#!/bin/bash

APP_NAME='studio-lite'

declare SELECTED_VERSION=$1
declare REPO_URL="https://raw.githubusercontent.com/iqb-berlin/$APP_NAME"
declare REPO_API="https://api.github.com/repos/iqb-berlin/$APP_NAME"
declare TRAEFIK_REPO_URL="https://raw.githubusercontent.com/iqb-berlin/traefik"
declare TRAEFIK_REPO_API="https://api.github.com/repos/iqb-berlin/traefik"
declare HAS_ENV_FILE_UPDATE=false
declare HAS_CONFIG_FILE_UPDATE=false
declare HAS_MIGRATION_FILES=false

declare APP_DIR
declare SOURCE_TAG
declare TARGET_TAG
declare IS_RELEASE_TAG
declare IS_PRERELEASE_TAG
declare TAG_EXISTS

load_environment_variables() {
  # Load current environment variables in .env.studio-lite
  source .env.studio-lite
  SOURCE_TAG=$TAG
  APP_DIR=$(pwd)
}

get_new_release_version() {
  local latest_release
  latest_release=$(curl -s "$REPO_API"/releases/latest |
    grep tag_name |
    cut -d : -f 2,3 |
    tr -d \" |
    tr -d , |
    tr -d " ")

  if [ "$SOURCE_TAG" = "latest" ]; then
    SOURCE_TAG="$latest_release"
  fi

  printf "Installed version: %s\n" "$SOURCE_TAG"
  printf "Latest available release: %s\n\n" "$latest_release"

  if [ "$SOURCE_TAG" = "$latest_release" ]; then
    printf "Latest release is already installed!\n"
    local continue
    read -p "Continue anyway? [Y/n] " -er -n 1 continue

    if [[ $continue =~ ^[nN]$ ]]; then
      printf "'%s' update script finished.\n" $APP_NAME
      exit 0
    fi

    printf "\n"
  fi

  while read -p '1. Name the desired version: ' -er -i "${latest_release}" TARGET_TAG; do
    if ! curl --head --silent --fail --output /dev/null $REPO_URL/"$TARGET_TAG"/README.md 2>/dev/null; then
      printf "This version tag does not exist.\n"

    else
      printf "\n"
      break
    fi

  done
}

create_backup() {
  printf "2. Backup creation\n"
  # Save installation directory
  mkdir -p "$PWD"/backup/release/"$SOURCE_TAG"
  tar -cf - --exclude='./backup' . | tar -xf - -C "$PWD"/backup/release/"$SOURCE_TAG"
  printf -- "- Current release files have been saved at: '%s'\n" "$PWD/backup/release/$SOURCE_TAG"

  # Dump the db completely
  if test "$(docker compose \
      --file "$PWD"/docker-compose.studio-lite.yaml \
      --file "$PWD"/docker-compose.studio-lite.prod.yaml \
      --env-file "$PWD"/.env.studio-lite \
    ps -q db)"
  then
    if docker compose \
        --file "$PWD"/docker-compose.studio-lite.yaml \
        --file "$PWD"/docker-compose.studio-lite.prod.yaml \
        --env-file "$PWD"/.env.studio-lite \
      exec -it db \
        pg_dumpall --username="$POSTGRES_USER" >"$PWD"/backup/database_dump/all.sql
    then
      printf -- "- Current db dump has been saved at: '%s'\n" "$PWD/backup/release/database_dump/all.sql"
    fi
  else
    docker compose \
        --progress quiet \
        --file "$PWD"/docker-compose.studio-lite.yaml \
        --file "$PWD"/docker-compose.studio-lite.prod.yaml \
        --env-file "$PWD"/.env.studio-lite \
      up -d db
    sleep 5 ## wait until db startup is completed
    if docker compose \
        --file "$PWD"/docker-compose.studio-lite.yaml \
        --file "$PWD"/docker-compose.studio-lite.prod.yaml \
        --env-file "$PWD"/.env.studio-lite \
      exec -it db \
        pg_dumpall --username="$POSTGRES_USER" >"$PWD"/backup/database_dump/all.sql
    then
      printf -- "- Current db dump has been saved at: '%s'\n" "$PWD/backup/release/database_dump/all.sql"
    fi
    docker compose \
        --progress quiet \
        --file "$PWD"/docker-compose.studio-lite.yaml \
        --file "$PWD"/docker-compose.studio-lite.prod.yaml \
        --env-file "$PWD"/.env.studio-lite \
      down
  fi

  printf "Backup created.\n\n"
}

