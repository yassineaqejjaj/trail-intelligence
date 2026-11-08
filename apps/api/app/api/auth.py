import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db, utcnow
from app.core.i18n import get_lang
from app.models import PasswordResetToken, User
from app.schemas import LoginIn, RegisterIn, ResetConfirmIn, ResetRequestIn, UserOut
from app.security import auth as A
from app.security.middleware import limiter
from app.services.audit import audit, track
from app.services.email import send_email

RESET_MAIL = {
    "en": ("Reset your TRAIL Intelligence password", "Use this link within 30 minutes to choose a new password:\n\n{link}\n\nIf you did not ask for this, ignore this email."),
    "fr": ("Réinitialisez votre mot de passe TRAIL Intelligence", "Utilisez ce lien dans les 30 minutes pour choisir un nouveau mot de passe :\n\n{link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail."),
    "ar": ("إعادة تعيين كلمة مرور TRAIL Intelligence", "استخدم هذا الرابط خلال 30 دقيقة لاختيار كلمة مرور جديدة:\n\n{link}\n\nإذا لم تطلب ذلك، تجاهل هذه الرسالة."),
}
router = APIRouter(prefix="/auth", tags=["auth"])


def client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    return xff.split(",")[0].strip() if xff else (request.client.host if request.client else "unknown")
log = logging.getLogger("trail.auth")


def _set_cookie(resp: Response, user: User):
    s = get_settings()
    resp.set_cookie(A.COOKIE, A.make_token(user.id), httponly=True, secure=s.is_prod,
                    samesite="lax", max_age=s.jwt_ttl_minutes * 60, path="/")


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: RegisterIn, request: Request, resp: Response, db: Session = Depends(get_db)):
    limiter.check(f"reg:{client_ip(request)}", 10, 3600)
    if not body.accept_terms:
        raise HTTPException(422, "Terms and privacy notice must be accepted")
    email = body.email.lower()
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(409, "Email already registered")
    u = User(email=email, password_hash=A.hash_password(body.password), full_name=body.full_name,
             consent_terms_at=utcnow(), locale=get_lang(request))
    db.add(u); db.flush()
    audit(db, u.id, "user.register", str(u.id))
    track(db, u.id, "user_registered")
    db.commit()
    _set_cookie(resp, u)
    return u


@router.post("/login", response_model=UserOut)
def login(body: LoginIn, request: Request, resp: Response, db: Session = Depends(get_db)):
    limiter.check(f"login:{client_ip(request)}:{body.email.lower()}", 8, 300)
    u = db.query(User).filter_by(email=body.email.lower()).first()
    if not u or u.deleted_at or not A.verify_password(u.password_hash, body.password):
        audit(db, None, "auth.login_failed"); db.commit()
        raise HTTPException(401, "Invalid credentials")
    audit(db, u.id, "auth.login"); db.commit()
    _set_cookie(resp, u)
    return u


@router.post("/logout", status_code=204)
def logout(resp: Response):
    resp.delete_cookie(A.COOKIE, path="/")


@router.post("/forgot-password", status_code=202)
def forgot(body: ResetRequestIn, request: Request, db: Session = Depends(get_db)):
    limiter.check(f"forgot:{client_ip(request)}", 5, 3600)
    u = db.query(User).filter_by(email=body.email.lower()).first()
    if u and not u.deleted_at:
        tok = A.new_reset_token()
        db.add(PasswordResetToken(user_id=u.id, token_hash=A.hash_reset_token(tok),
                                  expires_at=utcnow() + timedelta(minutes=30)))
        audit(db, u.id, "auth.reset_requested"); db.commit()
        link = f"{get_settings().frontend_url}/reset-password?token={tok}"
        subj, body = RESET_MAIL.get(u.locale, RESET_MAIL["en"])
        send_email(u.email, subj, body.format(link=link))
        if not get_settings().is_prod:
            log.info("dev password reset link: %s/reset-password?token=%s", get_settings().frontend_url, tok,
                     extra={"dev_only": True})
    return {"detail": "If the account exists, a reset link has been sent."}  # no enumeration


@router.post("/reset-password", status_code=204)
def reset(body: ResetConfirmIn, db: Session = Depends(get_db)):
    t = db.query(PasswordResetToken).filter_by(token_hash=A.hash_reset_token(body.token)).first()
    if not t or t.used_at or t.expires_at.replace(tzinfo=t.expires_at.tzinfo or utcnow().tzinfo) < utcnow():
        raise HTTPException(400, "Invalid or expired token")
    u = db.get(User, t.user_id)
    u.password_hash = A.hash_password(body.password)
    t.used_at = utcnow()
    audit(db, u.id, "auth.password_reset"); db.commit()
