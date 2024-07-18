#!/bin/bash

main() {
  printf "\n============================================================\n"
  printf "Migration script '%s' started ..." "$0"
  printf "\n------------------------------------------------------------\n"
  printf "\n"

  if [ -f update_studio-lite.sh ]; then
    mv update_studio-lite.sh scripts/update_studio-lite.sh
  fi

  printf "\n------------------------------------------------------------\n"
  printf "Migration script '%s' finished." "$0"
  printf "\n============================================================\n"
  printf "\n"
}

main
