--liquibase formatted sql

-- changeset jojohoch:1
-- Align session timestamps with the rest of the schema (TIMESTAMP WITH TIME ZONE)
-- so that all "now - lastActivity" comparisons are unambiguous. The naive values
-- were written exclusively by the API container (node default TZ = UTC):
-- node-postgres serializes JS dates as wall time with offset and Postgres drops
-- the offset on naive columns, so the stored wall times are UTC.
ALTER TABLE "public"."user_session"
  ALTER COLUMN "last_activity" TYPE TIMESTAMP WITH TIME ZONE USING "last_activity" AT TIME ZONE 'UTC';
-- rollback ALTER TABLE "public"."user_session" ALTER COLUMN "last_activity" TYPE TIMESTAMP USING "last_activity" AT TIME ZONE 'UTC';

-- changeset jojohoch:2
ALTER TABLE "public"."user_session"
  ALTER COLUMN "expires_at" TYPE TIMESTAMP WITH TIME ZONE USING "expires_at" AT TIME ZONE 'UTC';
-- rollback ALTER TABLE "public"."user_session" ALTER COLUMN "expires_at" TYPE TIMESTAMP USING "expires_at" AT TIME ZONE 'UTC';

-- changeset jojohoch:3
ALTER TABLE "public"."refresh_token"
  ALTER COLUMN "expires_at" TYPE TIMESTAMP WITH TIME ZONE USING "expires_at" AT TIME ZONE 'UTC';
-- rollback ALTER TABLE "public"."refresh_token" ALTER COLUMN "expires_at" TYPE TIMESTAMP USING "expires_at" AT TIME ZONE 'UTC';

-- changeset jojohoch:4
-- One-time cleanup of stale rows left behind by the previous session handling
-- (merged/rotated sessions and orphaned refresh tokens). Deleting expired
-- user_session rows cascades to their refresh_token rows via the existing FK.
DELETE FROM "public"."refresh_token" WHERE "expires_at" < now();
DELETE FROM "public"."user_session" WHERE "expires_at" < now();
-- rollback SELECT 1;
