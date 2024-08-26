-- liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."workspace"
  ADD COLUMN "drop_box_id" INTEGER DEFAULT null;
-- rollback ALTER TABLE "public"."workspace" DROP COLUMN "drop_box_id";

-- changeset jojohoch:2
CREATE TABLE "public".unit_drop_box_history
(
  "id"         SERIAL  NOT NULL
    CONSTRAINT "unit_drop_box_history_pk"
      PRIMARY KEY,
  "unit_id" INTEGER NOT NULL
    REFERENCES "public"."unit"
      ON DELETE CASCADE,
  "source_workspace_id" INTEGER NOT NULL
    REFERENCES "public"."workspace"
      ON DELETE CASCADE,
  "target_workspace_id" INTEGER NOT NULL
    REFERENCES "public"."workspace"
      ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."unit_drop_box_history";
