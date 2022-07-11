#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

  INSERT INTO public.user (name, password, is_admin)
    VALUES ('$DB_USER' , crypt('$DB_PASSWORD', gen_salt('bf',11)), 'True');

EOSQL
