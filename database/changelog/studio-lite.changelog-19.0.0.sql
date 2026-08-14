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
-- The cached registry csv is keyed by the url it was fetched from, so once the
-- setting is repointed further down, every row written under a retired url is
-- unreachable clutter. Drop them: the cache is one http GET away from being
-- refilled, and keeping a row would be worse than losing it — the two registries
-- are different documents, not two names for one. The retired registry.csv lists
-- stores (profile-config.json, github urls) in a three-column layout, the current
-- one lists profiles directly (w3id urls) and carries an extra "target" column.
-- Filing the old csv under the new url would make the next read parse the retired
-- format and re-register exactly the github-keyed rows changeset 5 just deleted.
DELETE FROM "public"."metadata_profile_registry"
  WHERE "id" ~
    '^https?://raw\.githubusercontent\.com/iqb-vocabs/profile-registry/(refs/heads/)?master/(metadata-)?registry\.csv$';
-- rollback SELECT 1;

-- changeset jojohoch:7
-- Point a stored registry url at the w3id form, which is the whole objective of
-- #1570: no github path may survive the upgrade. Two populations need it, and a
-- literal comparison against the old default would only catch the first:
--   * instances never switched, still on the retired store registry (registry.csv).
--     These matter most — reading it re-registers profiles under github urls and
--     undoes this migration on every request.
--   * instances an admin switched by hand at the last release. They already read
--     the current registry, but through raw.githubusercontent.com/…/metadata-registry.csv
--     instead of the permanent identifier that resolves to it.
-- The pattern is anchored on the iqb-vocabs/profile-registry path, so a registry
-- url deliberately pointed somewhere else stays untouched, and it accepts the
-- refs/heads/master spelling github's "copy raw file" button produces.
UPDATE "public"."setting"
  SET "content" = regexp_replace("content",
    'https?://raw\.githubusercontent\.com/iqb-vocabs/profile-registry/(refs/heads/)?master/(metadata-)?registry\.csv',
    'https://w3id.org/iqb/metadata-registry',
    'g')
  WHERE "key" = 'profiles-registry'
    AND "content" ~
      'https?://raw\.githubusercontent\.com/iqb-vocabs/profile-registry/(refs/heads/)?master/(metadata-)?registry\.csv';
-- rollback SELECT 1;

