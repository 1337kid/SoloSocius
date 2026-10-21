COMPOSE = docker compose
COMPOSE_FILE = docker-compose.dev.yml

up:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

add-backend:
	pnpm --filter backend add $(pkg)

add-frontend:
	pnpm --filter frontend add $(pkg)

logs:
	$(COMPOSE) logs

.PHONY: up down add-backend add-frontend logs