run_update_script_in_selected_version() {
  local current_update_script
  current_update_script=$PWD/backup/release/"$SOURCE_TAG"/scripts/update_$APP_NAME.sh

  local new_update_script
  new_update_script=$REPO_URL/"$TARGET_TAG"/scripts/update.sh

  printf "3. Update script modification check\n"
  if [ ! -f "$current_update_script" ] ||
    ! curl --stderr /dev/null "$new_update_script" | diff -q - "$current_update_script" &>/dev/null; then
    if [ ! -f "$current_update_script" ]; then
      printf -- "- Current update script 'update_%s.sh' does not exist (anymore)!\n" $APP_NAME

    elif ! curl --stderr /dev/null "$new_update_script" | diff -q - "$current_update_script" &>/dev/null; then
      printf -- '- Current update script is outdated!\n'
    fi

    printf '  Downloading a new update script in the selected version ...\n'
    if wget -q -O "$PWD"/scripts/update_$APP_NAME.sh "$new_update_script"; then
      chmod +x "$PWD"/scripts/update_$APP_NAME.sh
      printf '  Download successful!\n'
    else
      printf '  Download failed!\n'
      printf "  '%s' update script finished with error.\n" $APP_NAME
      exit 1
    fi

    printf "  Current update script will now call the downloaded update script and terminate itself.\n"
    local continue
    read -p "  Do you want to continue? [Y/n] " -er -n 1 continue
    if [[ $continue =~ ^[nN]$ ]]; then
      printf "  You can check the the new update script (e.g.: 'less scripts/update_%s.sh') or " $APP_NAME
      printf "compare it with the old one (e.g.: 'diff %s %s').\n\n" \
        "scripts/update_$APP_NAME.sh" "backup/release/$SOURCE_TAG/update_$APP_NAME.sh"

      printf "  If you want to resume this update process, please type: 'bash scripts/update_%s.sh %s'\n\n" \
        $APP_NAME "$TARGET_TAG"

      printf "'%s' update script finished.\n" $APP_NAME
      exit 0
    fi

    printf "Update script modification check done.\n\n"

    bash "$PWD"/scripts/update_$APP_NAME.sh "$TARGET_TAG"
    exit $?

  else
    printf -- "- Update script has not been changed in the selected version\n"
    printf "Update script modification check done.\n\n"
  fi
}

prepare_installation_dir() {
  mkdir -p "$PWD"/backup/release
  mkdir -p "$PWD"/backup/database_dump
  mkdir -p "$PWD"/config/frontend
  mkdir -p "$PWD"/scripts/make
  mkdir -p "$PWD"/scripts/migration
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
  printf "4. File download\n"

  download_file "$PWD"/docker-compose.studio-lite.yaml docker-compose.yaml
  download_file "$PWD"/docker-compose.studio-lite.prod.yaml docker-compose.studio-lite.prod.yaml
  download_file "$PWD"/scripts/make/studio-lite.mk scripts/make/prod.mk

  printf "File download done.\n\n"
}

