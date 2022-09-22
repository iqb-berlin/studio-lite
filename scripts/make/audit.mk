.PHONY: audit-app audit-backend audit-frontend
BASE_DIR := $(shell git rev-parse --show-toplevel)

audit-app: audit-backend audit-frontend ## Run all audits (only in combination with 'make dev-run')

audit-backend: ## Run backend audit (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it backend npm audit --audit-level critical

audit-frontend: ## Run frontend audit (only in combination with 'make dev-run')
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it frontend npm audit --audit-level critical
