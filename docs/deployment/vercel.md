# Vercel (frontend)

Status: **configured in repo, NOT deployed.**

1. Import the GitHub repo as project `trail-intelligence`; Framework: Next.js; **Root Directory `apps/web`**; Production branch `main`.
2. Environment variables (Production and Preview separately):
   - `API_URL` = Railway API URL (**server-side, required at build time** — rewrites are baked into the build)
   - `NEXT_PUBLIC_APP_URL` = deployed URL (non-sensitive)
3. Add the resulting origin(s) to the API's `CORS_ALLOWED_ORIGINS` (each preview origin you want to allow must be listed; previews are otherwise rejected by the Origin check).
4. Deploy, then verify: sign up, complete a baseline, confirm `/api/v1/users/me` returns your user (cookie is first-party).
