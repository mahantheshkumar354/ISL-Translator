from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import settings


# ============================================================
# PASSWORD HASHING
# ============================================================

# pwdlib uses a secure password hashing algorithm and avoids
# the bcrypt 72-byte limitation that caused problems previously.
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Hash a plain-text password securely.

    The plain-text password is never stored.
    """
    if not password:
        raise ValueError("Password cannot be empty.")

    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against its stored hash.
    """
    if not plain_password or not hashed_password:
        return False

    try:
        return password_hash.verify(
            plain_password,
            hashed_password,
        )
    except Exception:
        return False


# ============================================================
# JWT
# ============================================================

def create_access_token(
    subject: str | int,
    expires_delta: timedelta | None = None,
    **extra_claims: Any,
) -> str:
    """
    Create a signed JWT access token.

    The subject normally contains the user's database ID.
    """

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=settings.access_token_expire_minutes
        )

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        **extra_claims,
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any] | None:
    """
    Decode and validate a JWT access token.

    Returns None when the token is invalid or expired.
    """

    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )

        subject = payload.get("sub")

        if not subject:
            return None

        return payload

    except jwt.PyJWTError:
        return None


def get_token_subject(token: str) -> str | None:
    """
    Extract the user ID stored in the JWT subject.
    """

    payload = decode_access_token(token)

    if payload is None:
        return None

    subject = payload.get("sub")

    if subject is None:
        return None

    return str(subject)


# ============================================================
# STANDALONE TEST
# ============================================================

if __name__ == "__main__":
    print()
    print("=" * 65)
    print("ISL TRANSLATOR SECURITY TEST")
    print("=" * 65)
    print()

    test_password = "ISL_Test_Password_2026"

    hashed = hash_password(test_password)

    print("Password hashing: OK")
    print(f"Hash generated: {hashed[:30]}...")

    valid = verify_password(
        test_password,
        hashed,
    )

    invalid = verify_password(
        "wrong-password",
        hashed,
    )

    print(f"Correct password verification: {valid}")
    print(f"Wrong password verification: {invalid}")

    token = create_access_token(
        subject=123
    )

    print()
    print("JWT creation: OK")
    print(f"Token generated: {token[:40]}...")

    payload = decode_access_token(token)

    print("JWT decoding:", "OK" if payload else "FAILED")

    subject = get_token_subject(token)

    print(f"Token subject: {subject}")

    print()
    print("=" * 65)
    print("Security test completed.")
    print("=" * 65)
    print()