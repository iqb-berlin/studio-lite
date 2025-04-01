STUDIO_BASE_DIR := $(shell git rev-parse --show-toplevel)
CMD ?= status

include $(STUDIO_BASE_DIR)/.env.studio-lite

# exports all variables (especially those of the included .env.studio-lite file!)
.EXPORT_ALL_VARIABLES:

# prevents collisions of make target names with possible file names
.PHONY: studio-lite-up studio-lite-down studio-lite-start studio-lite-stop studio-lite-status studio-lite-logs\
	studio-lite-config studio-lite-system-prune studio-lite-volumes-prune studio-lite-images-clean\
	studio-lite-liquibase-status studio-lite-connect-db studio-lite-dump-all studio-lite-restore-all studio-lite-dump-db\
	studio-lite-restore-db studio-lite-dump-db-data-only studio-lite-restore-db-data-only studio-lite-export-backend-vol\
	studio-lite-import-backend-vol studio-lite-update

# disables printing the recipe of a make target before executing it
.SILENT: prod-images-clean

# Pull newest images, create and start docker containers
studio-lite-up:
	@if [ ! -f $(STUDIO_BASE_DIR)/config/frontend/default.conf.template ]; then\
		cp\
			$(STUDIO_BASE_DIR)/config/frontend/default.conf.http-template\
			$(STUDIO_BASE_DIR)/config/frontend/default.conf.template;\
	fi
	@if ! test $(shell docker network ls -q --filter name=app-net);\
		then docker network create app-net;\
	fi
	@if test $(REGISTRY_PATH); then printf "Login %s\n" $(REGISTRY_PATH); docker login $(REGISTRY_PATH); fi
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		pull
	@if test $(REGISTRY_PATH); then docker logout $(REGISTRY_PATH); fi
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d

# Stop and remove docker containers
studio-lite-down:
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		down

# Start docker containers
## Param (optional): SERVICE - Start the specified service only, e.g. `make studio-lite-start SERVICE=db`
studio-lite-start:
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		start $(SERVICE)

# Stop docker containers
## Param (optional): SERVICE - Stop the specified service only, e.g. `make studio-lite-stop SERVICE=db`
studio-lite-stop:
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		stop $(SERVICE)

# Show status of containers
## Param (optional): SERVICE - Show status of the specified service only, e.g. `make studio-lite-status SERVICE=db`
studio-lite-status:
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		ps -a $(SERVICE)

# Show service logs
## Param (optional): SERVICE - Show log of the specified service only, e.g. `make studio-lite-logs SERVICE=db`
studio-lite-logs:
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		logs -f $(SERVICE)

# Show services configuration
## Param (optional): SERVICE - Show config of the specified service only, e.g. `make studio-lite-config SERVICE=db`
studio-lite-config:
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		config $(SERVICE)

# Remove unused dangling images, containers, networks, etc. Data volumes will stay untouched!
studio-lite-system-prune:
	docker system prune

# Remove all anonymous local volumes not used by at least one container.
studio-lite-volumes-prune:
	docker volume prune

# Remove all unused (not just dangling) images!
studio-lite-images-clean: .EXPORT_ALL_VARIABLES
	if test "$(shell docker images -f reference=${REGISTRY_PATH}iqbberlin/studio-lite-* -q)";\
		then docker rmi $(shell docker images -f reference=${REGISTRY_PATH}iqbberlin/studio-lite-* -q);\
	fi

# Outputs the count of changesets that have not been deployed
## (https://docs.liquibase.com/commands/status/status.html)
studio-lite-liquibase-status: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_BASE_DIR) &&\
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		run --rm liquibase\
			liquibase\
					--changelogFile=studio-lite.changelog-root.xml\
					--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
					--username=$(POSTGRES_USER)\
					--password=$(POSTGRES_PASSWORD)\
					--classpath=changelog\
					--logLevel=info\
				$(CMD)

# Open DB console
studio-lite-connect-db: .EXPORT_ALL_VARIABLES
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		exec -it db\
			psql --username=$(POSTGRES_USER) --dbname=$(POSTGRES_DB)

