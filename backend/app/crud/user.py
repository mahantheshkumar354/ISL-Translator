from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    statement = select(User).where(User.email == email)
    return db.execute(statement).scalar_one_or_none()


def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:
    statement = select(User).where(User.id == user_id)
    return db.execute(statement).scalar_one_or_none()


def create_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
) -> User:
    user = User(
        full_name=full_name.strip(),
        email=email.lower().strip(),
        hashed_password=hash_password(password),
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user