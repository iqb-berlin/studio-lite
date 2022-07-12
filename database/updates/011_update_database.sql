alter table "user"
  add last_name varchar(100);
alter table "user"
  add first_name varchar(100);
alter table "user"
  add email varchar(100);
alter table "user"
  add "email_publish_approved" boolean default false;
