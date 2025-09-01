#!/usr/bin/env bash

migrate_legacy_versions() {
  if [ -d database_dumps ]; then
    mv database_dumps backup/database_dump
  fi
  if [ -d config/traefik ]; then
    rm -rf config/traefik
  fi
  if [ -d grafana ]; then
    rm -rf grafana
  fi
  if [ -d prometheus ]; then
    rm -rf prometheus
  fi
  if [ -f docker-compose.prod.yml ]; then
    mv docker-compose.prod.yml docker-compose.studio-lite.prod.yaml
  fi
  if [ -f docker-compose.yml ]; then
    mv docker-compose.yml docker-compose.studio-lite.yaml
  fi
  if [ -f .env.prod ]; then
    mv .env.prod .env.studio-lite
  fi
  if [ -f .env.prod.template ]; then
    mv .env.prod.template .env.studio-lite.template
  fi
  if [ -f update.sh ]; then
    mv update.sh update_studio-lite.sh
  fi
}

update_environment_file() {
  printf 'Update environment file ...\n'
  sed -i 's|# (empty) = hub.docker.com|# Docker Hub:   hub.docker.com or empty\n# GitLab:       scm.cms.hu-berlin.de:4567/iqb/studio-lite/|' .env.studio-lite
}

clean_up() {
  rm scripts/studio-lite.mk
  mv update_studio-lite.sh scripts/update_studio-lite.sh
}

main() {
  printf "\n============================================================\n"
  printf "Migration script '%s' started ..." "$0"
  printf "\n------------------------------------------------------------\n"
  printf "\n"

  migrate_legacy_versions
  update_environment_file
  clean_up

  printf "\n------------------------------------------------------------\n"
  printf "Migration script '%s' finished." "$0"
  printf "\n============================================================\n"
  printf "\n"
}
main
