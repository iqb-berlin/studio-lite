create table unit_user
(
  unit_id           integer not null
    references unit
      on delete cascade,
  user_id                integer not null
    references "user"
      on delete cascade,
  primary key (unit_id, user_id),
  last_seen_comment_changed_at TIMESTAMP with time zone
);

