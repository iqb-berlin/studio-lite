--liquibase formatted sql

-- Replace the github spelling of IQB metadata profile ids with their canonical
-- w3id form (#1570). The authoritative w3id rewrite rule (perma-id/w3id.org,
-- /iqb/.htaccess) maps
--   w3id.org/iqb/p{N}/{target}
--     -> raw.githubusercontent.com/iqb-vocabs/p{N}/master/{target}.json   [302]
-- for every profile number, so rewriting stored ids with the exact inverse of
-- that rule is loss-free: every produced w3id resolves to the same document the
-- stored github url pointed to. Only ids matching the iqb-vocabs github pattern
-- are touched; foreign profile hosts stay as they are.
--
-- ROLLBACK: the data-rewriting changesets below are deliberately NOT invertible.
-- The w3id spelling was already valid before 19.0.0 (profileIdsMatch/W3ID_PROFILE
-- ship since 18.0.0), so after the fact a w3id-spelled row is indistinguishable
-- from one this migration produced. A "rollback" that rewrote every w3id back to
-- github would therefore corrupt rows that were never migrated. Reverting the
-- data requires a dump taken before the upgrade; reverting the CODE alone is
-- safe, because 18.0.0 already canonicalizes both spellings when matching a
-- profile. The changesets are marked with an explicit empty rollback so liquibase
-- can still roll the changelog back without touching the data.

-- changeset jojohoch:1
-- Unit and item metadata blocks. The UPDATE targets the parent table
-- "metadata"; via Postgres table inheritance it propagates to "unit_metadata"
-- and "unit_item_metadata".
UPDATE "public"."metadata"
  SET "profile_id" = regexp_replace(
    "profile_id",
    '^https://raw\.githubusercontent\.com/iqb-vocabs/(p\d+)/master/([a-z]+)\.json$',
    'https://w3id.org/iqb/\1/\2/')
  WHERE "profile_id" ~ '^https://raw\.githubusercontent\.com/iqb-vocabs/p\d+/master/[a-z]+\.json$';
-- rollback SELECT 1;

-- changeset jojohoch:2
-- Workspace settings: the configured unit and item metadata profile urls.
UPDATE "public"."workspace"
  SET "settings" = jsonb_set("settings", '{unitMDProfile}',
    to_jsonb(regexp_replace("settings"->>'unitMDProfile',
      '^https://raw\.githubusercontent\.com/iqb-vocabs/(p\d+)/master/([a-z]+)\.json$',
      'https://w3id.org/iqb/\1/\2/')))
  WHERE "settings"->>'unitMDProfile'
    ~ '^https://raw\.githubusercontent\.com/iqb-vocabs/p\d+/master/[a-z]+\.json$';
UPDATE "public"."workspace"
  SET "settings" = jsonb_set("settings", '{itemMDProfile}',
    to_jsonb(regexp_replace("settings"->>'itemMDProfile',
      '^https://raw\.githubusercontent\.com/iqb-vocabs/(p\d+)/master/([a-z]+)\.json$',
      'https://w3id.org/iqb/\1/\2/')))
  WHERE "settings"->>'itemMDProfile'
    ~ '^https://raw\.githubusercontent\.com/iqb-vocabs/p\d+/master/[a-z]+\.json$';
-- rollback SELECT 1;

-- changeset jojohoch:3
-- Workspace group settings: the ids of the profiles selected for the group
-- ("settings"->'profiles' is an array of { id, label } objects).
UPDATE "public"."workspace_group" AS wg
  SET "settings" = jsonb_set(wg."settings", '{profiles}', sub."profiles")
  FROM (
    SELECT wg2."id" AS group_id,
      jsonb_agg(
        CASE
          WHEN entries.profile_entry->>'id'
            ~ '^https://raw\.githubusercontent\.com/iqb-vocabs/p\d+/master/[a-z]+\.json$'
            THEN jsonb_set(entries.profile_entry, '{id}',
              to_jsonb(regexp_replace(entries.profile_entry->>'id',
                '^https://raw\.githubusercontent\.com/iqb-vocabs/(p\d+)/master/([a-z]+)\.json$',
                'https://w3id.org/iqb/\1/\2/')))
          ELSE entries.profile_entry
        END ORDER BY entries.profile_index) AS "profiles"
    FROM "public"."workspace_group" AS wg2,
      jsonb_array_elements(wg2."settings"->'profiles')
        WITH ORDINALITY AS entries(profile_entry, profile_index)
    WHERE jsonb_typeof(wg2."settings"->'profiles') = 'array'
      -- cheap prefilter: without it every group's settings blob is rewritten,
      -- including groups holding only w3id or foreign ids
      AND wg2."settings"->>'profiles' LIKE '%raw.githubusercontent.com/iqb-vocabs/%'
    GROUP BY wg2."id"
  ) AS sub
  WHERE wg."id" = sub.group_id;
