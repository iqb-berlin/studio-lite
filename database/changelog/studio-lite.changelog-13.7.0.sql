--liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."unit_comment"
  ADD COLUMN "hidden" BOOLEAN DEFAULT FALSE;
-- rollback ALTER TABLE "public"."unit_comment" DROP COLUMN "hidden";
