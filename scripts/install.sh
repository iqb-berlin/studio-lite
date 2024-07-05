#!/bin/bash
set -e

declare APP_NAME='studio-lite'

declare INSTALL_SCRIPT_NAME=$0
declare SELECTED_VERSION=$1
declare REPO_URL="https://raw.githubusercontent.com/iqb-berlin/$APP_NAME"
declare REPO_API="https://api.github.com/repos/iqb-berlin/$APP_NAME"
declare TRAEFIK_REPO_URL="https://raw.githubusercontent.com/iqb-berlin/traefik"
declare TRAEFIK_REPO_API="https://api.github.com/repos/iqb-berlin/traefik"
declare REQUIRED_PACKAGES=("docker -v" "docker compose version")
declare OPTIONAL_PACKAGES=("make -v")

declare -A ENV_VARS
ENV_VARS[POSTGRES_USER]=root
ENV_VARS[POSTGRES_PASSWORD]=$(tr -dc 'a-zA-Z0-9' </dev/urandom | fold -w 16 | head -n 1)
ENV_VARS[POSTGRES_DB]=$APP_NAME
ENV_VAR_ORDER=(POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB)

declare TARGET_TAG
declare TARGET_DIR
declare TRAEFIK_DIR

get_release_version() {
  local latest_release
  latest_release=$(curl -s "$REPO_API"/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

  while read -p '1. Please name the desired release tag: ' -er -i "$latest_release" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null $REPO_URL/"$TARGET_TAG"/README.md 2>/dev/null; then
      printf "This version tag does not exist.\n"
    else
      break
    fi
  done

  # Check install script matches the selected release ...
  local new_install_script=$REPO_URL/"$TARGET_TAG"/scripts/install.sh
  if ! curl --stderr /dev/null "$new_install_script" | diff -q - "$INSTALL_SCRIPT_NAME" &>/dev/null; then
    printf -- '- Current install script does not match the selected release install script!\n'
    printf '  Downloading a new install script for the selected release ...\n'
    mv "$INSTALL_SCRIPT_NAME" "${INSTALL_SCRIPT_NAME}"_old
    if wget -q -O install_${APP_NAME}.sh "$new_install_script"; then
      chmod +x install_${APP_NAME}.sh
      printf '  Download successful!\n\n'
    else
      printf '  Download failed!\n\n'
      printf "  '%s' install script finished with error.\n" $APP_NAME
      exit 1
    fi

    printf "  The current install process will now execute the downloaded install script and terminate itself.\n"
    local is_continue
    read -p "  Do you want to continue? [Y/n] " -er -n 1 is_continue
    if [[ $is_continue =~ ^[nN]$ ]]; then
      printf "\n  You can check the the new install script (e.g.: 'less %s') or " install_${APP_NAME}.sh
      printf "compare it with the old one (e.g.: 'diff %s %s').\n\n" install_${APP_NAME}.sh "${INSTALL_SCRIPT_NAME}"_old

      printf "  If you want to resume this install process, please type: 'bash install_%s.sh %s'\n\n" \
        $APP_NAME "$TARGET_TAG"

      printf "'%s' install script finished.\n" $APP_NAME
      exit 0
    fi

    bash install_${APP_NAME}.sh "$TARGET_TAG"

    # remove old install script
    if [ -f "${INSTALL_SCRIPT_NAME}"_old ]; then
      rm "${INSTALL_SCRIPT_NAME}"_old
    fi

    exit $?
  fi

  printf "\n"
}

check_prerequisites() {
  printf "2. Checking prerequisites:\n\n"

  printf "2.1 Checking required packages ...\n"
  # Check required packages are installed
  local req_package
  for req_package in "${REQUIRED_PACKAGES[@]}"; do
    if $req_package >/dev/null 2>&1; then
      printf -- "- '%s' is working.\n" "$req_package"
    else
      printf "'%s' not working, please install the corresponding package before running!\n" "$req_package"
      exit 1
    fi
  done
  printf "Required packages successfully checked.\n\n"

  # Check optional packages are installed
  local opt_package
  printf "2.2 Checking optional packages ...\n"
  for opt_package in "${OPTIONAL_PACKAGES[@]}"; do
    if $opt_package >/dev/null 2>&1; then
      printf -- "- '%s' is working.\n" "$opt_package"
    else
      printf "%s not working! It is recommended to have the corresponding package installed.\n" "$opt_package"
      local is_continue
      read -p 'Continue anyway? [y/N] ' -er -n 1 is_continue

      if [[ ! $is_continue =~ ^[yY]$ ]]; then
        exit 1
      fi
    fi
  done
  printf "Optional packages successfully checked.\n\n"

  printf "2.3 Checking IQB infrastructure software is installed ...\n"
  # Check edge router (traefik) is already installed
  local traefik_dir_array
  readarray -d '' traefik_dir_array < <(find / -name ".env.traefik" -print0 2>/dev/null)

  local traefik_dir_count=${#traefik_dir_array[*]}
  if [ "$traefik_dir_count" -eq 0 ]; then
    printf -- "- No 'Traefik' installation found.\n"
    TRAEFIK_DIR=""

  elif [ "$traefik_dir_count" -eq 1 ]; then
    printf -- "- 'Traefik' installation found:\n"
    printf -- "  [1] %s\n" "$(dirname "${traefik_dir_array[0]}")"
    printf -- "  [2] Additional Installation\n\n"
    local choice
    while read -p "Which one do you want to choose? [1/2] " -er choice; do
      if [ "$choice" = 1 ]; then
        TRAEFIK_DIR=$(dirname "${traefik_dir_array[0]}")
        break

      elif [ "$choice" = 2 ]; then
        TRAEFIK_DIR=""
        break

      fi
    done

  else
    printf -- "- Multiple 'Traefik' installations found:\n"
    for ((i = 0; i < traefik_dir_count; i++)); do
      printf -- "  [%d] %s\n" $((i + 1)) "$(dirname "${traefik_dir_array[i]}")"
    done
    printf -- "  [%d] Additional Installation\n\n" $((traefik_dir_count + 1))

    while read -p "Which one do you want to choose? [1-$((traefik_dir_count + 1))] " -er choice; do
      if [ "$choice" -gt 0 ] && [ "$choice" -le "$traefik_dir_count" ]; then
        TRAEFIK_DIR=$(dirname "${traefik_dir_array[$((choice - 1))]}")
        break

      elif [ "$choice" -eq $((traefik_dir_count + 1)) ]; then
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

    printf "2.4 Installing missing IQB application infrastructure software:\n"
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
    local traefik_dir_array
    readarray -d '' traefik_dir_array < <(find / -name ".env.traefik" -mmin -5 -print0 2>/dev/null)

    local traefik_dir_count=${#traefik_dir_array[*]}
    if [ "$traefik_dir_count" -eq 0 ]; then
      printf -- '- No IQB Infrastructure environment file found.\n'
      printf 'Install script finished with error\n'
      exit 1

    elif [ "$traefik_dir_count" -eq 1 ]; then
      TRAEFIK_DIR=$(dirname "${traefik_dir_array[0]}")

    else
      printf -- "- Multiple 'Traefik' installations found:\n"
      for ((i = 0; i < traefik_dir_count; i++)); do
        printf -- "  [%d] %s\n" $((i + 1)) "$(dirname "${traefik_dir_array[i]}")"
      done

      local choice
      while read -p "Which one do you want to choose? [1-$traefik_dir_count] " -er choice; do
        if [ "$choice" -gt 0 ] && [ "$choice" -le "$traefik_dir_count" ]; then
          TRAEFIK_DIR=$(dirname "${traefik_dir_array[$((choice - 1))]}")
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

prepare_installation_dir() {
  while read -p '3. Determine installation directory: ' -er -i "$PWD/$APP_NAME" TARGET_DIR; do
    if [ ! -e "$TARGET_DIR" ]; then
      break

    elif [ -d "$TARGET_DIR" ] && [ -z "$(find "$TARGET_DIR" -maxdepth 0 -type d -empty 2>/dev/null)" ]; then
      local is_continue
      read -p "You have selected a non empty directory. Continue anyway? [y/N] " -er -n 1 is_continue
      if [[ ! $is_continue =~ ^[yY]$ ]]; then
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
  mkdir -p "$TARGET_DIR"/scripts/make
  mkdir -p "$TARGET_DIR"/scripts/migration

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
  download_file scripts/make/studio-lite.mk scripts/make/prod.mk
  download_file scripts/update_$APP_NAME.sh scripts/update.sh
  chmod +x scripts/update_$APP_NAME.sh

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

  local server_name
  if [ -n "$TRAEFIK_DIR" ]; then
    server_name=$(grep -oP 'SERVER_NAME=\K[^*]*' "$TRAEFIK_DIR"/.env.traefik)
  else
    read -p "SERVER_NAME: " -er -i "$server_name" server_name
  fi
  sed -i "s#SERVER_NAME.*#SERVER_NAME=$server_name#" .env.studio-lite

  sed -i "s#TAG.*#TAG=$TARGET_TAG#" .env.studio-lite

  local env_var_name
  for env_var_name in "${ENV_VAR_ORDER[@]}"; do
    local env_var_value
    read -p "$env_var_name: " -er -i "${ENV_VARS[$env_var_name]}" env_var_value
    sed -i "s#$env_var_name.*#$env_var_name=$env_var_value#" .env.studio-lite
  done

  local jwt_secret
  jwt_secret=$(openssl rand -base64 32 | tr -- '+/' '-_')
  sed -i "s#JWT_SECRET.*#JWT_SECRET=$jwt_secret#" .env.studio-lite

  # Setup makefiles
  sed -i "s#STUDIO_LITE_BASE_DIR :=.*#STUDIO_LITE_BASE_DIR := \\$TARGET_DIR#" scripts/make/studio-lite.mk
  sed -i "s#scripts/update.sh#scripts/update_${APP_NAME}.sh#" scripts/make/studio-lite.mk

  if [ -n "$TRAEFIK_DIR" ] && [ "$TRAEFIK_DIR" != "$TARGET_DIR" ]; then
    cp "$TRAEFIK_DIR"/Makefile "$TARGET_DIR"/Makefile
    printf "include %s/scripts/make/studio-lite.mk\n" "$TARGET_DIR" >>"$TARGET_DIR"/Makefile
  elif [ -n "$TRAEFIK_DIR" ] && [ "$TRAEFIK_DIR" == "$TARGET_DIR" ]; then
    printf "include %s/scripts/make/studio-lite.mk\n" "$TARGET_DIR" >>"$TARGET_DIR"Makefile
  else
    printf "include %s/scripts/make/studio-lite.mk\n" "$TARGET_DIR" >"$TARGET_DIR"/Makefile
  fi

  # Init nginx http configuration
  cp ./config/frontend/default.conf.http-template config/frontend/default.conf.template

  printf "\n"
}

application_start() {
  printf "'%s' installation done.\n\n" $APP_NAME

  if command make -v >/dev/null 2>&1; then
    local is_start_now
    read -p "Do you want to start $APP_NAME now? [Y/n] " -er -n 1 is_start_now
    printf '\n'
    if [[ ! $is_start_now =~ [nN] ]]; then
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
  if [ -z "$SELECTED_VERSION" ]; then
    printf "\n==================================================\n"
    printf "'%s' installation script started ..." $APP_NAME | tr '[:lower:]' '[:upper:]'
    printf "\n==================================================\n"
    printf "\n"

    get_release_version

    check_prerequisites

    install_application_infrastructure

    prepare_installation_dir

    download_files

    customize_settings

    application_start

  else

    TARGET_TAG="$SELECTED_VERSION"

    check_prerequisites

    install_application_infrastructure

    prepare_installation_dir

    download_files

    customize_settings

    application_start

  fi
}

main
