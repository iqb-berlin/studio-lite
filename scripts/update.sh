#!/bin/bash

declare UPDATE_OPTION
declare SOURCE_VERSION
declare TARGET_VERSION

declare APP_NAME='studio-lite'
declare APP_DIR="${PWD}"
declare MAKE_BASE_DIR_NAME='STUDIO_BASE_DIR'
declare REPO_URL="https://raw.githubusercontent.com/iqb-berlin/${APP_NAME}"
declare REPO_API="https://api.github.com/repos/iqb-berlin/${APP_NAME}"

declare RELEASE_REGEX='^((0|([1-9][0-9]*)))\.((0|([1-9][0-9]*)))\.((0|([1-9][0-9]*)))$'
declare PRERELEASE_REGEX='^(0|([1-9][0-9]*))\.(0|([1-9][0-9]*))\.(0|([1-9][0-9]*))(-((alpha|beta|rc)((\.)?([1-9][0-9]*))?))$'
declare ALL_RELEASE_REGEX='^(0|([1-9][0-9]*))\.(0|([1-9][0-9]*))\.(0|([1-9][0-9]*))(-((alpha|beta|rc)((\.)?([1-9][0-9]*))?))?$'

declare BACKUP_DIR
declare DB_SERVICE_NAME='db'
declare BACKEND_SERVICE_NAME='backend'
declare BACKEND_VOLUME_NAME='backend_vol'
declare BACKEND_VOLUME_DIR='/usr/src/studio-lite-api/packages'
declare ARE_DATA_SERVICES_UP=false

declare HAS_ENV_FILE_UPDATE=false
declare HAS_CONFIG_FILE_UPDATE=false
declare HAS_MIGRATION_FILES=false

declare TRAEFIK_DIR
declare TRAEFIK_REPO_URL='https://raw.githubusercontent.com/iqb-berlin/traefik'
declare TRAEFIK_REPO_API='https://api.github.com/repos/iqb-berlin/traefik'

check_version_tag_exists() {
  declare tag="${1}"
  declare status_code

  status_code=$(curl --silent --write-out "%{response_code}\n" --output /dev/null "${REPO_API}/releases/tags/${tag}")

  if [ "${status_code}" -ne "200" ]; then
    return 1
  fi

  return 0
}

get_new_release_version() {
  declare latest_release
  latest_release=$(curl -s "${REPO_API}"/releases/latest |
    grep tag_name |
    cut -d : -f 2,3 |
    tr -d \" |
    tr -d , |
    tr -d " ")

  if [ "${SOURCE_VERSION}" = "latest" ]; then
    SOURCE_VERSION="${latest_release}"
  fi

  printf "Installed version: %s\n" "${SOURCE_VERSION}"
  printf "Latest available release: %s\n\n" "${latest_release}"

  if [ "${SOURCE_VERSION}" = "${latest_release}" ]; then
    printf "Latest release is already installed!\n"
    declare continue
    read -p "Continue anyway? [y/N] " -er -n 1 continue

    if ! [[ ${continue} =~ ^[yY]$ ]]; then
      printf "'%s' update script finished.\n\n" "${APP_NAME}"

      exit 0
    fi

    printf "\n"
  fi

  while read -p '1. Name the desired version: ' -er -i "${latest_release}" TARGET_VERSION; do
    if ! check_version_tag_exists "${TARGET_VERSION}"; then
      printf "This version tag does not exist.\n"
    else
      printf "\n"
      break
    fi

  done
}

create_app_dir_backup() {
  printf "2. Application directory backup creation\n"
  # Save installation directory
  mkdir -p "${APP_DIR}/backup/release/${SOURCE_VERSION}"
  tar -cf - --exclude='./backup' --exclude='acme.json' . | tar -xf - -C "${APP_DIR}/backup/release/${SOURCE_VERSION}"
  printf -- "- Current release files have been saved at: '%s'\n" "backup/release/${SOURCE_VERSION}"
  printf "Application directory backup created.\n\n"
}

validate_source_and_target_release_tag() {
  if ! check_version_tag_exists "${SOURCE_VERSION}"; then
    printf -- "- Source release tag: '%s' doesn't exist (anymore)!\n" "${SOURCE_VERSION}"

    return 1
  fi
  if ! check_version_tag_exists "${TARGET_VERSION}"; then
    printf -- "- Target release tag: '%s' doesn't exist (anymore)!\n" "${TARGET_VERSION}"

    return 1
  fi

  if ! [[ "${SOURCE_VERSION}" =~ ${PRERELEASE_REGEX} || "${SOURCE_VERSION}" =~ ${RELEASE_REGEX} ]]; then
    printf -- "- Source tag '%s' is neither a valid release nor a valid pre-release tag!\n" "${SOURCE_VERSION}"

    return 1
  fi
  if ! [[ "${TARGET_VERSION}" =~ ${PRERELEASE_REGEX} || "${TARGET_VERSION}" =~ ${RELEASE_REGEX} ]]; then
    printf -- "- Target tag '%s' is neither a valid release nor a valid pre-release tag!\n" "${TARGET_VERSION}"

    return 1
  fi

  return 0
}

