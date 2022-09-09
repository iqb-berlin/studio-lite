.PHONY: production-status production-logs production-ramp-up production-shut-down production-start production-stop production-config production-clean
BASE_DIR := $(shell git rev-parse --show-toplevel)

production-status: ## Get status list of all containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml ps -a

production-logs: ## Get logs of running containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml logs -f

production-ramp-up: ## Pull newest images, create and start docker containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml pull
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml up -d

production-shut-down: ## Stop and remove docker containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml down

production-start: ## Start docker containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml start

production-stop: ## Stop docker containers
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml stop

production-config: ## Show services configuration
	docker compose --env-file $(BASE_DIR)/.env.prod -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.prod.yml config

production-clean: ## Remove unused (dangling) images, containers, networks, etc. Data volumes will stay untouched!
	docker system prune
