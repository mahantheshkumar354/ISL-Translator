from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.models.password_reset import PasswordResetToken


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Password Reset"],
)


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.execute(
        select(User).where(User.email == request.email.lower().strip())
    ).scalar_one_or_none()

    # Do not reveal whether the email exists.
    if user is None:
        return {
            "message": "If the email is registered, a password reset request has been created."
        }

    # Invalidate previous unused tokens for this user.
    old_tokens = db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False,
        )
    ).scalars().all()

    for old_token in old_tokens:
        old_token.used = True

    token = secrets.token_urlsafe(32)

    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        used=False,
    )

    db.add(reset_token)
    db.commit()

    return {
        "message": "Password reset request created.",
        "reset_token": token,
    }


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    reset_token = db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token == request.token,
            PasswordResetToken.used == False,
        )
    ).scalar_one_or_none()

    if reset_token is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid or already used reset token",
        )

    now = datetime.now(timezone.utc)

    if reset_token.expires_at.replace(tzinfo=timezone.utc) < now:
        reset_token.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Reset token has expired",
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    user = db.get(User, reset_token.user_id)

    if user is None:
        raise HTTPException(
            status_code=400,
            detail="User account not found",
        )

    user.hashed_password = hash_password(request.new_password)

    reset_token.used = True

    db.commit()

    return {
        "message": "Password reset successfully",
    }