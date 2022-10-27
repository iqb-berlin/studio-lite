#!/bin/bash

SELECTED_RELEASE=$1
REPO_URL=iqb-berlin/studio-lite

get_new_release_version() {
  . .env.prod

  SOURCE_TAG=$TAG
  LATEST_RELEASE=$(curl -s https://api.github.com/repos/$REPO_URL/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

  if [ "$SOURCE_TAG" = "latest" ]; then
    SOURCE_TAG="$LATEST_RELEASE"
  fi

  printf "Installed version: %s\n" "$SOURCE_TAG"
  printf "Latest available version: %s\n\n" "$LATEST_RELEASE"

  if [ "$SOURCE_TAG" = "$LATEST_RELEASE" ]; then
    echo "Latest version is already installed."
    exit 0
  fi

  while read -p 'Name the desired release tag: ' -er -i "${LATEST_RELEASE}" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/README.md 2>/dev/null; then
      echo "This version tag does not exist."
    else
      break
    fi
  done
}

create_backup() {
  mkdir -p ./backup/release/"$SOURCE_TAG"
  rsync -a --exclude='backup' . backup/release/"$SOURCE_TAG"
  echo "Backup created! Current release files have been saved at: $PWD/backup/release/$SOURCE_TAG"
}

run_update_script_in_selected_version() {
  if curl --silent https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/update.sh | diff -q - ./backup/release/"$SOURCE_TAG"/update.sh &>/dev/null; then
    # source update script end target update script differ
    printf "Update script has been modified in newer version!\n\nThis update script will download the new update script, terminate itself, and start the new one!\n\n"
    echo "Downloading new update script ..."
    wget -nv -O update.sh https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/update.sh
    chmod +x update.sh
    printf "Download done!\n\n"

    printf "Downloaded update script version %s will be started now.\n\n" "${TARGET_TAG}"
    ./update.sh "${TARGET_TAG}"
    exit $?
  fi
}

update_files() {
  echo "Downloading files..."
  wget -nv -O docker-compose.yml https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/docker-compose.yml
  wget -nv -O docker-compose.prod.yml https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/docker-compose.prod.yml
  wget -nv -O Makefile https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/make/prod.mk
  wget -nv -O https_on.sh https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/https_on.sh
  wget -nv -O https_off.sh https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/scripts/https_off.sh
  chmod +x https_on.sh
  chmod +x https_off.sh
  printf "Download done!\n\n"
}

get_modificated_file() {
  if curl --silent https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/"$2" | diff -q - ./backup/release/"$SOURCE_TAG"/"$1" &>/dev/null; then
    # source file end target file differ
    mv "$1" "$1".bkp 2>/dev/null
    wget -nv -O "$1" https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/"$2"
    if [ "$3" == "env-file" ]; then
      printf "Environment file template '%s' has been modified. Please enrich your current .env.prod file with new environment variables, or delete obsolete variables!\n\n" "$1"
    fi
    if [ "$3" == "conf-file" ]; then
      printf "Configuration file template '%s' has been modified. Please adjust the template with your current configuration file information, if necessary!\n\n" "$1"
    fi
  fi
}

check_config_files_modifications() {
  echo "Check config files for modifications ..."

  # check environment file
  get_modificated_file .env.prod.template .env.prod.template "env-file"

  # check nginx configuration files
  get_modificated_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template "conf-file"
  get_modificated_file config/frontend/default.conf.https-template config/frontend/default.conf.https-template "conf-file"

  printf "Config files modification check done!\n\n"
}

customize_settings() {
  # Set application BASE_DIR
  sed -i "s#BASE_DIR :=.*#BASE_DIR := \.#" Makefile
  sed -i "s#BASE_DIR=.*#BASE_DIR=\.#" https_on.sh
  sed -i "s#BASE_DIR=.*#BASE_DIR=\.#" https_off.sh

  # write chosen version tag to env file
  sed -i "s#TAG.*#TAG=$TARGET_TAG#" .env.prod
}

switch_tls() {
  read -p 'Use HTTPS? [y/N]: ' -er -n 1 TLS
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
}

application_warm_restart() {
  printf "Version update applied. Warm restart needed!\n\n"
  read -p "Do you want to restart the application now? [Y/n]:" -er -n 1 RESTART
  if [[ ! $RESTART =~ [nN] ]]; then
    make production-ramp-up
  else
    echo 'Update script finished.'
    exit 0
  fi
}

application_cold_restart() {
  read -p "Do you want to restart the application now? [Y/n]:" -er -n 1 RESTART
  if [[ ! $RESTART =~ [nN] ]]; then
    make production-shut-down
    make production-ramp-up
  else
    echo 'Update script finished.'
    exit 0
  fi
}

if [ -z "$SELECTED_RELEASE" ]; then
  echo "1. Update version"
  echo "2. Switch TLS on/off"
  read -p 'What do you want to do (1/2): ' -er -n 1 CHOICE
  printf "\n"

  if [ "$CHOICE" = 1 ]; then
    get_new_release_version
    create_backup
    run_update_script_in_selected_version
    update_files
    check_config_files_modifications
    customize_settings
    application_warm_restart
  elif [ "$CHOICE" = 2 ]; then
    switch_tls
    application_cold_restart
  fi
else
  TARGET_TAG="$SELECTED_RELEASE"

  update_files
  check_config_files_modifications
  customize_settings
  application_warm_restart
fi
