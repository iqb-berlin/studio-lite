alter table unit
  alter column scheme type text using scheme::text;

alter table unit
  add scheme_type varchar(50);

