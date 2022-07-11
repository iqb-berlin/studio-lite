create table public.user
(
  id          serial
    primary key,
  name        varchar(50)  not null,
  password    varchar(100) not null,
  is_admin    boolean default false,
  description text
);

create table public.workspace_group
(
  id       serial
    primary key,
  name     varchar(50) not null,
  settings jsonb
);

create table public.workspace
(
  id       serial
    primary key,
  name     varchar(50) not null,
  group_id integer     not null
    references workspace_group
      on delete cascade,
  settings jsonb
);

create table workspace_user
(
  workspace_id integer not null
    references workspace
      on delete cascade,
  user_id      integer not null
    references "user"
      on delete cascade,
  primary key (workspace_id, user_id)
);

create table public.unit_definition
(
  id   serial
    constraint unit_definition_pk
      primary key,
  data text not null
);

create table public.unit
(
  id                      serial
    primary key,
  workspace_id            integer                                not null
    references workspace
      on delete cascade,
  last_changed_scheme     timestamp with time zone default now() not null,
  key                     varchar(20)                            not null,
  name                    varchar(100),
  metadata                jsonb,
  variables               jsonb,
  scheme                  jsonb,
  editor                  varchar(50),
  player                  varchar(50),
  schemer                 varchar(50),
  definition_id           integer
    constraint unit_definition_id_fk
      references unit_definition
      on delete cascade,
  last_changed_definition timestamp with time zone default now(),
  group_name              varchar(50),
  description             text,
  last_changed_metadata   timestamp with time zone default now()
);


create table public.setting
(
  key     varchar(50) not null
    constraint app_config_pkey
      primary key,
  content text        not null
);

create table public.verona_module
(
  key           varchar(50) not null
    primary key,
  metadata      jsonb,
  file          bytea,
  file_size     integer                  default 0,
  file_datetime timestamp with time zone default now()
);
