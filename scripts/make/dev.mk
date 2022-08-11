.PHONY: dev-build dev-db-up dev-db-down dev-db-update dev-up dev-down dev-start dev-stop dev-status dev-logs dev-config dev-clean dev-clean-all
BASE_DIR := $(shell git rev-parse --show-toplevel)

dev-build: ## Build docker image
	docker-compose --env-file $(BASE_DIR)/.env.dev build --pull

dev-db-up: ## Start only db container in use with local frontend and backend dev servers
	docker-compose --env-file $(BASE_DIR)/.env.dev.local up --build -d db

dev-db-down: ## Stop db container
	docker-compose --env-file $(BASE_DIR)/.env.dev.local down

dev-db-update-status:
	docker run --rm --network studio-lite_backend-network -v $(BASE_DIR)/database/changelog:/liquibase/changelog liquibase/liquibase:4.15 --defaultsFile=changelog/liquibase.docker.properties --logLevel=info status

dev-db-update-history:
	docker run --rm --network studio-lite_backend-network -v $(BASE_DIR)/database/changelog:/liquibase/changelog liquibase/liquibase:4.15 --defaultsFile=changelog/liquibase.docker.properties --logLevel=info history

dev-db-update-sql:
	docker run --rm --network studio-lite_backend-network -v $(BASE_DIR)/database/changelog:/liquibase/changelog liquibase/liquibase:4.15 --defaultsFile=changelog/liquibase.docker.properties --logLevel=info updateSQL

dev-db-update: ## Update DB Schema
	#docker exec -it studio-lite-db bash -c ./db_update.sh
	#docker run --rm --network studio-lite_backend-network -v $(BASE_DIR)/database/changelog:/liquibase/changelog liquibase/liquibase:4.15 --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://studio-lite-db:5432/studio-lite --username=superdb --password=jfsdssfdfmsdp9fsumdpfu3094umt394u3 update --log-level debug
	docker run --rm --network studio-lite_backend-network -v $(BASE_DIR)/database/changelog:/liquibase/changelog liquibase/liquibase:4.15 --defaultsFile=changelog/liquibase.docker.properties --logLevel=info update

dev-db-update-rollbackLastChangeset:
	docker run --rm --network studio-lite_backend-network -v $(BASE_DIR)/database/changelog:/liquibase/changelog liquibase/liquibase:4.15 --defaultsFile=changelog/liquibase.docker.properties --logLevel=info rollbackCount 1

dev-up: ## Create and start all docker containers
	docker-compose --env-file $(BASE_DIR)/.env.dev up -d

dev-down: ## Stop and remove all docker containers, preserve data volumes
	docker-compose --env-file $(BASE_DIR)/.env.dev down

dev-start: ## Start all docker containers
	docker-compose start

dev-stop: ## Stop all docker containers
	docker-compose stop

dev-status: ## Get status of containers
	docker-compose ps -a

dev-logs: ## Get logs of containers
	docker-compose logs -f

dev-config: ## Show services configuration
	docker-compose --env-file $(BASE_DIR)/.env.dev config

dev-clean: ## Remove all stopped containers, all unused networks, all dangling images, and all dangling cache
	docker system prune

dev-clean-all: ## Removes all unused data volumes, images, containers, networks, and cache. Be careful it cleans all!!!
	docker system prune --all --volumes
