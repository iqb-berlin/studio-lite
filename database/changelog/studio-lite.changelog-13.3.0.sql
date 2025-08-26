-- liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."review"
  ADD COLUMN "created_at" TIMESTAMP WITH TIME ZONE;
-- rollback ALTER TABLE "public"."review" DROP COLUMN "created_at";

-- changeset jojohoch:2
ALTER TABLE "public"."review"
  ADD COLUMN "changed_at" TIMESTAMP WITH TIME ZONE;
-- rollback ALTER TABLE "public"."review" DROP COLUMN "changed_at";


