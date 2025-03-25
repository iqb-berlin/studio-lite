#!/bin/bash

declare TARGET_VERSION="11.0.0"

function update_environment_file() {
  source .env.studio-lite

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

  # Rearrange 'Backend' block
  sed -i.bak '/^## Backend.*/d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak '/^JWT_SECRET=.*/d' .env.studio-lite && rm .env.studio-lite.bak

  sed -i.bak '/^TRAEFIK_DIR=.*/a \\n# Backend' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^# Backend/a JWT_SECRET=${JWT_SECRET}" .env.studio-lite && rm .env.studio-lite.bak

  # Move 'Database' block from third to fifth
  sed -i.bak '/^## Database.*/d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak '/^POSTGRES_USER=.*/d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak '/^POSTGRES_PASSWORD=.*/d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak '/^POSTGRES_DB=.*/d' .env.studio-lite && rm .env.studio-lite.bak

  sed -i.bak '/^JWT_SECRET=.*/a \\n# Database' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^# Database/a POSTGRES_USER=${POSTGRES_USER}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^POSTGRES_USER=.*/a POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^POSTGRES_PASSWORD=.*/a POSTGRES_DB=${POSTGRES_DB}" .env.studio-lite && rm .env.studio-lite.bak

  # Add DB volume entries
  db_volume_comment="## DB Volume: Select 'db_vol' as default docker volume, or 'db_external_vol' if you use external "
  db_volume_comment+="block storage\n"

  db_external_volume_path_comment="## Type the path of your external storage device, of leave it empty, if you use the "
  db_external_volume_path_comment+="default docker volume\n"

  sed -i.bak "/^POSTGRES_DB=.*/a ${db_volume_comment}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^${db_volume_comment}/a DB_VOL=db_vol" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^DB_VOL=db_vol/a ${db_external_volume_path_comment}" .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^${db_external_volume_path_comment}/a DB_EXTERNAL_VOL_PATH=" .env.studio-lite && rm .env.studio-lite.bak

  # Move 'TRAEFIK_DIR' to 'Ingress' block
  sed -i.bak '/^TRAEFIK_DIR=.*/d' .env.studio-lite && rm .env.studio-lite.bak
  sed -i.bak "/^SERVER_NAME=.*/a TRAEFIK_DIR=${TRAEFIK_DIR}" .env.studio-lite && rm .env.studio-lite.bak
}

function main() {
  printf "Applying complementary update script: %s ...\n" ${TARGET_VERSION}

  update_environment_file

  printf "Complementary update script %s applied.\n\n" ${TARGET_VERSION}
}

main
