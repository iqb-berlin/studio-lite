#!/usr/bin/env bash

migrate_legacy_versions() {
  if [ -d backup/database_dump ]; then
    mv backup/database_dump/* backup/
    rmdir --ignore-fail-on-non-empty backup/database_dump
  fi
}

main() {
  printf "\n============================================================\n"
  printf "Migration script '%s' started ..." "${0}"
  printf "\n------------------------------------------------------------\n"
  printf "\n"

  migrate_legacy_versions

  printf "\n------------------------------------------------------------\n"
  printf "Migration script '%s' finished." "${0}"
  printf "\n============================================================\n"
  printf "\n"
}

main
