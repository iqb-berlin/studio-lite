.PHONY: scan-app scan-db scan-db-change-management scan-backend scan-frontend
BASE_DIR := $(shell git rev-parse --show-toplevel)
TRIVY_VERSION := aquasec/trivy:0.29.2

scan-app: scan-db scan-db-change-management scan-backend scan-frontend	## scans application images for security vulnerabilities

scan-db:	## scans db image for security vulnerabilities
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/database/Postgres.Dockerfile --no-cache --rm -t iqbberlin/studio-lite-db:scan .
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/Library/Caches:/root/.cache/ $(TRIVY_VERSION) image --security-checks vuln --ignore-unfixed --severity CRITICAL iqbberlin/studio-lite-db:scan

scan-db-change-management:	## scans db image for security vulnerabilities
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/database/Liquibase.Dockerfile --no-cache --rm -t iqbberlin/studio-lite-liquibase:scan .
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/Library/Caches:/root/.cache/ $(TRIVY_VERSION) image --security-checks vuln --ignore-unfixed --severity CRITICAL iqbberlin/studio-lite-liquibase:scan

scan-backend:	## scans backend image for security vulnerabilities
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/apps/api/Dockerfile --build-arg project=api --target=prod --no-cache --rm -t iqbberlin/studio-lite-backend:scan .
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/Library/Caches:/root/.cache/ $(TRIVY_VERSION) image --security-checks vuln --ignore-unfixed --severity CRITICAL iqbberlin/studio-lite-backend:scan

scan-frontend:	## scans frontend image for security vulnerabilities
	cd $(BASE_DIR) && docker build --pull -f $(BASE_DIR)/apps/frontend/Dockerfile --build-arg project=frontend --target=prod --no-cache --rm -t iqbberlin/studio-lite-frontend:scan .
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/Library/Caches:/root/.cache/ $(TRIVY_VERSION) image --security-checks vuln --ignore-unfixed --severity CRITICAL iqbberlin/studio-lite-frontend:scan
