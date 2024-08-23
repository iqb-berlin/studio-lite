-- liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."workspace"
  ADD COLUMN "drop_box_id" INTEGER DEFAULT null;
-- rollback ALTER TABLE "public"."workspace" DROP COLUMN "drop_box_id";

