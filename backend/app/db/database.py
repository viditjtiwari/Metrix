from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app.core.config import settings
from app.core.logging import logger

# SQLAlchemy 2.x Engine
# pool_pre_ping checks connection liveness prior to query execution
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG and settings.APP_ENV == "development",
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a database session per request.
    Rolls back transaction automatically if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as exc:
        logger.error(f"Database session rolled back due to error: {exc}")
        db.rollback()
        raise
    finally:
        db.close()
