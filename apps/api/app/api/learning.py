import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.ai.assessment import assess
from app.ai.llm import get_provider
from app.core.config import get_settings
from app.core.db import get_db, session_factory, utcnow
from app.core.i18n import get_lang, pick
from app.models import (
    Assessment,
    Exercise,
    ExerciseSkill,
    Membership,
    Rubric,
    Skill,
    SkillEvidence,
    SkillPrerequisite,
    Submission,
    User,
)
from app.schemas import (
    AssessmentOut,
    ExerciseOut,
    OnboardingIn,
    SettingsIn,
    SkillOut,
    SubmissionIn,
    SubmissionOut,
    UserOut,
)
from app.security.auth import current_user
from app.security.middleware import limiter
from app.services.audit import audit, track
from app.services.recommend import recommend

router = APIRouter(tags=["learning"])

DISCLAIMER = {
    "en": "Automatic assessments are provisional and are not certified professional competency.",
    "fr": "Les évaluations automatiques sont provisoires et ne constituent pas une compétence professionnelle certifiée.",
    "ar": "التقييمات الآلية مؤقتة وليست شهادة كفاءة مهنية معتمدة.",
}


def user_org_ids(db: Session, user: User) -> list[uuid.UUID]:
    return [m.org_id for m in db.query(Membership).filter_by(user_id=user.id)]


def exercise_out(db: Session, ex: Exercise, lang: str = "en") -> ExerciseOut:
    sk = [s.slug for s in db.query(Skill).join(ExerciseSkill, ExerciseSkill.skill_id == Skill.id)
          .filter(ExerciseSkill.exercise_id == ex.id)]
    r = db.query(Rubric).filter_by(exercise_id=ex.id).order_by(Rubric.version.desc()).first()
    out = ExerciseOut.model_validate(ex)
    tr = ex.translations
    out.title, out.scenario = pick(tr, lang, "title", ex.title), pick(tr, lang, "scenario", ex.scenario)
    out.objectives = pick(tr, lang, "objectives", ex.objectives)
    out.resources = pick(tr, lang, "resources", ex.resources)
    out.checklist = out.objectives if lang != "en" and (tr or {}).get(lang) else ex.checklist
    rub = []
    rt = ((tr or {}).get(lang) or {}).get("rubric") or {}
    for d in (r.dimensions if r else []):
        x = rt.get(d["key"]) or {}
        rub.append({**d, "name": x.get("name", d["name"]), "description": x.get("description", d["description"])})
    out.skills, out.rubric, out.rubric_version = sk, rub, (r.version if r else 1)
    return out


def can_see_exercise(db: Session, user: User, ex: Exercise) -> bool:
    if ex.org_id and ex.org_id not in user_org_ids(db, user):
        return False
    if ex.status != "published":
        return user.role in ("trainer", "platform_admin") and (ex.author_id == user.id or user.role == "platform_admin")
    return True


@router.get("/catalog/roles")
def roles(lang: str = Depends(get_lang)):
    from app.catalog import ROLES
    from app.catalog_roles import ROLE_LABELS
    return [{"key": r, "label": (ROLE_LABELS.get(r) or {}).get(lang) or (ROLE_LABELS.get(r) or {}).get("en") or r} for r in ROLES]


