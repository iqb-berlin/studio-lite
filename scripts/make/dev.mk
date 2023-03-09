.PHONY: dev-up dev-down dev-start dev-stop dev-status dev-logs dev-config dev-build dev-clean-system dev-clean-volumes \
dev-clean-all
BASE_DIR := $(shell git rev-parse --show-toplevel)

## Create and start all docker containers
dev-up:
	docker compose --env-file $(BASE_DIR)/.env.dev up -d

## Stop and remove all docker containers, preserve data volumes
dev-down:
	docker compose --env-file $(BASE_DIR)/.env.dev down

## Start docker containers
# Param (optional): SERVICE - Start the specified service only, e.g. `SERVICE=db make dev-start`
dev-start:
	docker compose --env-file $(BASE_DIR)/.env.dev start $(SERVICE)

## Stop docker containers
# Param (optional): SERVICE - Stop the specified service only, e.g. `SERVICE=db make dev-stop`
dev-stop:
	docker compose --env-file $(BASE_DIR)/.env.dev stop $(SERVICE)

## Show status of containers
# Param (optional): SERVICE - Show status of the specified service only, e.g. `SERVICE=db make dev-status`
dev-status:
	docker compose --env-file $(BASE_DIR)/.env.dev ps -a $(SERVICE)

## Show service logs
# Param (optional): SERVICE - Show log of the specified service only, e.g. `SERVICE=db make dev-logs`
dev-logs:
	docker compose --env-file $(BASE_DIR)/.env.dev logs -f $(SERVICE)

## Show services configuration
# Param (optional): SERVICE - Show config of the specified service only, e.g. `SERVICE=db make dev-config`
dev-config:
	docker compose --env-file $(BASE_DIR)/.env.dev config $(SERVICE)

## Build docker images
# Param (optional): SERVICE - Build the specified service only, e.g. `SERVICE=db make dev-build`
dev-build:
	docker compose --env-file $(BASE_DIR)/.env.dev build --pull --progress plain $(SERVICE)

## Remove all stopped containers, all unused networks, all dangling images, and all dangling cache
dev-clean-system:
	docker system prune

## Remove all unused data volumes
# Be careful, all data could be lost!!!
dev-clean-volumes:
	docker volume prune

## Remove all unused data volumes, images, containers, networks, and cache.
# Be careful, it cleans all!!!
dev-clean-all:
	docker system prune --all --volumes
