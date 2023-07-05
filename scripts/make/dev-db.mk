SHELL:=/bin/bash -O extglob
STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)

include $(STUDIO_LITE_BASE_DIR)/.env.dev

## prevents collisions of make target names with possible file names
.PHONY: dev-db-up dev-db-down dev-db-update-status dev-db-update-history dev-db-validate-changelog\
	dev-db-update-display-sql dev-db-update-testing-rollback dev-db-update dev-db-rollback-lastchangeset\
	dev-db-generate-docs

## exports all variables (especially those of the included .env.dev file!)
.EXPORT_ALL_VARIABLES:

## Start db container (e.g. for a localhost dev environment with non containerized frontend and backend servers)
dev-db-up:
	@if ! test $(shell docker network ls -q --filter name=app-net);\
		then docker network create app-net;\
	fi
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev up --build -d db liquibase

## Stop db container
dev-db-down:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev down
	@if test $(shell docker network ls -q --filter name=app-net);\
		then docker network rm $(shell docker network ls -q -f name=app-net);\
	fi

## Outputs the count of changesets that have not been deployed
# (https://docs.liquibase.com/commands/status/status.html)
dev-db-update-status: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--classpath=changelog\
				--logLevel=info\
			status

## Lists all deployed changesets and their deploymentIds
# (https://docs.liquibase.com/commands/status/history.html)
dev-db-update-history: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--classpath=changelog\
				--logLevel=info\
			history

## Checks and identifies any possible errors in a changelog that may cause the update command to fail
# (https://docs.liquibase.com/commands/maintenance/validate.html)
dev-db-validate-changelog: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--classpath=changelog\
				--logLevel=info\
			validate

## Displays the SQL Liquibase will run while using the update command
# (https://docs.liquibase.com/commands/update/update-sql.html)
dev-db-update-display-sql: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--classpath=changelog\
				--logLevel=info\
			updateSQL

## Updates the database, then rolls back changes before updating again
# (https://docs.liquibase.com/commands/update/update-testing-rollback.html)
dev-db-update-testing-rollback: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--classpath=changelog\
				--logLevel=info\
			updateTestingRollback

## Updates database to current version
# (https://docs.liquibase.com/commands/update/update.html)
dev-db-update: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--classpath=changelog\
				--logLevel=info\
			update

## Rolls back the last changeset
# (https://docs.liquibase.com/commands/rollback/rollback-count.html)
dev-db-rollback-lastchangeset: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--classpath=changelog\
				--logLevel=info\
			rollbackCount 1

## Generates Javadoc-like documentation based on current database and changelog
# (https://docs.liquibase.com/commands/docs/db-doc.html)
dev-db-generate-docs: .EXPORT_ALL_VARIABLES
	cd $(STUDIO_LITE_BASE_DIR)/database/changelogDocs && rm -vrf !(".gitignore") && cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--classpath=changelog\
				--logLevel=info\
			db-doc --output-directory=changelogDocs
