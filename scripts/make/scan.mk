.PHONY: scan-app scan-db scan-db-change-management scan-backend scan-frontend
BASE_DIR := $(shell git rev-parse --show-toplevel)

scan-app: scan-db scan-backend scan-frontend	## scans application images for security vulnerabilities

scan-db:	## scans db image for security vulnerabilities
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/database/Postgres.Dockerfile --no-cache --rm -t iqbberlin/studio-lite-db:latest -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-db:latest .
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/Library/Caches:/root/.cache/ aquasec/trivy:0.29.2 image --security-checks vuln --ignore-unfixed --severity CRITICAL iqbberlin/studio-lite-db:latest

scan-db-change-management:	## scans db image for security vulnerabilities
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/database/Liquibase.Dockerfile --no-cache --rm -t iqbberlin/studio-lite-liquibase:latest -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-liquibase:latest .
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/Library/Caches:/root/.cache/ aquasec/trivy:0.29.2 image --security-checks vuln --ignore-unfixed --severity CRITICAL iqbberlin/studio-lite-liquibase:latest

scan-backend:	## scans backend image for security vulnerabilities
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/apps/api/Dockerfile --build-arg project=api --target=prod --no-cache --rm -t iqbberlin/studio-lite-backend:latest -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-backend:latest .
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/Library/Caches:/root/.cache/ aquasec/trivy:0.29.2 image --security-checks vuln --ignore-unfixed --severity CRITICAL iqbberlin/studio-lite-backend:latest

scan-frontend:	## scans frontend image for security vulnerabilities
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/apps/frontend/Dockerfile --build-arg project=frontend --target=prod --no-cache --rm -t iqbberlin/studio-lite-frontend:latest -t scm.cms.hu-berlin.de:4567/iqb/studio-lite/iqbberlin/studio-lite-frontend:latest .
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/Library/Caches:/root/.cache/ aquasec/trivy:0.29.2 image --security-checks vuln --ignore-unfixed --severity CRITICAL iqbberlin/studio-lite-frontend:latest
