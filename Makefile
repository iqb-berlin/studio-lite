BASE_DIR := $(shell git rev-parse --show-toplevel)

include $(BASE_DIR)/scripts/make/audit.mk
include $(BASE_DIR)/scripts/make/dev.mk
include $(BASE_DIR)/scripts/make/prod.mk
include $(BASE_DIR)/scripts/make/push.mk
include $(BASE_DIR)/scripts/make/test.mk
