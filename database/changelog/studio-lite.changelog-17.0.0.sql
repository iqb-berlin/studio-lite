--liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."unit_comment_vote"
(
  "comment_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  "vote" VARCHAR(10) NOT NULL,
  PRIMARY KEY ("comment_id", "user_id"),
  FOREIGN KEY ("comment_id") REFERENCES "public"."unit_comment" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE CASCADE
);
-- rollback DROP TABLE "public"."unit_comment_vote";
