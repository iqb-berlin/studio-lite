.PHONY: audit-app audit-backend audit-frontend

audit-app: audit-backend audit-frontend ## Run all audits (only in combination with 'make dev-run')

audit-backend: ## Run backend audit (only in combination with 'make dev-run')
	docker exec -it studio-lite-backend npm audit --audit-level critical

audit-frontend: ## Run frontend audit (only in combination with 'make dev-run')
	docker exec -it studio-lite-frontend npm audit --audit-level critical
