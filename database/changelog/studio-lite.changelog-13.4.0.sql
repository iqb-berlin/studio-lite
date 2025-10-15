-- liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."registered_metadata_profile"
  ALTER COLUMN "maintainer" DROP NOT NULL;
-- rollback ALTER TABLE "public"."registered_metadata_profile" ALTER COLUMN "maintainer" SET NOT NULL;


