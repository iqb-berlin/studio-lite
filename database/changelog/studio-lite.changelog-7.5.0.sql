-- liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."workspace_user"
  ADD COLUMN "has_write_access" BOOLEAN DEFAULT TRUE;
-- rollback ALTER TABLE "public"."workspace_user" DROP COLUMN "has_write_access";
