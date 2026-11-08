# MVP scope

## Implemented and tested
Auth (register/login/logout/reset, Argon2, httpOnly cookie, rate limits) · onboarding · 11 domains / 15 skills / prerequisites / versioned framework · 10 exercises + rubrics (3 role baselines) · Practice Lab (autosave, revisions, unsaved-work guard) · assessment engine (structured validation, retries, statuses, cost/latency metadata, injection routing) · deterministic recommendations · learning paths · skills graph + list · trainer exercise CRUD with rubric versioning and review with justification (audit-logged) · enterprise members, consent-based k≥3 aggregates, programs · GDPR export/delete · analytics events table · audit log.

## Internationalisation and professions
12 professions with a baseline exercise each; UI, catalog, exercises, assessments feedback and emails in English, French and Arabic (RTL). Content translations are AI-drafted and not native-reviewed; the 9 added professions' exercises are not practitioner-validated; trainer-authored exercises are single-language.

## Deferred / limitations
- **Scoring is not validated.** The `mock` provider is a keyword heuristic. The 20-case reference set is synthetic and author-labelled (`validated: false`). No claim of human-level reliability.
- Assessment jobs are DB-backed with a sweeper (re-queues stale work); no dedicated worker yet. Password reset email requires `EMAIL_PROVIDER=resend` + key (implemented, not yet exercised against the live provider).
- Rate limiter is in-memory (single instance). Retention job and SSO not implemented. Learning Recommendation/Exercise Generation/Coach LLM services are not built (recommendations are deterministic; no generation/coach).
- Program assignment/completion tracking, analytics dashboards (events are stored only), OpenTelemetry exporters are not implemented. UI components are hand-written (no shadcn CLI). Accessibility: keyboard/labels done, no automated axe audit yet.
- Legal before public launch: DPA/privacy notice/terms text, lawful basis for AI processing, retention schedule, subprocessor list (LLM provider), DPIA.
