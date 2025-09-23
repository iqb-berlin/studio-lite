#!/usr/bin/env bash

declare TARGET_VERSION="11.0.0"

function update_environment_file() {
  source .env.studio-lite

  printf "    Upgrading docker environment file '%s' ...\n" .env.studio-lite

  # Rename 'Version' comment
  sed -i.bak 's|^## Version.*|# Version|' .env.studio-lite && rm .env.studio-lite.bak

  # Rename 'Image Registry Path' comment
  sed -i.bak 's|^## Image Registry Path.*|# Image Registry Path|' .env.studio-lite && rm .env.studio-lite.bak

  # Rename 'Docker Hub:' comment
  sed -i.bak 's|# Docker Hub:|## Docker Hub:|' .env.studio-lite && rm .env.studio-lite.bak

  # Rename 'Docker Hub Proxy:' comment
  sed -i.bak 's|# Docker Hub Proxy:|## Docker Hub Proxy:|' .env.studio-lite && rm .env.studio-lite.bak

  # Rename 'GitLab:' comment
  sed -i.bak 's|# GitLab:|## GitLab:|' .env.studio-lite && rm .env.studio-lite.bak

  # Rename 'Infrastructure' comment
  sed -i.bak 's|^## Infrastructure.*|# Ingress|' .env.studio-lite && rm .env.studio-lite.bak

  # Rename 'Infrastructure' sub comments
  sed -i.bak 's|# The Server Name|## The Server Name|' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "s|# 'SERVER_NAME' and|## 'SERVER_NAME' and|" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "s|# in the '.env.traefik'|## in the '.env.traefik'|" .env.studio-lite && rm .env.studio-lite.bak

  # Rename 'TLS_CERTIFICATE_RESOLVER Settings' comment
  sed -i.bak 's|^# TLS_CERTIFICATE_RESOLVER Settings:.*|## TLS_CERTIFICATE_RESOLVER Settings:|' .env.studio-lite && rm .env.studio-lite.bak

  # Rename 'Infrastructure' sub comments
  sed -i.bak 's|^# Leave it empty for|### Leave it empty for|' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "s|^# 'acme', if you want|### 'acme', if you want|" .env.studio-lite && rm .env.studio-lite.bak

  # Rearrange 'Backend' block
  sed -i.bak '\|^## Backend.*|d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak '\|^JWT_SECRET=.*|d' .env.studio-lite && rm .env.studio-lite.bak

  sed -i.bak '\|^TRAEFIK_DIR=.*|a \\n# Backend' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "\|^# Backend|a JWT_SECRET=${JWT_SECRET}" .env.studio-lite && rm .env.studio-lite.bak

  # Move 'Database' block from third to fifth
  sed -i.bak '\|^## Database.*|d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak '\|^POSTGRES_USER=.*|d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak '\|^POSTGRES_PASSWORD=.*|d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak '\|^POSTGRES_DB=.*|d' .env.studio-lite && rm .env.studio-lite.bak

  sed -i.bak '\|^JWT_SECRET=.*|a \\n# Database' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "\|^# Database|a POSTGRES_USER=${POSTGRES_USER}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "\|^POSTGRES_USER=.*|a POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "\|^POSTGRES_PASSWORD=.*|a POSTGRES_DB=${POSTGRES_DB}" .env.studio-lite && rm .env.studio-lite.bak

  # Add DB volume entries
  db_volume_comment="## DB Volume: Select 'db_vol' to use the default docker volume, or 'db_external_vol' if you want "
  db_volume_comment+="to use block storage."

  db_external_volume_path_comment="## Enter the path of your external storage device. Only required if you are NOT "
  db_external_volume_path_comment+="using the default Docker volume."

  sed -i.bak "\|^POSTGRES_DB=.*|a \\\n${db_volume_comment}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "\|^${db_volume_comment}|a DB_VOL=db_vol" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "\|^DB_VOL=db_vol|a \\\n${db_external_volume_path_comment}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "\|^${db_external_volume_path_comment}|a DB_EXTERNAL_VOL_PATH=" .env.studio-lite && rm .env.studio-lite.bak

  # Move 'TRAEFIK_DIR' to 'Ingress' block
  sed -i.bak '\|^TRAEFIK_DIR=.*|d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "\|^SERVER_NAME=.*|a TRAEFIK_DIR=${TRAEFIK_DIR}" .env.studio-lite && rm .env.studio-lite.bak

  # Replace multiple empty lines with on empty line
  sed -i.bak '\|^$|N;\|^\n$|D' .env.studio-lite && rm .env.studio-lite.bak

  printf "    Docker environment file '%s' successfully upgraded.\n" .env.studio-lite
}

function main() {

  update_environment_file

}

main