-- Five tables were created without a PRIMARY KEY although their entities declare
-- one, so nothing stopped duplicate rows from accumulating and TypeORM's save()
-- on a supposedly single row updated every copy of it (#1581).
--
-- The three cache tables (metadata_profile, metadata_profile_registry,
-- metadata_vocabulary) are filled by a read-then-write path that two concurrent
-- requests could both take, so they are deduplicated before the key is added --
-- newest row per "id" wins, "ctid" breaks ties so the choice is deterministic.
-- The DELETEs are one-time cleanups and are not undone on rollback; dropping the
-- constraint is enough to return to the previous schema.
--
-- These changesets run after the w3id rewrites above on purpose: changesets 1-7
-- rewrite and delete rows keyed by "id", so deduplicating first would keep a copy
-- the rewrite then turns into a duplicate again.
--
-- unit_metadata and unit_item_metadata need no cleanup: they are Postgres
-- inheritance children of "metadata", and while a PRIMARY KEY on the parent does
-- not propagate to a child, the inherited "id" default does. Both draw from the
-- parent's "metadata_id_seq", so their ids are unique already and "id" is the
-- key their shared entity base class has claimed all along.

-- changeset jojohoch:8
DELETE FROM "public"."metadata_profile" p
WHERE p."ctid" <> (
  SELECT k."ctid" FROM "public"."metadata_profile" k
  WHERE k."id" = p."id"
  ORDER BY k."modified_at" DESC NULLS LAST, k."ctid" DESC
  LIMIT 1
);
ALTER TABLE "public"."metadata_profile"
  ADD CONSTRAINT "metadata_profile_pkey" PRIMARY KEY ("id");
-- rollback ALTER TABLE "public"."metadata_profile" DROP CONSTRAINT "metadata_profile_pkey";

-- changeset jojohoch:9
DELETE FROM "public"."metadata_profile_registry" r
WHERE r."ctid" <> (
  SELECT k."ctid" FROM "public"."metadata_profile_registry" k
  WHERE k."id" = r."id"
  ORDER BY k."modified_at" DESC NULLS LAST, k."ctid" DESC
  LIMIT 1
);
ALTER TABLE "public"."metadata_profile_registry"
  ADD CONSTRAINT "metadata_profile_registry_pkey" PRIMARY KEY ("id");
-- rollback ALTER TABLE "public"."metadata_profile_registry" DROP CONSTRAINT "metadata_profile_registry_pkey";

-- changeset jojohoch:10
DELETE FROM "public"."metadata_vocabulary" v
WHERE v."ctid" <> (
  SELECT k."ctid" FROM "public"."metadata_vocabulary" k
  WHERE k."id" = v."id"
  ORDER BY k."modified_at" DESC NULLS LAST, k."ctid" DESC
  LIMIT 1
);
ALTER TABLE "public"."metadata_vocabulary"
  ADD CONSTRAINT "metadata_vocabulary_pkey" PRIMARY KEY ("id");
-- rollback ALTER TABLE "public"."metadata_vocabulary" DROP CONSTRAINT "metadata_vocabulary_pkey";

-- changeset jojohoch:11
ALTER TABLE "public"."unit_metadata"
  ADD CONSTRAINT "unit_metadata_pkey" PRIMARY KEY ("id");
-- rollback ALTER TABLE "public"."unit_metadata" DROP CONSTRAINT "unit_metadata_pkey";

-- changeset jojohoch:12
ALTER TABLE "public"."unit_item_metadata"
  ADD CONSTRAINT "unit_item_metadata_pkey" PRIMARY KEY ("id");
-- rollback ALTER TABLE "public"."unit_item_metadata" DROP CONSTRAINT "unit_item_metadata_pkey";

-- A user_session row said when someone last interacted ("last_activity"), but never
-- whether a browser is still open behind it (#1569). Both questions were answered from
-- the one column, and since every write set "last_activity" and "expires_at" together,
-- "now - last_activity > INACTIVITY_THRESHOLD" (the "orphaned" state) could only ever be
-- true for a row whose "expires_at" had already passed -- i.e. for a row the display
-- filters out and the cleanup job deletes. The status, its marker in the admin list and
-- the delete endpoint guarded by it were therefore unreachable.
--
-- "last_seen" carries the missing signal: every open tab pings it on a timer regardless
-- of user interaction, so a row without recent pings has no browser behind it.
--
-- Existing rows are backfilled with now(), not with "last_activity", which would look
-- like the more faithful value but is the wrong way to be wrong. No row carries evidence
-- either way at this point, so the choice is which error to make for the one ping interval
-- until every open tab has reported in:
--   now()          -- a genuinely abandoned row keeps looking alive for up to one ping
--                     interval, then turns orphaned by itself. That is the status quo this
--                     migration inherits, extended by a minute.
--   last_activity  -- a live session whose user last clicked longer than
--                     ORPHANED_SESSION_THRESHOLD_MS ago is reported orphaned immediately.
--                     logoutOrphanedSession accepts it, so an admin looking at the list
--                     right after the upgrade can delete a session someone is working in.
-- Overstating liveness for a minute costs nothing; understating it costs a stranger their
-- session. Hence now().

-- changeset jojohoch:13
ALTER TABLE "public"."user_session"
  ADD COLUMN "last_seen" TIMESTAMP WITH TIME ZONE;
UPDATE "public"."user_session" SET "last_seen" = now() WHERE "last_seen" IS NULL;
ALTER TABLE "public"."user_session"
  ALTER COLUMN "last_seen" SET NOT NULL;
-- rollback ALTER TABLE "public"."user_session" DROP COLUMN "last_seen";
