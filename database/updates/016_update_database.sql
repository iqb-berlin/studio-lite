create table resource_package
(
  id         serial not null
    primary key,
  elements   text [],
  name        varchar(100),
  created_at timestamp with time zone default now()
);
