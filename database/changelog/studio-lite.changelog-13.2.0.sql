-- liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."unit"
  ALTER COLUMN "last_changed_definition" DROP DEFAULT;
-- rollback ALTER TABLE "public"."unit" ALTER COLUMN "last_changed_definition" SET DEFAULT now();


-- changeset jojohoch:2
ALTER TABLE "public"."unit"
  ALTER COLUMN "last_changed_definition" SET DEFAULT NULL;
-- rollback ALTER TABLE "public"."unit" ALTER COLUMN "last_changed_definition" DROP DEFAULT;


-- changeset jojohoch:3
ALTER TABLE "public"."unit"
  ALTER COLUMN "last_changed_scheme" DROP NOT NULL;
-- rollback ALTER TABLE "public"."unit" ALTER COLUMN "last_changed_scheme" SET NOT NULL;


-- changeset jojohoch:4
ALTER TABLE "public"."unit"
  ALTER COLUMN "last_changed_scheme" DROP DEFAULT;
-- rollback ALTER TABLE "public"."unit" ALTER COLUMN "last_changed_scheme" SET DEFAULT now(); UPDATE "public"."unit" SET "last_changed_scheme" = now() WHERE "last_changed_scheme" IS NULL;


-- changeset jojohoch:5
ALTER TABLE "public"."unit"
  ALTER COLUMN "last_changed_scheme" SET DEFAULT NULL;
-- rollback ALTER TABLE "public"."unit" ALTER COLUMN "last_changed_scheme" DROP DEFAULT;