run_complementary_migration_scripts() {
  printf "3. Complementary migration scripts check\n"

  if ! validate_source_and_target_release_tag; then
    printf "  The existence of possible migration scripts could not be determined.\n"
    printf "Complementary migration scripts check done.\n\n"

    return
  fi

  declare normalized_source_release_tag="${SOURCE_VERSION}"
  declare normalized_target_release_tag="${TARGET_VERSION}"
  declare release_tags

  if [[ "${SOURCE_VERSION}" =~ ${PRERELEASE_REGEX} ]]; then
    normalized_source_release_tag=$(printf '%s' "${SOURCE_VERSION}" | cut -d'-' -f1)
  fi
  if [[ "${TARGET_VERSION}" =~ ${PRERELEASE_REGEX} ]]; then
    normalized_target_release_tag=$(printf '%s' "${TARGET_VERSION}" | cut -d'-' -f1)
  fi

  # source <= target
  if printf '%s\n%s' "${normalized_source_release_tag}" "${normalized_target_release_tag}" | sort -C -V; then
    # source < target
    if [ "${normalized_source_release_tag}" != "${normalized_target_release_tag}" ]; then
      release_tags=$(
        curl --silent ${REPO_API}/releases?per_page=100 |                                       # get all releases in json format
          grep tag_name |                                                                       # extract 'tag_name' key and value ("key":"value")
          cut -d : -f 2,3 |                                                                     # cut off key and delimiter ("value")
          tr -d \" |                                                                            # truncate quotes  (value)
          tr -d , |                                                                             # truncate end comma
          tr -d " " |                                                                           # truncate start space
          grep -Po "${ALL_RELEASE_REGEX}" |                                                     # use only release and pre-release versions
          cut -d '-' -f 1 |                                                                     # cut off pre-release suffixes
          sort -u -V |                                                                          # remove duplicates and sort versions ascending
          sed -ne "\|${normalized_source_release_tag}|,\|${normalized_target_release_tag}|p" |  # use only versions between source and target version
          tail -n +2                                                                            # exclude source version
      )
    fi
  fi

  if [ -z "${release_tags}" ]; then
    printf -- "- No complementary migration scripts to execute.\n"

  else
    declare release_tag

    for release_tag in ${release_tags}; do
      declare -a migration_scripts
      declare migration_script_check_url
      migration_script_check_url="${REPO_URL}/${TARGET_VERSION}/scripts/migration/${release_tag}.sh"
      if curl --head --silent --fail --output /dev/null "${migration_script_check_url}" 2>/dev/null; then
        migration_scripts+=("${release_tag}".sh)
      fi
    done

    if [ ${#migration_scripts[@]} -eq 0 ]; then
      printf -- "- No complementary migration scripts to execute.\n"

    else
      printf -- "- Complementary Migration script(s) available.\n\n"
      printf "3.1 Migration script download\n"
      mkdir -p "${APP_DIR}/scripts/migration"
      declare migration_script
      for migration_script in "${migration_scripts[@]}"; do
        download_file "scripts/migration/${migration_script}" "scripts/migration/${migration_script}"
        chmod +x "${APP_DIR}/scripts/migration/${migration_script}"
      done

      printf "\n3.2 Migration script execution\n"
      printf "  The following migration scripts will be executed for the migration from version %s to version %s:\n" \
        "${SOURCE_VERSION}" "${TARGET_VERSION}"
      for migration_script in "${migration_scripts[@]}"; do
        printf -- "  - %s\n" "${migration_script}"
      done

      printf "\n  We strongly recommend the installation of the migration scripts, otherwise it is very likely that "
      printf "errors will occur during operation of the application.\n\n"

      read -p "  Do you want to proceed with the migration? [Y/n] " -er -n 1 continue
      if [[ ${continue} =~ ^[nN]$ ]]; then
        HAS_MIGRATION_FILES=true

        printf "\n  If you want to ensure the smooth operation of the application, you can also install the migration "
        printf "scripts manually.\n"
        printf "  To do this, change to directory './scripts/migration' and execute the above scripts in ascending "
        printf "order!\n\n"

        printf "Complementary migration scripts check done.\n\n"

        printf "Since the migration scripts have not been executed, "
        printf "it is not recommended to proceed with the update procedure.\n"

        declare proceed
        read -p "Do you want to proceed? [y/N] " -er -n 1 proceed

        if [[ ${proceed} =~ ^[yY]$ ]]; then
          return
        fi

        printf "'%s' update script finished.\n\n" "${APP_NAME}"
        exit 0
      fi
      printf "\n"

      declare has_errors=false
      for migration_script in "${migration_scripts[@]}"; do
        printf -- "  - Executing '%s' ...\n" "${migration_script}"
        if bash "${APP_DIR}/scripts/migration/${migration_script}"; then
          rm "${APP_DIR}/scripts/migration/${migration_script}"
          printf "  '%s' successfully executed.\n\n" "${migration_script}"
        else
          declare proceed

          printf "  '%s' executed with errors.\n\n" "${migration_script}"
          read -p "  Do you want to proceed? [Y/n] " -er -n 1 proceed

          if [[ ${proceed} =~ ^[nN]$ ]]; then
            printf "\n  The update has failed!\n\n"
            printf "  Up to this point, only migration scripts have been executed.\n"
            printf "  If you want to examine the failed script, you can view it under "
            printf "'%s'.\n" "${APP_DIR}/scripts/migration/${migration_script}"
            printf "  Edit and execute it manually if necessary.\n\n"

            printf "  If you want to restore the initial state, you can do this with the backup of the "
            printf "installation directory under '%s'.\n\n" "${APP_DIR}/backup/release/${SOURCE_VERSION}"

            printf "'%s' update script finished with error.\n\n" "${APP_NAME}"

            exit 1
          fi

          has_errors=true
        fi
      done

      if ${has_errors}; then
        printf "  Migration scripts executed with errors.\n\n"
      else
        printf "  Migration scripts successfully executed.\n\n"
      fi

    fi

  fi

  printf "Complementary migration scripts check done.\n\n"
}

load_docker_environment_variables() {
  # shellcheck source=.env.studio-lite
  source ".env.${APP_NAME}"
}

data_services_up() {
  if [ "$(docker compose \
    --env-file "${APP_DIR}/.env.${APP_NAME}" \
    --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
    --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
    ps -q "${DB_SERVICE_NAME}" "${BACKEND_SERVICE_NAME}" | wc -l)" != 2 ]; then

    docker compose \
      --progress quiet \
      --env-file "${APP_DIR}/.env.${APP_NAME}" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
      up -d "${DB_SERVICE_NAME}" "${BACKEND_SERVICE_NAME}"
  else
    ARE_DATA_SERVICES_UP=true
  fi
}

data_services_down() {
  if ! ${ARE_DATA_SERVICES_UP}; then
    docker compose \
      --progress quiet \
      --env-file "${APP_DIR}/.env.${APP_NAME}" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
      down
  fi
}

dump_db() {
  declare db_name="all" # for a single db, adapt 'pg_dumpall' options and "${POSTGRES_DB}" of docker environment file!
  declare db_dump_file="${BACKUP_DIR}/${db_name}.sql"

  if docker compose \
    --env-file "${APP_DIR}/.env.${APP_NAME}" \
    --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
    --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
    exec -it "${DB_SERVICE_NAME}" \
    pg_dumpall --username="${POSTGRES_USER}" >"${APP_DIR}/${db_dump_file}"; then

    printf -- "  - Current db dump has been saved at: '%s'\n" "${db_dump_file}"

  else
    declare continue
    printf -- "- Current db dump was not successful!\n"
    read -p "  Do you want to continue? [y/N] " -er -n 1 continue

    if [[ ! $continue =~ ^[yY]$ ]]; then
      printf "'%s' update script finished.\n" "${APP_NAME}"

      exit 0
    fi
  fi
}

export_backend_volume() {
  declare volume_name
  declare container_name

  volume_name="$(basename "${APP_DIR}")_${BACKEND_VOLUME_NAME}"
  container_name="$(basename "${APP_DIR}")-${BACKEND_SERVICE_NAME}-1"

  docker run \
    --rm \
    --volumes-from "${container_name}" \
    --volume "${APP_DIR}/${BACKUP_DIR}":/tmp \
    busybox tar czvf "/tmp/${BACKEND_VOLUME_NAME}.tar.gz" "${BACKEND_VOLUME_DIR}" &>/dev/null

  if test ${?} -eq 0; then
    declare backup_file="${BACKUP_DIR}/${BACKEND_VOLUME_NAME}.tar.gz"
    printf -- "  - Current '%s' volume has been saved at: '%s'\n" "${volume_name}" "${backup_file}"
  else
    declare continue
    printf -- "  - Current '%s' backup was not successful!\n" "${volume_name}"
    read -p "    Do you want to continue? [y/N] " -er -n 1 continue

    if [[ ! ${continue} =~ ^[yY]$ ]]; then
      printf "'%s' update script finished.\n" "${APP_NAME}"

      exit 0
    fi
  fi
}

create_data_backup() {
  printf "4. Data backup creation\n"

  declare backup
  read -p "  Do you want to create a data backup? [Y/n] " -er -n 1 backup

  if ! [[ ${backup} =~ ^[nN]$ ]]; then
    BACKUP_DIR="backup/$(date '+%Y-%m-%d')"
    mkdir -p "${APP_DIR}/${BACKUP_DIR}"

    printf "\n  Dumping '%s' DB and exporting backend data files (this may take a while) ...\n" "${APP_NAME}"
    data_services_up
    dump_db
    export_backend_volume
    data_services_down
    printf "  DB dumped and backend data files exported.\n"
  fi

  printf "Data backup creation done.\n\n"
}

run_update_script_in_selected_version() {
  printf "5. Update script modification check\n"

  declare current_update_script="${APP_DIR}/backup/release/${SOURCE_VERSION}/scripts/update_${APP_NAME}.sh"
  declare new_update_script="${REPO_URL}/${TARGET_VERSION}/scripts/update.sh"

  if [ ! -f "${current_update_script}" ] ||
    ! curl --stderr /dev/null "${new_update_script}" | diff -q - "${current_update_script}" &>/dev/null; then
    if [ ! -f "${current_update_script}" ]; then
      printf -- "- Current update script 'update_%s.sh' does not exist (anymore)!\n\n" "${APP_NAME}"

    elif ! curl --stderr /dev/null "${new_update_script}" | diff -q - "${current_update_script}" &>/dev/null; then
      printf -- '- Current update script is outdated!\n\n'
    fi

    printf '  Downloading a new update script in the selected version ...\n'
    if curl --silent --fail --output "${APP_DIR}/scripts/update_${APP_NAME}.sh" "${new_update_script}"; then
      chmod +x "${APP_DIR}/scripts/update_${APP_NAME}.sh"
      printf '  Download successful!\n\n'
    else
      printf '  Download failed!\n\n'
      printf "  '%s' update script finished with error.\n\n" "${APP_NAME}"
      exit 1
    fi

    printf "  Current update script will now call the downloaded update script and terminate itself.\n"
    declare continue
    read -p "  Do you want to continue? [Y/n] " -er -n 1 continue
    if [[ ${continue} =~ ^[nN]$ ]]; then
      printf "\n  You can check the the new update script (e.g.: 'less scripts/update_%s.sh') or " "${APP_NAME}"
      printf "compare it with the old one\n(e.g.: 'diff %s %s').\n\n" \
        "scripts/update_${APP_NAME}.sh" "backup/release/${SOURCE_VERSION}/scripts/update_${APP_NAME}.sh"

      printf "  If you want to resume this update process, please type: 'bash scripts/update_%s.sh -s %s -t %s'\n\n" \
        "${APP_NAME}" "${SOURCE_VERSION}" "${TARGET_VERSION}"

      printf "'%s' update script finished.\n\n" "${APP_NAME}"

      exit 0
    fi

    printf "Update script modification check done.\n\n"

    bash "${APP_DIR}/scripts/update_${APP_NAME}.sh" -s "${SOURCE_VERSION}" -t "${TARGET_VERSION}"
    exit ${?}

  else
    printf -- "- Update script has not been changed in the selected version\n"
    printf "Update script modification check done.\n\n"
  fi
}

prepare_installation_dir() {
  mkdir -p "${APP_DIR}/backup/release"
  mkdir -p "${APP_DIR}/backup/temp"
  mkdir -p "${APP_DIR}/config/frontend"
  mkdir -p "${APP_DIR}/scripts/make"
  mkdir -p "${APP_DIR}/scripts/migration"
}

download_file() {
  declare local_file="${1}"
  declare remote_file="${REPO_URL}/${TARGET_VERSION}/${2}"

  if curl --silent --fail --output "${APP_DIR}/${local_file}" "${remote_file}"; then
    printf -- "- File '%s' successfully downloaded.\n" "${1}"
  else
    printf -- "- File '%s' download failed.\n\n" "${1}"
    printf "'%s' update script finished with error.\n\n" "${APP_NAME}"
    exit 1
  fi
}

update_files() {
  printf "6. File download\n"

  download_file "docker-compose.${APP_NAME}.yaml" docker-compose.yaml
  download_file "docker-compose.${APP_NAME}.prod.yaml" "docker-compose.${APP_NAME}.prod.yaml"
  download_file "scripts/make/${APP_NAME}.mk" scripts/make/prod.mk

  printf "File download done.\n\n"
}

get_modified_file() {
  declare source_file="${1}"
  declare target_file="${REPO_URL}/${TARGET_VERSION}/${2}"
  declare file_type="${3}"
  declare current_env_file=.env.${APP_NAME}
  declare current_config_file="config/frontend/default.conf.template"

  if [ ! -f "${APP_DIR}/${source_file}" ] ||
    ! (curl --stderr /dev/null "${target_file}" | diff -q - "${APP_DIR}/${source_file}" &>/dev/null); then

    # no source file exists anymore
    if [ ! -f "${APP_DIR}/${source_file}" ]; then
      if [ "${file_type}" == "env-file" ]; then
        printf -- "- Environment template file '%s' does not exist anymore.\n\n" "${source_file}"
        printf "  A version %s environment template file will be downloaded now ...\n" "${TARGET_VERSION}"
        printf "  Please compare your current environment file with the new template file and update it "
        printf "with new environment variables, or delete obsolete variables, if necessary.\n"
        printf "  For comparison use e.g. 'diff %s %s'.\n" "${current_env_file}" "${source_file}"
      fi

      if [ "${file_type}" == "conf-file" ]; then
        printf -- "- Configuration template file '%s' does not exist (anymore).\n\n" "${source_file}"
        printf "  A version %s configuration template file will be downloaded now ...\n" "${TARGET_VERSION}"
        printf "  Please compare your current '%s' file with the new template file and " "${current_config_file}"
        printf "update it, if necessary!\n"
      fi

    # source file and target file differ
    elif ! curl --stderr /dev/null "${target_file}" | diff -q - "${APP_DIR}/${source_file}" &>/dev/null; then
      if [ "${file_type}" == "env-file" ]; then
        printf -- "- The current environment template file '%s' is outdated.\n\n" "${source_file}"
        printf "  A version %s environment template file will be downloaded now ...\n" "${TARGET_VERSION}"
        printf "  Please compare your current environment file with the new template file and update it "
        printf "with new environment variables, or delete obsolete variables, if necessary.\n"
        printf "  For comparison use e.g. 'diff %s %s'.\n" "${current_env_file}" "${source_file}"
      fi

      if [ "${file_type}" == "conf-file" ]; then
        mv "${APP_DIR}/${source_file}" "${APP_DIR}/${source_file}.old" 2>/dev/null
        cp "${APP_DIR}/${current_config_file}" "${APP_DIR}/${current_config_file}.old"
        printf -- "- The current configuration template file '%s' is outdated.\n\n" "${source_file}"
        printf "  A version %s configuration template file will be downloaded now ...\n" "${TARGET_VERSION}"
        printf "  Please compare your current configuration file with the new template file and update it, "
        printf "if necessary!\n"
        printf "  For comparison use e.g. 'diff %s %s'.\n" "${current_config_file}" "${source_file}"
      fi

    fi

    if curl --silent --fail --output "${APP_DIR}/${source_file}" "${target_file}"; then
      printf "  File '%s' was downloaded successfully.\n" "${source_file}"

      if [ "${file_type}" == "env-file" ]; then
        HAS_ENV_FILE_UPDATE=true
      fi

      if [ "${file_type}" == "conf-file" ]; then
        HAS_CONFIG_FILE_UPDATE=true
      fi

    else
      printf "  File '%s' download failed.\n\n" "${source_file}"
      printf "'%s' update script finished with error.\n\n" "${APP_NAME}"

      exit 1
    fi

  else
    if [ "${file_type}" == "env-file" ]; then
      printf -- "- The current environment template file '%s' is still up to date.\n" "${source_file}"
    fi

    if [ "${file_type}" == "conf-file" ]; then
      printf -- "- The current configuration template file '%s' is still up to date.\n" "${source_file}"
    fi

  fi
}

check_environment_file_modifications() {
  printf "7. Environment template file modification check\n"

  get_modified_file ".env.${APP_NAME}.template" ".env.${APP_NAME}.template" "env-file"

  printf "Environment template file modification check done.\n\n"
}

check_config_files_modifications() {
  printf "8. Configuration template files modification check\n"

  get_modified_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template "conf-file"

  printf "Configuration template files modification check done.\n\n"
}

update_makefile() {
  if [ -n "${TRAEFIK_DIR}" ] && [ "${TRAEFIK_DIR}" != "${APP_DIR}" ]; then
    rm "${APP_DIR}/Makefile"
    cp "${TRAEFIK_DIR}/Makefile" "${APP_DIR}/Makefile"
    printf "include %s/scripts/make/%s.mk\n" "${APP_DIR}" "${APP_NAME}" >>"${APP_DIR}/Makefile"
  fi
}

customize_settings() {
  # write chosen version tag to env file
  sed -i.bak "s|TAG.*|TAG=${TARGET_VERSION}|" "${APP_DIR}/.env.${APP_NAME}" && rm "${APP_DIR}/.env.${APP_NAME}.bak"

  # Setup makefiles
  sed -i.bak "s|${MAKE_BASE_DIR_NAME} :=.*|${MAKE_BASE_DIR_NAME} := \\$(pwd)|" \
    "${APP_DIR}/scripts/make/${APP_NAME}.mk" && rm "${APP_DIR}/scripts/make/${APP_NAME}.mk.bak"
  sed -i.bak "s|scripts/update.sh|scripts/update_${APP_NAME}.sh|" "${APP_DIR}/scripts/make/${APP_NAME}.mk" &&
    rm "${APP_DIR}/scripts/make/${APP_NAME}.mk.bak"
  update_makefile
}

finalize_update() {
  printf "9. Summary\n"
  if ${HAS_ENV_FILE_UPDATE} || ${HAS_CONFIG_FILE_UPDATE} || ${HAS_MIGRATION_FILES}; then
    if ${HAS_ENV_FILE_UPDATE} && ${HAS_CONFIG_FILE_UPDATE}; then
      printf -- '- Version, environment, and configuration update applied!\n\n'
      printf "  PLEASE CHECK YOUR ENVIRONMENT AND CONFIGURATION FILES FOR MODIFICATIONS ! ! !\n\n"
    elif ${HAS_ENV_FILE_UPDATE}; then
      printf -- '- Version and environment update applied!\n\n'
      printf "  PLEASE CHECK YOUR ENVIRONMENT FILE FOR MODIFICATIONS ! ! !\n\n"
    elif ${HAS_CONFIG_FILE_UPDATE}; then
      printf -- '- Version and configuration update applied!\n\n'
      printf "  PLEASE CHECK YOUR CONFIGURATION FILES FOR MODIFICATIONS ! ! !\n\n"
    fi
    if ${HAS_MIGRATION_FILES}; then
      printf -- '- Migration script(s) existing and execution is still pending!\n\n'
      printf "  PLEASE EXECUTE PENDING MIGRATION SCRIPTS ! ! !\n\n"
    fi
    printf "Summary done.\n\n\n"

    if [[ $(docker compose --project-name "${PWD##*/}" ps -q) ]]; then
      printf "'%s' application will now shut down ...\n" "${APP_NAME}"
      docker compose --project-name "${PWD##*/}" down
    fi

    printf "When your files are checked for modification, you could restart the application with "
    printf "'make %s-up' at the command line to put the update into effect.\n\n" "${APP_NAME}"

    printf "'%s' update script finished.\n\n" "${APP_NAME}"

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
  declare reload
  read -p "Do you want to reload '${APP_NAME}' now? [Y/n] " -er -n 1 reload

  if [[ ! ${reload} =~ [nN] ]]; then
    if ! test "$(docker network ls -q --filter name=app-net)"; then
      docker network create app-net
    fi
    docker compose \
      --env-file "${APP_DIR}/.env.${APP_NAME}" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
      pull
    docker compose --env-file "${APP_DIR}/.env.${APP_NAME}" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
      up -d
  else
    printf "'%s' update script finished.\n\n" "${APP_NAME}"

    exit 0
  fi
}

application_restart() {
  declare restart
  read -p "Do you want to restart '${APP_NAME}' now? [Y/n] " -er -n 1 restart

  if [[ ! ${restart} =~ [nN] ]]; then
    docker compose \
      --env-file "${APP_DIR}/.env.${APP_NAME}" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
      down
    if ! test "$(docker network ls -q --filter name=app-net)"; then
      docker network create app-net
    fi
    docker compose \
      --env-file "${APP_DIR}/.env.${APP_NAME}" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
      pull
    docker compose --env-file "${APP_DIR}/.env.${APP_NAME}" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.yaml" \
      --file "${APP_DIR}/docker-compose.${APP_NAME}.prod.yaml" \
      up -d
  else
    printf "'%s' update script finished.\n\n" "${APP_NAME}"

    exit 0
  fi
}

check_application_infrastructure() {
  declare -a traefik_dir_array
  declare traefik_dir_count
  declare return_code

  readarray -d '' traefik_dir_array < <(find / -name ".env.traefik" -print0 2>/dev/null)
  traefik_dir_count=${#traefik_dir_array[*]}

  if [ "${traefik_dir_count}" -eq 0 ]; then
    printf -- '- No application Infrastructure installations found.\n'

    return_code=1

  elif [ "${traefik_dir_count}" -eq 1 ]; then
    TRAEFIK_DIR=$(dirname "${traefik_dir_array[0]}")
    printf -- "- Application Infrastructure installation found at '%s'\n" "${TRAEFIK_DIR}"

    return_code=0

  else
    printf -- "- Multiple infrastructure installations found:\n"
    for ((i = 0; i < traefik_dir_count; i++)); do
      printf -- "  [%d] %s\n" $((i + 1)) "$(dirname "${traefik_dir_array[i]}")"
    done
    printf -- "  [%d] Additional Installation\n\n" $((traefik_dir_count + 1))

    declare choice
    while read -p "  Which one do you want to choose? [1-$((traefik_dir_count + 1))] " -er choice; do
      if [ "${choice}" -gt 0 ] && [ "${choice}" -le "${traefik_dir_count}" ]; then
        TRAEFIK_DIR=$(dirname "${traefik_dir_array[$((choice - 1))]}")

        return_code=0
        break

      elif [ "$choice" -eq $((traefik_dir_count + 1)) ]; then
        TRAEFIK_DIR=''

        return_code=1
        break

      fi
    done
  fi
  printf "Application infrastructure installations check done.\n\n"

  return $return_code
}

install_application_infrastructure() {
  declare latest_traefik_release
  latest_traefik_release=$(curl -s "${TRAEFIK_REPO_API}/releases/latest" |
    grep tag_name |
    cut -d : -f 2,3 |
    tr -d \" |
    tr -d , |
    tr -d " ")

  printf "Installing missing application infrastructure software:\n"
  printf "Downloading application infrastructure installation script version %s ...\n" "${latest_traefik_release}"
  if curl --silent --fail --output "${APP_DIR}/install_traefik.sh" \
    "${TRAEFIK_REPO_URL}/${latest_traefik_release}/scripts/install.sh"; then

    chmod +x "${APP_DIR}/install_traefik.sh"
    printf 'Download successful!\n\n'
  else
    printf 'Download failed!\n'
    printf 'Update script finished with error\n\n'

    exit 1
  fi

  declare proceed
  printf "Downloaded application infrastructure installation script will be started now.\n"
  read -p "Do you want to proceed? [Y/n] " -er -n 1 proceed

  if [[ ${proceed} =~ ^[nN]$ ]]; then
    printf "\nMissing application infrastructure was not installed.\n\n"
    printf "'%s' update script finished.\n\n" "${APP_NAME}"

    exit 0
  fi

  ("${APP_DIR}/install_traefik.sh")
  rm "${APP_DIR}/install_traefik.sh"
}

update_application_infrastructure() {
  printf "Check for existing application infrastructure installations ...\n"

  # Check application infrastructure setting
  if [ -z "${TRAEFIK_DIR}" ]; then
    printf -- "- No application infrastructure settings found.\n"

    # Check for existing installations
    if ! check_application_infrastructure; then
      install_application_infrastructure

      printf "Check new application infrastructure installation ...\n"
      check_application_infrastructure
    fi

    # Update application infrastructure installation directory setting
    if grep TRAEFIK_DIR= ".env.${APP_NAME}" &>/dev/null; then
      sed -i.bak "s|TRAEFIK_DIR.*|TRAEFIK_DIR=${TRAEFIK_DIR}|" ".env.${APP_NAME}" && rm ".env.${APP_NAME}.bak"
    else
      printf '\nTRAEFIK_DIR=%s\n' "${TRAEFIK_DIR}" >>".env.${APP_NAME}"
    fi

    # Synchronize server name setting
    if [ -f "${TRAEFIK_DIR}/.env.traefik" ]; then
      declare server_name
      server_name=$(sed -n 's/^SERVER_NAME=//p' "${TRAEFIK_DIR}/.env.traefik")
      sed -i.bak "s|SERVER_NAME.*|SERVER_NAME=${server_name}|" ".env.${APP_NAME}" && rm ".env.${APP_NAME}.bak"
    fi

    # Synchronize tls certificate resolver setting
    if [ -f "${TRAEFIK_DIR}/.env.traefik" ]; then
      declare resolver
      resolver=$(sed -n 's/^TLS_CERTIFICATE_RESOLVER=//p' "${TRAEFIK_DIR}/.env.traefik")
      sed -i.bak "s|TLS_CERTIFICATE_RESOLVER.*|TLS_CERTIFICATE_RESOLVER=${resolver}|" ".env.${APP_NAME}" &&
        rm ".env.${APP_NAME}.bak"
    fi

    update_makefile

    printf "\nMissing application infrastructure successfully installed.\n\n"
    printf "'%s' update script finished.\n\n" "${APP_NAME}"

    exit 0
  else
    printf -- "- Updating existing application infrastructure installation at: %s \n\n" "${TRAEFIK_DIR}"

    printf "Go to infrastructure directory '%s' and execute infrastructure 'update script' ... \n\n" "${TRAEFIK_DIR}"
    if [ -e "${TRAEFIK_DIR}/scripts/update_traefik.sh" ]; then
      cd "${TRAEFIK_DIR}" && ./scripts/update_traefik.sh

      update_makefile

      printf "Application infrastructure update script finished.\n\n"
    else
      printf "Application infrastructure update script '%s' not found.\n" "${TRAEFIK_DIR}/scripts/update_traefik.sh"
      printf "'%s' update script finished with error.\n\n" "${APP_NAME}"

      exit 1
    fi

    if [ -e "${APP_DIR}" ]; then
      cd "${APP_DIR}" || exit 1

    else
      printf "'%s' installation directory '%s' was not found.\n" "${APP_NAME}" "${APP_DIR}"
      printf "'%s' update script finished with error.\n\n" "${APP_NAME}"

      exit 1
    fi
  fi
}

main() {
  if [ -z "${TARGET_VERSION}" ]; then
    printf "\n==================================================\n"
    printf "'%s' update script started ..." "${APP_NAME}" | tr '[:lower:]' '[:upper:]'
    printf "\n==================================================\n"
    printf "\n"
    printf "[1] Update '%s' application\n" "${APP_NAME}"
    printf "[2] Update application infrastructure\n"
    printf "[3] Exit update script\n\n"

    declare choice
    while read -p 'What do you want to do? [1-3] ' -er -n 1 choice; do
      if [ "${choice}" = 1 ]; then
        printf "\n=== UPDATE '%s' application ===\n\n" "${APP_NAME}"

        get_new_release_version
        create_app_dir_backup
        run_complementary_migration_scripts
        load_docker_environment_variables
        create_data_backup
        run_update_script_in_selected_version
        prepare_installation_dir
        update_files
        check_environment_file_modifications
        check_config_files_modifications
        customize_settings
        finalize_update

        break

      elif [ "${choice}" = 2 ]; then
        printf "\n=== UPDATE application infrastructure ===\n\n"

        load_docker_environment_variables
        update_application_infrastructure

        break

      elif [ "${choice}" = 3 ]; then
        printf "'%s' update script finished.\n\n" "${APP_NAME}"

        exit 0

      fi

    done

  else
    load_docker_environment_variables
    prepare_installation_dir
    update_files
    check_environment_file_modifications
    check_config_files_modifications
    customize_settings
    finalize_update
  fi
}

display_usage() {
  printf "Usage: %s <-s source_release> [-t <target_release>]\n" "${0}"
  printf "Try '%s -h' for more information.\n\n" "${0}"

  exit 1
}

display_help() {
  printf "Usage: %s <-s source_release> [-t <target_release>]\n\n" "${0}"
  printf "Options:\n"
  printf "  -s  Specify the current source release tag to be updated from.\n"
  printf "  -t  Specify the upcoming target release tag to be updated to.\n"
  printf "      WARNING: Only set the '-t' option if you want to resume an interrupted update process!\n"
  printf "  -h  Display this help information.\n\n"

  exit 0
}

while getopts s:t:h UPDATE_OPTION; do
  case "${UPDATE_OPTION}" in
  s)
    if check_version_tag_exists "${OPTARG}"; then
      SOURCE_VERSION="${OPTARG}"
    else
      printf "This source release tag does not exist.\n"
      exit 1
    fi
    ;;
  t)
    if check_version_tag_exists "${OPTARG}"; then
      TARGET_VERSION="${OPTARG}"
    else
      printf "This target release tag does not exist.\n"
      exit 1
    fi
    ;;
  h)
    display_help
    ;;
  \?)
    display_usage
    ;;
  esac
done
shift $((OPTIND - 1))

if [ -z "${SOURCE_VERSION}" ]; then
  printf "Error: '-s' or '-h' option is required.\n\n"
  display_usage
fi

main
