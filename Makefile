COMPOSE = docker compose
EXEC = $(COMPOSE) exec app
COMPOSE_FILE = docker-compose.dev.yml

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

shell:
	$(EXEC) bash

add-backend:
	pnpm --filter backend add $(pkg)

add-frontend:
	pnpm --filter frontend add $(pkg)

install:
	$(EXEC) pnpm install

logs:
	$(COMPOSE) logs

.PHONY: up down shell add-backend add-frontend install logs