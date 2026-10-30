--liquibase formatted sql

-- Refresh tokens that have been exchanged for a new pair (#1935). A token that comes back after its
-- exchange was not lost but copied: whoever used it first got the new pair, and the server cannot
-- tell which of the two is the copy. Without this table such a token looks like any unknown one,
-- and the copy keeps the session. With it, the refresh ends the session for both sides.
--
-- The rows live as long as the session, through the same cascade as "refresh_token", and at most
-- the inactivity window after their use: the hourly cleanup drops them then.

-- changeset jojohoch:1
CREATE TABLE "public"."used_refresh_token"
(
  "token_hash" VARCHAR(255) PRIMARY KEY,
  "user_id" INT NOT NULL,
  "session_id" VARCHAR(255) NOT NULL,
  "used_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT "fk_used_refresh_token_user_session"
    FOREIGN KEY ("user_id", "session_id")
    REFERENCES "public"."user_session" ("user_id", "session_id")
    ON DELETE CASCADE
);
-- Without it, every deleted session would read the whole table to find its rows.
CREATE INDEX "idx_used_refresh_token_user_session" ON "public"."used_refresh_token" ("user_id", "session_id");
-- rollback DROP TABLE "public"."used_refresh_token";

-- changeset jojohoch:2
-- Group settings: the highest id the group ever gave a unit state (#2009). A new state gets an id above it,
-- because units keep the id of a deleted state and would show a new state that got it again. A group that
-- deleted its highest state before this release has that id only on its units, so they count as well.
UPDATE "public"."workspace_group" AS "wsg"
  SET "settings" = COALESCE("wsg"."settings", '{}'::jsonb) || jsonb_build_object('lastStateId', "given"."id")
  FROM (
    SELECT "g"."id" AS "group_id", GREATEST(
      (SELECT MAX(("s"->>'id')::INTEGER)
        FROM jsonb_array_elements(CASE WHEN jsonb_typeof("g"."settings"->'states') = 'array'
          THEN "g"."settings"->'states' ELSE '[]'::jsonb END) AS "s"
        WHERE "s"->>'id' ~ '^[0-9]{1,9}$'),
      (SELECT MAX("u"."state"::INTEGER)
        FROM "public"."unit" AS "u"
        JOIN "public"."workspace" AS "w" ON "w"."id" = "u"."workspace_id"
        WHERE "w"."group_id" = "g"."id" AND "u"."state" ~ '^[0-9]{1,9}$')
    ) AS "id"
    FROM "public"."workspace_group" AS "g"
  ) AS "given"
  WHERE "given"."group_id" = "wsg"."id" AND "given"."id" IS NOT NULL;
-- rollback UPDATE "public"."workspace_group" SET "settings" = "settings" - 'lastStateId';
