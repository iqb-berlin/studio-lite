--liquibase formatted sql

--changeset jojohoch:1
create table unit_user
(
  unit_id                      integer not null
    references unit
      on delete cascade,
  user_id                      integer not null
    references "user"
      on delete cascade,
  primary key (unit_id, user_id),
  last_seen_comment_changed_at TIMESTAMP with time zone
);
--rollback drop table unit_user;

--changeset mechtelm:2
create table review
(
  id           serial
    primary key,
  workspace_id integer      not null
    references workspace
      on delete cascade,
  name         varchar(100) not null,
  link         varchar(100) not null,
  password     varchar(100),
  settings     jsonb
);
--rollback drop table review;

--changeset mechtelm:3
alter table review
  owner to superdb;
--rollback alter table review owner to pg_database_owner;

--changeset mechtelm:4
create table review_unit
(
  unit_id   integer not null
    references unit
      on delete cascade,
  review_id integer not null
    references review
      on delete cascade,
  "order"   integer,
  primary key (unit_id, review_id)
);
--rollback drop table review_unit

--changeset mechtelm:5
alter table review_unit
  owner to superdb;
--rollback alter table review_unit owner to pg_database_owner;
