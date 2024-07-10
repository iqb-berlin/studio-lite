STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)

include $(STUDIO_LITE_BASE_DIR)/.env.studio-lite

## exports all variables (especially those of the included .env.studio-lite file!)
.EXPORT_ALL_VARIABLES:

## prevents collisions of make target names with possible file names
.PHONY: prod-registry-login prod-registry-logout prod-test-build prod-test-up prod-test-down prod-test-logs\
	prod-test-e2e prod-test-e2e-api prod-test-e2e-ui-chrome prod-test-e2e-ui-chrome-mobile prod-test-e2e-ui-firefox\
	prod-test-e2e-ui-firefox-mobile prod-test-e2e-ui-edge prod-test-e2e-ui-edge-mobile

## disables printing the recipe of a make target before executing it
.SILENT: prod-registry-login prod-registry-logout

## Log in to selected registry (see .env.studio-lite file)
prod-registry-login:
	if test $(REGISTRY_PATH); then printf "Login %s\n" $(REGISTRY_PATH); docker login $(REGISTRY_PATH); fi

## Log out of selected registry (see .env.studio-lite file)
prod-registry-logout:
	if test $(REGISTRY_PATH); then docker logout $(REGISTRY_PATH); fi

## Build production and e2e test images
prod-test-build: prod-registry-login
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--file $(STUDIO_LITE_BASE_DIR)/database/Postgres.Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-db:e2e\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--file $(STUDIO_LITE_BASE_DIR)/database/Liquibase.Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-liquibase:e2e\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--tag studio-lite-base\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--target=prod\
				--build-arg PROJECT=api\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--file $(STUDIO_LITE_BASE_DIR)/apps/api/Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-backend:e2e\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--target=prod\
				--build-arg PROJECT=frontend\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--file $(STUDIO_LITE_BASE_DIR)/apps/frontend/Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-frontend:e2e\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--file $(STUDIO_LITE_BASE_DIR)/apps/frontend-e2e/Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-frontend-e2e:e2e\
			.

## Start production containers
prod-test-up:
	sed -i.'' 's/TAG=.*$$/TAG=e2e/' $(STUDIO_LITE_BASE_DIR)/.env.studio-lite
	@if [ ! -f $(STUDIO_LITE_BASE_DIR)/config/frontend/default.conf.template ]; then\
		cp\
			$(STUDIO_LITE_BASE_DIR)/config/frontend/default.conf.http-template\
			$(STUDIO_LITE_BASE_DIR)/config/frontend/default.conf.template;\
	fi
	@if ! test $(shell docker network ls -q --filter name=app-net);\
		then docker network create app-net;\
	fi
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never -d

## Stop and remove production containers
prod-test-down:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		down

## Show service logs
# Param (optional): SERVICE - Show log of the specified service only, e.g. `make prod-test-logs SERVICE=db`
prod-test-logs:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.studio-lite.yaml\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.studio-lite.prod.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		logs -f $(SERVICE)

## Run all e2e tests in production environment (only in combination with 'make prod-test-up')
prod-test-e2e:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e
	docker rm studio-lite-test-e2e-1

## Run all e2e tests in production environment with electron (only in combination with 'make prod-test-up')
# Use this for arm64 platforms (cypress/browsers only supports 'electron' for arm54 at the moment) ! ! !
prod-test-e2e-electron:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e-electron
	docker rm studio-lite-test-e2e-electron-1

## Run all e2e api tests in production environment (only in combination with 'make prod-test-up')
prod-test-e2e-api:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e-api
	docker rm studio-lite-test-e2e-api-1

## Run all e2e ui tests with chrome browser in production environment (only in combination with 'make prod-test-up')
prod-test-e2e-ui-chrome:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e-ui-chrome
	docker rm studio-lite-test-e2e-ui-chrome-1

## Run all e2e ui tests with chrome browser for mobiles in production environment (only in combination with 'make prod-test-up')
prod-test-e2e-ui-chrome-mobile:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e-ui-chrome-mobile
	docker rm studio-lite-test-e2e-ui-chrome-mobile-1

## Run all e2e ui tests with firefox browser in production environment (only in combination with 'make prod-test-up')
prod-test-e2e-ui-firefox:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e-ui-firefox
	docker rm studio-lite-test-e2e-ui-firefox-1

## Run all e2e ui tests with firefox browser for mobiles in production environment (only in combination with 'make prod-test-up')
prod-test-e2e-ui-firefox-mobile:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e-ui-firefox-mobile
	docker rm studio-lite-test-e2e-ui-firefox-mobile-1

## Run all e2e ui tests with edge browser in production environment (only in combination with 'make prod-test-up')
prod-test-e2e-ui-edge:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e-ui-edge
	docker rm studio-lite-test-e2e-ui-edge-1

## Run all e2e ui tests with edge browser for mobiles in production environment (only in combination with 'make prod-test-up')
prod-test-e2e-ui-edge-mobile:
	docker compose\
			--file $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
		up --no-build --pull never test-e2e-ui-edge-mobile
	docker rm studio-lite-test-e2e-ui-edge-mobile-1
