from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str

    # Loaded from JWT_SECRET or SECRET_KEY in .env
    JWT_SECRET: str = "change-me-in-production"
    SECRET_KEY: Optional[str] = None

    DEBUG: bool = False
    FRONTEND_URL: Optional[str] = "http://localhost:3000"
    OPENROUTER_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    PORT: int = 8001
    NODE_ENV: str = "development"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        extra="ignore",
        env_file=".env",
        env_file_encoding="utf-8",
    )

    @property
    def DEBUG_MODE(self) -> bool:
        return self.DEBUG or (self.NODE_ENV == "development")

    @property
    def signing_key(self) -> str:
        return self.SECRET_KEY or self.JWT_SECRET


settings = Settings()
