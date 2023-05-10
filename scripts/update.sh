#!/bin/bash

APP_NAME='studio-lite'

SELECTED_VERSION=$1
REPO_URL="https://raw.githubusercontent.com/iqb-berlin/$APP_NAME"
REPO_API="https://api.github.com/repos/iqb-berlin/$APP_NAME"
HAS_ENV_FILE_UPDATE=false
HAS_CONFIG_FILE_UPDATE=false

get_new_release_version() {
  LATEST_RELEASE=$(curl -s "$REPO_API"/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

  if [ "$SOURCE_TAG" = "latest" ]; then
    SOURCE_TAG="$LATEST_RELEASE"
  fi

  printf "Installed version: %s\n" "$SOURCE_TAG"
  printf "Latest available release: %s\n\n" "$LATEST_RELEASE"

  if [ "$SOURCE_TAG" = "$LATEST_RELEASE" ]; then
    echo "Latest release is already installed!"
    read -p "Continue anyway? [Y/n] " -er -n 1 CONTINUE

    if [[ $CONTINUE =~ ^[nN]$ ]]; then
      echo 'Update script finished.'
      exit 0
    fi

    printf "\n"
  fi

  while read -p 'Name the desired version: ' -er -i "${LATEST_RELEASE}" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null $REPO_URL/"$TARGET_TAG"/README.md 2>/dev/null; then
      echo "This version tag does not exist."

    else
      break
    fi

  done
}

create_backup() {
  mkdir -p ./backup/release/"$SOURCE_TAG"
  tar -cf - --exclude='./backup' . | tar -xf - -C ./backup/release/"$SOURCE_TAG"
  printf "\nBackup created!\nCurrent release files have been saved at: '%s'\n\n" "$PWD/backup/release/$SOURCE_TAG"
}

run_update_script_in_selected_version() {
  CURRENT_UPDATE_SCRIPT=./backup/release/"$SOURCE_TAG"/update_$APP_NAME.sh
  NEW_UPDATE_SCRIPT=$REPO_URL/"$TARGET_TAG"/scripts/update.sh

  if [ ! -f "$CURRENT_UPDATE_SCRIPT" ] || ! curl --stderr /dev/null "$NEW_UPDATE_SCRIPT" | diff -q - "$CURRENT_UPDATE_SCRIPT" &>/dev/null; then
    if [ ! -f "$CURRENT_UPDATE_SCRIPT" ]; then
      echo "Update script 'update_$APP_NAME.sh' does not exist!"

    elif ! curl --stderr /dev/null "$NEW_UPDATE_SCRIPT" | diff -q - "$CURRENT_UPDATE_SCRIPT" &>/dev/null; then
      echo 'Update script has been modified in newer version!'
    fi

    printf "The running update script will download the desired update script, terminate itself, and start the new one!\n\n"
    echo 'Downloading the desired update script ...'
    if wget -q -O update_$APP_NAME.sh "$NEW_UPDATE_SCRIPT"; then
      chmod +x update_$APP_NAME.sh
      echo 'Download successful!'
    else
      echo 'Download failed!'
      echo 'Update script finished with error'
      exit 1
    fi

    printf "\nDownloaded update script version %s will be started now.\n\n" "$TARGET_TAG"
    ./update_$APP_NAME.sh "$TARGET_TAG"
    exit $?
  fi
}

prepare_installation_dir() {
  mkdir -p ./backup/release
  if [ -d ./database_dump ]; then
    mv ./database_dump ./backup/database_dump
  else
    mkdir -p ./backup/database_dump
  fi
  mkdir -p ./config/frontend
}

download_file() {
  if wget -q -O "$1" $REPO_URL/"$TARGET_TAG"/"$2"; then
    printf -- "- File '%s' successfully downloaded.\n" "$1"
  else
    printf -- "- File '%s' download failed.\n\n" "$1"
    echo 'Update script finished with error'
    exit 1
  fi
}

update_files() {
  echo "Downloading files ..."

  download_file docker-compose.yml docker-compose.yml
  download_file docker-compose.prod.yml docker-compose.prod.yml
  download_file scripts/prod.mk scripts/make/prod.mk

  printf "Downloads done!\n\n"
}

get_modified_file() {
  SOURCE_FILE=./backup/release/"$SOURCE_TAG"/"$1"
  TARGET_FILE=$REPO_URL/"$TARGET_TAG"/"$2"
  CURRENT_ENV_FILE=.env.prod
  CURRENT_CONFIG_FILE=config/frontend/default.conf.template

  if [ ! -f "$SOURCE_FILE" ] || ! (curl --stderr /dev/null "$TARGET_FILE" | diff -q - "$SOURCE_FILE" &>/dev/null); then

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
  get_modified_file .env.prod.template .env.prod.template "env-file"

  # check nginx configuration files
  get_modified_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template "conf-file"

  printf "Template files update check done.\n\n"
}

customize_settings() {
  # write chosen version tag to env file
  sed -i "s#TAG.*#TAG=$TARGET_TAG#" .env.prod

  # Set makefile BASE_DIR
  sed -i "s#BASE_DIR :=.*#BASE_DIR := \.#" scripts/studio-lite.mk
}

finalize_update() {
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
      printf "\nWhen your files are checked, you could restart the application with 'make %s-up' at the " $APP_NAME
      printf "command line to put the update into effect.\n\n"

    else
      printf '\nWhen your files are checked, you could restart the docker services to put the update into effect.\n\n'
    fi

    echo 'The application will now shut down ...'
    make studio-lite-down

    echo 'Update script finished.'
    exit 0

  else
    printf "Version update applied.\n\n"
    # application_reload --> Seems not to work with liquibase containers!
    application_restart
  fi
}

application_reload() {
  if command make -v >/dev/null 2>&1; then
    read -p "Do you want to reload $APP_NAME now? [Y/n] " -er -n 1 RELOAD

    if [[ ! $RELOAD =~ [nN] ]]; then
      make studio-lite-up

    else
      echo 'Update script finished.'
      exit 0
    fi

  else
    printf 'You could start the updated docker services now.\n\n'
    echo 'Update script finished.'
    exit 0
  fi
}

application_restart() {
  if command make -v >/dev/null 2>&1; then
    read -p "Do you want to restart $APP_NAME now? [Y/n] " -er -n 1 RESTART

    if [[ ! $RESTART =~ [nN] ]]; then
      make studio-lite-down
      make studio-lite-up

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

main() {
  # Load current environment variables in .env.prod
  source .env.prod
  SOURCE_TAG=$TAG

  if [ -z "$SELECTED_VERSION" ]; then
    printf "Update script started ...\n\n"
    printf "1. Update %s\n" $APP_NAME
    printf "2. Exit update script\n\n"

    while read -p 'What do you want to do? [1/2] ' -er -n 1 CHOICE; do
      if [ "$CHOICE" = 1 ]; then
        printf "\n=== UPDATE %s ===\n\n" $APP_NAME

        get_new_release_version
        create_backup
        run_update_script_in_selected_version
        prepare_installation_dir
        update_files
        check_template_files_modifications
        customize_settings
        finalize_update

        break

      elif [ "$CHOICE" = 2 ]; then
        echo 'Installation script finished.'

        exit 0

      fi

    done

  else
    TARGET_TAG="$SELECTED_VERSION"

    prepare_installation_dir
    update_files
    check_template_files_modifications
    customize_settings
    finalize_update
  fi
}

main