get_modified_file() {
  local source_file
  source_file="$PWD"/"$1"

  local target_file
  target_file=$REPO_URL/"$TARGET_TAG"/"$2"

  local file_type
  file_type="$3"

  local current_env_file
  current_env_file=.env.studio-lite

  local current_config_file
  current_config_file="$PWD"/config/frontend/default.conf.template

  if [ ! -f "$source_file" ] || ! (curl --stderr /dev/null "$target_file" | diff -q - "$source_file" &>/dev/null); then

    # no source file exists anymore
    if [ ! -f "$source_file" ]; then
      if [ "$file_type" == "env-file" ]; then
        printf -- "- Environment template file '%s' does not exist anymore.\n" "$source_file"
        printf "  A version %s environment template file will be downloaded now ...\n" "$TARGET_TAG"
        printf "  Please compare your current environment file with the new template file and update it "
        printf "with new environment variables, or delete obsolete variables, if necessary.\n"
        printf "  For comparison use e.g. 'diff %s %s'.\n" $current_env_file "$source_file"
      fi

      if [ "$file_type" == "conf-file" ]; then
        printf -- "- Configuration template file '%s' does not exist (anymore).\n" "$source_file"
        printf "  A version %s configuration template file will be downloaded now ...\n" "$TARGET_TAG"
        printf "  Please compare your current '%s' file with the new template file and update it" "$current_config_file"
        printf ", if necessary!\n"
      fi

    # source file and target file differ
    elif ! curl --stderr /dev/null "$target_file" | diff -q - "$source_file" &>/dev/null; then
      if [ "$file_type" == "env-file" ]; then
        printf -- "- The current environment template file '%s' is outdated.\n" "$source_file"
        printf "  A version %s environment template file will be downloaded now ...\n" "$TARGET_TAG"
        printf "  Please compare your current environment file with the new template file and update it "
        printf "with new environment variables, or delete obsolete variables, if necessary.\n"
        printf "  For comparison use e.g. 'diff %s %s'.\n" $current_env_file "$source_file"
      fi

      if [ "$file_type" == "conf-file" ]; then
        mv "$source_file" "$source_file".old 2>/dev/null
        cp "$current_config_file" "$current_config_file.old"
        printf -- "- The current configuration template file '%s' is outdated.\n" "$source_file"
        printf "  A version %s configuration template file will be downloaded now ...\n" "$TARGET_TAG"
        printf "  Please compare your current configuration file with the new template file and update it, "
        printf "if necessary!\n"
        printf "  For comparison use e.g. 'diff %s %s'.\n" "$current_config_file" "$source_file"
      fi

    fi

    if wget -q -O "$source_file" "$target_file"; then
      printf "  File '%s' was downloaded successfully.\n" "$source_file"

      if [ "$file_type" == "env-file" ]; then
        HAS_ENV_FILE_UPDATE=true
      fi

      if [ "$file_type" == "conf-file" ]; then
        HAS_CONFIG_FILE_UPDATE=true
      fi

    else
      printf "  File '%s' download failed.\n\n" "$source_file"
      printf "'%s' update script finished with error.\n" $APP_NAME
      exit 1

    fi

  else
    if [ "$file_type" == "env-file" ]; then
      printf -- "- The current environment template file '%s' is still up to date.\n" "$source_file"
    fi

    if [ "$file_type" == "conf-file" ]; then
      printf -- "- The current configuration template file '%s' is still up to date.\n" "$source_file"
    fi

  fi
}

check_environment_file_modifications() {
  # check environment file
  printf "5. Environment template file modification check\n"
  get_modified_file .env.studio-lite.template .env.studio-lite.template "env-file"
  printf "Environment template file modification check done.\n\n"
}

check_tag_exists() {
  local tag
  tag="$1"

  local status_code
  status_code=$(curl \
      --write-out "%{response_code}\n" \
      --silent \
      --output /dev/null \
    https://api.github.com/repos/iqb-berlin/studio-lite/releases/tags/"$tag")

  if test "$status_code" -eq "200"; then
    TAG_EXISTS=true
    #printf "  Tag '%s' exists.\n" "$tag"
  else
    TAG_EXISTS=false
    #printf "  Tag '%s' does not exist!\n" "$tag"
  fi
}

check_tag_format() {
  local tag
  tag="$1"

  if test "$(printf "%s\n" "$tag" |
    sed -nre 's/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\-(alpha|beta|rc)(\.[1-9][0-9]*|[1-9][0-9]*)?$/&/p')"
  then
    IS_RELEASE_TAG=false
    IS_PRERELEASE_TAG=true
    #printf "  Tag '%s' is a pre-release tag.\n" "$tag"
  elif test "$(printf "%s\n" "$tag" | sed -nre 's/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/&/p')"
  then
    IS_RELEASE_TAG=true
    IS_PRERELEASE_TAG=false
    #printf "  Tag '%s' is a release tag.\n" "$tag"
  else
    IS_RELEASE_TAG=false
    IS_PRERELEASE_TAG=false
    #printf "  Tag '%s' is neither a release tag nor pre-release tag!\n" "$tag"
  fi
}

