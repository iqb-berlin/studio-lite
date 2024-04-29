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

-- changeset jojohoch:2
CREATE TABLE "public"."metadata_vocabulary"
(
  "id"  VARCHAR(128)  NOT NULL,
  "type" VARCHAR(128)  NOT NULL,
  "title" JSONB NOT NULL,
  "description" JSONB,
  "hasTopConcept" JSONB,
  "@context" JSONB NOT NULL,
  "modified_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."metadata_vocabulary";

