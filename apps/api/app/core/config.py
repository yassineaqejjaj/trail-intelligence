from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    log_level: str = "INFO"
    database_url: str = "sqlite:///./trail_dev.db"
    jwt_secret_key: str = "dev-only-change-me-please-32-bytes-min"
    jwt_ttl_minutes: int = 60 * 12
    frontend_url: str = "http://localhost:3000"
    cors_allowed_origins: str = "http://localhost:3000"
    llm_provider: str = "mock"  # mock | anthropic
    llm_api_key: str = ""
    llm_model: str = "claude-sonnet-5-5"
    llm_timeout_s: float = 45.0
    llm_max_attempts: int = 3
    email_provider: str = ""  # resend | "" (disabled)
    email_api_key: str = ""
    email_from: str = "TRAIL Intelligence <no-reply@example.com>"
    max_request_bytes: int = 256_000
    max_submission_chars: int = 20_000

    @property
    def is_prod(self) -> bool:
        return self.environment == "production"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_allowed_origins.split(",") if o.strip()]

    @property
    def sqlalchemy_url(self) -> str:
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if s.is_prod and s.jwt_secret_key.startswith("dev-only"):
        raise RuntimeError("JWT_SECRET_KEY must be set in production")
    return s
