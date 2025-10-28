-- liquibase formatted sql

-- changeset jojohoch:1
DELETE FROM unit_definition ud
WHERE NOT EXISTS (
  SELECT 1 FROM unit u WHERE u.definition_id = ud.id
);
-- rollback /* no-op: cannot restore deleted rows without backup */

-- changeset jojohoch:2
ALTER TABLE "public"."unit_definition"
  ADD COLUMN "unit_id" INTEGER;
-- rollback ALTER TABLE "public"."unit_definition" DROP COLUMN "unit_id";

-- changeset jojohoch:3
UPDATE "public"."unit_definition" ud
SET "unit_id" = u."id"
  FROM "public"."unit" u
WHERE u."definition_id" = ud."id";
-- rollback UPDATE "public"."unit_definition" SET "unit_id" = NULL;

-- changeset jojohoch:4
ALTER TABLE "public"."unit_definition"
  ADD CONSTRAINT "unit_definition_unit_fk"
    FOREIGN KEY ("unit_id") REFERENCES "public"."unit" ON DELETE CASCADE;
-- rollback ALTER TABLE "public"."unit_definition" DROP CONSTRAINT "unit_definition_unit_fk";

-- changeset jojohoch:5
ALTER TABLE "public"."unit"
DROP CONSTRAINT "unit_definition_id_fk",
DROP COLUMN "definition_id";
-- rollback ALTER TABLE "public"."unit" ADD COLUMN "definition_id" INTEGER;
-- rollback UPDATE "public"."unit" u SET "definition_id" = ud."id" FROM "public"."unit_definition" ud WHERE ud."unit_id" = u."id";
-- rollback ALTER TABLE "public"."unit" ADD CONSTRAINT "unit_definition_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."unit_definition";
