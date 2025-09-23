#!/usr/bin/env bash
set -e

declare APP_DIR
declare APP_NAME='studio-lite'
declare REPO_URL="https://raw.githubusercontent.com/iqb-berlin/${APP_NAME}"
declare REPO_API="https://api.github.com/repos/iqb-berlin/${APP_NAME}"

declare INSTALL_SCRIPT_NAME="${0}"
declare TARGET_VERSION="${1}"
declare MAKE_BASE_DIR_NAME='STUDIO_BASE_DIR'
declare REQUIRED_PACKAGES=("docker -v" "docker compose version")
declare OPTIONAL_PACKAGES=("make -v")

declare -A ENV_VARS
ENV_VARS[POSTGRES_USER]=root
ENV_VARS[POSTGRES_PASSWORD]=$(tr -dc 'a-zA-Z0-9' </dev/urandom | fold -w 16 | head -n 1)
ENV_VARS[POSTGRES_DB]="${APP_NAME}"

declare ENV_VAR_ORDER=(POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB)

declare TRAEFIK_DIR
declare TRAEFIK_REPO_URL="https://raw.githubusercontent.com/iqb-berlin/traefik"
declare TRAEFIK_REPO_API="https://api.github.com/repos/iqb-berlin/traefik"

get_release_version() {
  declare latest_release
  latest_release=$(curl --silent "${REPO_API}/releases/latest" |
    grep tag_name |
    cut -d : -f 2,3 |
    tr -d \" |
    tr -d , |
    tr -d " ")

  while read -p '1. Please name the desired release tag: ' -er -i "${latest_release}" TARGET_VERSION; do
    if ! curl --head --silent --fail --output /dev/null "${REPO_URL}/${TARGET_VERSION}/README.md" 2>/dev/null; then
      printf "This version tag does not exist.\n"
    else
      break
    fi
  done

  # Check install script matches the selected release ...
  declare new_install_script="${REPO_URL}/${TARGET_VERSION}/scripts/install.sh"
  if ! curl --stderr /dev/null "${new_install_script}" | diff -q - "${INSTALL_SCRIPT_NAME}" &>/dev/null; then
    printf -- '- Current install script does not match the selected release install script!\n'
    printf '  Downloading a new install script for the selected release ...\n'
    mv "${INSTALL_SCRIPT_NAME}" "${INSTALL_SCRIPT_NAME}_old"
    if curl --silent --fail --output "install_${APP_NAME}.sh" "${new_install_script}"; then
      chmod +x "install_${APP_NAME}.sh"
      printf '  Download successful!\n\n'
    else
      printf '  Download failed!\n\n'
      printf "  '%s' install script finished with error.\n" "${APP_NAME}"
      exit 1
    fi

    printf "  The current install process will now execute the downloaded install script and terminate itself.\n"
    declare is_continue
    read -p "  Do you want to continue? [Y/n] " -er -n 1 is_continue
    if [[ ${is_continue} =~ ^[nN]$ ]]; then
      printf "\n  You can check the the new install script (e.g.: 'less %s') or " "install_${APP_NAME}.sh"
      printf "compare it with the old one (e.g.: 'diff %s %s').\n\n" \
        "install_${APP_NAME}.sh" "${INSTALL_SCRIPT_NAME}_old"

      printf "  If you want to resume this install process, please type: 'bash install_%s.sh %s'\n\n" \
        "${APP_NAME}" "${TARGET_VERSION}"

      printf "'%s' install script finished.\n" "${APP_NAME}"
      exit 0
    fi

    bash "install_${APP_NAME}.sh" "${TARGET_VERSION}"

    # remove old install script
    if [ -f "${INSTALL_SCRIPT_NAME}_old" ]; then
      rm "${INSTALL_SCRIPT_NAME}_old"
    fi

    exit ${?}
  fi

  printf "\n"
}

