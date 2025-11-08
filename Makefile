.PHONY: all down stop terminal logs build dev lint format install

# Declare all targets as "PHONY", see https://www.gnu.org/software/make/manual/html_node/Phony-Targets.html.
MAKEFLAGS += --always-make

all: terminal
down:
	docker compose down --remove-orphans -v
stop:
	docker compose stop
terminal:
	docker compose run --rm codex
logs:
	docker compose logs --tail=200 -f
build:
	npm run build
	mv dist/index.html dist/wallpaper-generator.html
	@echo "bundle: dist/wallpaper-generator.html"

dev:
	npm run dev

lint:
	npm run lint

format:
	npm run format

install:
	npm install
