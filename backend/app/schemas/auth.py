from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str


class UserResponse(BaseModel):
    id: int
    full_name: str | None = None
    email: EmailStr
    is_active: bool

    created_at: datetime

    last_login: datetime | None = None
    last_logout: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"