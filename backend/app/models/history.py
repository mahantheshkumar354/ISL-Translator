from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class History(Base):
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    mode: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    input_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    output_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    prediction: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )