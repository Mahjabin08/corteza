.PHONY: dev test lint fresh audit

dev:
	@echo "---Processing libs---"
	@(cd $(CURDIR)/lib-vue3 && make dev) || (echo "Failed to build libs"; exit 1)
	@echo "---Processing clients---"
	@(cd $(CURDIR)/client-vue3 && make dev) || (echo "Failed to yarn clients"; exit 1)

test:
	@echo "---Testing libs---"
	@(cd $(CURDIR)/lib-vue3 && make test) || (echo "Failed to test libs"; exit 1)
	@echo "---Testing clients---"
	@(cd $(CURDIR)/client-vue3 && make test) || (echo "Failed to test clients"; exit 1)
	@echo "---Testing server---"
	@(cd $(CURDIR)/server && make test) || (echo "Failed to test server"; exit 1)

lint:
	@echo "---Linting libs---"
	@(cd $(CURDIR)/lib-vue3 && make lint) || (echo "Failed to lint libs"; exit 1)
	@echo "---Linting clients---"
	@(cd $(CURDIR)/client-vue3 && make lint) || (echo "Failed to lint clients"; exit 1)

fresh:
	@echo "---Fresh---"
	@(cd $(CURDIR)/lib-vue3 && make fresh) || (echo "Failed to fresh libs"; exit 1)
	@echo "---Fresh clients---"
	@(cd $(CURDIR)/client-vue3 && make fresh) || (echo "Failed to fresh clients"; exit 1)


audit:
	@echo "---Audit---"
	@(cd $(CURDIR)/lib-vue3 && make audit) || true
	@echo "---Audit clients---"
	@(cd $(CURDIR)/client-vue3 && make audit) || true

.DEFAULT_GOAL := dev