--liquibase formatted sql

--changeset jojohoch:1
CREATE INDEX IF NOT EXISTS idx_unit_workspace_id ON unit(workspace_id);
--rollback DROP INDEX IF EXISTS idx_unit_workspace_id;

--changeset jojohoch:2
CREATE INDEX IF NOT EXISTS idx_unit_key ON unit(key);
--rollback DROP INDEX IF EXISTS idx_unit_key;

--changeset jojohoch:3
CREATE INDEX IF NOT EXISTS idx_unit_metadata_unit_id ON unit_metadata(unit_id);
--rollback DROP INDEX IF EXISTS idx_unit_metadata_unit_id;

--changeset jojohoch:4
CREATE INDEX IF NOT EXISTS idx_unit_comment_unit_id ON unit_comment(unit_id);
--rollback DROP INDEX IF EXISTS idx_unit_comment_unit_id;

--changeset jojohoch:5
CREATE INDEX IF NOT EXISTS idx_unit_comment_user_id ON unit_comment(user_id);
--rollback DROP INDEX IF EXISTS idx_unit_comment_user_id;

--changeset jojohoch:6
CREATE INDEX IF NOT EXISTS idx_unit_user_unit_id ON unit_user(unit_id);
--rollback DROP INDEX IF EXISTS idx_unit_user_unit_id;

--changeset jojohoch:7
CREATE INDEX IF NOT EXISTS idx_unit_user_user_id ON unit_user(user_id);
--rollback DROP INDEX IF EXISTS idx_unit_user_user_id;

--changeset jojohoch:8
CREATE INDEX IF NOT EXISTS idx_unit_item_unit_id ON unit_item(unit_id);
--rollback DROP INDEX IF EXISTS idx_unit_item_unit_id;

--changeset jojohoch:9
CREATE INDEX IF NOT EXISTS idx_unit_item_metadata_unit_item_uuid ON unit_item_metadata(unit_item_uuid);
--rollback DROP INDEX IF EXISTS idx_unit_item_metadata_unit_item_uuid;

--changeset jojohoch:10
CREATE INDEX IF NOT EXISTS idx_unit_definition_unit_id ON unit_definition(unit_id);
--rollback DROP INDEX IF EXISTS idx_unit_definition_unit_id;

--changeset jojohoch:11
CREATE INDEX IF NOT EXISTS idx_workspace_user_workspace_id ON workspace_user(workspace_id);
--rollback DROP INDEX IF EXISTS idx_workspace_user_workspace_id;

--changeset jojohoch:12
CREATE INDEX IF NOT EXISTS idx_workspace_user_user_id ON workspace_user(user_id);
--rollback DROP INDEX IF EXISTS idx_workspace_user_user_id;

--changeset jojohoch:13
CREATE INDEX IF NOT EXISTS idx_review_unit_unit_id ON review_unit(unit_id);
--rollback DROP INDEX IF EXISTS idx_review_unit_unit_id;

--changeset jojohoch:14
CREATE INDEX IF NOT EXISTS idx_review_unit_review_id ON review_unit(review_id);
--rollback DROP INDEX IF EXISTS idx_review_unit_review_id;

--changeset jojohoch:15
CREATE INDEX IF NOT EXISTS idx_unit_comment_unit_item_uuid ON unit_comment_unit_item(unit_item_uuid);
--rollback DROP INDEX IF EXISTS idx_unit_comment_unit_item_uuid;

--changeset jojohoch:16
CREATE INDEX IF NOT EXISTS idx_unit_comment_unit_item_comment_id ON unit_comment_unit_item(unit_comment_id);
--rollback DROP INDEX IF EXISTS idx_unit_comment_unit_item_comment_id;

--changeset jojohoch:17
CREATE INDEX IF NOT EXISTS idx_workspace_group_admin_group_id ON workspace_group_admin(workspace_group_id);
--rollback DROP INDEX IF EXISTS idx_workspace_group_admin_group_id;

--changeset jojohoch:18
CREATE INDEX IF NOT EXISTS idx_workspace_group_admin_user_id ON workspace_group_admin(user_id);
--rollback DROP INDEX IF EXISTS idx_workspace_group_admin_user_id;

--changeset jojohoch:19
CREATE INDEX IF NOT EXISTS idx_unit_drop_box_history_unit_id ON unit_drop_box_history(unit_id);
--rollback DROP INDEX IF EXISTS idx_unit_drop_box_history_unit_id;

--changeset jojohoch:20
CREATE INDEX IF NOT EXISTS idx_unit_drop_box_history_source_workspace_id ON unit_drop_box_history(source_workspace_id);
--rollback DROP INDEX IF EXISTS idx_unit_drop_box_history_source_workspace_id;

--changeset jojohoch:21
CREATE INDEX IF NOT EXISTS idx_unit_drop_box_history_target_workspace_id ON unit_drop_box_history(target_workspace_id);
--rollback DROP INDEX IF EXISTS idx_unit_drop_box_history_target_workspace_id;

--changeset jojohoch:22
CREATE INDEX IF NOT EXISTS idx_review_workspace_id ON review(workspace_id);
--rollback DROP INDEX IF EXISTS idx_review_workspace_id;

--changeset jojohoch:23
CREATE INDEX IF NOT EXISTS idx_workspace_group_id ON workspace(group_id);
--rollback DROP INDEX IF EXISTS idx_workspace_group_id;