@router.get("/users/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@router.post("/users/me/onboarding", response_model=UserOut)
def onboarding(body: OnboardingIn, request: Request, user: User = Depends(current_user), db: Session = Depends(get_db)):
    from app.catalog import ROLES
    if body.professional_role not in ROLES:
        raise HTTPException(422, f"professional_role must be one of {ROLES}")
    user.professional_role, user.objectives = body.professional_role, body.objectives
    user.locale = get_lang(request)
    user.share_with_org, user.onboarding_completed = body.share_with_org, True
    track(db, user.id, "onboarding_completed", role=body.professional_role)
    audit(db, user.id, "user.onboarding")
    db.commit()
    return user


@router.patch("/users/me", response_model=UserOut)
def update_me(body: SettingsIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.share_with_org is not None:
        user.share_with_org = body.share_with_org
    if body.locale in ("en", "fr", "ar"):
        user.locale = body.locale
    audit(db, user.id, "user.settings"); db.commit()
    return user


@router.get("/users/me/export")
def export_me(user: User = Depends(current_user), db: Session = Depends(get_db)):
    """GDPR data export (Art. 15/20)."""
    subs = db.query(Submission).filter_by(user_id=user.id).all()
    asm = db.query(Assessment).filter_by(user_id=user.id).all()
    audit(db, user.id, "user.export"); db.commit()
    return {"user": UserOut.model_validate(user).model_dump(mode="json"),
            "submissions": [SubmissionOut.model_validate(s).model_dump(mode="json") for s in subs],
            "assessments": [AssessmentOut.model_validate(a).model_dump(mode="json") for a in asm]}


@router.delete("/users/me", status_code=204)
def delete_me(user: User = Depends(current_user), db: Session = Depends(get_db)):
    """GDPR erasure: removes content and anonymises the account; audit trail keeps only the actor id."""
    uid = user.id
    for s in db.query(Submission).filter_by(user_id=uid).all():
        db.delete(s)
    db.query(SkillEvidence).filter_by(user_id=uid).delete()
    db.query(Assessment).filter_by(user_id=uid).delete()
    db.query(Membership).filter_by(user_id=uid).delete()
    user.email, user.full_name, user.password_hash = f"deleted+{uid}@invalid", "", "!"
    user.deleted_at, user.objectives = utcnow(), []
    audit(db, uid, "user.deleted"); db.commit()


# ---------- skills ----------
def user_levels(db: Session, user: User) -> dict[uuid.UUID, tuple[int, bool]]:
    out: dict[uuid.UUID, tuple[int, bool]] = {}
    for e in db.query(SkillEvidence).filter_by(user_id=user.id).order_by(SkillEvidence.created_at):
        out[e.skill_id] = (e.level, e.verified)  # latest evidence wins
    return out


def build_skills(db: Session, user: User | None, lang: str = "en"):
    lv = user_levels(db, user) if user else {}
    skills = db.query(Skill).order_by(Skill.slug).all()
    by_id = {s.id: s for s in skills}
    pre: dict[uuid.UUID, list[str]] = {}
    for p in db.query(SkillPrerequisite):
        pre.setdefault(p.skill_id, []).append(by_id[p.prerequisite_id].slug)
    res = []
    for s in skills:
        level, ver = lv.get(s.id, (0, False))
        res.append(SkillOut(id=s.id, slug=s.slug, name=pick(s.translations, lang, "name", s.name),
                            description=pick(s.translations, lang, "description", s.description),
                            domain=pick(s.domain.translations, lang, "name", s.domain.name),
                            domain_slug=s.domain.slug, levels=pick(s.translations, lang, "levels", s.levels),
                            criteria=pick(s.translations, lang, "criteria", s.criteria),
                            prerequisites=pre.get(s.id, []), level=level, framework_version=s.framework_version,
                            state="not_assessed" if s.id not in lv else "verified" if ver else "provisional"))
    return res


@router.get("/skills", response_model=list[SkillOut])
def skills(user: User = Depends(current_user), db: Session = Depends(get_db), lang: str = Depends(get_lang)):
    return build_skills(db, user, lang)


@router.get("/skills/{skill_id}", response_model=SkillOut)
def skill(skill_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db), lang: str = Depends(get_lang)):
    for s in build_skills(db, user, lang):
        if s.id == skill_id:
            return s
    raise HTTPException(404, "Not found")


# ---------- exercises ----------
@router.get("/exercises", response_model=list[ExerciseOut])
def exercises(role: str | None = None, user: User = Depends(current_user), db: Session = Depends(get_db),
              lang: str = Depends(get_lang)):
    q = db.query(Exercise)
    if role:
        q = q.filter(Exercise.professional_role == role)
    return [exercise_out(db, e, lang) for e in q.order_by(Exercise.slug) if can_see_exercise(db, user, e)]


@router.get("/exercises/{ex_id}", response_model=ExerciseOut)
def exercise(ex_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db),
             lang: str = Depends(get_lang)):
    ex = db.get(Exercise, ex_id)
    if not ex or not can_see_exercise(db, user, ex):
        raise HTTPException(404, "Not found")
    return exercise_out(db, ex, lang)


# ---------- submissions ----------
def own_submission(db: Session, user: User, sid: uuid.UUID) -> Submission:
    s = db.get(Submission, sid)
    if not s or s.user_id != user.id:
        raise HTTPException(404, "Not found")
    return s


