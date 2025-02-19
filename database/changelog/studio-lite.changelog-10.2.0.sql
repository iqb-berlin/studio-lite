-- liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."unit_item"
(
  "id"         SERIAL  NOT NULL
    PRIMARY KEY,
  "key"      VARCHAR(100),
  "order"      INTEGER DEFAULT 0,
  "locked"   boolean DEFAULT false,
  "position"  Text,
  "variable_id"  VARCHAR(100),
  "weighting"  INTEGER,
  "description" TEXT,
  "unit_id"    INTEGER NOT NULL
    REFERENCES "public"."unit"
      ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."unit_item";

-- changeset jojohoch:2
CREATE TABLE "public"."metadata"
(
  "id"   SERIAL
      PRIMARY KEY,
  "data" JSONB NOT NULL,
  "profile" VARCHAR(256) NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."metadata";

-- changeset jojohoch:3
CREATE TABLE "public"."unit_item_metadata"
(
  "unit_item_id" INTEGER NOT NULL
    REFERENCES "public"."unit_item"
      ON DELETE CASCADE
) INHERITS ("public"."metadata");
-- rollback DROP TABLE "public"."unit_item_metadata";

-- changeset jojohoch:4
CREATE TABLE "public"."unit_metadata"
(
  "unit_id" INTEGER NOT NULL
    REFERENCES "public"."unit"
      ON DELETE CASCADE
) INHERITS ("public"."metadata");
-- rollback DROP TABLE "public"."unit_metadata";

-- changeset jojohoch:5
CREATE TABLE "public"."unit_comment_unit_item"
(
  "unit_item_id" INTEGER NOT NULL
    REFERENCES "public"."unit_item"
      ON DELETE CASCADE,
  "unit_comment_id" INTEGER NOT NULL
    REFERENCES "public"."unit_comment"
      ON DELETE CASCADE,
  PRIMARY KEY ("unit_item_id", "unit_comment_id"),
  "user_name"  VARCHAR(100),
  "user_id"    INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."unit_comment_unit_item";




