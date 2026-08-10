GO_SERVICES   := catalog inventory order checkout user notification ingestion payment
AI_API        := services/ai-assistant/api
EDITORIAL_API := services/editorial/api
GATEWAY       := gateway
SWAG          := $(HOME)/go/bin/swag

AWS_PROFILE   ?=

.PHONY: tidy build dev-go dev-ai dev-web health chroma-up help

## regenerate swagger docs for all services (run after changing annotations)
swag:
	@for svc in $(GO_SERVICES); do \
		echo "→ swag services/$$svc"; \
		(cd services/$$svc && $(SWAG) init -g cmd/server/main.go -o docs --quiet); \
	done
	@echo "→ swag $(AI_API)"
	@(cd $(AI_API) && $(SWAG) init -g cmd/server/main.go -o docs --quiet)
	@echo "→ swag $(EDITORIAL_API)"
	@(cd $(EDITORIAL_API) && $(SWAG) init -g cmd/server/main.go -o docs --quiet)
	@echo "Unified UI available at http://localhost:8080/swagger once gateway is running"

## go mod tidy for all Go modules
tidy:
	@for svc in $(GO_SERVICES); do \
		echo "→ tidy services/$$svc"; \
		(cd services/$$svc && go mod tidy); \
	done
	@echo "→ tidy $(AI_API)"
	@(cd $(AI_API) && go mod tidy)
	@echo "→ tidy $(EDITORIAL_API)"
	@(cd $(EDITORIAL_API) && go mod tidy)
	@echo "→ tidy gateway"
	@(cd $(GATEWAY) && go mod tidy)

## build all Go binaries
build:
	@for svc in $(GO_SERVICES); do \
		echo "→ build services/$$svc"; \
		(cd services/$$svc && go build ./cmd/server); \
	done
	@echo "→ build $(AI_API)"
	@(cd $(AI_API) && go build ./cmd/server)
	@echo "→ build $(EDITORIAL_API)"
	@(cd $(EDITORIAL_API) && go build ./cmd/server)
	@(cd $(GATEWAY) && go build ./cmd/server)

## start ChromaDB only (prerequisite for ai-assistant-core)
chroma-up:
	DOCKER_HOST=unix://$(HOME)/.colima/default/docker.sock docker compose up -d chromadb
	@echo "ChromaDB ready at http://localhost:8200"

## install Python deps for both cores using uv
ai-install:
	cd services/ai-assistant/core && uv venv --python 3.12 && uv pip install --no-config -r requirements.txt --index-url https://pypi.org/simple
	cd services/editorial/core && uv venv --python 3.12 && uv pip install --no-config -r requirements.txt --index-url https://pypi.org/simple

## start the Python AI core (run after chroma-up)
dev-ai-core:
	cd services/ai-assistant/core && \
	  $(if $(AWS_PROFILE),AWS_PROFILE=$(AWS_PROFILE)) CHROMA_HOST=localhost CHROMA_PORT=8200 CATALOG_URL=http://localhost:8081 \
	  uv run uvicorn app.main:app --host 0.0.0.0 --port 19010 --reload

## start the Go AI API proxy (run after dev-ai-core)
dev-ai-api:
	cd $(AI_API) && AI_CORE_URL=http://localhost:19010 PORT=8088 go run ./cmd/server

## start all Go backend services locally
dev-go:
	@echo "Starting Go services (Ctrl-C to stop all)..."
	@(cd services/catalog    && PORT=8081 go run ./cmd/server) & \
	 (cd services/inventory  && PORT=8082 go run ./cmd/server) & \
	 (cd services/order      && PORT=8083 go run ./cmd/server) & \
	 (cd services/checkout   && PORT=8084 go run ./cmd/server) & \
	 (cd services/user       && PORT=8085 go run ./cmd/server) & \
	 (cd services/notification && PORT=8086 go run ./cmd/server) & \
	 (cd services/ingestion  && PORT=8087 go run ./cmd/server) & \
	 (cd $(AI_API)           && AI_CORE_URL=http://localhost:19010 PORT=8088 go run ./cmd/server) & \
	 (cd $(EDITORIAL_API)   && EDITORIAL_CORE_URL=http://localhost:9100 CATALOG_URL=http://localhost:8081 PORT=8089 go run ./cmd/server) & \
	 (cd services/payment   && PORT=8090 go run ./cmd/server) & \
	 (cd $(GATEWAY)          && PORT=8080 go run ./cmd/server); \
	 wait

## start Python editorial core (port 9100)
dev-editorial-core:
	cd services/editorial/core && \
	  $(if $(AWS_PROFILE),AWS_PROFILE=$(AWS_PROFILE)) \
	  uv run uvicorn app.main:app --host 0.0.0.0 --port 9100 --reload

## start Go editorial API (port 8089)
dev-editorial-api:
	cd $(EDITORIAL_API) && \
	  EDITORIAL_CORE_URL=http://localhost:9100 CATALOG_URL=http://localhost:8081 PORT=8089 go run ./cmd/server

## start storefront Next.js frontend (port 3000)
dev-web:
	cd apps/web && NODE_EXTRA_CA_CERTS=$(HOME)/.corp-ca-certs.pem npm run dev

## start editorial internal UI (port 3001)
dev-editorial-ui:
	cd apps/editorial && NODE_EXTRA_CA_CERTS=$(HOME)/.corp-ca-certs.pem npm run dev

## check health of all running services
health:
	@echo "Checking service health..."
	@curl -sf http://localhost:8080/health       && echo " gateway OK"           || echo " gateway DOWN"
	@curl -sf http://localhost:8081/health       && echo " catalog OK"           || echo " catalog DOWN"
	@curl -sf http://localhost:8082/health       && echo " inventory OK"         || echo " inventory DOWN"
	@curl -sf http://localhost:8083/health       && echo " order OK"             || echo " order DOWN"
	@curl -sf http://localhost:8084/health       && echo " checkout OK"          || echo " checkout DOWN"
	@curl -sf http://localhost:8085/health       && echo " user OK"              || echo " user DOWN"
	@curl -sf http://localhost:8086/health       && echo " notification OK"      || echo " notification DOWN"
	@curl -sf http://localhost:8087/health       && echo " ingestion OK"         || echo " ingestion DOWN"
	@curl -sf http://localhost:8088/health       && echo " ai-assistant API OK"  || echo " ai-assistant API DOWN"
	@curl -sf http://localhost:19010/health       && echo " ai-assistant core OK" || echo " ai-assistant core DOWN"
	@curl -sf http://localhost:8089/health       && echo " editorial API OK"    || echo " editorial API DOWN"
	@curl -sf http://localhost:8090/health       && echo " payment OK"          || echo " payment DOWN"
	@curl -sf http://localhost:9100/health       && echo " editorial core OK"   || echo " editorial core DOWN"
	@curl -sf http://localhost:8200/api/v1/heartbeat && echo " chromadb OK"      || echo " chromadb DOWN"

help:
	@echo "Targets:"
	@echo "  swag          — regenerate swagger docs for all services"
	@echo "  tidy          — go mod tidy all modules"
	@echo "  build         — build all Go binaries"
	@echo "  chroma-up     — start ChromaDB in Docker"
	@echo "  ai-install    — pip install Python AI core deps"
	@echo "  dev-ai-core   — run Python FastAPI core (port 19010)"
	@echo "  dev-ai-api    — run Go AI API proxy (port 8088)"
	@echo "  dev-go        — run all Go services locally"
	@echo "  dev-web       — run Next.js frontend"
	@echo "  health        — check all service health endpoints"