@router.post("/submissions", response_model=SubmissionOut)
def save_submission(body: SubmissionIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Upsert the user's working submission for an exercise (draft autosave / edit)."""
    ex = db.get(Exercise, body.exercise_id)
    if not ex or not can_see_exercise(db, user, ex):
        raise HTTPException(404, "Not found")
    sub = (db.query(Submission).filter_by(user_id=user.id, exercise_id=ex.id)
           .filter(Submission.status.in_(["draft", "submitted"])).first())
    if sub is None:
        sub = Submission(user_id=user.id, exercise_id=ex.id)
        db.add(sub)
        track(db, user.id, "baseline_started" if ex.is_baseline else "exercise_started", exercise=ex.slug)
    elif sub.status == "evaluating":
        raise HTTPException(409, "Submission is being evaluated")
    sub.content, sub.checklist_state = body.content, body.checklist_state
    if body.submit:
        if len(body.content.strip()) < 1:
            raise HTTPException(422, "Empty submission")
        sub.status, sub.submitted_at = "submitted", utcnow()
        track(db, user.id, "exercise_submitted", exercise=ex.slug)
    db.commit()
    return sub


@router.get("/submissions/{sid}", response_model=SubmissionOut)
def get_submission(sid: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return own_submission(db, user, sid)


@router.get("/submissions", response_model=list[SubmissionOut])
def my_submissions(exercise_id: uuid.UUID | None = None, user: User = Depends(current_user), db: Session = Depends(get_db)):
    q = db.query(Submission).filter_by(user_id=user.id)
    if exercise_id:
        q = q.filter_by(exercise_id=exercise_id)
    return q.order_by(Submission.updated_at.desc()).all()


# ---------- assessments ----------
def run_assessment(assessment_id: uuid.UUID):
    """Background job. Persisted status transitions: queued -> running -> terminal."""
    s = get_settings()
    with session_factory()() as db:
        # Atomic claim: only one worker (request task or sweeper) may run a queued assessment.
        claimed = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.status == "queued").update(
            {"status": "running"}, synchronize_session=False)
        db.commit()
        if not claimed:
            return
        a = db.get(Assessment, assessment_id)
        sub = db.get(Submission, a.submission_id)
        ex = db.get(Exercise, sub.exercise_id)
        rub = db.query(Rubric).filter_by(exercise_id=ex.id).order_by(Rubric.version.desc()).first()
        a.rubric_version = rub.version
        db.commit()
        try:
            rt = ((ex.translations or {}).get(a.language) or {}).get("rubric") or {}
            rubric = [{**d, **{k: v for k, v in (rt.get(d["key"]) or {}).items() if k in ("name", "description", "keywords")}}
                      for d in rub.dimensions]
            res = assess(get_provider(), exercise={"title": ex.title, "scenario": ex.scenario},
                         rubric=rubric, language=a.language, submission=sub.content[: s.max_submission_chars],
                         expected_level=ex.expected_level, max_attempts=s.llm_max_attempts,
                         timeout_s=s.llm_timeout_s)
        except Exception as e:  # provider misconfiguration etc. -> explicit failure
            from app.ai.assessment import AssessmentResult
            res = AssessmentResult(status="failed", error=f"service_error:{type(e).__name__}")
        a.status, a.scores, a.overall_score, a.level = res.status, res.scores, res.overall_score, res.level
        a.evidence, a.strengths, a.improvements, a.next_actions = res.evidence, res.strengths, res.improvements, res.next_actions
        a.error = res.error if res.status != "completed" else None
        if res.flags:
            a.error = (a.error + "; " if a.error else "") + "flags=" + ",".join(res.flags)
        a.attempts, a.input_tokens, a.output_tokens = res.attempts, res.input_tokens, res.output_tokens
        a.cost_usd, a.latency_ms, a.model, a.prompt_version = res.cost_usd, res.latency_ms, res.model, res.prompt_version
        sub.status = "evaluated"
        if res.level and res.status in ("completed", "pending_human_review"):
            for link in db.query(ExerciseSkill).filter_by(exercise_id=ex.id):
                db.add(SkillEvidence(user_id=sub.user_id, skill_id=link.skill_id, assessment_id=a.id,
                                     level=res.level, verified=False))
        if res.status == "completed":
            track(db, sub.user_id, "baseline_completed" if ex.is_baseline else "assessment_completed", exercise=ex.slug,
                  cost_usd=res.cost_usd, latency_ms=res.latency_ms)
        elif res.status == "pending_human_review":
            track(db, sub.user_id, "assessment_review_requested", exercise=ex.slug)
        else:
            track(db, sub.user_id, "assessment_completed", exercise=ex.slug, status=res.status)
        db.commit()


@router.post("/assessments", response_model=AssessmentOut, status_code=202)
def create_assessment(body: dict, bg: BackgroundTasks, request: Request, user: User = Depends(current_user),
                      db: Session = Depends(get_db), lang: str = Depends(get_lang)):
    limiter.check(f"ai:{user.id}", 20, 3600)
    try:
        sid = uuid.UUID(str(body.get("submission_id")))
    except ValueError:
        raise HTTPException(422, "submission_id required")
    sub = own_submission(db, user, sid)
    if sub.status != "submitted":
        raise HTTPException(409, "Submission must be submitted first")
    a = Assessment(submission_id=sub.id, user_id=user.id, status="queued", language=lang)
    sub.status = "evaluating"
    db.add(a); audit(db, user.id, "assessment.created", str(sub.id)); db.commit()
    bg.add_task(run_assessment, a.id)
    return a


@router.get("/assessments", response_model=list[AssessmentOut])
def my_assessments(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Assessment).filter_by(user_id=user.id).order_by(Assessment.created_at.desc()).all()


@router.get("/assessments/{aid}", response_model=AssessmentOut)
def get_assessment(aid: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    a = db.get(Assessment, aid)
    if not a or a.user_id != user.id:
        raise HTTPException(404, "Not found")
    return a


# ---------- progress / recommendations / paths ----------
def compute_recommendation(db: Session, user: User, lang: str = "en"):
    sk = build_skills(db, user, lang)
    levels = {s.slug: s.level for s in sk}
    prereqs = {s.slug: s.prerequisites for s in sk}
    doms = {s.slug: s.domain_slug for s in sk}
    exs = [exercise_out(db, e, lang) for e in db.query(Exercise).filter_by(status="published")
           if can_see_exercise(db, user, e)]
    done = {db.get(Exercise, s.exercise_id).slug for s in db.query(Submission).filter_by(user_id=user.id, status="evaluated")}
    rec = recommend(role=user.professional_role, objectives=user.objectives or [], levels=levels, prereqs=prereqs,
                    skill_domains=doms, done_exercises=done, lang=lang, skill_names={x.slug: x.name for x in sk},
                    exercises=[{"slug": e.slug, "role": e.professional_role, "skills": e.skills, "is_baseline": e.is_baseline} for e in exs])
    return rec, exs


@router.get("/progress/me")
def progress(user: User = Depends(current_user), db: Session = Depends(get_db), lang: str = Depends(get_lang)):
    sk = build_skills(db, user, lang)
    assessed = [s for s in sk if s.state != "not_assessed"]
    rec, exs = compute_recommendation(db, user, lang)
    ex_id = next((e.id for e in exs if e.slug == rec.exercise_slug), None)
    return {"skills": [s.model_dump(mode="json") for s in sk],
            "summary": {"assessed": len(assessed), "total": len(sk),
                        "verified": sum(s.state == "verified" for s in sk),
                        "provisional": sum(s.state == "provisional" for s in sk)},
            "recommendation": {"skill_slug": rec.skill_slug, "exercise_slug": rec.exercise_slug,
                               "exercise_id": str(ex_id) if ex_id else None, "explanation": rec.explanation},
            "disclaimer": DISCLAIMER.get(lang, DISCLAIMER["en"])}


@router.get("/learning-paths/me")
def learning_path(user: User = Depends(current_user), db: Session = Depends(get_db), lang: str = Depends(get_lang)):
    """Ordered path: all skills below target (2) in prerequisite order, each with its exercises."""
    sk = {s.slug: s for s in build_skills(db, user, lang)}
    order, seen = [], set()

    def visit(slug):
        if slug in seen:
            return
        seen.add(slug)
        for p in sk[slug].prerequisites:
            visit(p)
        order.append(slug)

    for slug in sorted(sk):
        visit(slug)
    rec, exs = compute_recommendation(db, user, lang)
    steps = [{"skill": sk[s].model_dump(mode="json"),
              "exercises": [e.id.hex and str(e.id) for e in exs if s in e.skills],
              "complete": sk[s].level >= 2} for s in order]
    done = sum(x["complete"] for x in steps)
    return {"steps": steps, "completed": done, "total": len(steps), "next": rec.skill_slug}
