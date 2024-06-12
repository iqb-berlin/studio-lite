#!/bin/bash

update_environment_file() {

  JWT_SECRET=$(openssl rand -base64 32 | tr -- '+/' '-_')
  sed -i '/POSTGRES_DB=.*/a\''\n## Backend\n'"JWT_SECRET=$JWT_SECRET" .env.studio-lite
}

main() {
  printf "\n============================================================\n"
  printf "Migration script '%s' started ..." "$0"
  printf "\n------------------------------------------------------------\n"
  printf "\n"

  update_environment_file

  printf "\n------------------------------------------------------------\n"
  printf "Migration script '%s' finished." "$0"
  printf "\n============================================================\n"
  printf "\n"
}

main
