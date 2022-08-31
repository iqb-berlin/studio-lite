-- liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."unit_comment"
(
  "id"         SERIAL  NOT NULL
    CONSTRAINT "unit_comment_pk"
      PRIMARY KEY,
  "body"       TEXT,
  "user_name"  VARCHAR(100),
  "user_id"    INTEGER,
  "parent_id"  INTEGER,
  "unit_id"    INTEGER NOT NULL
    REFERENCES "public"."unit"
      ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."unit_comment";
