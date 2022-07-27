create table review
(
  id                      serial
    primary key,
  workspace_id            integer                                not null
    references workspace
      on delete cascade,
  name                    varchar(100) not null,
  link                    varchar(100) not null,
  settings                jsonb
);

alter table review
  owner to superdb;

create table review_unit
(
  unit_id                      integer not null
    references unit
      on delete cascade,
  review_id                      integer not null
    references review
      on delete cascade,
  "order"            integer,
  primary key (unit_id, review_id)
);

alter table review_unit
  owner to superdb;
