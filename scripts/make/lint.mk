STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)

## prevents collisions of make target names with possible file names
.PHONY: lint-app lint-backend lint-frontend lint-frontend-e2e

## Run all linters (only in combination with 'make dev-up')
lint-app: lint-backend lint-frontend lint-frontend-e2e

## Run backend linter (only in combination with 'make dev-up')
lint-backend:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev exec -it backend bash -c "npx nx lint api"

## Run frontend linter (only in combination with 'make dev-up')
lint-frontend:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev exec -it frontend bash -c "npx nx lint frontend"

## Run frontend-e2e linter (only in combination with 'make dev-up')
lint-frontend-e2e:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev exec -it frontend bash -c "npx nx lint frontend-e2e"
