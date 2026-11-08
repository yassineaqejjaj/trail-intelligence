# TRAIL Intelligence — working notes

Monorepo: `apps/api` (FastAPI, SQLAlchemy 2, Alembic) and `apps/web` (Next.js 16 App Router, Tailwind v4).
Note: Next 16 renames middleware → `proxy.ts`; route `params` are Promises. Read `apps/web/node_modules/next/dist/docs/` before changing framework-level code.

## Commands
- API: `cd apps/api && make test | lint | eval | dev` (uv; Python 3.12+). Migrations: `uv run alembic upgrade head`.
- Web: `cd apps/web && npm run lint | typecheck | test | build | e2e`. Build needs `API_URL` (rewrites are baked at build time).

## Architecture rules
- Modular monolith. Routers in `app/api`, ORM in `app/models.py`, AI in `app/ai`, deterministic logic in `app/services`.
- Browser talks to same-origin `/api/v1/*`; Next rewrites to the API so the session cookie is first-party.
- LLM access only through `app/ai/llm.py` (`LLMProvider`). Assessment output must pass Pydantic + rubric + evidence-substring validation; invalid output is retried (bounded) then `failed` — never converted to success.
- Automatic assessments are PROVISIONAL, capped at L3, and only a trainer review sets `verified`. Never label them "certified".

## Security constraints
- httpOnly cookie sessions; Origin check on unsafe methods; rate limits on auth and AI endpoints; Argon2 hashing.
- Authorize at resource level (owner / org membership); return 404 for foreign tenants.
- Treat submissions as untrusted: payload in JSON data field, system prompt separate, injection regex → human review.
- Enterprise aggregates: consent-only, k≥3. Never expose individual submissions to org admins.
- No secrets in git. Demo accounts use random passwords printed once by `python -m app.seed --demo`.

## Definition of Done
Migration + tests for the change; `make test lint eval` and web `lint typecheck test build` green; E2E updated if a journey changed; docs/product/mvp-scope.md updated.
