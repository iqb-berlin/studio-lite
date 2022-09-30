#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

# backup previous nginx config file
mv "$BASE_DIR"/config/frontend/default.conf.template "$BASE_DIR"/config/frontend/default.conf.template.bkp

# use preconfigured http config file
cp "$BASE_DIR"/config/frontend/default.conf.http-template "$BASE_DIR"/config/frontend/default.conf.template

printf "Nginx is now preconfigured for HTTP communication.\n"

printf "\nYou must (re)start the application for the new configuration to take effect!\n"
