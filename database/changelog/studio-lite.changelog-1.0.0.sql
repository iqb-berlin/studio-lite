-- liquibase formatted sql

-- changeset mechtelm:1
CREATE TABLE "public"."user"
(
  "id"          SERIAL
    PRIMARY KEY,
  "name"        VARCHAR(50)  NOT NULL,
  "password"    VARCHAR(100) NOT NULL,
  "is_admin"    BOOLEAN DEFAULT FALSE,
  "description" TEXT
);
-- rollback DROP TABLE "public"."user";

-- changeset mechtelm:2
CREATE TABLE "public"."workspace_group"
(
  "id"       SERIAL
    PRIMARY KEY,
  "name"     VARCHAR(50) NOT NULL,
  "settings" JSONB
);
-- rollback DROP TABLE "public"."workspace_group";

-- changeset mechtelm:3
CREATE TABLE "public"."workspace"
(
  "id"       SERIAL
    PRIMARY KEY,
  "name"     VARCHAR(50) NOT NULL,
  "group_id" INTEGER     NOT NULL
    REFERENCES "public"."workspace_group"
      ON DELETE CASCADE,
  "settings" JSONB
);
-- rollback DROP TABLE "public"."workspace";

-- changeset mechtelm:4
CREATE TABLE "public"."workspace_user"
(
  "workspace_id" INTEGER NOT NULL
    REFERENCES "public"."workspace"
      ON DELETE CASCADE,
  "user_id"      INTEGER NOT NULL
    REFERENCES "public"."user"
      ON DELETE CASCADE,
  PRIMARY KEY ("workspace_id", "user_id")
);
-- rollback DROP TABLE "public"."workspace_user";

-- changeset mechtelm:5
CREATE TABLE "public"."unit_definition"
(
  "id"   SERIAL
    CONSTRAINT "unit_definition_pk"
      PRIMARY KEY,
  "data" TEXT NOT NULL
);
-- rollback DROP TABLE "public"."unit_definition";

-- changeset mechtelm:6
CREATE TABLE "public"."unit"
(
  "id"                      SERIAL
    PRIMARY KEY,
  "workspace_id"            INTEGER                                NOT NULL
    REFERENCES "public"."workspace"
      ON DELETE CASCADE,
  "last_changed_scheme"     TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "key"                     VARCHAR(20)                            NOT NULL,
  "name"                    VARCHAR(100),
  "metadata"                JSONB,
  "variables"               JSONB,
  "scheme"                  JSONB,
  "editor"                  VARCHAR(50),
  "player"                  VARCHAR(50),
  "schemer"                 VARCHAR(50),
  "definition_id"           INTEGER
    CONSTRAINT "unit_definition_id_fk"
      REFERENCES "public"."unit_definition"
      ON DELETE CASCADE,
  "last_changed_definition" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "group_name"              VARCHAR(50),
  "description"             TEXT,
  "last_changed_metadata"   TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."unit";

-- changeset mechtelm:7
CREATE TABLE "public"."setting"
(
  "key"     VARCHAR(50) NOT NULL
    CONSTRAINT "app_config_pkey"
      PRIMARY KEY,
  "content" TEXT        NOT NULL
);
-- rollback DROP TABLE "public"."setting";

-- changeset mechtelm:8
CREATE TABLE "public"."verona_module"
(
  "key"           VARCHAR(50) NOT NULL
    PRIMARY KEY,
  "metadata"      JSONB,
  "file"          bytea,
  "file_size"     INTEGER                  DEFAULT 0,
  "file_datetime" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- rollback DROP TABLE "public"."verona_module";
