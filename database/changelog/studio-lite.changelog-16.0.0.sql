--liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."user_session"
(
  "id" SERIAL PRIMARY KEY,
  "session_id" VARCHAR(255) NOT NULL,
  "user_id" INT NOT NULL,
  "last_activity" TIMESTAMP NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  CONSTRAINT "uq_user_session_user_id_session_id" UNIQUE ("user_id", "session_id"),
  FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE CASCADE
);
-- rollback DROP TABLE "public"."user_session";

-- changeset jojohoch:2
CREATE TABLE "public"."refresh_token"
(
  "id" SERIAL PRIMARY KEY,
  "token_hash" VARCHAR(255) NOT NULL,
  "user_id" INT NOT NULL,
  "session_id" VARCHAR(255) NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE CASCADE,
  CONSTRAINT "fk_refresh_token_user_session"
    FOREIGN KEY ("user_id", "session_id")
    REFERENCES "public"."user_session" ("user_id", "session_id")
    ON DELETE CASCADE
);
-- rollback DROP TABLE "public"."refresh_token";
