-- liquibase formatted sql

-- changeset jurei733:1
ALTER TABLE "public"."unit"
    ADD COLUMN "state" TEXT;
-- rollback ALTER TABLE "public"."unit" DROP COLUMN "state";
