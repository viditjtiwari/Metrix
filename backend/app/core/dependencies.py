from typing import Callable, Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import user_repository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """Dependency that extracts, decodes, and validates the JWT access token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account.",
        )

    return user


def require_role(*allowed_roles: UserRole) -> Callable[[User], User]:
    """Factory dependency enforcing that current user possesses an authorized role."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role: {current_user.role.value}.",
            )
        return current_user

    return role_checker


# Role-specific shorthand dependencies
require_admin = require_role(UserRole.ADMIN)
require_lmo = require_role(UserRole.LMO)
require_gatc = require_role(UserRole.GATC)
require_instrument_owner = require_role(UserRole.INSTRUMENT_OWNER)
require_officer = require_role(UserRole.LMO, UserRole.ADMIN)
require_authenticated_user = get_current_user

__all__ = [
    "get_db",
    "get_current_user",
    "require_role",
    "require_admin",
    "require_lmo",
    "require_gatc",
    "require_instrument_owner",
    "require_officer",
    "require_authenticated_user",
]
