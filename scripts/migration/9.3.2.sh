#!/bin/bash

update_environment_file() {
  source .env.studio-lite

  printf "Update docker environment file ...\n"

  declare infrastructure_comment
  declare tls_certificates_resolvers_comment
  declare tls_cert_resolver

  infrastructure_comment="# The Server Name and the TLS Certificates Resolvers are defined and configured in the "
  infrastructure_comment+="Traefik project.\n# 'SERVER_NAME' and 'TLS_CERTIFICATE_RESOLVER' have to be in sync with"
  infrastructure_comment+="the 'SERVER_NAME' and 'TLS_CERTIFICATE_RESOLVER'\n# in the '.env.traefik' file located at "
  infrastructure_comment+="TRAEFIK_DIR (see below)!"

  tls_certificates_resolvers_comment="\n# TLS_CERTIFICATE_RESOLVER Settings:\n# Leave it empty for user-defined "
  tls_certificates_resolvers_comment+="certificates, or choose\n# 'acme', if you want to use an acme-provider, like "
  tls_certificates_resolvers_comment+="'Let's Encrypt' or 'Sectigo'\nTLS_CERTIFICATE_RESOLVER="

  if [ -n "${TRAEFIK_DIR}" ]; then
    tls_cert_resolver=$(grep -oP 'TLS_CERTIFICATE_RESOLVER=\K[^*]*' "${TRAEFIK_DIR}/.env.traefik")
  fi

  sed -i.bak "/^## Infrastructure/a ${infrastructure_comment}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^SERVER_NAME=.*/a \\${tls_certificates_resolvers_comment}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "s|TLS_CERTIFICATE_RESOLVER=.*|TLS_CERTIFICATE_RESOLVER=${tls_cert_resolver}|" .env.studio-lite &&
    rm .env.studio-lite.bak

  printf "Docker environment file updated.\n"
}

main() {
  printf "\n============================================================\n"
  printf "Migration script '%s' started ..." "$0"
  printf "\n------------------------------------------------------------\n"
  printf "\n"

  update_environment_file

  printf "\n------------------------------------------------------------\n"
  printf "Migration script '%s' finished." "$0"
  printf "\n============================================================\n"
  printf "\n"
}

main
