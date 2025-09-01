#!/usr/bin/env bash

declare APP_NAME='studio-lite'

migrate_make_studio_update() {
  if ! grep -q '.sh -s \$(TAG)' scripts/make/${APP_NAME}.mk; then
    sed -i.bak "s|scripts/update_${APP_NAME}.sh|scripts/update_${APP_NAME}.sh -s \$(TAG)|" \
      "${PWD}/scripts/make/${APP_NAME}.mk" && rm "${PWD}/scripts/make/${APP_NAME}.mk.bak"
  fi

  printf "File '%s' patched.\n" "scripts/make/${APP_NAME}.mk"
}

main() {
  printf "\n============================================================\n"
  printf "Migration script '%s' started ..." "${0}"
  printf "\n------------------------------------------------------------\n"
  printf "\n"

  migrate_make_studio_update

  printf "\n------------------------------------------------------------\n"
  printf "Migration script '%s' finished." "${0}"
  printf "\n============================================================\n"
  printf "\n"
}

main
