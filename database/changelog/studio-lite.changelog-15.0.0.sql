-- liquibase formatted sql

-- changeset jojohoch:1
CREATE TABLE "public"."unit_rich_note"
(
  "id"         SERIAL  NOT NULL
    CONSTRAINT "unit_rich_note_pk"
      PRIMARY KEY,
  "unit_id"    INTEGER NOT NULL
    REFERENCES "public"."unit"
      ON DELETE CASCADE,
  "tag_id"     VARCHAR(255) NOT NULL,
  "content"    TEXT NOT NULL,
  "links"      JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."unit_rich_note";

-- changeset jojohoch:2
CREATE INDEX IF NOT EXISTS idx_unit_rich_note_unit_id ON unit_rich_note(unit_id);
-- rollback DROP INDEX IF EXISTS idx_unit_rich_note_unit_id;

-- changeset jojohoch:3
CREATE TABLE "public"."unit_rich_note_unit_item"
(
  "unit_item_uuid" UUID NOT NULL
    REFERENCES "public"."unit_item"
      ON DELETE CASCADE,
  "unit_rich_note_id" INTEGER NOT NULL
    REFERENCES "public"."unit_rich_note"
      ON DELETE CASCADE,
  PRIMARY KEY ("unit_item_uuid", "unit_rich_note_id"),
  "unit_id"    INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."unit_rich_note_unit_item";

-- changeset jojohoch:4
CREATE INDEX IF NOT EXISTS idx_unit_rn_ui_uuid ON unit_rich_note_unit_item(unit_item_uuid);
-- rollback DROP INDEX IF EXISTS idx_unit_rn_ui_uuid;

-- changeset jojohoch:5
CREATE INDEX IF NOT EXISTS idx_unit_rn_ui_note_id ON unit_rich_note_unit_item(unit_rich_note_id);
-- rollback DROP INDEX IF EXISTS idx_unit_rn_ui_note_id;

-- changeset jojohoch:6
UPDATE workspace
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{hiddenRoutes}',
  COALESCE(settings->'hiddenRoutes', '[]'::jsonb) || '["notes"]'::jsonb
               )
WHERE settings->'hiddenRoutes' IS NULL OR NOT (settings->'hiddenRoutes' @> '["notes"]'::jsonb);
-- rollback UPDATE workspace SET settings = CASE WHEN (settings->'hiddenRoutes') - 'notes' = '[]'::jsonb THEN settings - 'hiddenRoutes' ELSE jsonb_set(settings, '{hiddenRoutes}', (settings->'hiddenRoutes') - 'notes') END WHERE settings->'hiddenRoutes' @> '["notes"]'::jsonb;

