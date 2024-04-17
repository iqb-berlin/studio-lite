-- liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."metadata_profile"
(
  "id"  VARCHAR(128)  NOT NULL,
  "label" JSONB NOT NULL,
  "groups" JSONB NOT NULL,
  "modified_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."metadata_profile";
