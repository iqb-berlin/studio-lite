create table workspace_group_admin
(
  workspace_group_id integer not null
    references workspace_group
      on delete cascade,
  user_id      integer not null
    references "user"
      on delete cascade,
  primary key (workspace_group_id, user_id)
);
