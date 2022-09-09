.PHONY: dev-db-up dev-db-down dev-db-update-status dev-db-update-history dev-db-validate-changelog dev-db-update-display-sql dev-db-update-testing-rollback dev-db-update dev-db-rollback-lastchangeset dev-db-generate-docs
SHELL:=/bin/bash -O extglob
BASE_DIR := $(shell git rev-parse --show-toplevel)
include $(BASE_DIR)/.env.dev

.EXPORT_ALL_VARIABLES: ## exports all variables (especially those of the included .env.dev file!)

dev-db-up: ## Start db container (e.g. for a localhost dev environment with non containerized frontend and backend servers)
	docker compose --env-file $(BASE_DIR)/.env.dev.local up --build -d db

dev-db-down: ## Stop db container
	docker compose --env-file $(BASE_DIR)/.env.dev.local down

dev-db-update-status: .EXPORT_ALL_VARIABLES ## Outputs the count of changesets that have not been deployed (https://docs.liquibase.com/commands/status/status.html)
	cd $(BASE_DIR) && docker compose run --rm db-change-management liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB) --username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info status -Ddb.user=${POSTGRES_DB_USER} -Ddb.password=${POSTGRES_DB_PASSWORD}

dev-db-update-history: .EXPORT_ALL_VARIABLES ## Lists all deployed changesets and their deploymentIds (https://docs.liquibase.com/commands/status/history.html)
	cd $(BASE_DIR) && docker compose run --rm db-change-management liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB) --username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info history

dev-db-validate-changelog: .EXPORT_ALL_VARIABLES ## Checks and identifies any possible errors in a changelog that may cause the update command to fail (https://docs.liquibase.com/commands/maintenance/validate.html)
	cd $(BASE_DIR) && docker compose run --rm db-change-management liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB) --username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info validate -Ddb.user=${POSTGRES_DB_USER} -Ddb.password=${POSTGRES_DB_PASSWORD}

dev-db-update-display-sql: .EXPORT_ALL_VARIABLES ## Displays the SQL Liquibase will run while using the update command (https://docs.liquibase.com/commands/update/update-sql.html)
	cd $(BASE_DIR) && docker compose run --rm db-change-management liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB) --username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info updateSQL -Ddb.user=${POSTGRES_DB_USER} -Ddb.password=${POSTGRES_DB_PASSWORD}

dev-db-update-testing-rollback: .EXPORT_ALL_VARIABLES ## Updates the database, then rolls back changes before updating again (https://docs.liquibase.com/commands/update/update-testing-rollback.html)
	cd $(BASE_DIR) && docker compose run --rm db-change-management liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB) --username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info updateTestingRollback -Ddb.user=${POSTGRES_DB_USER} -Ddb.password=${POSTGRES_DB_PASSWORD}

dev-db-update: .EXPORT_ALL_VARIABLES ## Updates database to current version (https://docs.liquibase.com/commands/update/update.html)
	cd $(BASE_DIR) && docker compose run --rm db-change-management liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB) --username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info update -Ddb.user=${POSTGRES_DB_USER} -Ddb.password=${POSTGRES_DB_PASSWORD}

dev-db-rollback-lastchangeset: .EXPORT_ALL_VARIABLES ## Rolls back the last changeset (https://docs.liquibase.com/commands/rollback/rollback-count.html)
	cd $(BASE_DIR) && docker compose run --rm db-change-management liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB) --username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info rollbackCount 1 -Ddb.user=${POSTGRES_DB_USER} -Ddb.password=${POSTGRES_DB_PASSWORD}

dev-db-generate-docs: .EXPORT_ALL_VARIABLES ## Generates Javadoc-like documentation based on current database and changelog (https://docs.liquibase.com/commands/docs/db-doc.html)
	cd $(BASE_DIR) && cd $(BASE_DIR)/database/changelogDocs && rm -vrf !(".gitignore")
	docker compose run --rm db-change-management liquibase --changelogFile=studio-lite.changelog-root.xml --url=jdbc:postgresql://$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB) --username=$(POSTGRES_USER) --password=$(POSTGRES_PASSWORD) --classpath=changelog --logLevel=info db-doc --output-directory=changelogDocs -Ddb.user=${POSTGRES_DB_USER} -Ddb.password=${POSTGRES_DB_PASSWORD}
