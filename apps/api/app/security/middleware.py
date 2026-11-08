import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings

UNSAFE = {"POST", "PUT", "PATCH", "DELETE"}


class SecurityMiddleware(BaseHTTPMiddleware):
    """Body-size limit, Origin check (CSRF defence for cookie auth), security headers."""

    async def dispatch(self, request: Request, call_next):
        s = get_settings()
        if request.method in UNSAFE:
            cl = request.headers.get("content-length")
            if cl and cl.isdigit() and int(cl) > s.max_request_bytes:
                return JSONResponse({"detail": "Request too large"}, 413)
            origin = request.headers.get("origin")
            if origin and origin not in s.origins:
                return JSONResponse({"detail": "Origin not allowed"}, 403)
            if not origin and s.is_prod and request.cookies:
                return JSONResponse({"detail": "Origin required"}, 403)
        resp = await call_next(request)
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["Referrer-Policy"] = "no-referrer"
        return resp


class RateLimiter:
    def __init__(self):
        self.hits: dict[str, deque] = defaultdict(deque)

    def check(self, key: str, limit: int, window_s: int):
        from fastapi import HTTPException

        now = time.monotonic()
        q = self.hits[key]
        while q and now - q[0] > window_s:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(429, "Too many requests")
        q.append(now)

    def reset(self):
        self.hits.clear()


limiter = RateLimiter()
