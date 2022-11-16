#!/bin/bash

SELECTED_VERSION=$1
REPO_URL=iqb-berlin/studio-lite
HAS_ENV_FILE_UPDATE=false
HAS_CONFIG_FILE_UPDATE=false

get_new_release_version() {
  LATEST_RELEASE=$(curl -s https://api.github.com/repos/$REPO_URL/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

  if [ "$SOURCE_TAG" = "latest" ]; then
    SOURCE_TAG="$LATEST_RELEASE"
  fi

  printf "Installed version: %s\n" "$SOURCE_TAG"
  printf "Latest available release: %s\n\n" "$LATEST_RELEASE"

  if [ "$SOURCE_TAG" = "$LATEST_RELEASE" ]; then
    echo "Latest release is already installed!"
    read -p "Continue anyway? (Y/n) " -er -n 1 CONTINUE

    if [[ $CONTINUE =~ ^[nN]$ ]]; then
      exit 0
    fi

    printf "\n"
  fi

  while read -p 'Name the desired version: ' -er -i "${LATEST_RELEASE}" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null https://raw.githubusercontent.com/${REPO_URL}/"${TARGET_TAG}"/README.md 2>/dev/null; then
      echo "This version tag does not exist."

    else
      break
    fi

  done
}

create_backup() {
  mkdir -p ./backup/release/"$SOURCE_TAG"
  tar -cf - --exclude='./backup' --exclude='./database_dumps' . | tar -xf - -C ./backup/release/"$SOURCE_TAG"
  printf "\nBackup created!\nCurrent release files have been saved at: '%s'\n\n" "$PWD/backup/release/$SOURCE_TAG"
}

run_update_script_in_selected_version() {
  CURRENT_UPDATE_SCRIPT=./backup/release/"$SOURCE_TAG"/update.sh
  NEW_UPDATE_SCRIPT=https://raw.githubusercontent.com/$REPO_URL/"$TARGET_TAG"/scripts/update.sh

  if [ ! -f CURRENT_UPDATE_SCRIPT ] || ! curl --stderr /dev/null "$NEW_UPDATE_SCRIPT" | diff -q - "$CURRENT_UPDATE_SCRIPT"; then
    if [ ! -f CURRENT_UPDATE_SCRIPT ]; then
      echo "Update script 'update.sh' does not exist!"

    elif ! curl --stderr /dev/null "$NEW_UPDATE_SCRIPT" | diff -q - "$CURRENT_UPDATE_SCRIPT"; then
      echo 'Update script has been modified in newer version!'
    fi

    printf "The running update script will download the desired update script, terminate itself, and start the new one!\n\n"
    echo 'Downloading the desired update script ...'
    if wget -q -O update.sh https://raw.githubusercontent.com/$REPO_URL/"$TARGET_TAG"/scripts/update.sh; then
      chmod +x update.sh
      echo 'Download successful!'
    else
      echo 'Download failed!'
      echo 'Update script finished with error'
      exit 1
    fi

    printf "\nDownloaded update script version %s will be started now.\n\n" "$TARGET_TAG"
    ./update.sh "$TARGET_TAG"
    exit $?
  fi
}

download_file() {
  if wget -q -O "$1" https://raw.githubusercontent.com/$REPO_URL/"$TARGET_TAG"/"$2"; then
    printf -- "- File '%s' successfully downloaded.\n" "$1"
  else
    printf -- "- File '%s' download failed.\n\n" "$1"
    echo 'Update script finished with error'
    exit 1
  fi
}

update_files() {
  echo "Downloading files..."
  download_file docker-compose.yml docker-compose.yml
  download_file docker-compose.prod.yml docker-compose.prod.yml
  download_file Makefile scripts/make/prod.mk
  download_file https_on.sh scripts/https_on.sh
  chmod +x https_on.sh
  download_file https_off.sh scripts/https_off.sh
  chmod +x https_off.sh
  printf "Downloads done!\n\n"
}

get_modificated_file() {
  SOURCE_FILE=./backup/release/"$SOURCE_TAG"/"$1"
  TARGET_FILE=https://raw.githubusercontent.com/$REPO_URL/"$TARGET_TAG"/"$2"
  CURRENT_ENV_FILE=.env.prod
  CURRENT_CONFIG_FILE=config/frontend/default.conf.template

  if [ ! -f "$SOURCE_FILE" ] || ! curl --stderr /dev/null "$TARGET_FILE" | diff -q - "$SOURCE_FILE" &>/dev/null; then

    # no source file exists anymore
    if [ ! -f "$SOURCE_FILE" ]; then
      if [ "$3" == "env-file" ]; then
        printf -- "- Environment template file '%s' does not exist anymore!\n" "$1"
        printf "  A version %s environment template file will be downloaded now.\n" "$TARGET_TAG"
        printf "  Please compare your current '%s' file with the new template file and update it with new environment variables, or delete obsolete variables, if necessary.\n" $CURRENT_ENV_FILE
      fi

      if [ "$3" == "conf-file" ]; then
        printf -- "- Configuration template file '%s' does not exist anymore!\n" "$1"
        printf "  A version %s configuration template file will be downloaded now.\n" "$TARGET_TAG"
        printf "  Please compare your current '%s' file with the new template file and update it, if necessary!\n" $CURRENT_CONFIG_FILE
      fi

    # source file and target file differ
    elif ! curl --stderr /dev/null "$TARGET_FILE" | diff -q - "$SOURCE_FILE" &>/dev/null; then
      if [ "$3" == "env-file" ]; then
        printf -- "- A new version of the current environment template file '%s' is available and will be downloaded now!\n" "$1"
        printf "  Please compare your current '%s' file with the new template file and update it with new environment variables, or delete obsolete variables, if necessary.\n" $CURRENT_ENV_FILE
      fi

      if [ "$3" == "conf-file" ]; then
        mv "$1" "$1".old 2>/dev/null
        cp $CURRENT_CONFIG_FILE ${CURRENT_CONFIG_FILE}.old
        printf -- "- A new version of the current configuration template file '%s' is available and will be downloaded now!\n" "$1"
        printf "  Please compare your current '%s' file with the new template file and update it, if necessary!\n" $CURRENT_CONFIG_FILE
      fi

    fi

    if wget -q -O "$1" "$TARGET_FILE"; then
      printf "  File '%s' was downloaded successfully.\n" "$1"

      if [ "$3" == "env-file" ]; then
        HAS_ENV_FILE_UPDATE=true
      fi

      if [ "$3" == "conf-file" ]; then
        HAS_CONFIG_FILE_UPDATE=true
      fi

    else
      printf "  File '%s' download failed.\n\n" "$1"
      echo 'Update script finished with error'
      exit 1

    fi

  else
    if [ "$3" == "env-file" ]; then
      printf -- "- No update of environment template file '%s' available.\n" "$1"
    fi

    if [ "$3" == "conf-file" ]; then
      printf -- "- No update of configuration template file '%s' available.\n" "$1"
    fi

  fi
}

check_template_files_modifications() {
  echo "Check template files for updates ..."

  # check environment file
  get_modificated_file .env.prod.template .env.prod.template "env-file"

  # check nginx configuration files
  get_modificated_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template "conf-file"
  get_modificated_file config/frontend/default.conf.https-template config/frontend/default.conf.https-template "conf-file"

  printf "Template files update check done.\n\n"
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
  if [ $HAS_ENV_FILE_UPDATE == "true" ] || [ $HAS_CONFIG_FILE_UPDATE == "true" ]; then
    if [ $HAS_ENV_FILE_UPDATE == "true" ] && [ $HAS_CONFIG_FILE_UPDATE == "true" ]; then
      echo 'Version, environment, and configuration update applied!'
      printf "\nPlease check your environment and configuration file for modifications!\n"
    elif [ $HAS_ENV_FILE_UPDATE == "true" ]; then
      echo 'Version and environment update applied!'
      printf "\nPlease check your environment file for modifications!\n"
    elif [ $HAS_CONFIG_FILE_UPDATE == "true" ]; then
      echo 'Version and configuration update applied!'
      printf "\nPlease check your configuration file for modifications!\n"
    fi

    if command make -v >/dev/null 2>&1; then
      printf "\nAfter that you could run 'make production-ramp-up' at the command line for the update to take effect.\n\n"

    else
      printf '\nAfter that you could restart the docker services for the update to take effect.\n\n'
    fi

    echo 'Update script finished.'
    exit 0

  else
    printf "Version update applied. Warm restart needed!\n\n"

    if command make -v >/dev/null 2>&1; then
      read -p "Do you want to restart the application now? [Y/n]:" -er -n 1 RESTART

      if [[ ! $RESTART =~ [nN] ]]; then
        make production-ramp-up

      else
        echo 'Update script finished.'
        exit 0
      fi

    else
      printf 'You could start the updated docker services now.\n\n'
      echo 'Update script finished.'
      exit 0
    fi

  fi
}

application_cold_restart() {
  if command make -v >/dev/null 2>&1; then
    read -p "Do you want to restart the application now? [Y/n]:" -er -n 1 RESTART

    if [[ ! $RESTART =~ [nN] ]]; then
      make production-shut-down
      make production-ramp-up

    else
      echo 'Update script finished.'
      exit 0
    fi

  else
    printf 'You can restart the docker services now.\n\n'
    echo 'Update script finished.'
    exit 0
  fi

}

# Load current environment variables in .env.prod
. .env.prod
SOURCE_TAG=$TAG

if [ -z "$SELECTED_VERSION" ]; then
  echo "Update script started ..."
  echo
  echo "1. Update application"
  echo "2. Switch TLS on/off"
  read -p 'What do you want to do (1/2): ' -er -n 1 CHOICE
  printf "\n"

  if [ "$CHOICE" = 1 ]; then
    get_new_release_version
    create_backup
    run_update_script_in_selected_version
    update_files
    check_template_files_modifications
    customize_settings
    application_warm_restart

  elif [ "$CHOICE" = 2 ]; then
    switch_tls
    application_cold_restart
  fi

else
  TARGET_TAG="$SELECTED_VERSION"

  update_files
  check_template_files_modifications
  customize_settings
  application_warm_restart
fi
