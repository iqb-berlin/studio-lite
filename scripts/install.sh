#!/bin/bash
set -e

APP_NAME='studio-lite'
REPO_URL=iqb-berlin/studio-lite
REQUIRED_PACKAGES=("docker -v" "docker compose version")
OPTIONAL_PACKAGES=("make -v")

declare -A ENV_VARS
ENV_VARS[POSTGRES_USER]=root
ENV_VARS[POSTGRES_PASSWORD]=$(tr -dc 'a-zA-Z0-9' </dev/urandom | fold -w 16 | head -n 1)
ENV_VARS[POSTGRES_DB]=studio
ENV_VARS[HTTP_PORT]=80

ENV_VAR_ORDER=(POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB HTTP_PORT)

check_prerequisites() {
  for APP in "${REQUIRED_PACKAGES[@]}"; do
    {
      $APP >/dev/null 2>&1
    } || {
      echo "$APP not found, please install before running!"
      exit 1
    }
  done
  for APP in "${OPTIONAL_PACKAGES[@]}"; do
    {
      $APP >/dev/null 2>&1
    } || {
      echo "$APP not found! It is recommended to have it installed."
      read -p 'Continue anyway? (y/N): ' -er -n 1 CONTINUE

      if [[ ! $CONTINUE =~ ^[yY]$ ]]; then
        exit 1
      fi
    }
  done
}

get_release_version() {
  LATEST_RELEASE=$(curl -s https://api.github.com/repos/$REPO_URL/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")
  while read -p '1. Name the desired release tag: ' -er -i "${LATEST_RELEASE}" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/README.md 2>/dev/null; then
      echo "This version tag does not exist."
    else
      break
    fi
  done
}

prepare_installation_dir() {
  read -p '2. Determine installation directory: ' -er -i "$PWD/$APP_NAME" TARGET_DIR

  if [ -z "$(find "$TARGET_DIR" -maxdepth 0 -type d -empty 2>/dev/null)" -a $? = 0 ]; then
    read -p "You have selected a non empty directory. Continue anyway? (y/N)" -er -n 1 CONTINUE
    if [[ ! $CONTINUE =~ ^[yY]$ ]]; then
      exit 1
    fi
  fi
  printf "\n"

  mkdir -p "$TARGET_DIR"/backup/release
  mkdir -p "$TARGET_DIR"/config/frontend/tls
  printf "Generated certificate placeholder file.\nReplace this text with real content if necessary.\n" > "$TARGET_DIR"/config/frontend/tls/studio.crt
  printf "Generated key placeholder file.\nReplace this text with real content if necessary.\n" > "$TARGET_DIR"/config/frontend/tls/studio.key
  mkdir -p "$TARGET_DIR"/database_dumps

  cd "$TARGET_DIR"
}

download_files() {
  echo "Downloading files..."
  wget -nv -O docker-compose.yml https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/docker-compose.yml
  wget -nv -O docker-compose.prod.yml https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/docker-compose.prod.yml
  wget -nv -O .env.prod.template https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/.env.prod.template
  wget -nv -O config/frontend/default.conf.http-template https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/config/frontend/default.conf.http-template
  wget -nv -O config/frontend/default.conf.https-template https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/config/frontend/default.conf.https-template
  wget -nv -O Makefile https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/make/prod.mk
  wget -nv -O update.sh https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/update.sh
  wget -nv -O https_on.sh https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/https_on.sh
  wget -nv -O https_off.sh https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/https_off.sh
  chmod +x update.sh
  chmod +x https_on.sh
  chmod +x https_off.sh
  printf "Download done!\n\n"
}

customize_settings() {
  # Activate environment file
  cp .env.prod.template .env.prod

  # Init nginx http configuration
  cp ./config/frontend/default.conf.http-template config/frontend/default.conf.template

  # Set application BASE_DIR
  sed -i "s#BASE_DIR :=.*#BASE_DIR := \.#" Makefile
  sed -i "s#BASE_DIR=.*#BASE_DIR=\.#" https_on.sh
  sed -i "s#BASE_DIR=.*#BASE_DIR=\.#" https_off.sh

  # Write chosen version tag to env file
  sed -i "s#TAG.*#TAG=$TARGET_TAG#" .env.prod

  # Set environment variables in .env.prod
  printf "3. Set Environment variables (default postgres password is generated randomly):\n\n"
  for var in "${ENV_VAR_ORDER[@]}"; do
    read -p "$var: " -er -i ${ENV_VARS[$var]} NEW_ENV_VAR_VALUE
    sed -i "s#$var.*#$var=$NEW_ENV_VAR_VALUE#" .env.prod
  done

  printf "\n\n"
}

set_tls() {
  read -p '4. Use HTTPS? [y/N]: ' -er -n 1 TLS
  printf "\n"

  if [[ $TLS =~ ^[yY]$ ]]; then
    # Load sample values for environment variables in .env.prod
    . .env.prod

    # Set server name
    read -p "SERVER_NAME: " -er -i "${SERVER_NAME}" NEW_SERVER_NAME
    sed -i "s#SERVER_NAME.*#SERVER_NAME=$NEW_SERVER_NAME#" .env.prod

    # Set https port
    read -p "HTTPS_PORT: " -er -i "${HTTPS_PORT}" NEW_HTTPS_PORT
    sed -i "s#HTTPS_PORT.*#HTTPS_PORT=$NEW_HTTPS_PORT#" .env.prod
    printf "\n"

    ./https_on.sh
  else
    ./https_off.sh
  fi

  printf "\n"
}

application_start() {
  printf "\nInstallation done!\n"
  if command make -v >/dev/null 2>&1; then
    read -p "Do you want to start the application now? [Y/n]:" -er -n 1 START_NOW
    if [[ ! $START_NOW =~ [nN] ]]; then
      make production-ramp-up
    else
      echo 'Installation script finished.'
      exit 0
    fi
  else
    printf 'You can start the docker services now.\n\n'
    echo 'Installation script finished.'
    exit 0
  fi
}

check_prerequisites

get_release_version

prepare_installation_dir

download_files

customize_settings

set_tls

application_start
