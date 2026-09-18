from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    verify_password,
    decode_access_token,
)
from app.crud.user import (
    create_user,
    get_user_by_email,
    get_user_by_id,
)
from app.schemas.auth import (
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    if not user_data.full_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required",
        )

    existing_user = get_user_by_email(
        db,
        user_data.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = create_user(
        db,
        user_data.full_name,
        user_data.email,
        user_data.password,
    )

    return user


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=Token,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = get_user_by_email(
        db,
        form_data.username,
    )

    if user is None or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # -----------------------------------------------------
    # Record the current login time in UTC.
    # The frontend converts this to IST.
    # -----------------------------------------------------

    user.last_login = datetime.now(timezone.utc)

    # IMPORTANT:
    # Do NOT clear last_logout here.
    #
    # We want Settings to continue showing the
    # previous session's logout time even after
    # the user logs in again.
    #

    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        subject=user.id,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# =========================================================
# CURRENT USER
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    subject = payload.get("sub")

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    user = get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user


# =========================================================
# GET MY PROFILE
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user=Depends(get_current_user),
):
    return current_user


# =========================================================
# UPDATE MY PROFILE
# =========================================================

@router.put(
    "/me",
    response_model=UserResponse,
)
def update_me(
    user_data: UserUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    full_name = user_data.full_name.strip()

    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required",
        )

    current_user.full_name = full_name

    db.commit()
    db.refresh(current_user)

    return current_user


# =========================================================
# LOGOUT
# =========================================================

@router.post(
    "/logout",
)
def logout(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Record the exact logout time in UTC.
    # -----------------------------------------------------

    current_user.last_logout = datetime.now(
        timezone.utc
    )

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Logged out successfully",
        "logout_time": current_user.last_logout,
    }