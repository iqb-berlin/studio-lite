-- noinspection SqlNoDataSourceInspectionForFile

CREATE TABLE public.user
(
  id serial,
  name character varying(50) NOT NULL,
  password character varying(100) NOT NULL,
  email character varying(100),
  is_admin boolean DEFAULT false,
  PRIMARY KEY (id)
);

CREATE TABLE public.workspace_group
(
  id serial,
  name character varying(50) NOT NULL,
  settings jsonb,
  PRIMARY KEY (id)
);

CREATE TABLE public.workspace
(
  id serial,
  name character varying(50) NOT NULL,
  group_id integer NOT NULL,
  settings jsonb,
  PRIMARY KEY (id),
  FOREIGN KEY (group_id) REFERENCES public.workspace_group (id) MATCH SIMPLE
  ON UPDATE NO ACTION
  ON DELETE CASCADE
);

CREATE TABLE public.workspace_user
(
  workspace_id integer NOT NULL,
  user_id integer NOT NULL,
  PRIMARY KEY (workspace_id, user_id),
  FOREIGN KEY (user_id) REFERENCES public.user (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE,
  FOREIGN KEY (workspace_id) REFERENCES public.workspace (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
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

CREATE TABLE public.verona_module
(
  key character varying(50) NOT NULL,
  metadata jsonb,
  file bytea,
  PRIMARY KEY (key)
);
