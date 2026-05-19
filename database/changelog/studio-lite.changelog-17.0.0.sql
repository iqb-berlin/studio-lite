--liquibase formatted sql

-- changeset jojohoch:1
DROP TABLE IF EXISTS unit_rich_note_unit_item;
DROP TABLE IF EXISTS unit_rich_note;
-- rollback CREATE TABLE "public"."unit_rich_note" ("id" SERIAL NOT NULL CONSTRAINT "unit_rich_note_pk" PRIMARY KEY, "unit_id" INTEGER NOT NULL REFERENCES "public"."unit" ON DELETE CASCADE, "tag_id" VARCHAR(255) NOT NULL, "content" TEXT NOT NULL, "links" JSONB, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now());
-- rollback CREATE INDEX IF NOT EXISTS idx_unit_rich_note_unit_id ON unit_rich_note(unit_id);
-- rollback CREATE TABLE "public"."unit_rich_note_unit_item" ("unit_item_uuid" UUID NOT NULL REFERENCES "public"."unit_item" ON DELETE CASCADE, "unit_rich_note_id" INTEGER NOT NULL REFERENCES "public"."unit_rich_note" ON DELETE CASCADE, PRIMARY KEY ("unit_item_uuid", "unit_rich_note_id"), "unit_id" INTEGER NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT now());
-- rollback CREATE INDEX IF NOT EXISTS idx_unit_rn_ui_uuid ON unit_rich_note_unit_item(unit_item_uuid);
-- rollback CREATE INDEX IF NOT EXISTS idx_unit_rn_ui_note_id ON unit_rich_note_unit_item(unit_rich_note_id);

-- changeset jojohoch:2
CREATE TABLE unit_rich_note (
                              id SERIAL PRIMARY KEY,
                              unit_id INT NOT NULL,
                              tag_id TEXT NOT NULL,
                              content TEXT NOT NULL,
                              format TEXT NOT NULL DEFAULT 'html',
                              language VARCHAR(10),
                              links JSONB,
                              created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                              changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                              CONSTRAINT fk_unit FOREIGN KEY (unit_id) REFERENCES unit(id) ON DELETE CASCADE
);
-- rollback DROP TABLE IF EXISTS unit_rich_note;

-- changeset jojohoch:3
CREATE TABLE unit_rich_note_unit_item (
                                        unit_item_uuid UUID NOT NULL,
                                        unit_rich_note_id INT NOT NULL,
                                        unit_id INT NOT NULL,
                                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                        changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                        PRIMARY KEY (unit_item_uuid, unit_rich_note_id),
                                        CONSTRAINT fk_rich_note FOREIGN KEY (unit_rich_note_id) REFERENCES unit_rich_note(id) ON DELETE CASCADE,
                                        CONSTRAINT fk_unit_item FOREIGN KEY (unit_item_uuid) REFERENCES unit_item(uuid) ON DELETE CASCADE
);
-- rollback DROP TABLE IF EXISTS unit_rich_note_unit_item;

-- changeset jojohoch:4
CREATE TABLE "public"."unit_comment_vote"
(
  "comment_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  "vote" VARCHAR(10) NOT NULL,
  PRIMARY KEY ("comment_id", "user_id"),
  FOREIGN KEY ("comment_id") REFERENCES "public"."unit_comment" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE CASCADE
);
-- rollback DROP TABLE "public"."unit_comment_vote";
