-- noinspection SqlNoDataSourceInspectionForFile

CREATE TABLE public.user
(
  id serial,
  name character varying(50) NOT NULL,
  password character varying(100) NOT NULL,
  email character varying(100),
  isAdmin boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

CREATE TABLE public.workspaceGroup
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
  groupId integer NOT NULL,
  settings jsonb,
  PRIMARY KEY (id),
  FOREIGN KEY (groupId) REFERENCES public.workspaceGroup (id) MATCH SIMPLE
  ON UPDATE NO ACTION
  ON DELETE CASCADE
);

CREATE TABLE public.workspaceUser
(
  workspaceId integer NOT NULL,
  userId integer NOT NULL,
  PRIMARY KEY (workspaceId, userId),
  FOREIGN KEY (userId) REFERENCES public.user (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE,
  FOREIGN KEY (workspaceId) REFERENCES public.workspace (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
);

CREATE TABLE public.unit
(
  id serial,
  workspaceId integer NOT NULL,
  lastChanged timestamp without time zone NOT NULL DEFAULT now(),
  key character varying(20) NOT NULL,
  label character varying(100),
  metadata jsonb,
  definition bytea,
  variables jsonb,
  responseScheme jsonb,
  editor character varying(50),
  player character varying(50),
  schemer character varying(50),
  PRIMARY KEY (id),
  FOREIGN KEY (workspaceId) REFERENCES public.workspace (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
);

CREATE TABLE public.appConfig
(
  key character varying(50) NOT NULL,
  content jsonb,
  PRIMARY KEY (key)
);

CREATE TABLE public.module
(
  key character varying(50) NOT NULL,
  metadata jsonb,
  file bytea,
  PRIMARY KEY (key)
);
