import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db
from app.core.security import create_access_token, get_password_hash
from app.db.base import Base
from app.main import app
from app.models.enums import UserRole
from app.models.user import User

# SQLite in-memory database for isolated unit and integration testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Yields a clean in-memory database session per test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def owner_user(db_session: Session) -> User:
    """Create a test instrument owner user."""
    user = User(
        email="owner@example.com",
        hashed_password=get_password_hash("SecretPassword123!"),
        full_name="Rajesh Verma",
        role=UserRole.INSTRUMENT_OWNER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def owner_headers(owner_user: User) -> dict:
    """Generate JWT authorization headers for owner_user."""
    token = create_access_token(
        subject=owner_user.id,
        extra_claims={"role": owner_user.role.value, "email": owner_user.email},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def other_owner_user(db_session: Session) -> User:
    """Create a second test instrument owner user for boundary tests."""
    user = User(
        email="other.owner@example.com",
        hashed_password=get_password_hash("SecretPassword123!"),
        full_name="Sunil Sharma",
        role=UserRole.INSTRUMENT_OWNER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def other_owner_headers(other_owner_user: User) -> dict:
    """Generate JWT authorization headers for second owner."""
    token = create_access_token(
        subject=other_owner_user.id,
        extra_claims={"role": other_owner_user.role.value, "email": other_owner_user.email},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def lmo_user(db_session: Session) -> User:
    """Create a test Legal Metrology Officer user."""
    user = User(
        email="lmo@example.com",
        hashed_password=get_password_hash("SecretPassword123!"),
        full_name="Inspector Sharma",
        role=UserRole.LMO,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def lmo_headers(lmo_user: User) -> dict:
    """Generate JWT authorization headers for LMO."""
    token = create_access_token(
        subject=lmo_user.id,
        extra_claims={"role": lmo_user.role.value, "email": lmo_user.email},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_user(db_session: Session) -> User:
    """Create a test Admin user."""
    user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("SecretPassword123!"),
        full_name="System Administrator",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_headers(admin_user: User) -> dict:
    """Generate JWT authorization headers for Admin."""
    token = create_access_token(
        subject=admin_user.id,
        extra_claims={"role": admin_user.role.value, "email": admin_user.email},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def gatc_user(db_session: Session) -> User:
    """Create a test GATC test centre user."""
    user = User(
        email="gatc@example.com",
        hashed_password=get_password_hash("SecretPassword123!"),
        full_name="National Calibration Lab (GATC)",
        role=UserRole.GATC,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def gatc_headers(gatc_user: User) -> dict:
    """Generate JWT authorization headers for GATC."""
    token = create_access_token(
        subject=gatc_user.id,
        extra_claims={"role": gatc_user.role.value, "email": gatc_user.email},
    )
    return {"Authorization": f"Bearer {token}"}
