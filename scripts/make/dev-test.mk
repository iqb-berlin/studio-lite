STUDIO_BASE_DIR := $(shell git rev-parse --show-toplevel)

include $(STUDIO_BASE_DIR)/.env.dev

# exports all variables (especially those of the included .env.dev file!)
.EXPORT_ALL_VARIABLES:

# prevents collisions of make target names with possible file names
.PHONY: dev-test-app dev-test-backend dev-test-frontend dev-test-registry-login dev-test-registry-logout\
dev-test-build-e2e dev-test-e2e dev-test-e2e-api dev-test-e2e-ui-chrome dev-test-e2e-ui-workspace-chrome\
dev-test-e2e-ui-admin-chrome dev-test-e2e-ui-chrome-mobile dev-test-e2e-ui-firefox dev-test-e2e-ui-firefox-mobile\
dev-test-e2e-ui-edge dev-test-e2e-ui-edge-mobile dev-test-e2e-gate

# The e2e image works in /usr/src/studio-lite. Mounted there, the specs, the Cypress config and the
# translations of the working tree are what a run tests, not the copies made when the image was
# built (#1790); the translations because `make dev-up` serves the frontend from the working tree.
# Read-only, so that what Cypress writes as root stays in the container.
E2E_MOUNTS := -v $(STUDIO_BASE_DIR)/apps/frontend-e2e/src:/usr/src/studio-lite/apps/frontend-e2e/src:ro\
	-v $(STUDIO_BASE_DIR)/apps/frontend-e2e/cypress.config.ts:/usr/src/studio-lite/apps/frontend-e2e/cypress.config.ts:ro\
	-v $(STUDIO_BASE_DIR)/apps/frontend/src/assets/i18n:/usr/src/studio-lite/apps/frontend/src/assets/i18n:ro

# Run all tests (only in combination with 'make dev-up')
dev-test-app: dev-test-backend dev-test-frontend

# Run backend tests (only in combination with 'make dev-up')
dev-test-backend:
	docker compose --env-file $(STUDIO_BASE_DIR)/.env.dev exec -it backend bash -c "npx nx test api"

# Run frontend tests (only in combination with 'make dev-up')
dev-test-frontend:
	docker compose --env-file $(STUDIO_BASE_DIR)/.env.dev exec -it frontend bash -c "npx nx test frontend"

# disables printing the recipe of a make target before executing it
.SILENT: dev-test-registry-login dev-test-registry-logout

# Log in to selected registry (see .env.dev file)
dev-test-registry-login:
	if test $(REGISTRY_PATH); then printf "Login %s\n" $(REGISTRY_PATH); docker login $(REGISTRY_PATH); fi

# Log out of selected registry (see .env.dev file)
dev-test-registry-logout:
	if test $(REGISTRY_PATH); then docker logout $(REGISTRY_PATH); fi

# Build docker e2e test image (e.g. at nx workspace updates)
dev-test-build-e2e: dev-test-registry-login
	cd $(STUDIO_BASE_DIR) &&\
		docker build\
				--progress plain\
				--build-arg REGISTRY_PATH=$(REGISTRY_PATH)\
				--file $(STUDIO_BASE_DIR)/apps/frontend-e2e/Dockerfile\
				--tag studio-lite-frontend-e2e:$(TAG)\
			.

# Run all e2e tests in dev environment (only in combination with 'make dev-up')
dev-test-e2e:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=chrome

# Run all e2e api tests in dev environment (only in combination with 'make dev-up')
dev-test-e2e-api:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=chrome\
				--spec="./apps/frontend-e2e/src/e2e/api/**/*"

# Run all e2e ui tests with chrome browser in dev environment (only in combination with 'make dev-up')
dev-test-e2e-ui-chrome:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=chrome\
				--spec="./apps/frontend-e2e/src/e2e/ui/**/*"

# Run e2e ui workspace tests with chrome browser in dev environment (only in combination with 'make dev-up')
dev-test-e2e-ui-workspace-chrome:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=chrome\
				--spec="./apps/frontend-e2e/src/e2e/ui/workspace/**/*"

# Run all e2e ui tests except workspace with chrome in dev environment (only in combination with 'make dev-up')
dev-test-e2e-ui-admin-chrome:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=chrome\
				--spec="./apps/frontend-e2e/src/e2e/ui/**/*"\
				--excludeSpecPattern="**/ui/workspace/**"

# Run all e2e ui tests with chrome browser for mobiles in dev environment (only in combination with 'make dev-up')
dev-test-e2e-ui-chrome-mobile:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=chrome\
				--spec="./apps/frontend-e2e/src/e2e/ui/**/*"\
				--config="viewportWidth=375,viewportHeight=667"

# Run all e2e ui tests with firefox browser in dev environment (only in combination with 'make dev-up')
dev-test-e2e-ui-firefox:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=firefox\
				--spec="./apps/frontend-e2e/src/e2e/ui/**/*"\

# Run all e2e ui tests with firefox browser for mobiles in dev environment (only in combination with 'make dev-up')
dev-test-e2e-ui-firefox-mobile:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=firefox\
				--spec="./apps/frontend-e2e/src/e2e/ui/**/*"\
				--config="viewportWidth=375,viewportHeight=667"

# Run all e2e ui tests with edge browser in dev environment (only in combination with 'make dev-up')
dev-test-e2e-ui-edge:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=edge\
				--spec="./apps/frontend-e2e/src/e2e/ui/**/*"

# Run all e2e ui tests with edge browser for mobiles in dev environment (only in combination with 'make dev-up')
dev-test-e2e-ui-edge-mobile:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				$(E2E_MOUNTS)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://frontend:8080\
				--browser=edge\
				--spec="./apps/frontend-e2e/src/e2e/ui/**/*"\
				--config="viewportWidth=375,viewportHeight=667"

# Run the e2e test of the gateway (iqb-gate) through it, with its check on (only in combination with
# 'make dev-up' and the profile gate: COMPOSE_PROFILES=gate in .env.dev). The specs are mounted where
# the e2e image works, /usr/src/studio-lite (#1790).
dev-test-e2e-gate:
	cd $(STUDIO_BASE_DIR) &&\
		docker run\
				--rm\
				--pull never\
				-v ./apps/frontend-e2e:/usr/src/studio-lite/apps/frontend-e2e\
				-v ./apps/frontend/src/assets/i18n:/usr/src/studio-lite/apps/frontend/src/assets/i18n\
				-e IQB_GATE_E2E=on\
				-e IQB_GATE_AUDIT_KEY=$(IQB_GATE_AUDIT_KEY)\
				--network app-net\
			studio-lite-frontend-e2e:$(TAG) e2e frontend-e2e --baseUrl=http://iqb-gate:8080\
				--browser=chrome\
				--spec="./apps/frontend-e2e/src/e2e/iqb-gate/**/*"
