"""E2E-only: creates a trainer in a throwaway SQLite DB. Password comes from the environment, never committed."""
import os

from app.core.db import session_factory
from app.models import User
from app.security.auth import hash_password

with session_factory()() as db:
    db.add(User(email="e2e.trainer@example.com", password_hash=hash_password(os.environ["E2E_TRAINER_PASSWORD"]),
                full_name="E2E Trainer", role="trainer", onboarding_completed=True, professional_role="Product Manager"))
    db.commit()
