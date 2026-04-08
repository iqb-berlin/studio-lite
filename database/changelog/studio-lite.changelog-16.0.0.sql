--liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."refresh_token"
(
  "id" SERIAL PRIMARY KEY,
  "token_hash" VARCHAR(255) NOT NULL,
  "user_id" INT NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "is_revoked" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE CASCADE
);
-- rollback DROP TABLE "public"."refresh_token";

-- changeset jojohoch:2
ALTER TABLE "public"."user"
  ADD COLUMN "last_activity" TIMESTAMP;
-- rollback ALTER TABLE "public"."user" DROP COLUMN "last_activity";
