"""Transactional email. Provider is configured by env; without one, sending is skipped and logged."""
import logging

import httpx

from app.core.config import get_settings

log = logging.getLogger("trail.email")


def send_email(to: str, subject: str, text: str) -> bool:
    s = get_settings()
    if s.email_provider == "resend" and s.email_api_key:
        try:
            r = httpx.post("https://api.resend.com/emails", headers={"Authorization": f"Bearer {s.email_api_key}"},
                           json={"from": s.email_from, "to": [to], "subject": subject, "text": text}, timeout=10)
            r.raise_for_status()
            return True
        except httpx.HTTPError as e:
            log.error("email send failed: %s", type(e).__name__)
            return False
    log.warning("email not sent: EMAIL_PROVIDER not configured")
    return False
