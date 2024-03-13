-- liquibase formatted sql

-- changeset jurei733:1
CREATE TABLE "public"."missings_profiles"
(
  "id" SMALLINT NOT NULL PRIMARY KEY,
  "label" VARCHAR(50) NOT NULL,
  "missings" JSONB
);
-- rollback DROP TABLE "public"."missings_profiles";
