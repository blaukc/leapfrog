# Helper make targets for docker compose

.PHONY: up-dev up-prod down logs

up-dev:
	@echo "Starting services using .env.development"
	docker compose --env-file .env.development up --build -d

up-prod:
	@echo "Starting services using .env.production"
	docker compose --env-file .env.production up --build -d

down:
	docker compose down

logs:
	docker compose logs -f
