"""Content localisation. Canonical content is English; fr/ar live in `translations` JSON columns."""
from fastapi import Request

SUPPORTED = ("en", "fr", "ar")
LANG_NAMES = {"en": "English", "fr": "French", "ar": "Arabic"}


def get_lang(request: Request) -> str:
    h = request.headers.get("x-lang") or ""
    if h[:2].lower() in SUPPORTED:
        return h[:2].lower()
    for part in (request.headers.get("accept-language") or "").split(","):
        code = part.split(";")[0].strip()[:2].lower()
        if code in SUPPORTED:
            return code
    return "en"


def pick(translations: dict | None, lang: str, key: str, default):
    """translations[lang][key] if present and non-empty, else the English default."""
    v = ((translations or {}).get(lang) or {}).get(key)
    return v if v not in (None, "", [], {}) else default
