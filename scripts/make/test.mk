.PHONY: test-app test-backend test-frontend \
test-e2e-build test-e2e-dev test-e2e-prod test-e2e-api-dev test-e2e-api-prod \
test-e2e-ui-chrome-dev test-e2e-ui-chrome-prod test-e2e-ui-chrome-mobile-dev test-e2e-ui-chrome-mobile-prod \
test-e2e-ui-firefox-dev test-e2e-ui-firefox-prod test-e2e-ui-firefox-mobile-dev test-e2e-ui-firefox-mobile-prod \
test-e2e-ui-edge-dev test-e2e-ui-edge-prod test-e2e-ui-edge-mobile-dev test-e2e-ui-edge-mobile-prod
BASE_DIR := $(shell git rev-parse --show-toplevel)

test-app: test-backend test-frontend ## Run all tests (only in combination with 'make dev-run')

test-backend: ## Run backend tests (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it backend bash -c "nx test api"

test-frontend: ## Run frontend tests (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it frontend bash -c "nx test frontend"

test-e2e-build: ## Build docker e2e test image (e.g. at nx workspace updates)
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/apps/frontend-e2e/Dockerfile -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-frontend-e2e:latest -t iqbberlin/studio-lite-frontend-e2e:latest .

test-e2e-dev: ## Run all e2e tests in dev environment (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e

test-e2e-api-dev: ## Run all e2e api tests in dev environment (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-api

test-e2e-ui-chrome-dev: ## Run all e2e ui tests with chrome browser in dev environment (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-chrome

test-e2e-ui-chrome-mobile-dev: ## Run all e2e ui tests with chrome browser for mobiles in dev environment (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-chrome-mobile

test-e2e-ui-firefox-dev: ## Run all e2e ui tests with firefox browser in dev environment (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-firefox

test-e2e-ui-firefox-mobile-dev: ## Run all e2e ui tests with firefox browser for mobiles in dev environment (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-firefox-mobile

test-e2e-ui-edge-dev: ## Run all e2e ui tests with edge browser in dev environment (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-edge

test-e2e-ui-edge-mobile-dev: ## Run all e2e ui tests with edge browser for mobiles in dev environment (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-edge-mobile

test-e2e-prod: ## Run all e2e tests in production environment (only in combination with 'make production-ramp-up')
	cp $(BASE_DIR)/apps/frontend/default.conf.template $(BASE_DIR)/ssl/default.conf.template.ssl
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e

test-e2e-api-prod: ## Run all e2e api tests in production environment (only in combination with 'make production-ramp-up')
	cp $(BASE_DIR)/apps/frontend/default.conf.template $(BASE_DIR)/ssl/default.conf.template.ssl
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-api

test-e2e-ui-chrome-prod: ## Run all e2e ui tests with chrome browser in production environment (only in combination with 'make production-ramp-up')
	cp $(BASE_DIR)/apps/frontend/default.conf.template $(BASE_DIR)/ssl/default.conf.template.ssl
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-chrome

test-e2e-ui-chrome-mobile-prod: ## Run all e2e ui tests with chrome browser for mobiles in production environment (only in combination with 'make production-ramp-up')
	cp $(BASE_DIR)/apps/frontend/default.conf.template $(BASE_DIR)/ssl/default.conf.template.ssl
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-chrome-mobile

test-e2e-ui-firefox-prod: ## Run all e2e ui tests with firefox browser in production environment (only in combination with 'make production-ramp-up')
	cp $(BASE_DIR)/apps/frontend/default.conf.template $(BASE_DIR)/ssl/default.conf.template.ssl
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-firefox

test-e2e-ui-firefox-mobile-prod: ## Run all e2e ui tests with firefox browser for mobiles in production environment (only in combination with 'make production-ramp-up')
	cp $(BASE_DIR)/apps/frontend/default.conf.template $(BASE_DIR)/ssl/default.conf.template.ssl
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-firefox-mobile

test-e2e-ui-edge-prod: ## Run all e2e ui tests with edge browser in production environment (only in combination with 'make production-ramp-up')
	cp $(BASE_DIR)/apps/frontend/default.conf.template $(BASE_DIR)/ssl/default.conf.template.ssl
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-edge

test-e2e-ui-edge-mobile-prod: ## Run all e2e ui tests with edge browser for mobiles in production environment (only in combination with 'make production-ramp-up')
	cp $(BASE_DIR)/apps/frontend/default.conf.template $(BASE_DIR)/ssl/default.conf.template.ssl
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.e2e.yml run --rm test-e2e-ui-edge-mobile
