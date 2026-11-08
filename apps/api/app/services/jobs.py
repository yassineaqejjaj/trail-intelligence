"""Durable assessment execution: a sweeper re-queues stale work and runs anything left in `queued`
(e.g. after a restart or deploy), so no submission is silently lost."""
import logging
import threading
from datetime import timedelta

from app.core.db import session_factory, utcnow
from app.models import Assessment

log = logging.getLogger("trail.jobs")
STALE_RUNNING = timedelta(minutes=10)
QUEUED_GRACE = timedelta(seconds=20)


def sweep_once() -> int:
    from app.api.learning import run_assessment

    now = utcnow()
    with session_factory()() as db:
        stale = db.query(Assessment).filter(Assessment.status == "running", Assessment.updated_at < now - STALE_RUNNING).all()
        for a in stale:
            log.warning("re-queueing stale assessment %s", a.id)
            a.status = "queued"
        db.commit()
        ids = [a.id for a in db.query(Assessment).filter(Assessment.status == "queued", Assessment.updated_at < now - QUEUED_GRACE)]
    for i in ids:
        run_assessment(i)
    return len(ids)


def start_sweeper(interval_s: int = 15) -> threading.Event:
    stop = threading.Event()

    def loop():
        while not stop.wait(interval_s):
            try:
                sweep_once()
            except Exception:
                log.exception("sweeper failed")

    threading.Thread(target=loop, name="assessment-sweeper", daemon=True).start()
    return stop
