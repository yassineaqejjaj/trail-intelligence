import uuid

from sqlalchemy.orm import Session

from app.models import AnalyticsEvent, AuditEvent

EVENTS = {
    "user_registered", "onboarding_completed", "baseline_started", "baseline_completed",
    "exercise_started", "exercise_submitted", "assessment_completed",
    "assessment_review_requested", "skill_validated", "learning_path_started",
    "learning_path_completed",
}


def audit(db: Session, actor_id: uuid.UUID | None, action: str, target: str | None = None,
          org_id: uuid.UUID | None = None, **meta):
    db.add(AuditEvent(actor_id=actor_id, action=action, target=target, org_id=org_id, meta=meta))


def track(db: Session, user_id: uuid.UUID | None, name: str, **props):
    assert name in EVENTS, name
    db.add(AnalyticsEvent(user_id=user_id, name=name, props=props))
