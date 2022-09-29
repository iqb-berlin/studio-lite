BASE_DIR := $(shell git rev-parse --show-toplevel)
MK_FILE_DIR := $(BASE_DIR)/scripts/make

audit-app:
	$(MAKE) -f $(MK_FILE_DIR)/audit.mk -C $(MK_FILE_DIR) $@
audit-backend:
	$(MAKE) -f $(MK_FILE_DIR)/audit.mk -C $(MK_FILE_DIR) $@
audit-frontend:
	$(MAKE) -f $(MK_FILE_DIR)/audit.mk -C $(MK_FILE_DIR) $@

dev-status:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-logs:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-up:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-down:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-start:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-stop:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-build:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-config:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-clean:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-clean-all:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@

dev-db-up:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-down:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-update-status:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-update-history:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-validate-changelog:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-update-display-sql:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-update-testing-rollback:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-update:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-rollback-lastchangeset:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-generate-docs:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@

lint-app:
	$(MAKE) -f $(MK_FILE_DIR)/lint.mk -C $(MK_FILE_DIR) $@
lint-backend:
	$(MAKE) -f $(MK_FILE_DIR)/lint.mk -C $(MK_FILE_DIR) $@
lint-frontend:
	$(MAKE) -f $(MK_FILE_DIR)/lint.mk -C $(MK_FILE_DIR) $@
lint-frontend-e2e:
	$(MAKE) -f $(MK_FILE_DIR)/lint.mk -C $(MK_FILE_DIR) $@

production-status:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-logs:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-ramp-up:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-shut-down:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-start:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-stop:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-connect-db:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-dump-all:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-restore-all:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-dump-db:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-restore-db:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-dump-db-data-only:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-restore-db-data-only:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-config:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
production-clean:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@

push-dockerhub:
	$(MAKE) -f $(MK_FILE_DIR)/push.mk -C $(MK_FILE_DIR) $@
push-iqb-registry:
	$(MAKE) -f $(MK_FILE_DIR)/push.mk -C $(MK_FILE_DIR) $@

scan-app:
	$(MAKE) -f $(MK_FILE_DIR)/scan.mk -C $(MK_FILE_DIR) $@
scan-db:
	$(MAKE) -f $(MK_FILE_DIR)/scan.mk -C $(MK_FILE_DIR) $@
scan-liquibase:
	$(MAKE) -f $(MK_FILE_DIR)/scan.mk -C $(MK_FILE_DIR) $@
scan-backend:
	$(MAKE) -f $(MK_FILE_DIR)/scan.mk -C $(MK_FILE_DIR) $@
scan-frontend:
	$(MAKE) -f $(MK_FILE_DIR)/scan.mk -C $(MK_FILE_DIR) $@

test-app:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-backend:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-frontend:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-build:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-dev:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-api-dev:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-chrome-dev:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-chrome-mobile-dev:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-firefox-dev:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-firefox-mobile-dev:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-edge-dev:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-edge-mobile-dev:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-prod:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-api-prod:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-chrome-prod:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-chrome-mobile-prod:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-firefox-prod:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-firefox-mobile-prod:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-edge-prod:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
test-e2e-ui-edge-mobile-prod:
	$(MAKE) -f $(MK_FILE_DIR)/test.mk -C $(MK_FILE_DIR) $@