check_prerequisites() {
  printf "2. Checking prerequisites:\n\n"

  printf "2.1 Checking required packages ...\n"
  # Check required packages are installed
  declare req_package
  for req_package in "${REQUIRED_PACKAGES[@]}"; do
    if ${req_package} >/dev/null 2>&1; then
      printf -- "- '%s' is working.\n" "${req_package}"
    else
      printf "'%s' not working, please install the corresponding package before running!\n" "${req_package}"
      exit 1
    fi
  done
  printf "Required packages successfully checked.\n\n"

  # Check optional packages are installed
  declare opt_package
  printf "2.2 Checking optional packages ...\n"
  for opt_package in "${OPTIONAL_PACKAGES[@]}"; do
    if ${opt_package} >/dev/null 2>&1; then
      printf -- "- '%s' is working.\n" "${opt_package}"
    else
      printf "%s not working! It is recommended to have the corresponding package installed.\n" "${opt_package}"
      declare is_continue
      read -p 'Continue anyway? [y/N] ' -er -n 1 is_continue

      if [[ ! ${is_continue} =~ ^[yY]$ ]]; then
        exit 1
      fi
    fi
  done
  printf "Optional packages successfully checked.\n\n"

  printf "2.3 Checking application infrastructure software is installed ...\n"
  # Check edge router (traefik) is already installed
  declare traefik_dir_array
  readarray -d '' traefik_dir_array < <(find / -name ".env.traefik" -print0 2>/dev/null)

  declare traefik_dir_count=${#traefik_dir_array[*]}
  if [ "${traefik_dir_count}" -eq 0 ]; then
    printf -- "- No 'Traefik' installation found.\n"
    TRAEFIK_DIR=""

  elif [ "${traefik_dir_count}" -eq 1 ]; then
    printf -- "- 'Traefik' installation found:\n"
    printf -- "  [1] %s\n" "$(dirname "${traefik_dir_array[0]}")"
    printf -- "  [2] Additional Installation\n\n"
    declare choice
    while read -p "Which one do you want to choose? [1/2] " -er choice; do
      if [ "${choice}" = 1 ]; then
        TRAEFIK_DIR=$(dirname "${traefik_dir_array[0]}")
        break

      elif [ "${choice}" = 2 ]; then
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
      if [ "${choice}" -gt 0 ] && [ "${choice}" -le "${traefik_dir_count}" ]; then
        TRAEFIK_DIR=$(dirname "${traefik_dir_array[$((choice - 1))]}")
        break

      elif [ "${choice}" -eq $((traefik_dir_count + 1)) ]; then
        TRAEFIK_DIR=""
        break
      fi
    done
  fi

  printf "\nPrerequisites check finished successfully.\n\n"
}

install_application_infrastructure() {
  if [ -z "${TRAEFIK_DIR}" ]; then
    LATEST_TRAEFIK_RELEASE=$(curl --silent "${TRAEFIK_REPO_API}/releases/latest" |
      grep tag_name |
      cut -d : -f 2,3 |
      tr -d \" |
      tr -d , |
      tr -d " ")

    printf "2.4 Installing missing application infrastructure software:\n"
    printf "Downloading traefik installation script version %s ...\n" "${LATEST_TRAEFIK_RELEASE}"
    if curl -s --fail -o install_traefik.sh "${TRAEFIK_REPO_URL}/${LATEST_TRAEFIK_RELEASE}/scripts/install.sh"; then
      chmod +x install_traefik.sh
      printf 'Download successful!\n\n'
    else
      printf 'Download failed!\n'
      printf 'Traefik installation script finished with error\n'
      exit 1
    fi

    printf 'Downloaded installation script will be started now.\n\n'
    (./install_traefik.sh)
    rm ./install_traefik.sh

    printf '\nChecking Infrastructure installation ...\n'
    declare traefik_dir_array
    readarray -d '' traefik_dir_array < <(find / -name ".env.traefik" -mmin -5 -print0 2>/dev/null)

    declare traefik_dir_count=${#traefik_dir_array[*]}
    if [ "${traefik_dir_count}" -eq 0 ]; then
      printf -- '- No application infrastructure settings found.\n'
      printf 'Install script finished with error\n'
      exit 1

    elif [ "${traefik_dir_count}" -eq 1 ]; then
      TRAEFIK_DIR=$(dirname "${traefik_dir_array[0]}")

    else
      printf -- "- Multiple 'Traefik' installations found:\n"
      for ((i = 0; i < traefik_dir_count; i++)); do
        printf -- "  [%d] %s\n" $((i + 1)) "$(dirname "${traefik_dir_array[i]}")"
      done

      declare choice
      while read -p "Which one do you want to choose? [1-${traefik_dir_count}] " -er choice; do
        if [ "${choice}" -gt 0 ] && [ "${choice}" -le "${traefik_dir_count}" ]; then
          TRAEFIK_DIR="$(dirname "${traefik_dir_array[$((choice - 1))]}")"
          break
        fi
      done
    fi

    printf "Infrastructure installation checked.\n"
    printf "\n"
    printf "Missing application infrastructure successfully installed.\n"
    printf "\n"
    printf "\n"
    printf -- "------------------------------------------------------------\n"
    printf "Proceed with the original '%s' installation ...\n" "${APP_NAME}"
    printf -- "------------------------------------------------------------\n"
    printf "\n"
  fi
}

prepare_installation_dir() {
  while read -p '3. Determine installation directory: ' -er -i "${PWD}/${APP_NAME}" APP_DIR; do
    if [ ! -e "${APP_DIR}" ]; then
      break

    elif [ -d "${APP_DIR}" ] && [ -z "$(find "${APP_DIR}" -maxdepth 0 -type d -empty 2>/dev/null)" ]; then
      declare is_continue
      read -p "You have selected a non empty directory. Continue anyway? [y/N] " -er -n 1 is_continue
      if [[ ! ${is_continue} =~ ^[yY]$ ]]; then
        printf "'%s' installation script finished.\n" "${APP_NAME}"
        exit 0
      fi

      break

    else
      printf "'%s' is not a directory!\n\n" "${APP_DIR}"
    fi

  done

  printf "\n"

  mkdir -p "${APP_DIR}/backup/release"
  mkdir -p "${APP_DIR}/backup/temp"
  mkdir -p "${APP_DIR}/config/frontend"
  mkdir -p "${APP_DIR}/scripts/make"
  mkdir -p "${APP_DIR}/scripts/migration"

  cd "${APP_DIR}"
}

download_file() {
  declare local_file="${1}"
  declare remote_file="${REPO_URL}/${TARGET_VERSION}/${2}"

  if curl --silent --fail --output "${local_file}" "${remote_file}"; then
    printf -- "- File '%s' successfully downloaded.\n" "${1}"
  else
    printf -- "- File '%s' download failed.\n\n" "${1}"
    printf "'%s' installation script finished with error.\n\n" "${APP_NAME}"

    exit 1
  fi
}

download_files() {
  printf "4. Downloading files:\n"

  download_file "docker-compose.${APP_NAME}.yaml" docker-compose.yaml
  download_file "docker-compose.${APP_NAME}.prod.yaml" "docker-compose.${APP_NAME}.prod.yaml"
  download_file ".env.${APP_NAME}.template" ".env.${APP_NAME}.template"
  download_file config/frontend/default.conf.http-template config/frontend/default.conf.http-template
  download_file "scripts/make/${APP_NAME}.mk" scripts/make/prod.mk
  download_file "scripts/update_${APP_NAME}.sh" scripts/update.sh
  chmod +x "scripts/update_${APP_NAME}.sh"

  printf "Downloads done!\n\n"
}

customize_settings() {
  # Activate environment file
  cp ".env.${APP_NAME}.template" ".env.${APP_NAME}"

  # Set Edge Router Directory
  sed -i.bak "s|^TRAEFIK_DIR.*|TRAEFIK_DIR=${TRAEFIK_DIR}|" ".env.${APP_NAME}" && rm ".env.${APP_NAME}.bak"

  # Load defaults
  # shellcheck source=.env.studio-lite
  source ".env.${APP_NAME}"

  # Setup environment variables
  printf "5. Set Environment variables (default postgres password is generated randomly):\n\n"

  sed -i.bak "s|^TAG=.*|TAG=${TARGET_VERSION}|" ".env.${APP_NAME}" && rm ".env.${APP_NAME}.bak"

  declare server_name
  if [ -n "${TRAEFIK_DIR}" ]; then
    server_name=$(grep -oP 'SERVER_NAME=\K[^*]*' "${TRAEFIK_DIR}/.env.traefik")
  else
    read -p "SERVER_NAME: " -er -i "${server_name}" server_name
  fi
  sed -i.bak "s|^SERVER_NAME=.*|SERVER_NAME=${server_name}|" ".env.${APP_NAME}" && rm ".env.${APP_NAME}.bak"

  declare env_var_name
  for env_var_name in "${ENV_VAR_ORDER[@]}"; do
    declare env_var_value
    read -p "${env_var_name}: " -er -i "${ENV_VARS[${env_var_name}]}" env_var_value
    sed -i.bak "s|^${env_var_name}.*|${env_var_name}=${env_var_value}|" ".env.${APP_NAME}" && rm ".env.${APP_NAME}.bak"
  done

  declare jwt_secret
  jwt_secret=$(openssl rand -base64 32 | tr -- '+/' '-_')
  sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=${jwt_secret}|" ".env.${APP_NAME}" && rm ".env.${APP_NAME}.bak"

  # Setup makefiles
  sed -i.bak "s|^${MAKE_BASE_DIR_NAME} :=.*|${MAKE_BASE_DIR_NAME} := \\${APP_DIR}|" \
    "scripts/make/${APP_NAME}.mk" && rm "scripts/make/${APP_NAME}.mk.bak"
  sed -i.bak "s|scripts/update.sh|scripts/update_${APP_NAME}.sh|" \
    "scripts/make/${APP_NAME}.mk" && rm "scripts/make/${APP_NAME}.mk.bak"

  if [ -n "${TRAEFIK_DIR}" ] && [ "${TRAEFIK_DIR}" != "${APP_DIR}" ]; then
    cp "${TRAEFIK_DIR}/Makefile" Makefile
    printf "include %s/scripts/make/%s.mk\n" "${APP_DIR}" "${APP_NAME}" >>Makefile
  elif [ -n "${TRAEFIK_DIR}" ] && [ "${TRAEFIK_DIR}" == "${APP_DIR}" ]; then
    printf "include %s/scripts/make/%s.mk\n" "${APP_DIR}" "${APP_NAME}" >>Makefile
  else
    printf "include %s/scripts/make/%s.mk\n" "${APP_DIR}" "${APP_NAME}" >Makefile
  fi

  # Init nginx http configuration
  cp ./config/frontend/default.conf.http-template config/frontend/default.conf.template

  printf "\n"
}

application_start() {
  printf "'%s' installation done.\n\n" "${APP_NAME}"

    declare is_start_now
    read -p "Do you want to start ${APP_NAME} now? [Y/n] " -er -n 1 is_start_now
    printf '\n'
    if [[ ! ${is_start_now} =~ [nN] ]]; then
      if ! test "$(docker network ls -q --filter name=app-net)"; then
        docker network create app-net
      fi
      docker compose \
        --env-file ".env.${APP_NAME}" \
        --file "docker-compose.${APP_NAME}.yaml" \
        --file "docker-compose.${APP_NAME}.prod.yaml" \
        pull
      docker compose \
        --env-file ".env.${APP_NAME}" \
        --file "docker-compose.${APP_NAME}.yaml" \
        --file "docker-compose.${APP_NAME}.prod.yaml" \
        up -d
    else
      printf "'%s' installation script finished.\n" "${APP_NAME}"
      exit 0
    fi
}

main() {
  if [ -z "${TARGET_VERSION}" ]; then
    printf "\n==================================================\n"
    printf "'%s' installation script started ..." "${APP_NAME}" | tr '[:lower:]' '[:upper:]'
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

    check_prerequisites

    install_application_infrastructure

    prepare_installation_dir

    download_files

    customize_settings

    application_start

  fi
}

main