# Extract a database cluster into a script file
## (https://www.postgresql.org/docs/current/app-pg-dumpall.html)
studio-lite-dump-all: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d db
	sleep 5 ## wait until db startup is completed
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		exec -it db\
			pg_dumpall --verbose --username=$(POSTGRES_USER) > $(STUDIO_BASE_DIR)/backup/temp/all.sql
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		down

# PostgreSQL interactive terminal reads commands from the dump file all.sql
## (https://www.postgresql.org/docs/14/app-psql.html)
## Before restoring, delete the DB volume and any existing block storage.
## Check whether the database already exists and drop it if necessary.
studio-lite-restore-all: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d db
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		cp $(STUDIO_BASE_DIR)/backup/temp/all.sql db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		exec -it db\
			psql --username=$(POSTGRES_USER) --file=/tmp/all.sql postgres
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		down

# Extract a database into a script file or other archive file
## (https://www.postgresql.org/docs/current/app-pgdump.html)
studio-lite-dump-db: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d db
	sleep 5 ## wait until db startup is completed
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		exec -it db\
			pg_dump\
					--verbose\
					--username=$(POSTGRES_USER)\
					--format=t\
				$(POSTGRES_DB) > $(STUDIO_BASE_DIR)/backup/temp/$(POSTGRES_DB).tar
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		down

# Restore a database from an archive file created by pg_dump
## (https://www.postgresql.org/docs/current/app-pgrestore.html)
## Before restoring, delete the DB volume and any existing block storage.
studio-lite-restore-db: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d db
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		cp $(STUDIO_BASE_DIR)/backup/temp/$(POSTGRES_DB).tar db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		exec -it db\
			pg_restore\
					--verbose\
					--single-transaction\
					--username=$(POSTGRES_USER)\
					--dbname=$(POSTGRES_DB)\
					--clean\
					--if-exists\
				/tmp/$(POSTGRES_DB).tar
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		down

# Extract a database data into a script file or other archive file
## (https://www.postgresql.org/docs/current/app-pgdump.html)
studio-lite-dump-db-data-only: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d db liquibase
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		exec -it db\
			pg_dump\
					--verbose\
					--data-only\
					--exclude-table=public.databasechangelog\
					--exclude-table=public.databasechangeloglock\
					--username=$(POSTGRES_USER)\
					--format=t\
			$(POSTGRES_DB) > $(STUDIO_BASE_DIR)/backup/temp/$(POSTGRES_DB)_data.tar
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		down

# Restore a database data from an archive file created by pg_dump
## (https://www.postgresql.org/docs/current/app-pgrestore.html)
studio-lite-restore-db-data-only: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d db liquibase
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		cp $(STUDIO_BASE_DIR)/backup/temp/$(POSTGRES_DB)_data.tar db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		exec -it db\
			pg_restore\
					--verbose\
					--data-only\
					--single-transaction\
					--disable-triggers\
					--username=$(POSTGRES_USER)\
					--dbname=$(POSTGRES_DB)\
				/tmp/$(POSTGRES_DB)_data.tar
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		down

# Creates a gzip'ed tarball in temporary backup directory from backend data (backend has to be up!)
studio-lite-export-backend-vol:
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d backend
	sleep 5 ## wait until backend startup is completed
	docker run --rm\
			--volumes-from $(notdir $(CURDIR))-backend-1\
			--volume $(STUDIO_BASE_DIR)/backup/temp:/tmp\
		busybox tar cvzf /tmp/backend_vol.tar.gz /usr/src/studio-lite-api/packages

# Extracts a gzip'ed tarball from temporary backup directory into backend data volume (backend has to be up!)
studio-lite-import-backend-vol:
	docker compose\
			--env-file $(STUDIO_BASE_DIR)/.env.studio-lite\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
		up -d backend
	sleep 5 ## wait until backend startup is completed
	docker run --rm\
			--volumes-from $(notdir $(CURDIR))-backend-1\
			--volume $(STUDIO_BASE_DIR)/backup/temp:/tmp\
		busybox sh\
			-c "cd /usr/src/studio-lite-api/packages && tar xvzf /tmp/backend_vol.tar.gz --strip-components 4"

# Start application update procedure
studio-lite-update:
	bash $(STUDIO_BASE_DIR)/scripts/update.sh -s $(TAG)
