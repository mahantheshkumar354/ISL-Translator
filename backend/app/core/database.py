from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


# ============================================================
# DATABASE ENGINE
# ============================================================

# SQLite requires this option when the same database connection
# may be accessed from different FastAPI request contexts.
connect_args = {}

if settings.database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False


engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    future=True,
)


# ============================================================
# SESSION FACTORY
# ============================================================

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


# ============================================================
# BASE MODEL
# ============================================================

class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy database models.
    """

    pass


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def init_db() -> None:
    from app.models import user  # noqa: F401
    from app.models import history  # noqa: F401

    Base.metadata.create_all(bind=engine)


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db() -> Generator[Session, None, None]:
    """
    Provide a database session to FastAPI endpoints.

    The session is always closed after the request finishes.
    """

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# STANDALONE TEST
# ============================================================

if __name__ == "__main__":
    init_db()

    print()
    print("=" * 65)
    print("DATABASE INITIALIZATION")
    print("=" * 65)
    print()
    print(f"Database URL: {settings.database_url}")
    print("Database initialized successfully.")
    print()
    print("=" * 65)