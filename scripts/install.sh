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
ENV_VARS[SERVER_NAME]=hostname.de
ENV_VARS[HTTP_PORT]=80
ENV_VARS[HTTPS_PORT]=443

ENV_VAR_ORDER=(POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB SERVER_NAME HTTP_PORT HTTPS_PORT)

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
      read -p 'Continue anyway [y/N]? ' -er -n 1 CONTINUE

      if [[ ! $CONTINUE =~ ^[yY]$ ]]; then
        exit 1
      fi
    }
  done
}

get_release_version() {
  LATEST_RELEASE=$(curl -s "$REPO_API"/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

  while read -p '1. Name the desired release tag: ' -er -i "$LATEST_RELEASE" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null $REPO_URL/"$TARGET_TAG"/README.md 2>/dev/null; then
      echo "This version tag does not exist."
    else
      break
    fi
  done
}

prepare_installation_dir() {
  while read -p '2. Determine installation directory: ' -er -i "$PWD/$APP_NAME" TARGET_DIR; do
    if [ ! -e "$TARGET_DIR" ]; then
      break
    elif [ -d "$TARGET_DIR" ] && [ -z "$(find "$TARGET_DIR" -maxdepth 0 -type d -empty 2>/dev/null)" ]; then
      read -p "You have selected a non empty directory. Continue anyway [y/N]? " -er -n 1 CONTINUE
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
  mkdir -p "$TARGET_DIR"/config/frontend
  mkdir -p "$TARGET_DIR"/config/traefik
  mkdir -p "$TARGET_DIR"/secrets/traefik
  mkdir -p "$TARGET_DIR"/database_dumps
  mkdir -p "$TARGET_DIR"/prometheus
  mkdir -p "$TARGET_DIR"/grafana/provisioning/dashboards
  mkdir -p "$TARGET_DIR"/grafana/provisioning/datasources

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
  echo "Downloading files..."
  download_file docker-compose.yml docker-compose.yml
  download_file docker-compose.prod.yml docker-compose.prod.yml
  download_file .env.prod.template .env.prod.template
  download_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template
  download_file config/traefik/tls-config.yml config/traefik/tls-config.yml
  download_file Makefile scripts/make/prod.mk
  download_file update.sh scripts/update.sh
  chmod +x update.sh
  download_file prometheus/prometheus.yml prometheus/prometheus.yml
  download_file grafana/config.monitoring grafana/config.monitoring
  download_file grafana/provisioning/dashboards/dashboard.yml grafana/provisioning/dashboards/dashboard.yml
  download_file grafana/provisioning/dashboards/traefik_rev4.json grafana/provisioning/dashboards/traefik_rev4.json
  download_file grafana/provisioning/datasources/datasource.yml grafana/provisioning/datasources/datasource.yml
  printf "Download done!\n\n"
}

customize_settings() {
  # Activate environment file
  cp .env.prod.template .env.prod

  # Init nginx http configuration
  cp ./config/frontend/default.conf.http-template config/frontend/default.conf.template

  # Set application BASE_DIR
  sed -i "s#BASE_DIR :=.*#BASE_DIR := \.#" Makefile

  # Write chosen version tag to env file
  sed -i "s#TAG.*#TAG=$TARGET_TAG#" .env.prod

  # Set environment variables in .env.prod
  printf "3. Set Environment variables (default postgres password is generated randomly):\n\n"
  for var in "${ENV_VAR_ORDER[@]}"; do
    read -p "$var: " -er -i ${ENV_VARS[$var]} NEW_ENV_VAR_VALUE
    sed -i "s#$var.*#$var=$NEW_ENV_VAR_VALUE#" .env.prod
  done

  read -p "Traefik administrator name: " -er TRAEFIK_ADMIN_NAME
  read -p "Traefik administrator password: " -er TRAEFIK_ADMIN_PASSWORD
  BASIC_AUTH_CRED=$TRAEFIK_ADMIN_NAME:$(openssl passwd -apr1 "$TRAEFIK_ADMIN_PASSWORD" | sed -e s/\\$/\\$\\$/g)
  printf "TRAEFIK_AUTH: $BASIC_AUTH_CRED\n"
  sed -i "s#TRAEFIK_AUTH.*#TRAEFIK_AUTH=$BASIC_AUTH_CRED#" .env.prod

  # Generate TLS files
  printf "\n"
  read -p "4. Do you have a TLS certificate and private key [y/N]? " -er -n 1 IS_TLS
  if [[ ! $IS_TLS =~ ^[yY]$ ]]; then
    printf "\nAn unsecure self-signed TLS certificate valid for 30 days will be generated ...\n"
    source .env.prod
    openssl req \
      -newkey rsa:2048 -nodes -subj "/CN=$SERVER_NAME" -keyout "$TARGET_DIR"/secrets/traefik/$APP_NAME.key \
      -x509 -days 30 -out "$TARGET_DIR"/secrets/traefik/$APP_NAME.crt
    printf "A self-signed certificate file and a private key file have been generated.\n"

  else
    printf "Generated certificate placeholder file.\nReplace this text with real content if necessary.\n" \
      >"$TARGET_DIR"/secrets/traefik/$APP_NAME.crt
    printf "Generated key placeholder file.\nReplace this text with real content if necessary.\n" \
      >"$TARGET_DIR"/secrets/traefik/$APP_NAME.key
    printf "\nA certificate placeholder file and a private key placeholder file have been generated.\n"
    printf "Please replace the content of the placeholder files 'secrets/traefik/%s.crt' " $APP_NAME
    printf "and 'secrets/traefik/%s.key' with your existing certificate and private key!\n" $APP_NAME
  fi

  printf "\n"
}

application_start() {
  printf "Installation done.\n\n"
  if command make -v >/dev/null 2>&1; then
    read -p "Do you want to start the application now [Y/n]? " -er -n 1 START_NOW
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

application_start
