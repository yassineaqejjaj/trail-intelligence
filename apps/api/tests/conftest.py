import os
import tempfile
import uuid

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["ENVIRONMENT"] = "test"
os.environ["LLM_PROVIDER"] = "mock"

import pytest
from alembic.config import Config
from fastapi.testclient import TestClient

from alembic import command
from app.core.db import session_factory
from app.main import app
from app.models import Membership, Organization, User
from app.security.auth import hash_password
from app.security.middleware import limiter
from app.seed import seed_catalog

PW = "correct-horse-battery"


@pytest.fixture(scope="session", autouse=True)
def _db():
    command.upgrade(Config("alembic.ini"), "head")
    with session_factory()() as db:
        seed_catalog(db)


@pytest.fixture(autouse=True)
def _reset():
    limiter.reset()


def make_client(role="learner", org_id=None, org_role="member", share=False) -> tuple[TestClient, uuid.UUID]:
    email = f"{uuid.uuid4().hex[:8]}@example.com"
    with session_factory()() as db:
        u = User(email=email, password_hash=hash_password(PW), role=role, onboarding_completed=True,
                 share_with_org=share, professional_role="Product Manager")
        db.add(u); db.flush()
        if org_id:
            db.add(Membership(org_id=org_id, user_id=u.id, role=org_role))
        db.commit()
        uid = u.id
    c = TestClient(app)
    assert c.post("/api/v1/auth/login", json={"email": email, "password": PW}).status_code == 200
    return c, uid


def make_org() -> uuid.UUID:
    with session_factory()() as db:
        o = Organization(name="Org " + uuid.uuid4().hex[:4]); db.add(o); db.commit()
        return o.id


@pytest.fixture
def learner():
    return make_client()[0]
