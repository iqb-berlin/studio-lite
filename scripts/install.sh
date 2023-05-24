#!/bin/bash
set -e

APP_NAME='studio-lite'

REPO_URL="https://raw.githubusercontent.com/iqb-berlin/$APP_NAME"
REPO_API="https://api.github.com/repos/iqb-berlin/$APP_NAME"
REQUIRED_PACKAGES=("docker -v" "docker compose version")
OPTIONAL_PACKAGES=("make -v")

declare -A ENV_VARS
ENV_VARS[POSTGRES_USER]=root
ENV_VARS[POSTGRES_PASSWORD]=$(tr -dc 'a-zA-Z0-9' </dev/urandom | fold -w 16 | head -n 1)
ENV_VARS[POSTGRES_DB]=$APP_NAME

ENV_VAR_ORDER=(POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB)

check_prerequisites() {
  printf "1. Checking prerequisites "

  for APP in "${REQUIRED_PACKAGES[@]}"; do
    {
      $APP >/dev/null 2>&1
      printf '.'
    } || {
      echo "$APP not found, please install before running!"
      exit 1
    }
  done

  for APP in "${OPTIONAL_PACKAGES[@]}"; do
    {
      $APP >/dev/null 2>&1
      printf '.'
    } || {
      echo "$APP not found! It is recommended to have it installed."
      read -p 'Continue anyway? [y/N] ' -er -n 1 CONTINUE

      if [[ ! $CONTINUE =~ ^[yY]$ ]]; then
        exit 1
      fi
    }
  done

  printf "\nPrerequisites check finished successfully.\n\n"
}

get_release_version() {
  LATEST_RELEASE=$(curl -s "$REPO_API"/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

  while read -p '2. Name the desired release tag: ' -er -i "$LATEST_RELEASE" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null $REPO_URL/"$TARGET_TAG"/README.md 2>/dev/null; then
      echo "This version tag does not exist."
    else
      break
    fi
  done

  printf "\n"
}

prepare_installation_dir() {
  while read -p '3. Determine installation directory: ' -er -i "$PWD/$APP_NAME" TARGET_DIR; do
    if [ ! -e "$TARGET_DIR" ]; then
      break

    elif [ -d "$TARGET_DIR" ] && [ -z "$(find "$TARGET_DIR" -maxdepth 0 -type d -empty 2>/dev/null)" ]; then
      read -p "You have selected a non empty directory. Continue anyway? [y/N] " -er -n 1 CONTINUE
      if [[ ! $CONTINUE =~ ^[yY]$ ]]; then
        echo 'Installation script finished.'
        exit 0
      fi

      break

    else
      printf "'%s' is not a directory!\n\n" "$TARGET_DIR"
    fi

  done

  printf "\n"

  mkdir -p "$TARGET_DIR"/backup/release
  mkdir -p "$TARGET_DIR"/backup/database_dump
  mkdir -p "$TARGET_DIR"/config/frontend
  mkdir -p "$TARGET_DIR"/scripts

  cd "$TARGET_DIR"
}

download_file() {
  if wget -q -O "$1" $REPO_URL/"$TARGET_TAG"/"$2"; then
    printf -- "- File '%s' successfully downloaded.\n" "$1"

  else
    printf -- "- File '%s' download failed.\n\n" "$1"
    echo 'Install script finished with error'
    exit 1
  fi
}

download_files() {
  echo "4. Downloading files:"

  download_file docker-compose.studio-lite.yaml docker-compose.yaml
  download_file docker-compose.studio-lite.prod.yaml docker-compose.studio-lite.prod.yaml
  download_file .env.studio-lite.template .env.studio-lite.template
  download_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template
  download_file scripts/studio-lite.mk scripts/make/prod.mk
  download_file update_$APP_NAME.sh scripts/update.sh
  chmod +x update_$APP_NAME.sh

  printf "Downloads done!\n\n"
}

customize_settings() {
  # Activate environment file
  cp .env.studio-lite.template .env.studio-lite
  source .env.studio-lite

  # Setup environment variables
  printf "5. Set Environment variables (default postgres password is generated randomly):\n\n"

  read -p "SERVER_NAME: " -er -i "$SERVER_NAME" SERVER_NAME
  sed -i "s#SERVER_NAME.*#SERVER_NAME=$SERVER_NAME#" .env.studio-lite

  sed -i "s#TAG.*#TAG=$TARGET_TAG#" .env.studio-lite

  for VAR in "${ENV_VAR_ORDER[@]}"; do
    read -p "$VAR: " -er -i ${ENV_VARS[$VAR]} NEW_ENV_VAR_VALUE
    sed -i "s#$VAR.*#$VAR=$NEW_ENV_VAR_VALUE#" .env.studio-lite
  done

  # Setup makefiles
  sed -i "s#BASE_DIR :=.*#BASE_DIR := \.#" scripts/studio-lite.mk
  echo "include scripts/studio-lite.mk" >Makefile

  # Init nginx http configuration
  cp ./config/frontend/default.conf.http-template config/frontend/default.conf.template

  printf "\n"
}

application_start() {
  printf 'Installation done.\n\n'

  if command make -v >/dev/null 2>&1; then
    read -p "Do you want to start $APP_NAME now? [Y/n] " -er -n 1 START_NOW
    if [[ ! $START_NOW =~ [nN] ]]; then
      printf '\n'
      make studio-lite-up
    else
      printf '\nInstallation script finished.\n'
      exit 0
    fi

  else
    printf 'You can start the docker services now.\n\n'
    printf 'Installation script finished.\n'
    exit 0
  fi
}

main() {
  printf 'Installation script started ...\n\n'

  check_prerequisites

  get_release_version

  prepare_installation_dir

  download_files

  customize_settings

  application_start
}

main
