.PHONY: dev test lint eval migrate seed
dev: ; uv run alembic upgrade head && uv run python -m app.seed --demo && uv run uvicorn app.main:app --reload --port 8000
test: ; uv run pytest -q
lint: ; uv run ruff check app tests
eval: ; PYTHONPATH=. uv run python evals/run_eval.py
migrate: ; uv run alembic upgrade head
seed: ; uv run python -m app.seed
