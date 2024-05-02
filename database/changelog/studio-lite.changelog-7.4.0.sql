-- liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."metadata_profile"
(
  "id"  VARCHAR(256)  NOT NULL,
  "label" JSONB NOT NULL,
  "groups" JSONB NOT NULL,
  "modified_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."metadata_profile";

-- changeset jojohoch:2
CREATE TABLE "public"."metadata_vocabulary"
(
  "id"  VARCHAR(256)  NOT NULL,
  "type" VARCHAR(128)  NOT NULL,
  "title" JSONB NOT NULL,
  "description" JSONB,
  "hasTopConcept" JSONB,
  "@context" JSONB NOT NULL,
  "modified_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."metadata_vocabulary";

-- changeset jojohoch:3
CREATE TABLE "public"."metadata_profile_registry"
(
  "id" VARCHAR(256) NOT NULL,
  "csv"  TEXT  NOT NULL,
  "modified_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."metadata_profile_registry;

-- changeset jojohoch:4
CREATE TABLE "public"."registered_metadata_profile"
(
  "id" VARCHAR(128) PRIMARY KEY,
  "url" VARCHAR(256) NOT NULL,
  "title"  JSONB NOT NULL,
  "creator" VARCHAR(128) NOT NULL,
  "maintainer" VARCHAR(128) NOT NULL,
  "profiles" JSONB NOT NULL,
  "modified_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."registered_metadata_profile";

