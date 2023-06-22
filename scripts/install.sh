#!/bin/bash
set -e

APP_NAME='studio-lite'

REPO_URL="https://raw.githubusercontent.com/iqb-berlin/$APP_NAME"
REPO_API="https://api.github.com/repos/iqb-berlin/$APP_NAME"
TRAEFIK_REPO_URL="https://raw.githubusercontent.com/iqb-berlin/traefik"
TRAEFIK_REPO_API="https://api.github.com/repos/iqb-berlin/traefik"
REQUIRED_PACKAGES=("docker -v" "docker compose version")
OPTIONAL_PACKAGES=("make -v")

declare -A ENV_VARS
ENV_VARS[POSTGRES_USER]=root
ENV_VARS[POSTGRES_PASSWORD]=$(tr -dc 'a-zA-Z0-9' </dev/urandom | fold -w 16 | head -n 1)
ENV_VARS[POSTGRES_DB]=$APP_NAME

ENV_VAR_ORDER=(POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB)

check_prerequisites() {
  printf "1. Checking prerequisites:\n\n"

  printf "1.1 Checking required packages ...\n"
  # Check required packages are installed
  for REQ_PACKAGE in "${REQUIRED_PACKAGES[@]}"; do
    if $REQ_PACKAGE >/dev/null 2>&1; then
      printf -- "- '%s' is working.\n" "$REQ_PACKAGE"
    else
      printf "'%s' not working, please install the corresponding package before running!\n" "$REQ_PACKAGE"
      exit 1
    fi
  done
  printf "Required packages successfully checked.\n\n"

  # Check optional packages are installed
  printf "1.2 Checking optional packages ...\n"
  for OPT_PACKAGE in "${OPTIONAL_PACKAGES[@]}"; do
    if $OPT_PACKAGE >/dev/null 2>&1; then
      printf -- "- '%s' is working.\n" "$OPT_PACKAGE"
    else
      printf "%s not working! It is recommended to have the corresponding package installed.\n" "$OPT_PACKAGE"
      read -p 'Continue anyway? [y/N] ' -er -n 1 CONTINUE

      if [[ ! $CONTINUE =~ ^[yY]$ ]]; then
        exit 1
      fi
    fi
  done
  printf "Optional packages successfully checked.\n\n"

  printf "1.3 Checking IQB infrastructure software is installed ...\n"
  # Check edge router (traefik) is already installed
  readarray -d '' TRAEFIK_DIR_ARRAY < <(find / -name ".env.traefik" -print0 2>/dev/null)
  DIR_COUNT=${#TRAEFIK_DIR_ARRAY[*]}

  if [ "$DIR_COUNT" -eq 0 ]; then
    printf -- "- No 'Traefik' installation found.\n"
    TRAEFIK_DIR=""

  elif [ "$DIR_COUNT" -eq 1 ]; then
    printf -- "- 'Traefik' installation found:\n"
    printf -- "  [1] %s\n" "$(dirname "${TRAEFIK_DIR_ARRAY[0]}")"
    printf -- "  [2] Additional Installation\n\n"
    while read -p "Which one do you want to choose? [1/2] " -er CHOICE; do
      if [ "$CHOICE" = 1 ]; then
        TRAEFIK_DIR=$(dirname "${TRAEFIK_DIR_ARRAY[0]}")
        break

      elif [ "$CHOICE" = 2 ]; then
        TRAEFIK_DIR=""
        break

      fi
    done

  else
    printf -- "- Multiple 'Traefik' installations found:\n"
    for ((i = 0; i < DIR_COUNT; i++)); do
      printf -- "  [%d] %s\n" $((i + 1)) "$(dirname "${TRAEFIK_DIR_ARRAY[i]}")"
    done
    printf -- "  [%d] Additional Installation\n\n" $((DIR_COUNT + 1))

    while read -p "Which one do you want to choose? [1-$((DIR_COUNT + 1))] " -er CHOICE; do
      if [ "$CHOICE" -gt 0 ] && [ "$CHOICE" -le "$DIR_COUNT" ]; then
        TRAEFIK_DIR=$(dirname "${TRAEFIK_DIR_ARRAY[$((CHOICE - 1))]}")
        break

      elif [ "$CHOICE" -eq $((DIR_COUNT + 1)) ]; then
        TRAEFIK_DIR=""
        break
      fi
    done
  fi

  printf "\nPrerequisites check finished successfully.\n\n"
}

install_application_infrastructure() {
  if [ -z "$TRAEFIK_DIR" ]; then
    LATEST_TRAEFIK_RELEASE=$(curl -s "$TRAEFIK_REPO_API"/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

    printf "1.4 Installing missing IQB application infrastructure software:\n"
    printf "Downloading traefik installation script version %s ...\n" "$LATEST_TRAEFIK_RELEASE"
    if wget -q -O install_traefik.sh $TRAEFIK_REPO_URL/"$LATEST_TRAEFIK_RELEASE"/scripts/install.sh; then
      chmod +x install_traefik.sh
      printf 'Download successful!\n\n'
    else
      printf 'Download failed!\n'
      printf 'Traefik installation script finished with error\n'
      exit 1
    fi

    printf "Downloaded installation script will be started now.\n\n"
    (./install_traefik.sh)
    rm ./install_traefik.sh

    printf '\nChecking Infrastructure installation ...\n'
    readarray -d '' TRAEFIK_DIR_ARRAY < <(find / -name ".env.traefik" -mmin -5 -print0 2>/dev/null)
    DIR_COUNT=${#TRAEFIK_DIR_ARRAY[*]}

    if [ "$DIR_COUNT" -eq 0 ]; then
      printf '- No IQB Infrastructure environment file found.\n'
      printf 'Install script finished with error\n'
      exit 1

    elif [ "$DIR_COUNT" -eq 1 ]; then
      TRAEFIK_DIR=$(dirname "${TRAEFIK_DIR_ARRAY[0]}")

    else
      printf -- "- Multiple 'Traefik' installations found:\n"
      for ((i = 0; i < DIR_COUNT; i++)); do
        printf -- "  [%d] %s\n" $((i + 1)) "$(dirname "${TRAEFIK_DIR_ARRAY[i]}")"
      done

      while read -p "Which one do you want to choose? [1-$DIR_COUNT] " -er CHOICE; do
        if [ "$CHOICE" -gt 0 ] && [ "$CHOICE" -le "$DIR_COUNT" ]; then
          TRAEFIK_DIR=$(dirname "${TRAEFIK_DIR_ARRAY[$((CHOICE - 1))]}")
          break
        fi
      done
    fi

    printf 'Infrastructure installation checked.\n'

    printf "\nMissing IQB application infrastructure successfully installed.\n\n"
    printf "\n------------------------------------------------------------\n"
    printf "Proceed with the original '%s' installation ..." $APP_NAME
    printf "\n------------------------------------------------------------\n"
    printf "\n"
  fi
}

get_release_version() {
  LATEST_RELEASE=$(curl -s "$REPO_API"/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

  while read -p '2. Name the desired release tag: ' -er -i "$LATEST_RELEASE" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null $REPO_URL/"$TARGET_TAG"/README.md 2>/dev/null; then
      printf "This version tag does not exist.\n"
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
        printf "'%s' installation script finished.\n" $APP_NAME
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
    printf "'%s' installation script finished with error.\n" $APP_NAME
    exit 1
  fi
}

download_files() {
  printf "4. Downloading files:\n"

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

  # Set Edge Router Directory
  sed -i "s#TRAEFIK_DIR.*#TRAEFIK_DIR=$TRAEFIK_DIR#" .env.studio-lite

  # Load defaults
  source .env.studio-lite

  # Setup environment variables
  printf "5. Set Environment variables (default postgres password is generated randomly):\n\n"

  if [ -n "$TRAEFIK_DIR" ]; then
    SERVER_NAME=$(grep -oP 'SERVER_NAME=\K[^*]*' "$TRAEFIK_DIR"/.env.traefik)
  else
    read -p "SERVER_NAME: " -er -i "$SERVER_NAME" SERVER_NAME
  fi
  sed -i "s#SERVER_NAME.*#SERVER_NAME=$SERVER_NAME#" .env.studio-lite

  sed -i "s#TAG.*#TAG=$TARGET_TAG#" .env.studio-lite

  for VAR in "${ENV_VAR_ORDER[@]}"; do
    read -p "$VAR: " -er -i ${ENV_VARS[$VAR]} NEW_ENV_VAR_VALUE
    sed -i "s#$VAR.*#$VAR=$NEW_ENV_VAR_VALUE#" .env.studio-lite
  done

  # Setup makefiles
  sed -i "s#STUDIO_LITE_BASE_DIR :=.*#STUDIO_LITE_BASE_DIR := \\$TARGET_DIR#" scripts/studio-lite.mk
  if [ -f Makefile ]; then
    printf "include %s/scripts/studio-lite.mk\n" "$TARGET_DIR" >>Makefile
  else
    printf "include %s/scripts/studio-lite.mk\n" "$TARGET_DIR" >Makefile
  fi
  if [ -n "$TRAEFIK_DIR" ] && [ "$TRAEFIK_DIR" != "$TARGET_DIR" ]; then
    printf "include %s/scripts/traefik.mk\n" "$TRAEFIK_DIR" >>Makefile
  fi

  # Init nginx http configuration
  cp ./config/frontend/default.conf.http-template config/frontend/default.conf.template

  printf "\n"
}

application_start() {
  printf "'%s' installation done.\n\n" $APP_NAME

  if command make -v >/dev/null 2>&1; then
    read -p "Do you want to start $APP_NAME now? [Y/n] " -er -n 1 START_NOW
    printf '\n'
    if [[ ! $START_NOW =~ [nN] ]]; then
      make studio-lite-up
    else
      printf "'%s' installation script finished.\n" $APP_NAME
      exit 0
    fi

  else
    printf 'You can start the docker services now.\n\n'
    printf "'%s' installation script finished.\n" $APP_NAME
    exit 0
  fi
}

main() {
  printf "\n==================================================\n"
  printf "'%s' installation script started ..." $APP_NAME | tr '[:lower:]' '[:upper:]'
  printf "\n==================================================\n"
  printf "\n"

  check_prerequisites

  install_application_infrastructure

  get_release_version

  prepare_installation_dir

  download_files

  customize_settings

  application_start
}

main
