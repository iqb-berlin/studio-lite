--liquibase formatted sql

-- changeset jojohoch:1
-- Make session timestamps timezone-aware so that all "now - lastActivity"
-- comparisons (session status, refresh inactivity check) are unambiguous and no
-- longer depend on the DB/Node timezone. Existing naive values were written by an
-- app running in UTC, so they are interpreted as UTC.
ALTER TABLE "public"."user_session"
  ALTER COLUMN "last_activity" TYPE TIMESTAMPTZ USING "last_activity" AT TIME ZONE 'UTC';
ALTER TABLE "public"."user_session"
  ALTER COLUMN "expires_at" TYPE TIMESTAMPTZ USING "expires_at" AT TIME ZONE 'UTC';
ALTER TABLE "public"."refresh_token"
  ALTER COLUMN "expires_at" TYPE TIMESTAMPTZ USING "expires_at" AT TIME ZONE 'UTC';
-- rollback ALTER TABLE "public"."refresh_token" ALTER COLUMN "expires_at" TYPE TIMESTAMP;
-- rollback ALTER TABLE "public"."user_session" ALTER COLUMN "expires_at" TYPE TIMESTAMP;
-- rollback ALTER TABLE "public"."user_session" ALTER COLUMN "last_activity" TYPE TIMESTAMP;

-- changeset jojohoch:2
-- One-time cleanup of stale rows left behind by the previous session handling
-- (merged/rotated sessions and orphaned refresh tokens). Deleting expired
-- user_session rows cascades to their refresh_token rows via the existing FK.
DELETE FROM "public"."refresh_token" WHERE "expires_at" < now();
DELETE FROM "public"."user_session" WHERE "expires_at" < now();
-- rollback SELECT 1;
