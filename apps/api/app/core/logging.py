import logging
import re

from pythonjsonlogger.json import JsonFormatter

_SECRET = re.compile(r"(password|token|secret|api[_-]?key)(\"?\s*[:=]\s*\"?)[^\s\",]+", re.IGNORECASE)


class RedactFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if getattr(record, "dev_only", False):
            return True  # explicit opt-out; only used outside production
        record.msg = _SECRET.sub(r"\1\2[REDACTED]", record.getMessage())
        record.args = None
        return True


def setup_logging(level: str = "INFO") -> None:
    h = logging.StreamHandler()
    h.setFormatter(JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    h.addFilter(RedactFilter())
    root = logging.getLogger()
    root.handlers = [h]
    root.setLevel(level)
