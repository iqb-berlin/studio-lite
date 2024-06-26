STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)
TAG := dev

## prevents collisions of make target names with possible file names
.PHONY: push-dockerhub push-iqb-registry

## Build and tag all docker images
.build:
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--no-cache\
				--rm\
				--file $(STUDIO_LITE_BASE_DIR)/database/Postgres.Dockerfile\
				--tag iqbberlin/studio-lite-db:$(TAG)\
				--tag scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-db:$(TAG)\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--no-cache\
				--rm\
				--file $(STUDIO_LITE_BASE_DIR)/database/Liquibase.Dockerfile\
				--tag iqbberlin/studio-lite-liquibase:$(TAG)\
				--tag scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-liquibase:$(TAG)\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--pull\
				--no-cache\
				--rm\
				--tag studio-lite-base\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--target=prod\
				--no-cache\
				--rm\
				--build-arg PROJECT=api\
				--file $(STUDIO_LITE_BASE_DIR)/apps/api/Dockerfile\
				--tag iqbberlin/studio-lite-backend:$(TAG)\
				--tag scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-backend:$(TAG)\
			.
	cd $(STUDIO_LITE_BASE_DIR) &&\
		docker build\
				--progress plain\
				--target=prod\
				--no-cache\
				--rm\
				--build-arg PROJECT=frontend\
				--file $(STUDIO_LITE_BASE_DIR)/apps/frontend/Dockerfile\
				--tag iqbberlin/studio-lite-frontend:$(TAG)\
				--tag scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-frontend:$(TAG)\
			.

## Push all docker images to 'hub.docker.com'
push-dockerhub: .build
	docker login
	docker push iqbberlin/studio-lite-db:$(TAG)
	docker push iqbberlin/studio-lite-liquibase:$(TAG)
	docker push iqbberlin/studio-lite-backend:$(TAG)
	docker push iqbberlin/studio-lite-frontend:$(TAG)
	docker logout

## Push all docker images to 'scm.cms.hu-berlin.de:4567/iqb/studio-lite'
push-iqb-registry: .build
	docker login scm.cms.hu-berlin.de:4567
	docker push scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-db:$(TAG)
	docker push scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-liquibase:$(TAG)
	docker push scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-backend:$(TAG)
	docker push scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-frontend:$(TAG)
	docker logout
