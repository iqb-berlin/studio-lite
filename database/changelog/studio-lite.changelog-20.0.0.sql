--liquibase formatted sql

-- "last_seen" is dropped again, one release after it arrived (#1615).
--
-- It was added in 19.0.0 to carry a liveness signal: every open tab pinged it on a timer,
-- so a row without recent pings had no browser behind it and could be called orphaned.
-- That made the label unusable in practice. Closing the browser is the ordinary way to
-- leave a session, not an anomaly, so within three minutes nearly every session anyone
-- had ever left was reported as orphaned, while "passive" shrank to the single case of a
-- tab left open and idle.
--
-- The status is now read off the tokens a session lives by -- an access token while the
-- last interaction is recent enough, a refresh token for as long as it has not expired --
-- and "orphaned" means what it says: no key left, nobody can return to this session, the
-- row should have gone when its last token did. Nothing reads "last_seen" any more, and a
-- NOT NULL column that no code writes would break every insert, so it goes.
--
-- ROLLBACK re-creates the column and backfills now(), which is what changeset 13 of
-- 19.0.0 did for exactly the same reason: no row carries evidence of when its tab was
-- last open, and overstating liveness for one ping interval costs nothing, while
-- understating it hands an admin a live session to delete.

-- changeset jojohoch:1
ALTER TABLE "public"."user_session"
  DROP COLUMN "last_seen";
-- rollback ALTER TABLE "public"."user_session" ADD COLUMN "last_seen" TIMESTAMP WITH TIME ZONE;
-- rollback UPDATE "public"."user_session" SET "last_seen" = now() WHERE "last_seen" IS NULL;
-- rollback ALTER TABLE "public"."user_session" ALTER COLUMN "last_seen" SET NOT NULL;
