STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)

## Docker Hub Proxy (Docker Hub: REGISTRY_PATH := )
REGISTRY_PATH := scm.cms.hu-berlin.de:443/iqb/dependency_proxy/containers/
#REGISTRY_PATH :=

TRIVY_VERSION := aquasec/trivy:latest

## prevents collisions of make target names with possible file names
.PHONY: scan-registry-login scan-registry-logout scan-app scan-db scan-liquibase scan-backend scan-frontend

## disables printing the recipe of a make target before executing it
.SILENT: scan-registry-login scan-registry-logout

## Log in to selected registry
scan-registry-login:
	if test $(REGISTRY_PATH); then printf "Login %s\n" $(REGISTRY_PATH); docker login $(REGISTRY_PATH); fi

## Log out of selected registry
scan-registry-logout:
	if test $(REGISTRY_PATH); then docker logout $(REGISTRY_PATH); fi

## scans application images for security vulnerabilities
scan-app: scan-db scan-liquibase scan-backend scan-frontend

## scans db image for security vulnerabilities
scan-db: scan-registry-login
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--file $(STUDIO_LITE_BASE_DIR)/database/Postgres.Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-db:scan\
			.
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION) --version
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION)\
				image --download-db-only --no-progress
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION)\
				image\
						--scanners vuln\
						--ignore-unfixed\
						--severity CRITICAL\
					$(REGISTRY_PATH)iqbberlin/studio-lite-db:scan

## scans liquibase image for security vulnerabilities
scan-liquibase: scan-registry-login
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--file $(STUDIO_LITE_BASE_DIR)/database/Liquibase.Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-liquibase:scan\
			.
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION) --version
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION)\
				image --download-db-only --no-progress
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION)\
				image\
						--scanners vuln\
						--ignore-unfixed\
						--severity CRITICAL\
					$(REGISTRY_PATH)iqbberlin/studio-lite-liquibase:scan

## scans backend image for security vulnerabilities
scan-backend: scan-registry-login
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--tag studio-lite-base:scan\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--target=prod\
				--build-arg PROJECT=api\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--build-arg BASE_IMAGE_NAME=studio-lite-base:scan\
				--file $(STUDIO_LITE_BASE_DIR)/apps/api/Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-backend:scan\
			.
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION) --version
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION)\
				image --download-db-only --no-progress
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION)\
				image\
						--scanners vuln\
						--ignore-unfixed\
						--severity CRITICAL\
					$(REGISTRY_PATH)iqbberlin/studio-lite-backend:scan

## scans frontend image for security vulnerabilities
scan-frontend: scan-registry-login
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--tag studio-lite-base:scan\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--target=prod\
				--build-arg PROJECT=frontend\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--build-arg BASE_IMAGE_NAME=studio-lite-base:scan\
				--file $(STUDIO_LITE_BASE_DIR)/apps/frontend/Dockerfile\
				--tag $(REGISTRY_PATH)iqbberlin/studio-lite-frontend:scan\
			.
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION) --version
		docker run\
				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
			$(TRIVY_VERSION)\
				image --download-db-only --no-progress
		docker run\
 				--rm\
				--volume /var/run/docker.sock:/var/run/docker.sock\
				--volume ${HOME}/Library/Caches:/root/.cache/\
 			$(TRIVY_VERSION)\
 				image\
 						--scanners vuln\
 						--ignore-unfixed\
 						--severity CRITICAL\
					$(REGISTRY_PATH)iqbberlin/studio-lite-frontend:scan