run_optional_migration_scripts() {
  printf "6. Optional migration scripts check\n"
  local source_tag_is_release
  local source_tag_is_prerelease
  local target_tag_is_release
  local target_tag_is_prerelease

  #printf -- "- Source tag: '%s'\n" "$SOURCE_TAG"
  check_tag_format "$SOURCE_TAG"
  source_tag_is_release=$IS_RELEASE_TAG
  source_tag_is_prerelease=$IS_PRERELEASE_TAG
  check_tag_exists "$SOURCE_TAG"

  if test $TAG_EXISTS != true
  then
    printf -- "- Source tag: '%s' doesn't exist!\n" "$SOURCE_TAG"
    printf "  The existence of possible migration scripts could not be determined.\n"
    printf "Optional migration scripts check done.\n\n"

    return

  else
    #printf -- "- Target tag: '%s'\n" "$TARGET_TAG"
    check_tag_format "$TARGET_TAG"
    target_tag_is_release=$IS_RELEASE_TAG
    target_tag_is_prerelease=$IS_PRERELEASE_TAG
    check_tag_exists "$TARGET_TAG"

  fi

  if test $TAG_EXISTS = false
  then
    printf -- "- Target tag: '%s' doesn't exist!\n" "$TARGET_TAG"
    printf "  The existence of possible migration scripts could not be determined.\n"
    printf "Optional migration scripts check done.\n\n"

    return

  elif [[ ( "$source_tag_is_release" = true || "$source_tag_is_prerelease" = true ) && \
    ( "$target_tag_is_release" = true || "$target_tag_is_prerelease" = true) ]]
  then
    local release_tags
    release_tags=$(curl -s $REPO_API/releases?per_page=100 |
        grep tag_name |
        cut -d : -f 2,3 |
        tr -d \" |
        tr -d , |
        tr -d " " |
        sed -ne "/$TARGET_TAG/,/$SOURCE_TAG/p" |
        head -n -1)
    printf -- "- Additional Migration script(s) available.\n\n"

  elif [[ ( "$source_tag_is_release" = false && "$source_tag_is_prerelease" = false ) ]]
  then
    printf -- "- Source tag '%s' is neither a release tag nor pre-release tag!\n" "$SOURCE_TAG"
    printf "  The existence of possible migration scripts could not be determined.\n"
    printf "Optional migration scripts check done.\n\n"

    return

  elif [[ "$target_tag_is_release" = false && "$target_tag_is_prerelease" = false ]]
  then
    printf -- "- Target tag '%s' is neither a release tag nor pre-release tag!\n" "$TARGET_TAG"
    printf "  The existence of possible migration scripts could not be determined.\n"
    printf "Optional migration scripts check done.\n\n"

    return

  fi

  if [ -n "$release_tags" ]; then
    local release_tag
    for release_tag in $release_tags; do
      declare -a migration_scripts
      local migration_script_check_url
      migration_script_check_url=$REPO_URL/"$TARGET_TAG"/scripts/migration/"$release_tag".sh
      if curl --head --silent --fail --output /dev/null "$migration_script_check_url" 2>/dev/null; then
        migration_scripts+=("$release_tag".sh)
      fi
    done

    if [ ${#migration_scripts[@]} -eq 0 ]; then
      printf -- "- No additional migration scripts to execute.\n\n"

    else
      printf "6.1 Migration script download\n"
      mkdir -p "$PWD"/scripts/migration
      for migration_script in "${migration_scripts[@]}"; do
        download_file "$PWD"/scripts/migration/"$migration_script" scripts/migration/"$migration_script"
        chmod +x "$PWD"/scripts/migration/"$migration_script"
      done

      printf "\n6.2 Migration script execution\n"
      printf "The following migration scripts will be executed for the migration from version %s to version %s:\n" \
        "$SOURCE_TAG" "$TARGET_TAG"
      local migration_script
      for (( index=${#migration_scripts[@]} - 1; index >= 0; index-- )); do
        printf -- "- %s\n" "${migration_scripts[index]}"
      done

      printf "\nWe strongly recommend the installation of the update scripts, otherwise it is very likely that "
      printf "errors will occur during operation of the application.\n\n"

      read -p "Do you want to proceed with the installation? [Y/n] " -er -n 1 continue
      if [[ $continue =~ ^[nN]$ ]]; then
        HAS_MIGRATION_FILES=true

        printf "\nIf you want to ensure the smooth operation of the application, you can also install the migration "
        printf "scripts manually.\n"
        printf "To do this, change to directory './scripts/migration' and execute the above scripts in ascending "
        printf "order!\n\n"

        printf "Optional migration scripts check done.\n\n"

        return
      fi
      printf "\n"

      for ((i = ${#migration_scripts[@]} - 1; i >= 0; i--)); do
        printf -- "- Executing '%s' ...\n" "${migration_scripts[$i]}"
        bash "$PWD"/scripts/migration/"${migration_scripts[$i]}"
        rm "$PWD"/scripts/migration/"${migration_scripts[$i]}"
      done

      printf "\nMigration scripts successfully executed.\n\n"

      printf "Optional migration scripts check done.\n\n"

      printf "\n------------------------------------------------------------\n"
      printf "Proceed with the original '%s' installation ..." $APP_NAME
      printf "\n------------------------------------------------------------\n"
      printf "\n"

    fi

  fi
}

check_config_files_modifications() {
  # check nginx configuration files
  printf "7. Configuration template files modification check\n"
  get_modified_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template "conf-file"
  printf "Configuration template files modification check done.\n\n"
}

update_makefile() {
  if [ -n "$TRAEFIK_DIR" ] && [ "$TRAEFIK_DIR" != "$APP_DIR" ]; then
    rm "$PWD"/Makefile
    cp "$TRAEFIK_DIR"/Makefile "$APP_DIR"/Makefile
    printf "include %s/scripts/make/studio-lite.mk\n" "$APP_DIR" >>"$APP_DIR"/Makefile
  elif [ -n "$TRAEFIK_DIR" ] && [ "$TRAEFIK_DIR" == "$APP_DIR" ]; then
    printf "include %s/scripts/make/studio-lite.mk\n" "$APP_DIR" >>"$APP_DIR"/Makefile
  else
    printf "include %s/scripts/make/studio-lite.mk\n" "$APP_DIR" >"$APP_DIR"/Makefile
  fi
}

customize_settings() {
  # write chosen version tag to env file
  sed -i "s#TAG.*#TAG=$TARGET_TAG#" "$PWD"/.env.studio-lite

  # Setup makefiles
  sed -i "s#STUDIO_LITE_BASE_DIR :=.*#STUDIO_LITE_BASE_DIR := \\$(pwd)#" "$PWD"/scripts/make/studio-lite.mk
  sed -i "s#scripts/update.sh#scripts/update_${APP_NAME}.sh#" "$PWD"/scripts/make/studio-lite.mk
  update_makefile
}

finalize_update() {
  printf "8. Summary\n"
  if [ $HAS_ENV_FILE_UPDATE == "true" ] || [ $HAS_CONFIG_FILE_UPDATE == "true" ] || [ $HAS_MIGRATION_FILES == "true" ]
  then
    if [ $HAS_ENV_FILE_UPDATE == "true" ] && [ $HAS_CONFIG_FILE_UPDATE == "true" ]; then
      printf -- '- Version, environment, and configuration update applied!\n\n'
      printf "  PLEASE CHECK YOUR ENVIRONMENT AND CONFIGURATION FILES FOR MODIFICATIONS ! ! !\n\n"
    elif [ $HAS_ENV_FILE_UPDATE == "true" ]; then
      printf -- '- Version and environment update applied!\n\n'
      printf "  PLEASE CHECK YOUR ENVIRONMENT FILE FOR MODIFICATIONS ! ! !\n\n"
    elif [ $HAS_CONFIG_FILE_UPDATE == "true" ]; then
      printf -- '- Version and configuration update applied!\n\n'
      printf "  PLEASE CHECK YOUR CONFIGURATION FILES FOR MODIFICATIONS ! ! !\n\n"
    fi
    if [ $HAS_MIGRATION_FILES == "true" ]; then
      printf -- '- Migration script(s) existing and execution is still pending!\n\n'
      printf "  PLEASE EXECUTE PENDING MIGRATION SCRIPTS ! ! !\n\n"
    fi
    printf "Summary done.\n\n\n"

    if [[ $(docker compose --project-name "${PWD##*/}" ps -q) ]]; then
      printf "'%s' application will now shut down ...\n" $APP_NAME
      docker compose --project-name "${PWD##*/}" down
    fi

    printf "When your files are checked for modification, you could restart the application with "
    printf "'make %s-up' at the command line to put the update into effect.\n\n" $APP_NAME

    printf "'%s' update script finished.\n" $APP_NAME
    exit 0

  else
    printf -- "- Version update applied.\n"
    printf "  No further action needed.\n"
    printf "Summary done.\n\n\n"

    # application_reload --> Seems not to work with liquibase containers!
    application_restart
  fi
}

application_reload() {
  if command make -v >/dev/null 2>&1; then
    local reload
    read -p "Do you want to reload $APP_NAME now? [Y/n] " -er -n 1 reload

    if [[ ! $reload =~ [nN] ]]; then
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
    local restart
    read -p "Do you want to restart $APP_NAME now? [Y/n] " -er -n 1 restart

    if [[ ! $restart =~ [nN] ]]; then
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
    local latest_traefik_release
    latest_traefik_release=$(curl -s "$TRAEFIK_REPO_API"/releases/latest |
      grep tag_name |
      cut -d : -f 2,3 |
      tr -d \" |
      tr -d , |
      tr -d " ")

    printf -- "- No IQB infrastructure installation found.\n\n"
    printf "Installing missing IQB application infrastructure software:\n"
    printf "Downloading traefik installation script version %s ...\n" "$latest_traefik_release"
    if wget -q -O "$PWD"/install_traefik.sh $TRAEFIK_REPO_URL/"$latest_traefik_release"/scripts/install.sh; then
      chmod +x "$PWD"/install_traefik.sh
      printf 'Download successful!\n\n'
    else
      printf 'Download failed!\n'
      printf 'Update script finished with error\n'
      exit 1
    fi

    printf "Downloaded installation script will be started now.\n\n"
    ("$PWD"/install_traefik.sh)
    rm "$PWD"/install_traefik.sh

    printf '\nChecking Infrastructure installation ...\n'
    declare -a traefik_dir_array
    readarray -d '' traefik_dir_array < <(find / -name ".env.traefik" -mmin -5 -print0 2>/dev/null)

    local traefik_dir_count
    traefik_dir_count=${#traefik_dir_array[*]}

    if [ "$traefik_dir_count" -eq 0 ]; then
      printf -- '- No IQB Infrastructure environment file found.\n'
      printf 'Update script finished with error\n'
      exit 1

    elif [ "$traefik_dir_count" -eq 1 ]; then
      TRAEFIK_DIR=$(dirname "${traefik_dir_array[0]}")

    else
      printf -- "- Multiple traefik installations found:\n"
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

    # Set or update traefik installation directory in studio environment file
    if grep TRAEFIK_DIR= .env.studio-lite >/dev/null; then
      sed -i "s#TRAEFIK_DIR.*#TRAEFIK_DIR=$TRAEFIK_DIR#" .env.studio-lite
    else
      printf '\n# Infrastructure\nTRAEFIK_DIR=%s\n' "$TRAEFIK_DIR" >>.env.studio-lite
    fi

    # Update studio Makefile
    update_makefile

    printf 'Infrastructure installation checked.\n'

    printf "\nMissing IQB application infrastructure successfully installed.\n\n"
    printf "'%s' update script finished.\n" $APP_NAME
    exit 0
  else
    printf -- "- Updating existing IQB infrastructure installation at: %s \n\n" "$TRAEFIK_DIR"

    printf "Go to infrastructure directory '%s' and execute infrastructure 'update script' ... \n\n" "$TRAEFIK_DIR"
    if [ -e "$TRAEFIK_DIR/scripts/update_traefik.sh" ]; then
      cd "$TRAEFIK_DIR" && ./scripts/update_traefik.sh

      # Update Studio Makefile
      update_makefile

      printf "Infrastructure update script finished.\n\n"
    else
      printf "Infrastructure update script '%s' not found.\n" "$TRAEFIK_DIR/scripts/update_traefik.sh"
      printf "'%s' update script finished with error.\n\n" $APP_NAME
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

    local choice
    while read -p 'What do you want to do? [1-3] ' -er -n 1 choice; do
      if [ "$choice" = 1 ]; then
        printf "\n=== UPDATE %s ===\n\n" $APP_NAME

        get_new_release_version
        create_backup
        run_update_script_in_selected_version
        prepare_installation_dir
        update_files
        check_environment_file_modifications
        run_optional_migration_scripts
        check_config_files_modifications
        customize_settings
        finalize_update

        break

      elif [ "$choice" = 2 ]; then
        printf "\n=== UPDATE IQB application infrastructure ===\n\n"

        update_application_infrastructure

        break

      elif [ "$choice" = 3 ]; then
        printf "'%s' update script finished.\n" $APP_NAME
        exit 0

      fi

    done

  else
    TARGET_TAG="$SELECTED_VERSION"

    load_environment_variables
    prepare_installation_dir
    update_files
    check_environment_file_modifications
    run_optional_migration_scripts
    check_config_files_modifications
    customize_settings
    finalize_update
  fi
}

main
