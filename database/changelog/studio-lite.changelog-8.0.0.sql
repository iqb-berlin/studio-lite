-- liquibase formatted sql

-- changeset jojohoch:1
ALTER TABLE "public"."workspace_user"
  ALTER "has_write_access" SET DEFAULT null;
-- rollback ALTER TABLE "public"."workspace_user" ALTER "has_write_access" SET DEFAULT TRUE;


-- changeset jojohoch:2
ALTER TABLE "public"."workspace_user"
  ALTER "has_write_access" TYPE INTEGER USING CASE WHEN "has_write_access" THEN 4 ELSE 0 END;
-- rollback ALTER TABLE "public"."workspace_user" ALTER "has_write_access" TYPE BOOLEAN USING CASE WHEN has_write_access=0 THEN FALSE ELSE TRUE END;


-- changeset jojohoch:3
ALTER TABLE "public"."workspace_user"
  RENAME "has_write_access" TO "access_level";
-- rollback ALTER TABLE "public"."workspace_user" RENAME "access_level" TO "has_write_access";


-- changeset jojohoch:4
ALTER TABLE "public"."unit"
  ADD COLUMN "last_changed_definition_user" VARCHAR(50);
-- rollback ALTER TABLE "public"."unit" DROP COLUMN "last_changed_definition_user";


-- changeset jojohoch:5
ALTER TABLE "public"."unit"
  ADD COLUMN "last_changed_metadata_user" VARCHAR(50);
-- rollback ALTER TABLE "public"."unit" DROP COLUMN "last_changed_metadata_user";


-- changeset jojohoch:6
ALTER TABLE "public"."unit"
  ADD COLUMN "last_changed_scheme_user" VARCHAR(50);
-- rollback ALTER TABLE "public"."unit" DROP COLUMN "last_changed_scheme_user";


