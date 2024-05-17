STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)

include $(STUDIO_LITE_BASE_DIR)/.env.studio-lite

## exports all variables (especially those of the included .env.studio-lite file!)
.EXPORT_ALL_VARIABLES:

## prevents collisions of make target names with possible file names
.PHONY: prod-test-build-e2e prod-test-e2e prod-test-e2e-api prod-test-e2e-ui-chrome prod-test-e2e-ui-chrome-mobile \
prod-test-e2e-ui-firefox prod-test-e2e-ui-firefox-mobile prod-test-e2e-ui-edge prod-test-e2e-ui-edge-mobile

## Build docker e2e test image (e.g. at nx workspace updates)
prod-test-build-e2e:
	@if test $(REGISTRY_PATH); then printf "Login %s\n" $(REGISTRY_PATH); docker login $(REGISTRY_PATH); fi
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--pull\
				--progress plain\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				-f $(STUDIO_LITE_BASE_DIR)/apps/frontend-e2e/Dockerfile\
				-t $(REGISTRY_PATH)iqbberlin/studio-lite-frontend-e2e:$(TAG)\
			.nake prod
	@if test $(REGISTRY_PATH); then docker logout $(REGISTRY_PATH); fi

## Run all e2e tests in production environment (only in combination with 'make studio-lite-up')
prod-test-e2e:
	docker compose\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
			-f $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
		up --no-build --pull never test-e2e
	docker rm studio-lite-test-e2e-1

## Run all e2e api tests in production environment (only in combination with 'make studio-lite-up')
prod-test-e2e-api:
	docker compose\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
			-f $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
		up --no-build --pull never test-e2e-api
	docker rm studio-lite-test-e2e-api-1

## Run all e2e ui tests with chrome browser in production environment (only in combination with 'make studio-lite-up')
prod-test-e2e-ui-chrome:
	docker compose\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
			-f $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
		up --no-build --pull never test-e2e-ui-chrome
	docker rm studio-lite-test-e2e-ui-chrome-1

## Run all e2e ui tests with chrome browser for mobiles in production environment (only in combination with 'make studio-lite-up')
prod-test-e2e-ui-chrome-mobile:
	docker compose\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
			-f $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
		up --no-build --pull never test-e2e-ui-chrome-mobile
	docker rm studio-lite-test-e2e-ui-chrome-mobile-1

## Run all e2e ui tests with firefox browser in production environment (only in combination with 'make studio-lite-up')
prod-test-e2e-ui-firefox:
	docker compose\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
			-f $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
		up --no-build --pull never test-e2e-ui-firefox
	docker rm studio-lite-test-e2e-ui-firefox-1

## Run all e2e ui tests with firefox browser for mobiles in production environment (only in combination with 'make studio-lite-up')
prod-test-e2e-ui-firefox-mobile:
	docker compose\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
			-f $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
		up --no-build --pull never test-e2e-ui-firefox-mobile
	docker rm studio-lite-test-e2e-ui-firefox-mobile-1

## Run all e2e ui tests with edge browser in production environment (only in combination with 'make studio-lite-up')
prod-test-e2e-ui-edge:
	docker compose\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
			-f $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
		up --no-build --pull never test-e2e-ui-edge
	docker rm studio-lite-test-e2e-ui-edge-1

## Run all e2e ui tests with edge browser for mobiles in production environment (only in combination with 'make studio-lite-up')
prod-test-e2e-ui-edge-mobile:
	docker compose\
			--env-file $(STUDIO_LITE_BASE_DIR)/.env.studio-lite\
			-f $(STUDIO_LITE_BASE_DIR)/docker-compose.e2e.yaml\
		up --no-build --pull never test-e2e-ui-edge-mobile
	docker rm studio-lite-test-e2e-ui-edge-mobile-1
