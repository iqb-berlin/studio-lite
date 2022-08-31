-- liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."resource_package"
(
  "id"         SERIAL NOT NULL
    PRIMARY KEY,
  "elements"   TEXT[],
  "name"       VARCHAR(100),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."resource_package";
