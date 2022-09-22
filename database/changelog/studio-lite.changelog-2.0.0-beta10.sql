-- liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."unit_user"
(
  "unit_id"                      INTEGER NOT NULL
    REFERENCES "public"."unit"
      ON DELETE CASCADE,
  "user_id"                      INTEGER NOT NULL
    REFERENCES "public"."user"
      ON DELETE CASCADE,
  PRIMARY KEY ("unit_id", "user_id"),
  "last_seen_comment_changed_at" TIMESTAMP WITH TIME ZONE
);
-- rollback DROP TABLE "public"."unit_user";

-- changeset jojohoch:2
CREATE TABLE "public"."review"
(
  "id"           SERIAL
    PRIMARY KEY,
  "workspace_id" INTEGER      NOT NULL
    REFERENCES "public"."workspace"
      ON DELETE CASCADE,
  "name"         VARCHAR(100) NOT NULL,
  "link"         VARCHAR(100) NOT NULL,
  "password"     VARCHAR(100),
  "settings"     JSONB
);
-- rollback DROP TABLE "public"."review";

-- changeset mechtelm:3
CREATE TABLE "public"."review_unit"
(
  "unit_id"   INTEGER NOT NULL
    REFERENCES "public"."unit"
      ON DELETE CASCADE,
  "review_id" INTEGER NOT NULL
    REFERENCES "public"."review"
      ON DELETE CASCADE,
  "order"     INTEGER,
  PRIMARY KEY ("unit_id", "review_id")
);
-- rollback DROP TABLE "public"."review_unit";
