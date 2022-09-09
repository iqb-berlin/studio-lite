.PHONY: lint-app lint-backend lint-frontend lint-frontend-e2e

lint-app: lint-backend lint-frontend lint-frontend-e2e ## Run all linters (only in combination with 'make dev-run')

lint-backend: ## Run backend linter (only in combination with 'make dev-run')
	docker exec -it studio-lite-backend bash -c "nx lint api"

lint-frontend: ## Run frontend linter (only in combination with 'make dev-run')
	docker exec -it studio-lite-frontend bash -c "nx lint frontend"

lint-frontend-e2e: ## Run frontend-e2e linter (only in combination with 'make dev-run')
	docker exec -it studio-lite-frontend bash -c "nx lint frontend-e2e"
