"""Operator CLI (run via `railway run python -m app.admin ...`). Production bootstrap and maintenance."""
import argparse
import sys
from datetime import timedelta

from app.core.db import session_factory, utcnow
from app.models import AnalyticsEvent, Membership, Organization, PasswordResetToken, User
from app.services.audit import audit


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="app.admin")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("set-role"); r.add_argument("email"); r.add_argument("role", choices=["learner", "trainer", "org_admin", "platform_admin"])
    o = sub.add_parser("create-org"); o.add_argument("name")
    m = sub.add_parser("add-member"); m.add_argument("email"); m.add_argument("org"); m.add_argument("--org-admin", action="store_true"); m.add_argument("--team", default="General")
    sub.add_parser("maintenance")
    a = ap.parse_args(argv)
    with session_factory()() as db:
        if a.cmd == "set-role":
            u = db.query(User).filter_by(email=a.email.lower()).first()
            if not u:
                print("user not found"); return 1
            u.role = a.role; audit(db, None, "admin.set_role", str(u.id), role=a.role); db.commit(); print(f"{u.email} -> {a.role}")
        elif a.cmd == "create-org":
            org = Organization(name=a.name); db.add(org); db.commit(); print(f"created org {org.id}")
        elif a.cmd == "add-member":
            u = db.query(User).filter_by(email=a.email.lower()).first(); org = db.query(Organization).filter_by(name=a.org).first()
            if not u or not org:
                print("user or organization not found"); return 1
            db.add(Membership(org_id=org.id, user_id=u.id, role="org_admin" if a.org_admin else "member", team=a.team))
            if a.org_admin and u.role == "learner":
                u.role = "org_admin"
            db.commit(); print("ok")
        elif a.cmd == "maintenance":  # retention: expired reset tokens and analytics older than 24 months
            n1 = db.query(PasswordResetToken).filter(PasswordResetToken.expires_at < utcnow() - timedelta(days=1)).delete()
            n2 = db.query(AnalyticsEvent).filter(AnalyticsEvent.created_at < utcnow() - timedelta(days=730)).delete()
            db.commit(); print(f"purged {n1} reset tokens, {n2} analytics events")
    return 0


if __name__ == "__main__":
    sys.exit(main())
