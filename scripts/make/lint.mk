.PHONY: lint-app lint-backend lint-frontend lint-frontend-e2e
BASE_DIR := $(shell git rev-parse --show-toplevel)

lint-app: lint-backend lint-frontend lint-frontend-e2e ## Run all linters (only in combination with 'make dev-run')

lint-backend: ## Run backend linter (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it backend bash -c "nx lint api"

lint-frontend: ## Run frontend linter (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it frontend bash -c "nx lint frontend"

lint-frontend-e2e: ## Run frontend-e2e linter (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it frontend bash -c "nx lint frontend-e2e"
