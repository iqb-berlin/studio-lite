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
-- rollback UPDATE "public"."metadata"
-- rollback   SET "profile_id" = regexp_replace(
-- rollback     "profile_id",
-- rollback     '^https://w3id\.org/iqb/(p\d+)/([a-z]+)/$',
-- rollback     'https://raw.githubusercontent.com/iqb-vocabs/\1/master/\2.json')
-- rollback   WHERE "profile_id" ~ '^https://w3id\.org/iqb/p\d+/[a-z]+/$';

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
-- rollback UPDATE "public"."workspace"
-- rollback   SET "settings" = jsonb_set("settings", '{unitMDProfile}',
-- rollback     to_jsonb(regexp_replace("settings"->>'unitMDProfile',
-- rollback       '^https://w3id\.org/iqb/(p\d+)/([a-z]+)/$',
-- rollback       'https://raw.githubusercontent.com/iqb-vocabs/\1/master/\2.json')))
-- rollback   WHERE "settings"->>'unitMDProfile' ~ '^https://w3id\.org/iqb/p\d+/[a-z]+/$';
-- rollback UPDATE "public"."workspace"
-- rollback   SET "settings" = jsonb_set("settings", '{itemMDProfile}',
-- rollback     to_jsonb(regexp_replace("settings"->>'itemMDProfile',
-- rollback       '^https://w3id\.org/iqb/(p\d+)/([a-z]+)/$',
-- rollback       'https://raw.githubusercontent.com/iqb-vocabs/\1/master/\2.json')))
-- rollback   WHERE "settings"->>'itemMDProfile' ~ '^https://w3id\.org/iqb/p\d+/[a-z]+/$';

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
    GROUP BY wg2."id"
  ) AS sub
  WHERE wg."id" = sub.group_id;
-- rollback UPDATE "public"."workspace_group" AS wg
-- rollback   SET "settings" = jsonb_set(wg."settings", '{profiles}', sub."profiles")
-- rollback   FROM (
-- rollback     SELECT wg2."id" AS group_id,
-- rollback       jsonb_agg(
-- rollback         CASE
-- rollback           WHEN entries.profile_entry->>'id' ~ '^https://w3id\.org/iqb/p\d+/[a-z]+/$'
-- rollback             THEN jsonb_set(entries.profile_entry, '{id}',
-- rollback               to_jsonb(regexp_replace(entries.profile_entry->>'id',
-- rollback                 '^https://w3id\.org/iqb/(p\d+)/([a-z]+)/$',
-- rollback                 'https://raw.githubusercontent.com/iqb-vocabs/\1/master/\2.json')))
-- rollback           ELSE entries.profile_entry
-- rollback         END ORDER BY entries.profile_index) AS "profiles"
-- rollback     FROM "public"."workspace_group" AS wg2,
-- rollback       jsonb_array_elements(wg2."settings"->'profiles')
-- rollback         WITH ORDINALITY AS entries(profile_entry, profile_index)
-- rollback     WHERE jsonb_typeof(wg2."settings"->'profiles') = 'array'
-- rollback     GROUP BY wg2."id"
-- rollback   ) AS sub
-- rollback   WHERE wg."id" = sub.group_id;

-- changeset jojohoch:4
-- Cached profile definitions are keyed by profile id. Where a profile is
-- already cached under both spellings, drop the github row (the w3id row wins);
-- then rewrite the remaining github-keyed rows. Kept (instead of truncated) so
-- the db-only read path keeps serving profile definitions right after the
-- upgrade. The dropped duplicates are plain cache rows and are re-fetched on
-- demand, so the rollback only reverts the rewrite.
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
-- rollback UPDATE "public"."metadata_profile"
-- rollback   SET "id" = regexp_replace(
-- rollback     "id",
-- rollback     '^https://w3id\.org/iqb/(p\d+)/([a-z]+)/$',
-- rollback     'https://raw.githubusercontent.com/iqb-vocabs/\1/master/\2.json')
-- rollback   WHERE "id" ~ '^https://w3id\.org/iqb/p\d+/[a-z]+/$';

-- changeset jojohoch:5
-- The registered-profile rows cache what the registry csv listed. The entries
-- of the retired github registry (profile stores referencing profile-config
-- files) do not exist in the new w3id registry format; drop the iqb-vocabs
-- rows and let the next registry read repopulate the cache. Custom registries
-- on other hosts stay untouched.
DELETE FROM "public"."registered_metadata_profile"
  WHERE "url" LIKE 'https://raw.githubusercontent.com/iqb-vocabs/%'
     OR "id" LIKE 'https://raw.githubusercontent.com/iqb-vocabs/%';
-- rollback SELECT 1;

-- changeset jojohoch:6
-- Drop the cached csv of the retired github registry (rows are keyed by the
-- registry url). The new registry csv is cached on first use.
DELETE FROM "public"."metadata_profile_registry"
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
-- rollback UPDATE "public"."setting"
-- rollback   SET "content" = replace("content",
-- rollback     'https://w3id.org/iqb/metadata-registry',
-- rollback     'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv')
-- rollback   WHERE "key" = 'profiles-registry'
-- rollback     AND "content" LIKE '%https://w3id.org/iqb/metadata-registry%';
