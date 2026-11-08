import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import Membership, Program, Skill, SkillEvidence, User
from app.security.auth import current_user, org_admin_membership
from app.services.audit import audit

router = APIRouter(prefix="/organizations", tags=["enterprise"])
MIN_GROUP = 3  # k-anonymity threshold for aggregates


class MemberIn(BaseModel):
    email: str = Field(max_length=320)
    team: str = Field(default="General", max_length=100)


class OrgIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)


@router.post("", status_code=201)
def create_org(body: OrgIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Platform admins create organizations; the creator becomes its first org admin."""
    if user.role != "platform_admin":
        raise HTTPException(403, "Insufficient role")
    from app.models import Organization
    org = Organization(name=body.name)
    db.add(org); db.flush()
    db.add(Membership(org_id=org.id, user_id=user.id, role="org_admin"))
    audit(db, user.id, "org.created", str(org.id), org_id=org.id); db.commit()
    return {"id": str(org.id), "name": org.name}


@router.post("/{org_id}/members", status_code=201)
def add_member(org_id: uuid.UUID, body: MemberIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Add an already-registered user. The person is told nothing about other orgs; unknown emails get 404."""
    org_admin_membership(org_id, user, db)
    target = db.query(User).filter_by(email=body.email.lower()).first()
    if not target or target.deleted_at:
        raise HTTPException(404, "No registered user with that email")
    if db.query(Membership).filter_by(org_id=org_id, user_id=target.id).first():
        raise HTTPException(409, "Already a member")
    db.add(Membership(org_id=org_id, user_id=target.id, role="member", team=body.team))
    audit(db, user.id, "org.member_added", str(target.id), org_id=org_id); db.commit()
    return {"user_id": str(target.id), "team": body.team}


@router.delete("/{org_id}/members/{user_id}", status_code=204)
def remove_member(org_id: uuid.UUID, user_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    org_admin_membership(org_id, user, db)
    m = db.query(Membership).filter_by(org_id=org_id, user_id=user_id).first()
    if not m or user_id == user.id:
        raise HTTPException(404, "Not found")
    db.delete(m); audit(db, user.id, "org.member_removed", str(user_id), org_id=org_id); db.commit()


class ProgramIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    target_skill_slugs: list[str] = []


@router.get("/mine")
def my_orgs(user: User = Depends(current_user), db: Session = Depends(get_db)):
    from app.models import Organization
    return [{"id": str(o.id), "name": o.name, "role": m.role}
            for m, o in db.query(Membership, Organization).join(Organization, Organization.id == Membership.org_id)
            .filter(Membership.user_id == user.id)]


@router.get("/{org_id}/members")
def members(org_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    org_admin_membership(org_id, user, db)
    rows = db.query(Membership, User).join(User, User.id == Membership.user_id).filter(Membership.org_id == org_id)
    # Directory data only — no submissions or assessment details.
    return [{"user_id": str(u.id), "name": u.full_name, "email": u.email, "team": m.team, "org_role": m.role,
             "onboarded": u.onboarding_completed} for m, u in rows]


@router.get("/{org_id}/analytics")
def analytics(org_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    org_admin_membership(org_id, user, db)
    members = db.query(Membership, User).join(User, User.id == Membership.user_id).filter(Membership.org_id == org_id).all()
    consenting = [u.id for _, u in members if u.share_with_org]
    base = {"members": len(members), "consenting_members": len(consenting)}
    if len(consenting) < MIN_GROUP:
        return {**base, "suppressed": True, "reason": f"Fewer than {MIN_GROUP} members share data; aggregates hidden to protect privacy.",
                "skills": []}
    levels: dict[uuid.UUID, dict[uuid.UUID, int]] = defaultdict(dict)
    for e in db.query(SkillEvidence).filter(SkillEvidence.user_id.in_(consenting)).order_by(SkillEvidence.created_at):
        levels[e.skill_id][e.user_id] = e.level
    out = []
    for s in db.query(Skill).order_by(Skill.slug):
        lv = levels.get(s.id, {})
        out.append({"slug": s.slug, "name": s.name, "domain": s.domain.name, "assessed": len(lv),
                    "avg_level": round(sum(lv.values()) / len(lv), 2) if len(lv) >= MIN_GROUP else None,
                    "gap": len(consenting) - sum(1 for v in lv.values() if v >= 2)})
    return {**base, "suppressed": False, "skills": out,
            "note": "Provisional automated assessments; individual results are not shown."}


@router.get("/{org_id}/programs")
def programs(org_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    org_admin_membership(org_id, user, db)
    return [{"id": str(p.id), "name": p.name, "target_skill_ids": p.target_skill_ids}
            for p in db.query(Program).filter_by(org_id=org_id)]


@router.post("/{org_id}/programs", status_code=201)
def create_program(org_id: uuid.UUID, body: ProgramIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    org_admin_membership(org_id, user, db)
    ids = []
    for slug in body.target_skill_slugs:
        s = db.query(Skill).filter_by(slug=slug).first()
        if not s:
            raise HTTPException(422, f"Unknown skill {slug}")
        ids.append(str(s.id))
    p = Program(org_id=org_id, name=body.name, target_skill_ids=ids)
    db.add(p); audit(db, user.id, "program.created", str(p.id), org_id=org_id); db.commit()
    return {"id": str(p.id), "name": p.name}
