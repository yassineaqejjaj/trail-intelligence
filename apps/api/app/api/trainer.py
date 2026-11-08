import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.learning import exercise_out, user_org_ids
from app.core.db import get_db, utcnow
from app.models import Assessment, Exercise, ExerciseSkill, Rubric, Skill, SkillEvidence, Submission, User
from app.schemas import AssessmentOut, ExerciseIn, ExerciseOut, ReviewIn
from app.security.auth import require_roles
from app.services.audit import audit, track

router = APIRouter(prefix="/trainer", tags=["trainer"])
trainer = require_roles("trainer", "platform_admin")


def _validate_rubric(r: list[dict]):
    keys = set()
    for d in r:
        if not {"key", "name", "description", "max_score"} <= d.keys() or d["max_score"] <= 0:
            raise HTTPException(422, "Rubric dimensions need key, name, description, max_score>0")
        if d["key"] in keys:
            raise HTTPException(422, "Duplicate rubric key")
        keys.add(d["key"]); d.setdefault("weight", 1)


def _scoped(db: Session, t: User, ex: Exercise) -> bool:
    return t.role == "platform_admin" or ex.org_id is None or ex.org_id in user_org_ids(db, t)


def _apply(db: Session, ex: Exercise, body: ExerciseIn):
    _validate_rubric(body.rubric)
    ex.title, ex.scenario, ex.objectives, ex.resources = body.title, body.scenario, body.objectives, body.resources
    ex.checklist, ex.professional_role, ex.expected_level, ex.status = body.checklist, body.professional_role, body.expected_level, body.status
    db.flush()
    last = db.query(Rubric).filter_by(exercise_id=ex.id).order_by(Rubric.version.desc()).first()
    if not last or last.dimensions != body.rubric:
        db.add(Rubric(exercise_id=ex.id, version=(last.version + 1) if last else 1, dimensions=body.rubric))
    db.query(ExerciseSkill).filter_by(exercise_id=ex.id).delete()
    for slug in body.skill_slugs:
        s = db.query(Skill).filter_by(slug=slug).first()
        if not s:
            raise HTTPException(422, f"Unknown skill {slug}")
        db.add(ExerciseSkill(exercise_id=ex.id, skill_id=s.id))


@router.get("/exercises", response_model=list[ExerciseOut])
def list_ex(t: User = Depends(trainer), db: Session = Depends(get_db)):
    return [exercise_out(db, e) for e in db.query(Exercise).order_by(Exercise.created_at.desc())
            if _scoped(db, t, e) and (e.author_id == t.id or e.status == "published" or t.role == "platform_admin")]


@router.post("/exercises", response_model=ExerciseOut, status_code=201)
def create_ex(body: ExerciseIn, t: User = Depends(trainer), db: Session = Depends(get_db)):
    orgs = user_org_ids(db, t)
    ex = Exercise(slug=f"custom-{uuid.uuid4().hex[:10]}", title=body.title, scenario=body.scenario,
                  professional_role=body.professional_role, author_id=t.id, org_id=orgs[0] if orgs else None)
    db.add(ex); _apply(db, ex, body); audit(db, t.id, "exercise.created", str(ex.id)); db.commit()
    return exercise_out(db, ex)


@router.put("/exercises/{ex_id}", response_model=ExerciseOut)
def update_ex(ex_id: uuid.UUID, body: ExerciseIn, t: User = Depends(trainer), db: Session = Depends(get_db)):
    ex = db.get(Exercise, ex_id)
    if not ex or not (ex.author_id == t.id or t.role == "platform_admin"):
        raise HTTPException(404, "Not found")
    _apply(db, ex, body); audit(db, t.id, "exercise.updated", str(ex.id)); db.commit()
    return exercise_out(db, ex)


@router.get("/reviews")
def reviews(t: User = Depends(trainer), db: Session = Depends(get_db)):
    out = []
    for a in db.query(Assessment).filter_by(status="pending_human_review").order_by(Assessment.created_at):
        sub = db.get(Submission, a.submission_id)
        ex = db.get(Exercise, sub.exercise_id)
        if _scoped(db, t, ex):
            out.append({"assessment": AssessmentOut.model_validate(a).model_dump(mode="json"),
                        "exercise_title": ex.title, "submission_content": sub.content})
    return out


@router.post("/reviews/{aid}", response_model=AssessmentOut)
def review(aid: uuid.UUID, body: ReviewIn, t: User = Depends(trainer), db: Session = Depends(get_db)):
    a = db.get(Assessment, aid)
    if not a:
        raise HTTPException(404, "Not found")
    sub = db.get(Submission, a.submission_id)
    ex = db.get(Exercise, sub.exercise_id)
    if not _scoped(db, t, ex) or a.user_id == t.id:
        raise HTTPException(404, "Not found")
    if a.status != "pending_human_review":
        raise HTTPException(409, "Not awaiting review")
    old = a.level
    a.level, a.status, a.provisional = body.level, "completed", False
    a.reviewer_id, a.review_note, a.reviewed_at = t.id, body.justification, utcnow()
    for e in db.query(SkillEvidence).filter_by(assessment_id=a.id):
        e.level, e.verified = body.level, True
        track(db, a.user_id, "skill_validated", skill_id=str(e.skill_id), level=body.level)
    audit(db, t.id, "assessment.reviewed", str(a.id), old_level=old, new_level=body.level, justification=body.justification)
    db.commit()
    return a
