-- liquibase formatted sql

-- changeset jojohoch:2
ALTER TABLE "public"."unit_comment_unit_item"
  RENAME "user_id" TO "unit_id";
-- rollback ALTER TABLE "public"."unit_comment_unit_item" RENAME "unit_id" TO "user_id";

-- changeset jojohoch:3
ALTER TABLE "public"."unit_comment_unit_item"
  DROP COLUMN "user_name"
-- rollback ALTER TABLE "public"."unit_comment_unit_item" ADD COLUMN "user_name" VARCHAR(100);
