#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

# backup previous nginx config file
mv "$BASE_DIR"/config/frontend/default.conf.template "$BASE_DIR"/config/frontend/default.conf.template.bkp

# use preconfigured https config file
cp "$BASE_DIR"/config/frontend/default.conf.https-template "$BASE_DIR"/config/frontend/default.conf.template

printf "Nginx is now preconfigured for HTTPS communication.\n"
printf "Please store your certificate at 'config/frontend/tls/studio.crt' and your private key at 'config/frontend/tls/studio.key'!\n"
printf "If necessary, make adjustments in preconfigured nginx config file at 'config/frontend/default.conf.template'.\n"

printf "\nYou must (re)start the application for the new configuration to take effect!\n"
