.PHONY: push-dockerhub push-iqb-registry
BASE_DIR := $(shell git rev-parse --show-toplevel)
TAG := "dev"

.build:
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/database/Postgres.Dockerfile --no-cache --rm -t iqbberlin/studio-lite-db:$(TAG) -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-db:$(TAG) .
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/database/Liquibase.Dockerfile --no-cache --rm -t iqbberlin/studio-lite-liquibase:$(TAG) -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-liquibase:$(TAG) .
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/apps/api/Dockerfile --build-arg project=api --target=prod --no-cache --rm -t iqbberlin/studio-lite-backend:$(TAG) -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-backend:$(TAG) .
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/apps/frontend/Dockerfile --build-arg project=frontend --target=prod --no-cache --rm -t iqbberlin/studio-lite-frontend:$(TAG) -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-frontend:$(TAG) .

push-dockerhub: .build
	docker login
	docker push iqbberlin/studio-lite-db:$(TAG)
	docker push iqbberlin/studio-lite-liquibase:$(TAG)
	docker push iqbberlin/studio-lite-backend:$(TAG)
	docker push iqbberlin/studio-lite-frontend:$(TAG)
	docker logout

push-iqb-registry: .build
	docker login scm.cms.hu-berlin.de:4567
	docker push scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-db:$(TAG)
	docker push scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-liquibase:$(TAG)
	docker push scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-backend:$(TAG)
	docker push scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-frontend:$(TAG)
	docker logout
