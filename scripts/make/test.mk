.PHONY: test-app test-backend test-frontend test-e2e-build test-e2e test-e2e-prod

test-app: test-backend test-frontend ## Run all tests (only in combination with 'make dev-run')

test-backend: ## Run backend tests (only in combination with 'make dev-run')
	docker exec -it personaldb-backend bash -c "nx test api"

test-frontend: ## Run frontend tests (only in combination with 'make dev-run')
	docker exec -it personaldb-frontend bash -c "nx test frontend"

test-e2e-build: ## Build docker e2e test image (e.g. at nx workspace updates)
	docker build --pull -f apps/frontend-e2e/Dockerfile -t iqbberlin/personaldb-frontend-e2e:latest .

test-e2e: ## Run all e2e tests in dev environment (only in combination with 'make dev-run')
	#docker run --rm --name personaldb-frontend-e2e -v $(CURDIR)/apps/frontend-e2e:/personaldb/apps/frontend-e2e --network personaldb_backend-network iqbberlin/personaldb-frontend-e2e:latest e2e frontend-e2e --baseUrl=http://personaldb-frontend:4200 --browser=chrome
	docker-compose --env-file .env.dev -f docker-compose.e2e.yml up --exit-code-from frontend-e2e

test-e2e-prod: ## Run all e2e tests in production environment (only in combination with 'make production-ramp-up')
	#docker run --rm --name personaldb-frontend-e2e -v $(CURDIR)/apps/frontend-e2e:/personaldb/apps/frontend-e2e --network personaldb_backend-network iqbberlin/personaldb-frontend-e2e:latest e2e frontend-e2e --baseUrl=http://personaldb-frontend:4200 --browser=chrome
	docker-compose --env-file .env.prod -f docker-compose.e2e.yml up --exit-code-from frontend-e2e