-- rollback SELECT 1;

-- changeset jojohoch:4
-- Cached profile definitions are keyed by profile id. Where a profile is
-- already cached under both spellings, drop the github row (the w3id row wins);
-- then rewrite the remaining github-keyed rows. Kept (instead of truncated) so
-- the db-only read path keeps serving profile definitions right after the
-- upgrade. The dropped duplicates are plain cache rows and are re-fetched on
-- demand.
DELETE FROM "public"."metadata_profile" AS mp
  WHERE mp."id" ~ '^https://raw\.githubusercontent\.com/iqb-vocabs/p\d+/master/[a-z]+\.json$'
    AND EXISTS (
      SELECT 1 FROM "public"."metadata_profile" AS mp2
      WHERE mp2."id" = regexp_replace(mp."id",
        '^https://raw\.githubusercontent\.com/iqb-vocabs/(p\d+)/master/([a-z]+)\.json$',
        'https://w3id.org/iqb/\1/\2/'));
UPDATE "public"."metadata_profile"
  SET "id" = regexp_replace(
    "id",
    '^https://raw\.githubusercontent\.com/iqb-vocabs/(p\d+)/master/([a-z]+)\.json$',
    'https://w3id.org/iqb/\1/\2/')
  WHERE "id" ~ '^https://raw\.githubusercontent\.com/iqb-vocabs/p\d+/master/[a-z]+\.json$';
-- rollback SELECT 1;

-- changeset jojohoch:5
-- The registered-profile rows cache what the registry csv listed. From 19.0.0
-- on they are keyed by the registry url instead of the profile's self-declared
-- id, so every existing row sits under a potentially wrong key (and the retired
-- github registry entries do not exist in the new format at all). Clear the
-- cache; the next registry read repopulates it under the new keying.
DELETE FROM "public"."registered_metadata_profile";
-- rollback SELECT 1;

-- changeset jojohoch:6
-- Registry csv rows are keyed by the registry url, so repointing the setting in
-- changeset 7 would leave the read path without any cached csv: on an instance
-- that cannot reach w3id.org (air-gapped, restrictive proxy, or a hiccup during
-- rollout) the registry read then fails outright and no profile is selectable
-- for any workspace group. Re-key the cached row onto the new url instead of
-- dropping it, so the retired csv keeps serving as an offline fallback until the
-- first successful fetch overwrites it — the same property changeset 4
-- deliberately preserves for the profile definitions. If a row for the new url
-- somehow exists already, it wins and the stale one is dropped.
DELETE FROM "public"."metadata_profile_registry"
  WHERE "id" = 'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv'
    AND EXISTS (
      SELECT 1 FROM "public"."metadata_profile_registry" AS existing
      WHERE existing."id" = 'https://w3id.org/iqb/metadata-registry');
UPDATE "public"."metadata_profile_registry"
  SET "id" = 'https://w3id.org/iqb/metadata-registry'
  WHERE "id" = 'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv';
-- rollback SELECT 1;

-- changeset jojohoch:7
-- If an admin stored the old default registry url in the settings, move it to
-- the new w3id registry (new csv format, w3id profile urls). A deliberately
-- customized registry url stays untouched.
UPDATE "public"."setting"
  SET "content" = replace("content",
    'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv',
    'https://w3id.org/iqb/metadata-registry')
  WHERE "key" = 'profiles-registry'
    AND "content" LIKE '%https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv%';
-- rollback SELECT 1;
