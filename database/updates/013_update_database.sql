create table unit_comment
(
  id         serial not null
    constraint unit_comment_pk
      primary key,
  body       text,
  user_name  varchar(100),
  user_id    integer,
  parent_id  integer,
  unit_id    integer not null
    references unit
      on delete cascade,
  created_at TIMESTAMP with time zone,
  changed_at TIMESTAMP with time zone
);
