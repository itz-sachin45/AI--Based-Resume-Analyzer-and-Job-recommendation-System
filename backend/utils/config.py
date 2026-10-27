"""Application configuration loaded from environment variables.

Settings are read from a `.env` file (python-dotenv via pydantic-settings)
or from real environment variables. A safe default is used for the database
URL so the API can run out-of-the-box for a demo using a local SQLite file;
set DATABASE_URL to a MySQL connection string for the real project database.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "sqlite:///./career_guidance.db"

    # Auth
    secret_key: str = "change-this-to-a-long-random-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS
    frontend_origins: str = "https://career-guidance-frontend-delta.vercel.app,http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"

    # App
    app_name: str = "AI Career Guidance API"
    environment: str = "development"

    @property
    def allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

