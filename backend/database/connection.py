"""Database engine, session factory and declarative base.

Supports MySQL (recommended) via the DATABASE_URL environment variable, e.g.
    mysql+pymysql://user:password@localhost:3306/career_guidance
If no DATABASE_URL is configured it falls back to a local SQLite file so the
project runs immediately for a demo without requiring a MySQL install.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from utils.config import settings

connect_args = {}
if settings.database_url.startswith("sqlite"):
    # SQLite needs this so each connection can share the same thread.
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base shared by all ORM models."""


def get_db():
    """FastAPI dependency that yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables defined on the metadata (used on first run)."""
    # Import models so they register on Base.metadata before create_all.
    from database import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
