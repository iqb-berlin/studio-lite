BASE_DIR := $(shell git rev-parse --show-toplevel)

## prevents collisions of make target names with possible file names
.PHONY: audit-app audit-backend audit-frontend

## Run all audits (only in combination with 'make dev-up')
audit-app: audit-backend audit-frontend

## Run backend audit (only in combination with 'make dev-up')
audit-backend:
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it backend npm audit --audit-level critical

## Run frontend audit (only in combination with 'make dev-up')
audit-frontend:
	docker compose --env-file $(BASE_DIR)/.env.dev exec -it frontend npm audit --audit-level critical
