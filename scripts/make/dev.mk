.PHONY: dev-build dev-up dev-down dev-start dev-stop dev-status dev-logs dev-config dev-clean dev-clean-all
BASE_DIR := $(shell git rev-parse --show-toplevel)

dev-build: ## Build docker image
	docker-compose --env-file $(BASE_DIR)/.env.dev build --pull

dev-up: ## Create and start all docker containers
	docker-compose --env-file $(BASE_DIR)/.env.dev up -d

dev-down: ## Stop and remove all docker containers, preserve data volumes
	docker-compose --env-file $(BASE_DIR)/.env.dev down

dev-start: ## Start all docker containers
	docker-compose start

dev-stop: ## Stop all docker containers
	docker-compose stop

dev-status: ## Get status of containers
	docker-compose ps -a

dev-logs: ## Get logs of containers
	docker-compose logs -f

dev-config: ## Show services configuration
	docker-compose --env-file $(BASE_DIR)/.env.dev config

dev-clean: ## Remove all stopped containers, all unused networks, all dangling images, and all dangling cache
	docker system prune

dev-clean-all: ## Removes all unused data volumes, images, containers, networks, and cache. Be careful it cleans all!!!
	docker system prune --all --volumes
