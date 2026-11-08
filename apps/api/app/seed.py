"""Idempotent seeding. `python -m app.seed` = reference catalog. `--demo` adds clearly-marked demo accounts
with random passwords printed once (never predictable)."""
import secrets
import sys

from sqlalchemy.orm import Session

from app import catalog as C
from app.core.db import session_factory
from app.models import Domain, Exercise, ExerciseSkill, Membership, Organization, Rubric, Skill, SkillPrerequisite, User
from app.security.auth import hash_password


def _merge_i18n(skills_by_slug, doms, exs_by_slug):
    from app.catalog_i18n import DOMAINS_I18N, EXERCISES_I18N, LEVELS_I18N, SKILLS_I18N
    for slug, d in doms.items():
        d.translations = {lg: {"name": n} for lg, n in DOMAINS_I18N.get(slug, {}).items()} or None
    for slug, sk in skills_by_slug.items():
        tr = {lg: dict(v) for lg, v in SKILLS_I18N.get(slug, {}).items()}
        for lg, lv in LEVELS_I18N.items():
            tr.setdefault(lg, {})["levels"] = lv
        sk.translations = tr or None
    for slug, ex in exs_by_slug.items():
        if slug in EXERCISES_I18N:
            ex.translations = EXERCISES_I18N[slug]


def seed_catalog(db: Session) -> None:
    from app.catalog_roles import NEW_EXERCISES
    doms = {}
    for i, (slug, name) in enumerate(C.DOMAINS):
        d = db.query(Domain).filter_by(slug=slug).first() or Domain(slug=slug, name=name, position=i)
        db.add(d)
        doms[slug] = d
    db.flush()
    skills = {}
    for slug, name, dom, desc, _ in C.SKILLS:
        s = db.query(Skill).filter_by(slug=slug).first()
        if not s:
            s = Skill(slug=slug, name=name, description=desc, domain_id=doms[dom].id,
                      framework_version=C.FRAMEWORK_VERSION, levels=C.SKILL_LEVELS,
                      criteria=[f"Demonstrates: {desc}"])
            db.add(s)
        skills[slug] = s
    db.flush()
    for slug, *_rest, prereqs in C.SKILLS:
        for p in prereqs:
            if not db.get(SkillPrerequisite, (skills[slug].id, skills[p].id)):
                db.add(SkillPrerequisite(skill_id=skills[slug].id, prerequisite_id=skills[p].id))
    specs = [{"slug": slug, "title": title, "role": role, "baseline": base, "expected_level": lvl, "skills": sk,
              "scenario": scen, "objectives": objs, "rubric": dims, "i18n": None}
             for slug, title, role, base, lvl, sk, scen, objs, dims in C.EXERCISES]
    specs += [{**e, "baseline": True} for e in NEW_EXERCISES]
    exs = {}
    for e in specs:
        ex = db.query(Exercise).filter_by(slug=e["slug"]).first()
        if not ex:
            ex = Exercise(slug=e["slug"], title=e["title"], scenario=e["scenario"], objectives=e["objectives"],
                          professional_role=e["role"], is_baseline=e["baseline"], expected_level=e["expected_level"],
                          status="published", checklist=[f"Addressed: {o}" for o in e["objectives"]],
                          resources=[{"title": "Evaluation rubric", "note": "See the rubric panel"}])
            db.add(ex)
            db.flush()
            db.add(Rubric(exercise_id=ex.id, version=1, dimensions=e["rubric"]))
            for s in e["skills"]:
                db.add(ExerciseSkill(exercise_id=ex.id, skill_id=skills[s].id))
        exs[e["slug"]] = ex
        if e.get("i18n"):
            ex.translations = e["i18n"]
    _merge_i18n(skills, doms, exs)
    db.commit()


def seed_demo(db: Session) -> dict:
    if db.query(Organization).filter_by(is_demo=True).first():
        print("Demo data already present"); return {}
    org = Organization(name="Acme (DEMO DATA)", is_demo=True)
    db.add(org); db.flush()
    creds = {}
    for email, role, mrole in [("demo.admin@example.com", "org_admin", "org_admin"),
                               ("demo.trainer@example.com", "trainer", "member"),
                               ("demo.learner@example.com", "learner", "member")]:
        pw = secrets.token_urlsafe(14)
        u = User(email=email, password_hash=hash_password(pw), full_name="Demo " + role, role=role,
                 is_demo=True, onboarding_completed=True)
        db.add(u); db.flush()
        db.add(Membership(org_id=org.id, user_id=u.id, role=mrole, team="Demo"))
        creds[email] = pw
    db.commit()
    return creds


if __name__ == "__main__":
    with session_factory()() as db:
        seed_catalog(db)
        print("Catalog seeded.")
        if "--demo" in sys.argv:
            for e, p in seed_demo(db).items():
                print(f"DEMO {e} password={p}")
