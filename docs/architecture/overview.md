# Architecture overview

```
Browser ──(same-origin /api/v1/*)──► Vercel (Next.js) ──rewrite──► Railway trail-api (FastAPI) ──► Railway PostgreSQL (private network)
                                                                         └─► LLM provider (via LLMProvider abstraction)
```

## Decisions
1. **Modular monolith** — one deployable API; boundaries are Python packages (`api`, `services`, `ai`, `security`).
2. **First-party cookies via rewrite** — avoids third-party cookie blocking between Vercel and Railway domains. Cookie is `httpOnly`, `Secure` in production, `SameSite=Lax`. CSRF defence: strict Origin allow-list on unsafe methods + SameSite.
3. **Provider-independent LLM layer** — `LLMProvider` protocol; `mock` (deterministic heuristic, for dev/CI) and `anthropic`. Add providers by implementing `complete()`.
4. **Assessment pipeline** — validate (JSON → Pydantic → rubric keys → score bounds → quotes must exist in submission) → bounded retries → status. Level is computed in code from weighted score, not taken from the model. Level capped at L3 automatically; ≥L4 or injection suspicion → `pending_human_review`.
5. **Async assessments** — `POST /assessments` returns 202 with persisted status (`queued→running→terminal`); executed via FastAPI background tasks. *Limitation:* not durable across process restarts; replace with a queue worker before scale.
6. **Evidence model** — `skill_evidence` rows per assessment; latest evidence defines level; `verified` only after human review.
7. **Tenancy** — exercises may be org-scoped; org analytics require `org_admin` membership; foreign orgs get 404.
8. **Migrations** — Alembic, run as Railway `preDeployCommand`; no automatic downgrades.

## Dependency boundaries
`api → services/ai/security → models/core`. `ai` never imports `api`. Frontend only knows the REST contract (`apps/web/src/lib/api.ts`).
