BASE_DIR := $(shell git rev-parse --show-toplevel)

include $(BASE_DIR)/scripts/make/dev.mk
