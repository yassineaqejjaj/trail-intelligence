import { defineConfig } from "@playwright/test";

const API = "http://127.0.0.1:8731", WEB = "http://127.0.0.1:3731";
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  workers: 1,
  use: { baseURL: WEB, trace: "retain-on-failure" },
  webServer: [
    { command: `cd ../api && rm -f e2e.db && DATABASE_URL=sqlite:///./e2e.db .venv/bin/alembic upgrade head && DATABASE_URL=sqlite:///./e2e.db .venv/bin/python -m app.seed && DATABASE_URL=sqlite:///./e2e.db E2E_TRAINER_PASSWORD=e2e-trainer-pass-123 .venv/bin/python e2e_seed.py && DATABASE_URL=sqlite:///./e2e.db CORS_ALLOWED_ORIGINS=${WEB} .venv/bin/uvicorn app.main:app --port 8731`, url: `${API}/health`, reuseExistingServer: false, timeout: 60_000 },
    { command: `API_URL=${API} npx next dev -p 3731 -H 127.0.0.1`, url: WEB, reuseExistingServer: false, timeout: 120_000 },
  ],
});
