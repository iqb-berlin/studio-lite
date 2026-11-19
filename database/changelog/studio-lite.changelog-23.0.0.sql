--liquibase formatted sql logicalFilePath:studio-lite.changelog-23.0.0.sql

-- Named for the next major release, as the changelogs before it were. Should the release that ships
-- it carry another version, rename the file to it: logicalFilePath keeps the changesets' identity in
-- DATABASECHANGELOG, so a database that ran them already does not take them for new ones.

-- A comment is signed "last name, first name" (#2134): up to 100 + 2 + 100 characters, as the
-- columns "last_changed_*_user" of "unit" have held since 8.0.0. "user_name" held 100, so someone
-- whose two names came to more than 98 characters together could no longer comment at all.
-- The rollback cuts longer names to fit again.

-- changeset jojohoch:1
ALTER TABLE "public"."unit_comment"
  ALTER COLUMN "user_name" TYPE VARCHAR(202);
-- rollback ALTER TABLE "public"."unit_comment" ALTER COLUMN "user_name" TYPE VARCHAR(100) USING LEFT("user_name", 100);

-- changeset jojohoch:2
-- A session id names one session of one account (#2151). The browser may now choose the id of the
-- session a login opens, while the cleanup and the status of a session find its tokens by the id
-- alone; two accounts must therefore never hold the same one. Until now the server chose every id at
-- random, so no two rows share one. Should two do so all the same, the older goes, its tokens with
-- it through the cascade, rather than the constraint failing the update.
-- The comment stands below the changeset line: above it, Liquibase would count it to the changeset
-- before, whose check sum would change for every database that has run it. Roll this changeset back
-- only together with the API: the API from 23.0.0 on relies on the constraint to keep ids apart.
DELETE FROM "public"."user_session" AS "older"
  USING "public"."user_session" AS "newer"
  WHERE "older"."session_id" = "newer"."session_id" AND "older"."id" < "newer"."id";
ALTER TABLE "public"."user_session"
  ADD CONSTRAINT "uq_user_session_session_id" UNIQUE ("session_id");
-- rollback ALTER TABLE "public"."user_session" DROP CONSTRAINT "uq_user_session_session_id";

-- changeset jojohoch:3
-- What a unit needs beside its player and editor -- a resource package such as GeoGebra, a widget, a
-- service -- as the editor reports it with the definition (#1602): one list for playing, one for
-- editing. They belong to the definition and are kept beside its format. Until now the studio kept
-- neither, so every unit starts with two empty lists.
ALTER TABLE "public"."unit_definition"
  ADD COLUMN "dependencies_to_play" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN "dependencies_to_edit" JSONB NOT NULL DEFAULT '[]'::jsonb;
-- rollback ALTER TABLE "public"."unit_definition" DROP COLUMN "dependencies_to_play", DROP COLUMN "dependencies_to_edit";
