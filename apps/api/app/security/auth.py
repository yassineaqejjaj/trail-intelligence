import hashlib
import secrets
import uuid
from datetime import timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db, utcnow
from app.models import Membership, User

COOKIE = "trail_session"
_ph = PasswordHasher()


def hash_password(p: str) -> str:
    return _ph.hash(p)


def verify_password(h: str, p: str) -> bool:
    try:
        return _ph.verify(h, p)
    except VerifyMismatchError:
        return False


def make_token(user_id: uuid.UUID) -> str:
    s = get_settings()
    now = utcnow()
    return jwt.encode(
        {"sub": str(user_id), "iat": now, "exp": now + timedelta(minutes=s.jwt_ttl_minutes)},
        s.jwt_secret_key,
        algorithm="HS256",
    )


def hash_reset_token(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()


def new_reset_token() -> str:
    return secrets.token_urlsafe(32)


def current_user(request: Request, db: Session = Depends(get_db)) -> User:
    tok = request.cookies.get(COOKIE)
    if not tok:
        raise HTTPException(401, "Not authenticated")
    try:
        data = jwt.decode(tok, get_settings().jwt_secret_key, algorithms=["HS256"])
        uid = uuid.UUID(data["sub"])
    except Exception:
        raise HTTPException(401, "Invalid session")
    user = db.get(User, uid)
    if not user or user.deleted_at is not None:
        raise HTTPException(401, "Invalid session")
    return user


def require_roles(*roles: str):
    def dep(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, "Insufficient role")
        return user

    return dep


def org_admin_membership(org_id: uuid.UUID, user: User, db: Session) -> Membership:
    m = (
        db.query(Membership)
        .filter(Membership.org_id == org_id, Membership.user_id == user.id)
        .first()
    )
    if not m or m.role not in ("org_admin",):
        # 404 rather than 403 to avoid leaking tenant existence
        raise HTTPException(404, "Not found")
    return m
