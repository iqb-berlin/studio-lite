STUDIO_LITE_BASE_DIR := $(shell git rev-parse --show-toplevel)
MK_FILE_DIR := $(STUDIO_LITE_BASE_DIR)/scripts/make

audit-app:
	$(MAKE) -f $(MK_FILE_DIR)/audit.mk -C $(MK_FILE_DIR) $@
audit-backend:
	$(MAKE) -f $(MK_FILE_DIR)/audit.mk -C $(MK_FILE_DIR) $@
audit-frontend:
	$(MAKE) -f $(MK_FILE_DIR)/audit.mk -C $(MK_FILE_DIR) $@

dev-build:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-up:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-down:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-start:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-stop:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-status:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-logs:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-config:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-system-prune:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-volumes-prune:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-volumes-clean:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-images-clean:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@
dev-clean-all:
	$(MAKE) -f $(MK_FILE_DIR)/dev.mk -C $(MK_FILE_DIR) $@

dev-registry-login:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-registry-logout:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-build:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-up:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-down:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-volumes-clean:
	$(MAKE) -f $(MK_FILE_DIR)/dev-db.mk -C $(MK_FILE_DIR) $@
dev-db-images-clean:
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

dev-test-app:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-backend:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-frontend:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-build-e2e:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-e2e:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-e2e-api:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-e2e-ui-chrome:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-e2e-ui-chrome-mobile:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-e2e-ui-firefox:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-e2e-ui-firefox-mobile:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-e2e-ui-edge:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@
dev-test-e2e-ui-edge-mobile:
	$(MAKE) -f $(MK_FILE_DIR)/dev-test.mk -C $(MK_FILE_DIR) $@

lint-app:
	$(MAKE) -f $(MK_FILE_DIR)/lint.mk -C $(MK_FILE_DIR) $@
lint-backend:
	$(MAKE) -f $(MK_FILE_DIR)/lint.mk -C $(MK_FILE_DIR) $@
lint-frontend:
	$(MAKE) -f $(MK_FILE_DIR)/lint.mk -C $(MK_FILE_DIR) $@
lint-frontend-e2e:
	$(MAKE) -f $(MK_FILE_DIR)/lint.mk -C $(MK_FILE_DIR) $@

studio-lite-up:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-down:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-start:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-stop:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-status:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-logs:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-config:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-system-prune:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-volumes-prune:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-images-clean:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-liquibase-status:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-connect-db:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-dump-all:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-restore-all:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-dump-db:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-restore-db:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-dump-db-data-only:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-restore-db-data-only:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@
studio-lite-update:
	$(MAKE) -f $(MK_FILE_DIR)/prod.mk -C $(MK_FILE_DIR) $@

prod-test-build:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-up:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-down:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-e2e:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-e2e-api:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-e2e-ui-chrome:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-e2e-ui-chrome-mobile:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-e2e-ui-firefox:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-e2e-ui-firefox-mobile:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-e2e-ui-edge:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@
prod-test-e2e-ui-edge-mobile:
	$(MAKE) -f $(MK_FILE_DIR)/prod-test.mk -C $(MK_FILE_DIR) $@

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

