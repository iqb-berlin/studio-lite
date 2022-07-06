.PHONY: dev-db-up dev-db-down dev-db-update
BASE_DIR := $(shell git rev-parse --show-toplevel)

dev-db-up: ## Start only db container in use with local frontend and backend dev servers
	docker-compose --env-file $(BASE_DIR)/.env.dev.local up --build -d db

dev-db-down: ## Stop db container
	docker-compose --env-file $(BASE_DIR)/.env.dev.local down

dev-db-update: ## Update DB Schema
	docker exec -it studio-lite-db bash -c ./db_update.sh
