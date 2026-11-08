import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.core.config import get_settings


def utcnow() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )


_engine = None
_Session = None


def get_engine():
    global _engine, _Session
    if _engine is None:
        url = get_settings().sqlalchemy_url
        kw = {"connect_args": {"check_same_thread": False}} if url.startswith("sqlite") else {"pool_pre_ping": True}
        _engine = create_engine(url, **kw)
        _Session = sessionmaker(bind=_engine, expire_on_commit=False)
    return _engine


def session_factory():
    get_engine()
    return _Session


def get_db():
    db = session_factory()()
    try:
        yield db
    finally:
        db.close()
