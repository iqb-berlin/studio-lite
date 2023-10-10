-- liquibase formatted sql

-- changeset jurei733:1
ALTER TABLE "public"."user"
  ADD COLUMN "identity" VARCHAR(100);
-- rollback ALTER TABLE "public"."user" DROP COLUMN "identity";

-- changeset jurei733:2
ALTER TABLE "public"."user"
  ADD COLUMN "issuer" VARCHAR(100);
-- rollback ALTER TABLE "public"."user" DROP COLUMN "issuer";
