BASE_DIR := $(shell git rev-parse --show-toplevel)

## prevents collisions of make target names with possible file names
.PHONY: test-app test-backend test-frontend \
test-e2e-build test-e2e-dev test-e2e-api-dev  test-e2e-ui-chrome-dev test-e2e-ui-chrome-mobile-dev \
test-e2e-ui-firefox-dev test-e2e-ui-firefox-mobile-dev test-e2e-ui-edge-dev test-e2e-ui-edge-mobile-dev \
test-e2e-prod test-e2e-api-prod test-e2e-ui-chrome-prod test-e2e-ui-chrome-mobile-prod test-e2e-ui-firefox-prod \
test-e2e-ui-firefox-mobile-prod test-e2e-ui-edge-prod test-e2e-ui-edge-mobile-prod

## Run all tests (only in combination with 'make dev-up')
test-app: test-backend test-frontend

## Run backend tests (only in combination with 'make dev-up')
test-backend:
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it backend bash -c "nx test api"

## Run frontend tests (only in combination with 'make dev-up')
test-frontend:
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it frontend bash -c "nx test frontend"

## Build docker e2e test image (e.g. at nx workspace updates)
test-e2e-build:
	cd $(BASE_DIR) && \
		docker build --pull --progress plain -f $(BASE_DIR)/apps/frontend-e2e/Dockerfile \
			-t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-frontend-e2e:latest .

## Run all e2e tests in dev environment (only in combination with 'make dev-up')
test-e2e-dev:
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e

## Run all e2e api tests in dev environment (only in combination with 'make dev-up')
test-e2e-api-dev:
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-api

## Run all e2e ui tests with chrome browser in dev environment (only in combination with 'make dev-up')
test-e2e-ui-chrome-dev:
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-chrome

## Run all e2e ui tests with chrome browser for mobiles in dev environment (only in combination with 'make dev-up')
test-e2e-ui-chrome-mobile-dev:
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-chrome-mobile

## Run all e2e ui tests with firefox browser in dev environment (only in combination with 'make dev-up')
test-e2e-ui-firefox-dev:
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-firefox

## Run all e2e ui tests with firefox browser for mobiles in dev environment (only in combination with 'make dev-up')
test-e2e-ui-firefox-mobile-dev:
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-firefox-mobile

## Run all e2e ui tests with edge browser in dev environment (only in combination with 'make dev-up')
test-e2e-ui-edge-dev:
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-edge

## Run all e2e ui tests with edge browser for mobiles in dev environment (only in combination with 'make dev-up')
test-e2e-ui-edge-mobile-dev:
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-edge-mobile

## Run all e2e tests in production environment (only in combination with 'make studio-lite-up')
test-e2e-prod:
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e

## Run all e2e api tests in production environment (only in combination with 'make studio-lite-up')
test-e2e-api-prod:
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-api

## Run all e2e ui tests with chrome browser in production environment (only in combination with 'make studio-lite-up')
test-e2e-ui-chrome-prod:
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-chrome

## Run all e2e ui tests with chrome browser for mobiles in production environment (only in combination with 'make studio-lite-up')
test-e2e-ui-chrome-mobile-prod:
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-chrome-mobile

## Run all e2e ui tests with firefox browser in production environment (only in combination with 'make studio-lite-up')
test-e2e-ui-firefox-prod:
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-firefox

## Run all e2e ui tests with firefox browser for mobiles in production environment (only in combination with 'make studio-lite-up')
test-e2e-ui-firefox-mobile-prod:
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-firefox-mobile

## Run all e2e ui tests with edge browser in production environment (only in combination with 'make studio-lite-up')
test-e2e-ui-edge-prod:
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-edge

## Run all e2e ui tests with edge browser for mobiles in production environment (only in combination with 'make studio-lite-up')
test-e2e-ui-edge-mobile-prod:
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-edge-mobile
