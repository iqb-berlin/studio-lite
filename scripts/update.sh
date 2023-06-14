#!/bin/bash

APP_NAME='studio-lite'

SELECTED_VERSION=$1
REPO_URL="https://raw.githubusercontent.com/iqb-berlin/$APP_NAME"
REPO_API="https://api.github.com/repos/iqb-berlin/$APP_NAME"
TRAEFIK_REPO_URL="https://raw.githubusercontent.com/iqb-berlin/traefik"
TRAEFIK_REPO_API="https://api.github.com/repos/iqb-berlin/traefik"
HAS_ENV_FILE_UPDATE=false
HAS_CONFIG_FILE_UPDATE=false

load_environment_variables() {
  # Load current environment variables in .env.studio-lite
  source .env.studio-lite
  SOURCE_TAG=$TAG
}

get_new_release_version() {
  LATEST_RELEASE=$(curl -s "$REPO_API"/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

  if [ "$SOURCE_TAG" = "latest" ]; then
    SOURCE_TAG="$LATEST_RELEASE"
  fi

  printf "Installed version: %s\n" "$SOURCE_TAG"
  printf "Latest available release: %s\n\n" "$LATEST_RELEASE"

  if [ "$SOURCE_TAG" = "$LATEST_RELEASE" ]; then
    printf "Latest release is already installed!\n"
    read -p "Continue anyway? [Y/n] " -er -n 1 CONTINUE

    if [[ $CONTINUE =~ ^[nN]$ ]]; then
      printf "'%s' update script finished.\n" $APP_NAME
      exit 0
    fi

    printf "\n"
  fi

  while read -p 'Name the desired version: ' -er -i "${LATEST_RELEASE}" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null $REPO_URL/"$TARGET_TAG"/README.md 2>/dev/null; then
      printf "This version tag does not exist.\n"

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

  if [ ! -f "$CURRENT_UPDATE_SCRIPT" ] ||
    ! curl --stderr /dev/null "$NEW_UPDATE_SCRIPT" | diff -q - "$CURRENT_UPDATE_SCRIPT" &>/dev/null; then
    if [ ! -f "$CURRENT_UPDATE_SCRIPT" ]; then
      printf "Update script 'update_%s.sh' does not exist!\n" $APP_NAME

    elif ! curl --stderr /dev/null "$NEW_UPDATE_SCRIPT" | diff -q - "$CURRENT_UPDATE_SCRIPT" &>/dev/null; then
      printf 'Update script has been modified in newer version!\n'
    fi

    printf "The running update script will download the desired update script, terminate itself, and start the new one!\n\n"
    printf 'Downloading the desired update script ...\n'
    if wget -q -O update_$APP_NAME.sh "$NEW_UPDATE_SCRIPT"; then
      chmod +x update_$APP_NAME.sh
      printf 'Download successful!\n'
    else
      printf 'Download failed!\n'
      printf "'%s' update script finished with error.\n" $APP_NAME
      exit 1
    fi

    printf "\nDownloaded update script version %s will be started now.\n\n" "$TARGET_TAG"
    ./update_$APP_NAME.sh "$TARGET_TAG"
    exit $?
  fi
}

prepare_installation_dir() {
  mkdir -p backup/release
  if [ -d database_dumps ]; then
    mv database_dumps backup/database_dump
  else
    mkdir -p backup/database_dump
  fi
  mkdir -p config/frontend
  if [ -d config/traefik ]; then
    rm -rf config/traefik
  fi
  if [ -d grafana ]; then
    rm -rf grafana
  fi
  if [ -d prometheus ]; then
    rm -rf prometheus
  fi
  mkdir -p scripts
  if [ -f docker-compose.prod.yml ]; then
    mv docker-compose.prod.yml docker-compose.$APP_NAME.prod.yaml
  fi
  if [ -f docker-compose.yml ]; then
    mv docker-compose.yml docker-compose.$APP_NAME.yaml
  fi
  if [ -f .env.prod ]; then
    mv .env.prod .env.$APP_NAME
  fi
  if [ -f .env.prod.template ]; then
    mv .env.prod.template .env.$APP_NAME.template
  fi
  rm Makefile
  if [ -f update.sh ]; then
    mv update.sh update_$APP_NAME.sh
  fi
}

download_file() {
  if wget -q -O "$1" $REPO_URL/"$TARGET_TAG"/"$2"; then
    printf -- "- File '%s' successfully downloaded.\n" "$1"
  else
    printf -- "- File '%s' download failed.\n\n" "$1"
    printf "'%s' update script finished with error.\n" $APP_NAME
    exit 1
  fi
}

update_files() {
  printf "Downloading files ...\n"

  download_file docker-compose.studio-lite.yaml docker-compose.yaml
  download_file docker-compose.studio-lite.prod.yaml docker-compose.studio-lite.prod.yaml
  download_file scripts/studio-lite.mk scripts/make/prod.mk

  printf "Downloads done!\n\n"
}

get_modified_file() {
  SOURCE_FILE="$1"
  TARGET_FILE=$REPO_URL/"$TARGET_TAG"/"$2"
  CURRENT_ENV_FILE=.env.studio-lite
  CURRENT_CONFIG_FILE=config/frontend/default.conf.template

  if [ ! -f "$SOURCE_FILE" ] || ! (curl --stderr /dev/null "$TARGET_FILE" | diff -q - "$SOURCE_FILE" &>/dev/null); then

    # no source file exists anymore
    if [ ! -f "$SOURCE_FILE" ]; then
      if [ "$3" == "env-file" ]; then
        printf -- "- Environment template file '%s' does not exist anymore!\n" "$1"
        printf "  A version %s environment template file will be downloaded now.\n" "$TARGET_TAG"
        printf "  Please compare your current '%s' file with the new template file and update it " $CURRENT_ENV_FILE
        printf "with new environment variables, or delete obsolete variables, if necessary.\n"
      fi

      if [ "$3" == "conf-file" ]; then
        printf -- "- Configuration template file '%s' does not exist anymore!\n" "$1"
        printf "  A version %s configuration template file will be downloaded now.\n" "$TARGET_TAG"
        printf "  Please compare your current '%s' file with the new template file and update it, " $CURRENT_CONFIG_FILE
        printf "if necessary!\n"
      fi

    # source file and target file differ
    elif ! curl --stderr /dev/null "$TARGET_FILE" | diff -q - "$SOURCE_FILE" &>/dev/null; then
      if [ "$3" == "env-file" ]; then
        printf -- "- A new version of the current environment template file '%s' is available and will be " "$1"
        printf "downloaded now!\n"
        printf "  Please compare your current '%s' file with the new template file and update it " $CURRENT_ENV_FILE
        printf "with new environment variables, or delete obsolete variables, if necessary.\n"
      fi

      if [ "$3" == "conf-file" ]; then
        mv "$1" "$1".old 2>/dev/null
        cp $CURRENT_CONFIG_FILE ${CURRENT_CONFIG_FILE}.old
        printf -- "- A new version of the current configuration template file '%s' is available and will be " "$1"
        printf "downloaded now!\n"
        printf "  Please compare your current '%s' file with the new template file and update it, " $CURRENT_CONFIG_FILE
        printf "if necessary!\n"
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
      printf "'%s' update script finished with error.\n" $APP_NAME
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
  printf "Check template files for updates ...\n"

  # check environment file
  get_modified_file .env.studio-lite.template .env.studio-lite.template "env-file"

  # check nginx configuration files
  get_modified_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template "conf-file"

  printf "Template files update check done.\n\n"
}

customize_settings() {
  # write chosen version tag to env file
  sed -i "s#TAG.*#TAG=$TARGET_TAG#" .env.studio-lite

  # Setup makefiles
  sed -i "s#STUDIO_LITE_BASE_DIR :=.*#STUDIO_LITE_BASE_DIR := \\$(pwd)#" scripts/studio-lite.mk
  if [ -f Makefile ]; then
    printf "include %s/scripts/studio-lite.mk\n" "$(pwd)" >>Makefile
  else
    printf "include %s/scripts/studio-lite.mk\n" "$(pwd)" >Makefile
  fi
  if [ -n "$TRAEFIK_DIR" ] && [ "$TRAEFIK_DIR" != "$(pwd)" ]; then
    printf "include %s/scripts/traefik.mk\n" "$TRAEFIK_DIR" >>Makefile
  fi
}

finalize_update() {
  if [ $HAS_ENV_FILE_UPDATE == "true" ] || [ $HAS_CONFIG_FILE_UPDATE == "true" ]; then
    if [ $HAS_ENV_FILE_UPDATE == "true" ] && [ $HAS_CONFIG_FILE_UPDATE == "true" ]; then
      printf 'Version, environment, and configuration update applied!\n\n'
      printf "Please check your environment and configuration file for modifications!\n\n"
    elif [ $HAS_ENV_FILE_UPDATE == "true" ]; then
      printf 'Version and environment update applied!\n\n'
      printf "Please check your environment file for modifications!\n\n"
    elif [ $HAS_CONFIG_FILE_UPDATE == "true" ]; then
      printf 'Version and configuration update applied!\n\n'
      printf "Please check your configuration file for modifications!\n\n"
    fi

    if docker compose --project-name "${PWD##*/}" ps -q >/dev/null; then
      printf "'%s' will now shut down ...\n" $APP_NAME
      docker compose --project-name "${PWD##*/}" down
    fi

    printf "\nWhen your files are checked, you could restart the application with 'make %s-up' at the " $APP_NAME
    printf "command line to put the update into effect.\n\n"

    printf "'%s' update script finished.\n" $APP_NAME
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
      printf "'%s' update script finished.\n" $APP_NAME
      exit 0
    fi

  else
    printf 'You could start the updated docker services now.\n\n'
    printf "'%s' update script finished.\n" $APP_NAME
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
      printf "'%s' update script finished.\n" $APP_NAME
      exit 0
    fi

  else
    printf 'You can restart the docker services now.\n\n'
    printf "'%s' update script finished.\n" $APP_NAME
    exit 0
  fi
}

update_application_infrastructure() {
  # Check edge router (traefik) is already installed
  printf "Checking IQB infrastructure software to be updated ...\n"

  if [ -z "$TRAEFIK_DIR" ]; then
    LATEST_TRAEFIK_RELEASE=$(curl -s "$TRAEFIK_REPO_API"/releases/latest | grep tag_name | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " ")

    printf -- "- No IQB infrastructure installation found.\n\n"
    printf "Installing missing IQB application infrastructure software:\n"
    printf "Downloading traefik installation script version %s ...\n" "$LATEST_TRAEFIK_RELEASE"
    if wget -q -O install_traefik.sh $TRAEFIK_REPO_URL/"$LATEST_TRAEFIK_RELEASE"/scripts/install.sh; then
      chmod +x install_traefik.sh
      printf 'Download successful!\n\n'
    else
      printf 'Download failed!\n'
      printf 'Update script finished with error\n'
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
      printf 'Update script finished with error\n'
      exit 1

    elif [ "$DIR_COUNT" -eq 1 ]; then
      TRAEFIK_DIR=$(dirname "${TRAEFIK_DIR_ARRAY[0]}")

    else
      printf -- "- Multiple traefik installations found:\n"
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

    if grep TRAEFIK_DIR= .env.studio-lite >/dev/null; then
      sed -i "s#TRAEFIK_DIR.*#TRAEFIK_DIR=$TRAEFIK_DIR#" .env.studio-lite
    else
      printf '\n# Infrastructure\nTRAEFIK_DIR=%s\n' "$TRAEFIK_DIR" >>.env.studio-lite
    fi
    if [ -n "$TRAEFIK_DIR" ] && [ "$TRAEFIK_DIR" != "$(pwd)" ]; then
      printf "include %s/scripts/traefik.mk\n" "$TRAEFIK_DIR" >>Makefile
    fi
    printf 'Infrastructure installation checked.\n'

    printf "\nMissing IQB application infrastructure successfully installed.\n\n"
    printf "'%s' update script finished.\n" $APP_NAME
    exit 0
  else
    printf -- "- Updating existing IQB infrastructure installation at: %s \n\n" "$TRAEFIK_DIR"

    printf "Go to infrastructure directory '%s' and execute infrastructure 'update script' ... " "$TRAEFIK_DIR"
    APP_DIR=$(pwd)
    if [ -e "$TRAEFIK_DIR/update_traefik.sh" ]; then
      cd "$TRAEFIK_DIR" && ./update_traefik.sh

      printf "include %s/scripts/traefik.mk\n" "$TRAEFIK_DIR" >>"$APP_DIR"/Makefile
      printf "Infrastructure update script finished.\n\n"
    else
      printf "Infrastructure update script '%s' not found." "$TRAEFIK_DIR/update_traefik.sh"
      printf "'%s' update script finished with error.\n" $APP_NAME
      exit 1
    fi
    if [ -e "$APP_DIR" ]; then
      cd "$APP_DIR" || exit 1

      printf "Proceed with the original '%s' installation ...\n\n" $APP_NAME
    else
      printf "'%s' installation folder '%s' not found." $APP_NAME "$APP_DIR"
      printf "'%s' update script finished with error.\n" $APP_NAME
      exit 1
    fi
  fi
}

main() {
  if [ -z "$SELECTED_VERSION" ]; then
    printf "\n==================================================\n"
    printf '%s update script started ...' $APP_NAME | tr '[:lower:]' '[:upper:]'
    printf "\n==================================================\n"
    printf "\n"
    printf "[1] Update %s\n" $APP_NAME
    printf "[2] Update IQB application infrastructure\n"
    printf "[3] Exit update script\n\n"

    load_environment_variables

    while read -p 'What do you want to do? [1-3] ' -er -n 1 CHOICE; do
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
        printf "\n=== UPDATE IQB application infrastructure ===\n\n"

        update_application_infrastructure

        break

      elif [ "$CHOICE" = 3 ]; then
        printf "'%s' update script finished.\n" $APP_NAME
        exit 0

      fi

    done

  else
    TARGET_TAG="$SELECTED_VERSION"

    prepare_installation_dir
    load_environment_variables
    update_files
    check_template_files_modifications
    customize_settings
    finalize_update
  fi
}

main
