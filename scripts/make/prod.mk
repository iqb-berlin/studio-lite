.PHONY: production-ramp-up production-shut-down production-start production-stop production-status production-logs \
production-config production-clean production-liquibase-status production-connect-db production-dump-all \
production-restore-all production-dump-db production-restore-db production-dump-db-data-only \
production-restore-db-data-only
BASE_DIR := $(shell git rev-parse --show-toplevel)
CMD ?= status
include $(BASE_DIR)/.env.prod

## exports all variables (especially those of the included .env.prod file!)
.EXPORT_ALL_VARIABLES:

## Pull newest images, create and start docker containers
production-ramp-up:
	if \
		! test -f $(BASE_DIR)/secrets/traefik/studio-lite.crt || \
		! test -f $(BASE_DIR)/secrets/traefik/studio-lite.key || \
		! command openssl x509 -in $(BASE_DIR)/secrets/traefik/studio-lite.crt -text -noout >/dev/null 2>&1 || \
		! command openssl rsa -in $(BASE_DIR)/secrets/traefik/studio-lite.key -check >/dev/null 2>&1; \
				then \
					echo "==============================================="; \
					echo "No SSL certificate and/or key available!"; \
					echo "Generating a 1-day self-signed certificate ..."; \
					openssl req \
							 -newkey rsa:2048 -nodes -subj "/CN=$(SERVER_NAME)" \
							 -keyout $(BASE_DIR)/secrets/traefik/studio-lite.key \
							 -x509 -days 1 -out $(BASE_DIR)/secrets/traefik/studio-lite.crt; \
					echo "Self-signed 1-day certificate created."; \
					echo "==============================================="; \
	fi
	if [ ! -f $(BASE_DIR)/config/frontend/default.conf.template ]; \
		then cp $(BASE_DIR)/config/frontend/default.conf.http-template $(BASE_DIR)/config/frontend/default.conf.template; fi
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		--env-file $(BASE_DIR)/.env.prod pull
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		--env-file $(BASE_DIR)/.env.prod up -d

## Stop and remove docker containers
production-shut-down:
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod down

## Start docker containers
# Param (optional): SERVICE - Start the specified service only, e.g. `SERVICE=db make production-start`
production-start:
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod start $(SERVICE)

## Stop docker containers
production-stop:
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod stop $(SERVICE)

## Show status of containers
# Param (optional): SERVICE - Show status of the specified service only, e.g. `SERVICE=db make production-status`
production-status:
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod ps -a $(SERVICE)

## Show service logs
# Param (optional): SERVICE - Show log of the specified service only, e.g. `SERVICE=db make production-logs`
production-logs:
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod logs -f $(SERVICE)

## Show services configuration
# Param (optional): SERVICE - Show config of the specified service only, e.g. `SERVICE=db make production-config`
production-config:
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		--env-file $(BASE_DIR)/.env.prod config $(SERVICE)

## Remove unused (dangling) images, containers, networks, etc. Data volumes will stay untouched!
production-clean:
	docker system prune

## Outputs the count of changesets that have not been deployed
# (https://docs.liquibase.com/commands/status/status.html)
production-liquibase-status: .EXPORT_ALL_VARIABLES
	cd $(BASE_DIR) && docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		--env-file $(BASE_DIR)/.env.prod run --rm liquibase \
			liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://db:5432/$(POSTGRES_DB) \
				--username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info $(CMD)

## Open DB console
production-connect-db: .EXPORT_ALL_VARIABLES
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		--env-file $(BASE_DIR)/.env.prod exec -it db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

## Extract a database cluster into a script file
# (https://www.postgresql.org/docs/current/app-pg-dumpall.html)
production-dump-all: production-shut-down .EXPORT_ALL_VARIABLES
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod up -d db
	sleep 5 ## wait until db startup is completed
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod exec -it db pg_dumpall --verbose -U $(POSTGRES_USER) > \
		 $(BASE_DIR)/database_dumps/all.sql
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod down

## PostgreSQL interactive terminal reads commands from the dump file all.sql
# (https://www.postgresql.org/docs/14/app-psql.html)
production-restore-all: production-shut-down .EXPORT_ALL_VARIABLES
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod up -d db
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod cp $(BASE_DIR)/database_dumps/all.sql db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod exec -it db psql -U $(POSTGRES_USER) -f /tmp/all.sql postgres
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod down

## Extract a database into a script file or other archive file
# (https://www.postgresql.org/docs/current/app-pgdump.html)
production-dump-db: production-shut-down .EXPORT_ALL_VARIABLES
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod up -d db
	sleep 5 ## wait until db startup is completed
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod exec -it db pg_dump --verbose -U $(POSTGRES_USER) -F t $(POSTGRES_DB) > \
		 $(BASE_DIR)/database_dumps/$(POSTGRES_DB).tar
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod down

## Restore a database from an archive file created by pg_dump
# (https://www.postgresql.org/docs/current/app-pgrestore.html)
production-restore-db: production-shut-down .EXPORT_ALL_VARIABLES
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod up -d db
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod cp $(BASE_DIR)/database_dumps/$(POSTGRES_DB).tar db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod exec -it db pg_restore --verbose --single-transaction -U $(POSTGRES_USER) \
		 -d $(POSTGRES_DB) /tmp/$(POSTGRES_DB).tar
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod down

## Extract a database data into a script file or other archive file
# (https://www.postgresql.org/docs/current/app-pgdump.html)
production-dump-db-data-only: production-shut-down .EXPORT_ALL_VARIABLES
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod up -d db liquibase
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod exec -it db pg_dump --verbose --data-only \
		 --exclude-table=public.databasechangelog --exclude-table=public.databasechangeloglock -U $(POSTGRES_USER) -F \
		 t $(POSTGRES_DB) > $(BASE_DIR)/database_dumps/$(POSTGRES_DB)_data.tar
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod down

## Restore a database data from an archive file created by pg_dump
# (https://www.postgresql.org/docs/current/app-pgrestore.html)
production-restore-db-data-only: production-shut-down .EXPORT_ALL_VARIABLES
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod up -d db liquibase
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod cp $(BASE_DIR)/database_dumps/$(POSTGRES_DB)_data.tar db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod exec -it db pg_restore --verbose --data-only --single-transaction \
		 --disable-triggers -U $(POSTGRES_USER) -d $(POSTGRES_DB) /tmp/$(POSTGRES_DB)_data.tar
	docker compose -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml \
		 --env-file $(BASE_DIR)/.env.prod down
