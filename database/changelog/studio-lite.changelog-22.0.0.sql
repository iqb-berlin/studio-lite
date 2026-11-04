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
-- Settings holding JSON other than an object (an array, a text, a number, true/false or JSON null) stay as they
-- are, both ways: `||` would turn them into an array, and `-` fails on a scalar.
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
  WHERE "given"."group_id" = "wsg"."id" AND "given"."id" IS NOT NULL
    AND ("wsg"."settings" IS NULL OR jsonb_typeof("wsg"."settings") = 'object');
-- rollback UPDATE "public"."workspace_group" SET "settings" = "settings" - 'lastStateId' WHERE jsonb_typeof("settings") = 'object';

-- changeset jojohoch:3
-- The XML import took the attribute `complete` of a value list over as text up to #1987, so units
-- imported from XML carry "valuesComplete": "false" -- a string, which JavaScript takes for true.
-- The editor writes a boolean when the definition is saved; units not saved since keep the text.
-- The attribute is an xs:boolean: "1" is true as well, and white space around the value is ignored.
UPDATE "public"."unit" AS "u"
  SET "variables" = (
    SELECT jsonb_agg(
      CASE WHEN jsonb_typeof("v"->'valuesComplete') = 'string'
        THEN jsonb_set("v", '{valuesComplete}',
          to_jsonb(btrim("v"->>'valuesComplete', E' \t\n\r') IN ('true', '1')))
        ELSE "v" END
      ORDER BY "position")
    FROM jsonb_array_elements("u"."variables") WITH ORDINALITY AS "list"("v", "position"))
  -- CASE, not AND: AND leaves the order open, and the list functions fail on anything but an array
  WHERE CASE WHEN jsonb_typeof("u"."variables") = 'array'
    THEN EXISTS (
      SELECT 1 FROM jsonb_array_elements("u"."variables") AS "list"("v")
      WHERE jsonb_typeof("v"->'valuesComplete') = 'string')
    ELSE FALSE END;
-- rollback SELECT 1;
