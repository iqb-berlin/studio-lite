#!/bin/bash
set -e

bash db_update.sh | awk '{print "database update script: " $0}' &

bash docker-entrypoint.sh postgres
