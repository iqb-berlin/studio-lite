SHELL:=/bin/bash -O extglob
STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)

include $(STUDIO_LITE_BASE_DIR)/.env.dev

## exports all variables (especially those of the included .env.dev file!)
.EXPORT_ALL_VARIABLES:

## prevents collisions of make target names with possible file names
.PHONY: dev-db-build dev-db-up dev-db-down dev-db-volumes-clean dev-db-images-clean dev-db-update-status\
	dev-db-update-history dev-db-validate-changelog dev-db-update-display-sql dev-db-update-testing-rollback\
	dev-db-update dev-db-rollback-lastchangeset dev-db-generate-docs

## disables printing the recipe of a make target before executing it
.SILENT: dev-db-volumes-clean dev-db-images-clean


## Build docker images
dev-db-build:
	@if test $(REGISTRY_PATH); then printf "Login %s\n" $(REGISTRY_PATH); docker login $(REGISTRY_PATH); fi
	docker compose --progress plain --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev build --pull db liquibase
	@if test $(REGISTRY_PATH); then docker logout $(REGISTRY_PATH); fi

## Start db container (e.g. for a localhost dev environment with non containerized frontend and backend servers)
dev-db-up:
	@if ! test $(shell docker network ls -q --filter name=app-net);\
		then docker network create app-net;\
	fi
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev up --no-build --pull never -d db liquibase

## Stop db container
dev-db-down:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev down
	@if test $(shell docker network ls -q --filter name=app-net);\
		then docker network rm $(shell docker network ls -q -f name=app-net);\
	fi

## Remove all unused db volumes
# Be very careful, all data could be lost!!!
dev-db-volumes-clean:
	if test "$(shell docker volume ls -f name=db -q)";\
		then docker volume rm $(shell docker volume ls -f name=db -q);\
	fi

## Remove all unused (not just dangling) db and liquibase images!
dev-db-images-clean:
	if test "$(shell docker images -f reference=studio-lite-db -f reference=studio-lite-liquibase -q)";\
		then docker rmi $(shell docker images -f reference=studio-lite-db -f reference=studio-lite-liquibase -q);\
	fi

## Outputs the count of changesets that have not been deployed
# (https://docs.liquibase.com/commands/status/status.html)
dev-db-update-status:
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--headless=true\
				--show-banner=false\
				--classpath=changelog\
				--logLevel=info\
			status\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)

## Lists all deployed changesets and their deploymentIds
# (https://docs.liquibase.com/commands/status/history.html)
dev-db-update-history:
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--headless=true\
				--show-banner=false\
				--classpath=changelog\
				--logLevel=info\
			history\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)

## Checks and identifies any possible errors in a changelog that may cause the update command to fail
# (https://docs.liquibase.com/commands/maintenance/validate.html)
dev-db-validate-changelog:
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--headless=true\
				--show-banner=false\
				--classpath=changelog\
				--logLevel=info\
			validate\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)

## Displays the SQL Liquibase will run while using the update command
# (https://docs.liquibase.com/commands/update/update-sql.html)
dev-db-update-display-sql:
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--headless=true\
				--show-banner=false\
				--classpath=changelog\
				--logLevel=info\
			updateSQL\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)

## Updates the database, then rolls back changes before updating again
# (https://docs.liquibase.com/commands/update/update-testing-rollback.html)
dev-db-update-testing-rollback:
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--headless=true\
				--show-banner=false\
				--classpath=changelog\
				--logLevel=info\
			updateTestingRollback\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)

## Updates database to current version
# (https://docs.liquibase.com/commands/update/update.html)
dev-db-update:
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--headless=true\
				--show-banner=false\
				--classpath=changelog\
				--logLevel=info\
			update\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)

## Rolls back the last changeset
# (https://docs.liquibase.com/commands/rollback/rollback-count.html)
dev-db-rollback-lastchangeset:
	cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--headless=true\
				--show-banner=false\
				--classpath=changelog\
				--logLevel=info\
			rollbackCount 1\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)

## Generates Javadoc-like documentation based on current database and changelog
# (https://docs.liquibase.com/commands/docs/db-doc.html)
dev-db-generate-docs:
	cd $(STUDIO_LITE_BASE_DIR)/database/changelogDocs && rm -vrf !(".gitignore") && cd $(STUDIO_LITE_BASE_DIR) &&\
	docker compose run --rm liquibase\
		liquibase\
				--headless=true\
				--show-banner=false\
				--classpath=changelog\
				--logLevel=info\
			db-doc\
				--changelogFile=studio-lite.changelog-root.xml\
				--url=jdbc:postgresql://db:5432/$(POSTGRES_DB)\
				--username=$(POSTGRES_USER)\
				--password=$(POSTGRES_PASSWORD)\
				--output-directory=changelogDocs
