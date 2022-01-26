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

CREATE TABLE public.unit
(
  id serial,
  workspace_id integer NOT NULL,
  last_changed timestamp without time zone NOT NULL DEFAULT now(),
  key character varying(20) NOT NULL,
  label character varying(100),
  metadata jsonb,
  definition bytea,
  variables jsonb,
  response_scheme jsonb,
  editor character varying(50),
  player character varying(50),
  schemer character varying(50),
  PRIMARY KEY (id),
  FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
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
