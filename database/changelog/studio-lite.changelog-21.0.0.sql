--liquibase formatted sql

-- The data format a unit definition is written in, as the editor reports it in
-- `unitDefinitionType` (Verona editor spec 4.6), e.g. "aspect-unit-definition@4.12.0" (#1368).
-- It sits beside the definition it describes, not on "unit": the two are written together, and a
-- definition replaced without a type must take the old type with it.
--
-- No backfill, on purpose. An empty column means "not reported" -- every unit saved by an editor
-- that does not send the field, and every unit not saved since this release. Players are checked
-- against the type only when it is known, so a guessed value could make a unit that ran before
-- look unreadable, while NULL leaves it exactly as it was.
--
-- Unbounded VARCHAR: the value comes from a module, and a length limit would turn a long type
-- name into a failed save.

-- changeset jojohoch:1
ALTER TABLE "public"."unit_definition"
  ADD COLUMN "type" VARCHAR;
-- rollback ALTER TABLE "public"."unit_definition" DROP COLUMN "type";
