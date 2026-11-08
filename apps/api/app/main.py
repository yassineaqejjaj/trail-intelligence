import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api import auth, enterprise, learning, trainer
from app.core.config import get_settings
from app.core.db import get_db
from app.core.logging import setup_logging
from app.security.middleware import SecurityMiddleware
from app.services.jobs import start_sweeper

s = get_settings()
setup_logging(s.log_level)
log = logging.getLogger("trail")

@asynccontextmanager
async def lifespan(_app: FastAPI):
    stop = start_sweeper() if s.environment != "test" else None
    yield
    if stop:
        stop.set()


app = FastAPI(title="TRAIL Intelligence API", version="0.1.0", lifespan=lifespan,
              docs_url=None if s.is_prod else "/docs", redoc_url=None)
app.add_middleware(SecurityMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=s.origins, allow_credentials=True,
                   allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"], allow_headers=["Content-Type"])

for r in (auth.router, learning.router, trainer.router, enterprise.router):
    app.include_router(r, prefix="/api/v1")


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    rid = uuid.uuid4().hex[:12]
    log.error("unhandled %s request_id=%s path=%s", type(exc).__name__, rid, request.url.path)
    return JSONResponse({"detail": "Internal error", "request_id": rid}, 500)


@app.get("/health", tags=["ops"])
def health(db: Session = Depends(get_db)):
    """Ready only when the DB answers AND migrations have been applied."""
    try:
        db.execute(text("select 1"))
        rev = db.execute(text("select version_num from alembic_version")).scalar()
    except Exception:
        return JSONResponse({"status": "unavailable"}, 503)
    return {"status": "ok", "migration": rev}
