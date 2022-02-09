create table public."user"
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

create table public.unit
(
  id                      serial
    primary key,
  workspace_id            integer                                not null
    references workspace
      on delete cascade,
  group_name              varchar(50),
  description             text,
  key                     varchar(20)                            not null,
  name                    varchar(100),
  editor                  varchar(50),
  player                  varchar(50),
  schemer                 varchar(50),
  metadata                jsonb,
  last_changed_metadata   timestamp with time zone default now(),
  variables               jsonb,
  definition_id           integer
    constraint unit_definition_id_fk
      references public.unit
      on delete cascade,
  last_changed_definition timestamp with time zone default now(),
  scheme                  jsonb,
  last_changed_scheme     timestamp with time zone default now() not null
);


CREATE TABLE public.app_config
(
  key character varying(50) NOT NULL,
  content jsonb,
  PRIMARY KEY (key)
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
