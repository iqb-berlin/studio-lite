.PHONY: test-app test-backend test-frontend

test-app: test-backend test-frontend ## Run all tests (only in combination with 'make dev-run')

test-backend: ## Run backend tests (only in combination with 'make dev-run')
	docker exec -it studio-lite-backend bash -c "nx test api"

test-frontend: ## Run frontend tests (only in combination with 'make dev-run')
	docker exec -it studio-lite-frontend bash -c "nx test frontend"
