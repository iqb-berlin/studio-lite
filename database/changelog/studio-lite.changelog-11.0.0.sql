-- liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."metadata"
(
  "id"   SERIAL
      PRIMARY KEY,
  "data" TEXT NULL,
  "profile" VARCHAR(256) NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."metadata";

-- changeset jojohoch:2
ALTER TABLE "public"."unit"
  ADD COLUMN  "metadata_id" INTEGER NULL
    REFERENCES "public"."metadata"
      ON DELETE CASCADE;
-- rollback ALTER TABLE "unit" DROP COLUMN "metadata_id";

-- changeset jojohoch:3
CREATE TABLE "public"."unit_item"
(
  "id"         SERIAL  NOT NULL
    PRIMARY KEY,
  "alias"      VARCHAR(100),
  "variable_id"  VARCHAR(100),
  "weighting"  INTEGER,
  "description" TEXT,
  "metadata_id" INTEGER NULL
    REFERENCES "public"."metadata"
      ON DELETE CASCADE,
  "unit_id"    INTEGER NOT NULL
    REFERENCES "public"."unit"
      ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."unit_item";

-- changeset jojohoch:4
ALTER TABLE "public"."unit_comment"
  ALTER COLUMN "unit_id" DROP NOT NULL;
-- rollback ALTER TABLE "unit_comment" ALTER COLUMN "unit_id" SET NOT NULL;

-- changeset jojohoch:5
ALTER TABLE "public"."unit_comment"
  ADD COLUMN  "item_id" INTEGER NULL
    REFERENCES "public"."unit_item"
      ON DELETE CASCADE;
-- rollback ALTER TABLE "unit_comment" DROP COLUMN "item_id";





