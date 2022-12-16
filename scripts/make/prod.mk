.PHONY: production-status production-logs production-ramp-up production-shut-down production-start production-stop \
production-connect-db production-dump-all production-restore-all production-dump-db production-restore-db \
production-dump-db-data-only production-restore-db-data-only production-config production-clean
BASE_DIR := $(shell git rev-parse --show-toplevel)
include $(BASE_DIR)/.env.prod

.EXPORT_ALL_VARIABLES: ## exports all variables (especially those of the included .env.prod file!)

production-status: ## Get status list of all containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml ps -a

production-logs: ## Get logs of running containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml logs -f

production-ramp-up: ## Pull newest images, create and start docker containers
	if [ ! -f $(BASE_DIR)/config/frontend/default.conf.template ]; then cp $(BASE_DIR)/config/frontend/default.conf.http-template $(BASE_DIR)/config/frontend/default.conf.template; fi
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d

production-shut-down: ## Stop and remove docker containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml down

production-start: ## Start docker containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml start

production-stop: ## Stop docker containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml stop

production-connect-db: .EXPORT_ALL_VARIABLES
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml exec -it db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

production-dump-all: production-shut-down .EXPORT_ALL_VARIABLES	## Extract a database cluster into a script file (https://www.postgresql.org/docs/current/app-pg-dumpall.html)
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d db
	sleep 5 ## wait until db startup is completed
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml exec -it db pg_dumpall --verbose -U $(POSTGRES_USER)  > $(BASE_DIR)/database_dumps/all.sql
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml down

production-restore-all: production-shut-down .EXPORT_ALL_VARIABLES	## PostgreSQL interactive terminal reads commands from the dump file all.sql (https://www.postgresql.org/docs/14/app-psql.html)
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d db
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml cp $(BASE_DIR)/database_dumps/all.sql db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml exec -it db psql -U $(POSTGRES_USER) -f /tmp/all.sql postgres
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml down

production-dump-db: production-shut-down .EXPORT_ALL_VARIABLES	## Extract a database into a script file or other archive file (https://www.postgresql.org/docs/current/app-pgdump.html)
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d db
	sleep 5 ## wait until db startup is completed
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml exec -it db pg_dump --verbose -U $(POSTGRES_USER) -F t $(POSTGRES_DB) > $(BASE_DIR)/database_dumps/$(POSTGRES_DB).tar
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml down

production-restore-db: production-shut-down .EXPORT_ALL_VARIABLES	## Restore a database from an archive file created by pg_dump (https://www.postgresql.org/docs/current/app-pgrestore.html)
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d db
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml cp $(BASE_DIR)/database_dumps/$(POSTGRES_DB).tar db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml exec -it db pg_restore --verbose --single-transaction -U $(POSTGRES_USER) -d $(POSTGRES_DB) /tmp/$(POSTGRES_DB).tar
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml down

production-dump-db-data-only: production-shut-down .EXPORT_ALL_VARIABLES	## Extract a database data into a script file or other archive file (https://www.postgresql.org/docs/current/app-pgdump.html)
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d db liquibase
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml exec -it db pg_dump --verbose --data-only --exclude-table=public.databasechangelog --exclude-table=public.databasechangeloglock -U $(POSTGRES_USER) -F t $(POSTGRES_DB) > $(BASE_DIR)/database_dumps/$(POSTGRES_DB)_data.tar
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml down

production-restore-db-data-only: production-shut-down .EXPORT_ALL_VARIABLES	## Restore a database data from an archive file created by pg_dump (https://www.postgresql.org/docs/current/app-pgrestore.html)
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d db liquibase
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml cp $(BASE_DIR)/database_dumps/$(POSTGRES_DB)_data.tar db:/tmp/
	sleep 10	## wait until file upload is completed
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml exec -it db pg_restore --verbose --data-only --single-transaction --disable-triggers -U $(POSTGRES_USER) -d $(POSTGRES_DB) /tmp/$(POSTGRES_DB)_data.tar
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml down

production-config: ## Show services configuration
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml config

production-clean: ## Remove unused (dangling) images, containers, networks, etc. Data volumes will stay untouched!
	docker system prune
