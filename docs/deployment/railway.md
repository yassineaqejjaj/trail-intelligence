# Railway (API + PostgreSQL)

Status: **configured in repo, NOT deployed** (see README for blockers).

1. Create project `trail-intelligence`; add a **PostgreSQL** service (do not enable public networking).
2. Add service `trail-api` from the GitHub repo, root directory `apps/api` (uses `Dockerfile` and `railway.json`).
3. Variables on `trail-api`:
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}` (private network)
   - `JWT_SECRET_KEY` (`openssl rand -hex 32`), `ENVIRONMENT=production`, `LOG_LEVEL=INFO`
   - `LLM_PROVIDER` (`mock` until a key is available, then `anthropic`), `LLM_API_KEY`
   - `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` = your Vercel production URL (exact origin, no trailing slash)
4. Deploy. The container start command runs `alembic upgrade head` then the idempotent catalog seed before serving. Health check: `/health` (returns 503 until DB + migrations are ready).
5. Verify: `curl https://<api-domain>/health` → `{"status":"ok","migration":"0001"}`.
6. Optional demo data: `railway run python -m app.seed --demo` (prints random passwords once). Do not run in a real customer environment.
