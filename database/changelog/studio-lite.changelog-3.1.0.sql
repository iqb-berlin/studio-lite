-- liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."unit"
  ADD COLUMN "transcript" TEXT;
-- rollback ALTER TABLE "public"."unit" DROP COLUMN "transcript";

-- changeset jojohoch:2
ALTER TABLE "public"."unit"
  ADD COLUMN "reference" TEXT;
-- rollback ALTER TABLE "public"."unit" DROP COLUMN "reference";
