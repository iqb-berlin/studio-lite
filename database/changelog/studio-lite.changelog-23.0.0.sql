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
