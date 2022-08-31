-- liquibase formatted sql

-- changeset mechtelm:1
ALTER TABLE "public"."unit"
  ALTER COLUMN "scheme" TYPE TEXT USING scheme::TEXT;
-- rollback ALTER TABLE "public"."unit" ALTER COLUMN "scheme" TYPE JSONB USING scheme::JSONB;

-- changeset mechtelm:2
ALTER TABLE "public"."unit" ADD COLUMN "scheme_type" VARCHAR(50);
-- rollback ALTER TABLE "public"."unit" DROP COLUMN "scheme_type";
