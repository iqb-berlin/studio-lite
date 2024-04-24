STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)

include $(STUDIO_LITE_BASE_DIR)/.env.dev

## exports all variables (especially those of the included .env.dev file!)
.EXPORT_ALL_VARIABLES:

## prevents collisions of make target names with possible file names
.PHONY: dev-build dev-up dev-down dev-start dev-stop dev-status dev-logs dev-config dev-system-prune dev-volumes-prune\
	dev-volumes-clean dev-images-clean dev-clean-all

## disables printing the recipe of a make target before executing it
.SILENT: dev-volumes-clean dev-images-clean

## Build docker images
# Param (optional): SERVICE - Build the specified service only, e.g. `SERVICE=db make dev-build`
dev-build:
	@if test $(REGISTRY_PATH); then printf "Login %s\n" $(REGISTRY_PATH); docker login $(REGISTRY_PATH); fi
	docker compose --progress plain --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev build --pull $(SERVICE)
	@if test $(REGISTRY_PATH); then docker logout $(REGISTRY_PATH); fi

## Create and start all docker containers
dev-up:
	@if ! test $(shell docker network ls -q --filter name=app-net);\
		then docker network create app-net;\
	fi
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev up --no-build --pull never -d

## Stop and remove all docker containers, preserve data volumes
dev-down:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev down
	@if test $(shell docker network ls -q --filter name=app-net);\
		then docker network rm $(shell docker network ls -q -f name=app-net);\
	fi

## Start docker containers
# Param (optional): SERVICE - Start the specified service only, e.g. `SERVICE=db make dev-start`
dev-start:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev start $(SERVICE)

## Stop docker containers
# Param (optional): SERVICE - Stop the specified service only, e.g. `SERVICE=db make dev-stop`
dev-stop:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev stop $(SERVICE)

## Show status of containers
# Param (optional): SERVICE - Show status of the specified service only, e.g. `SERVICE=db make dev-status`
dev-status:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev ps -a $(SERVICE)

## Show service logs
# Param (optional): SERVICE - Show log of the specified service only, e.g. `SERVICE=db make dev-logs`
dev-logs:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev logs -f $(SERVICE)

## Show services configuration
# Param (optional): SERVICE - Show config of the specified service only, e.g. `SERVICE=db make dev-config`
dev-config:
	docker compose --env-file $(STUDIO_LITE_BASE_DIR)/.env.dev config $(SERVICE)

## Remove all stopped containers, all unused networks, all dangling images, and all dangling cache
dev-system-prune:
	docker system prune

## Remove all anonymous local volumes not used by at least one container.
dev-volumes-prune:
	docker volume prune

## Remove all unused data volumes
# Be very careful, all data could be lost!!!
dev-volumes-clean:
	if test "$(shell docker volume ls -f name=db -f name=backend -q)";\
		then docker volume rm $(shell docker volume ls -f name=db -f name=backend -q);\
	fi

## Remove all unused (not just dangling) images!
dev-images-clean: .EXPORT_ALL_VARIABLES
	if test "$(shell docker images -f reference=studio-lite-* -q)";\
		then docker rmi $(shell docker images -f reference=studio-lite-* -q);\
	fi

## Remove all unused data volumes, images, containers, networks, and cache.
# Be careful, it cleans all!
dev-clean-all:
	docker system prune --all --volumes
