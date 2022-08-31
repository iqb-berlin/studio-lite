-- liquibase formatted sql

-- changeset mechtelm:1
ALTER TABLE "public"."user"
  ADD COLUMN "last_name" VARCHAR(100);
-- rollback ALTER TABLE "public"."user" DROP COLUMN "last_name";

-- changeset mechtelm:2
ALTER TABLE "public"."user"
  ADD COLUMN "first_name" VARCHAR(100);
-- rollback ALTER TABLE "public"."user" DROP COLUMN "first_name";

-- changeset mechtelm:3
ALTER TABLE "public"."user"
  ADD COLUMN "email" VARCHAR(100);
-- rollback ALTER TABLE "public"."user" DROP COLUMN "email";

-- changeset mechtelm:4
ALTER TABLE "public"."user"
  ADD COLUMN "email_publish_approved" BOOLEAN DEFAULT FALSE;
-- rollback ALTER TABLE "public"."user" DROP COLUMN "email_publish_approved";

-- changeset mechtelm:5
CREATE TABLE "public"."workspace_group_admin"
(
  "workspace_group_id" INTEGER NOT NULL
    REFERENCES "public"."workspace_group"
      ON DELETE CASCADE,
  "user_id"            INTEGER NOT NULL
    REFERENCES "public"."user"
      ON DELETE CASCADE,
  PRIMARY KEY ("workspace_group_id", "user_id")
);
-- rollback DROP TABLE "public"."workspace_group_admin";
