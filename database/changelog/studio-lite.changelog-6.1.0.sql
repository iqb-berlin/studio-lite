-- liquibase formatted sql

-- changeset jurei733:1
ALTER TABLE "public"."user"
  ADD COLUMN "issuer" TEXT;
-- rollback ALTER TABLE "public"."user" DROP COLUMN "issuer";

-- changeset jurei733:2
ALTER TABLE "public"."user"
  ADD COLUMN "identity" TEXT;
-- rollback ALTER TABLE "public"."user" DROP COLUMN "identity";
