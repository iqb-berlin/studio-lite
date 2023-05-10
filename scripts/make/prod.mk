BASE_DIR := $(shell git rev-parse --show-toplevel)
CMD ?= status

include $(BASE_DIR)/.env.prod

## exports all variables (especially those of the included .env.prod file!)
.EXPORT_ALL_VARIABLES:

## prevents collisions of make target names with possible file names
.PHONY: studio-lite-up studio-lite-down studio-lite-start studio-lite-stop studio-lite-status studio-lite-logs\
	studio-lite-config studio-lite-system-prune studio-lite-volumes-prune studio-lite-images-clean\
	studio-lite-liquibase-status studio-lite-connect-db studio-lite-dump-all studio-lite-restore-all studio-lite-dump-db\
	studio-lite-restore-db studio-lite-dump-db-data-only studio-lite-restore-db-data-only

## disables printing the recipe of a make target before executing it
.SILENT: prod-images-clean

## Pull newest images, create and start docker containers
studio-lite-up:
	@if [ ! -f $(BASE_DIR)/config/frontend/default.conf.template ];\
		then cp $(BASE_DIR)/config/frontend/default.conf.http-template $(BASE_DIR)/config/frontend/default.conf.template;\
	fi
	@if ! test $(shell docker network ls -q --filter name=app-net);\
		then docker network create app-net;\
	fi
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		pull
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		up -d

## Stop and remove docker containers
studio-lite-down:
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		down

## Start docker containers
# Param (optional): SERVICE - Start the specified service only, e.g. `make studio-lite-start SERVICE=db`
studio-lite-start:
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		start $(SERVICE)

## Stop docker containers
# Param (optional): SERVICE - Stop the specified service only, e.g. `make studio-lite-stop SERVICE=db`
studio-lite-stop:
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		stop $(SERVICE)

## Show status of containers
# Param (optional): SERVICE - Show status of the specified service only, e.g. `make studio-lite-status SERVICE=db`
studio-lite-status:
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		ps -a $(SERVICE)

## Show service logs
# Param (optional): SERVICE - Show log of the specified service only, e.g. `make studio-lite-logs SERVICE=db`
studio-lite-logs:
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		logs -f $(SERVICE)

## Show services configuration
# Param (optional): SERVICE - Show config of the specified service only, e.g. `make studio-lite-config SERVICE=db`
studio-lite-config:
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		config $(SERVICE)

## Remove unused dangling images, containers, networks, etc. Data volumes will stay untouched!
studio-lite-system-prune:
	docker system prune

## Remove all anonymous local volumes not used by at least one container.
studio-lite-volumes-prune:
	docker volume prune

## Remove all unused (not just dangling) images!
studio-lite-images-clean: .EXPORT_ALL_VARIABLES
	if test "$(shell docker images -q ${REGISTRY_PATH}iqbberlin/studio-lite-db)";\
		then docker rmi $(shell docker images -q ${REGISTRY_PATH}iqbberlin/studio-lite-db);\
	fi
	if test "$(shell docker images -q ${REGISTRY_PATH}iqbberlin/studio-lite-liquibase)";\
		then docker rmi $(shell docker images -q ${REGISTRY_PATH}iqbberlin/studio-lite-liquibase);\
	fi
	if test "$(shell docker images -q ${REGISTRY_PATH}iqbberlin/studio-lite-backend)";\
		then docker rmi $(shell docker images -q ${REGISTRY_PATH}iqbberlin/studio-lite-backend);\
	fi
	if test "$(shell docker images -q ${REGISTRY_PATH}iqbberlin/studio-lite-frontend)";\
		then docker rmi $(shell docker images -q ${REGISTRY_PATH}iqbberlin/studio-lite-frontend);\
	fi

## Outputs the count of changesets that have not been deployed
# (https://docs.liquibase.com/commands/status/status.html)
studio-lite-liquibase-status: .EXPORT_ALL_VARIABLES
	cd $(BASE_DIR) &&\
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		run --rm liquibase\
			liquibase\
					--changelogFile=studio-lite.changelog-root.xml\
					--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
					--username=$(POSTGRES_USER)\
					--password=$(POSTGRES_PASSWORD)\
					--classpath=changelog\
					--logLevel=info\
				$(CMD)

## Open DB console
studio-lite-connect-db: .EXPORT_ALL_VARIABLES
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		exec -it db\
			psql --username=$(POSTGRES_USER) --dbname=$(POSTGRES_DB)

## Extract a database cluster into a script file
# (https://www.postgresql.org/docs/current/app-pg-dumpall.html)
studio-lite-dump-all: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		up -d db
	sleep 5 ## wait until db startup is completed
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		exec -it db\
			pg_dumpall --verbose --username=$(POSTGRES_USER) > $(BASE_DIR)/backup/database_dump/all.sql
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		down

## PostgreSQL interactive terminal reads commands from the dump file all.sql
# (https://www.postgresql.org/docs/14/app-psql.html)
studio-lite-restore-all: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		up -d db
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		cp $(BASE_DIR)/backup/database_dump/all.sql db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		exec -it db\
			psql --username=$(POSTGRES_USER) --file=/tmp/all.sql postgres
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		down

## Extract a database into a script file or other archive file
# (https://www.postgresql.org/docs/current/app-pgdump.html)
studio-lite-dump-db: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		up -d db
	sleep 5 ## wait until db startup is completed
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		exec -it db\
			pg_dump\
					--verbose\
					--username=$(POSTGRES_USER)\
					--format=t\
				$(POSTGRES_DB) > $(BASE_DIR)/backup/database_dump/$(POSTGRES_DB).tar
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		down

## Restore a database from an archive file created by pg_dump
# (https://www.postgresql.org/docs/current/app-pgrestore.html)
studio-lite-restore-db: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		up -d db
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		cp $(BASE_DIR)/backup/database_dump/$(POSTGRES_DB).tar db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		exec -it db\
			pg_restore\
					--verbose\
					--single-transaction\
					--username=$(POSTGRES_USER)\
					--dbname=$(POSTGRES_DB)\
				/tmp/$(POSTGRES_DB).tar
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		down

## Extract a database data into a script file or other archive file
# (https://www.postgresql.org/docs/current/app-pgdump.html)
studio-lite-dump-db-data-only: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		up -d db liquibase
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		exec -it db\
			pg_dump\
					--verbose\
					--data-only\
					--exclude-table=public.databasechangelog\
					--exclude-table=public.databasechangeloglock\
					--username=$(POSTGRES_USER)\
					--format=t\
			$(POSTGRES_DB) > $(BASE_DIR)/backup/database_dump/$(POSTGRES_DB)_data.tar
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		down

## Restore a database data from an archive file created by pg_dump
# (https://www.postgresql.org/docs/current/app-pgrestore.html)
studio-lite-restore-db-data-only: studio-lite-down .EXPORT_ALL_VARIABLES
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		up -d db liquibase
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		cp $(BASE_DIR)/backup/database_dump/$(POSTGRES_DB)_data.tar db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose\
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
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
			--file $(BASE_DIR)/docker-compose.yml\
			--file $(BASE_DIR)/docker-compose.prod.yml\
			--env-file $(BASE_DIR)/.env.prod\
		down
