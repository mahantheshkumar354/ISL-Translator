from datetime import datetime, time, timezone
import csv
import io
import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.history import History
from app.models.user import User


router = APIRouter(
    prefix="/api/v1/history",
    tags=["History"],
)


# ============================================================
# SCHEMAS
# ============================================================

class HistoryCreate(BaseModel):
    mode: str
    input_text: str | None = None
    output_text: str | None = None
    prediction: str | None = None
    confidence: float | None = None


class HistoryResponse(BaseModel):
    id: int
    mode: str
    input_text: str | None
    output_text: str | None
    prediction: str | None
    confidence: float | None
    created_at: str


class DashboardStatsResponse(BaseModel):
    total_translations: int
    today_translations: int

    sign_to_text: int
    text_to_sign: int
    speech_to_sign: int

    average_confidence: float


# ============================================================
# CONSTANTS
# ============================================================

ALLOWED_MODES = {
    "sign_to_text",
    "text_to_sign",
    "speech_to_sign",
}


# ============================================================
# HELPER
# ============================================================

def history_to_response(item: History) -> HistoryResponse:
    created_at = item.created_at

    # SQLite may return a timezone-aware UTC timestamp
    # as a naive datetime.
    #
    # Our History model stores timestamps in UTC.
    # Therefore, if timezone information is missing,
    # explicitly mark the timestamp as UTC.
    if created_at.tzinfo is None:
        created_at = created_at.replace(
            tzinfo=timezone.utc
        )

    return HistoryResponse(
        id=item.id,
        mode=item.mode,
        input_text=item.input_text,
        output_text=item.output_text,
        prediction=item.prediction,
        confidence=item.confidence,
        created_at=created_at.isoformat(),
    )


# ============================================================
# CREATE HISTORY
# ============================================================

@router.post(
    "",
    response_model=HistoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_history(
    history_data: HistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Validate translation mode
    # --------------------------------------------------------

    if history_data.mode not in ALLOWED_MODES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid translation mode. "
                "Allowed values: sign_to_text, "
                "text_to_sign, speech_to_sign"
            ),
        )

    # --------------------------------------------------------
    # Normalize confidence
    # --------------------------------------------------------

    confidence = history_data.confidence

    if confidence is not None and confidence > 1:
        confidence = confidence / 100

    # --------------------------------------------------------
    # Create database record
    # --------------------------------------------------------

    history = History(
        user_id=current_user.id,
        mode=history_data.mode,
        input_text=history_data.input_text,
        output_text=history_data.output_text,
        prediction=history_data.prediction,
        confidence=confidence,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history_to_response(history)


# ============================================================
# GET HISTORY
# ============================================================

@router.get(
    "",
    response_model=list[HistoryResponse],
)
def get_history(
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statement = (
        select(History)
        .where(
            History.user_id == current_user.id
        )
        .order_by(
            History.created_at.desc()
        )
        .offset(offset)
        .limit(limit)
    )

    history_items = (
        db.execute(statement)
        .scalars()
        .all()
    )

    return [
        history_to_response(item)
        for item in history_items
    ]


# ============================================================
# EXPORT HISTORY
# IMPORTANT:
# Keep this BEFORE /{history_id}
# ============================================================

@router.get("/export")
def export_history(
    format: str = Query(
        default="csv",
        pattern="^(csv|json)$",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statement = (
        select(History)
        .where(
            History.user_id == current_user.id
        )
        .order_by(
            History.created_at.desc()
        )
    )

    history_items = (
        db.execute(statement)
        .scalars()
        .all()
    )

    # ========================================================
    # JSON EXPORT
    # ========================================================

    if format == "json":

        data = []

        for item in history_items:
            created_at = item.created_at

            if created_at.tzinfo is None:
                created_at = created_at.replace(
                    tzinfo=timezone.utc
                )

            data.append({
                "id": item.id,
                "mode": item.mode,
                "input_text": item.input_text,
                "output_text": item.output_text,
                "prediction": item.prediction,
                "confidence": item.confidence,
                "created_at": created_at.isoformat(),
            })

        content = json.dumps(
            data,
            indent=2,
        )

        return StreamingResponse(
            io.BytesIO(
                content.encode("utf-8")
            ),
            media_type="application/json",
            headers={
                "Content-Disposition":
                    'attachment; filename="isl_history.json"'
            },
        )

    # ========================================================
    # CSV EXPORT
    # ========================================================

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "id",
        "mode",
        "input_text",
        "output_text",
        "prediction",
        "confidence",
        "created_at",
    ])

    for item in history_items:
        created_at = item.created_at

        if created_at.tzinfo is None:
            created_at = created_at.replace(
                tzinfo=timezone.utc
            )

        writer.writerow([
            item.id,
            item.mode,
            item.input_text or "",
            item.output_text or "",
            item.prediction or "",
            item.confidence
            if item.confidence is not None
            else "",
            created_at.isoformat(),
        ])

    content = output.getvalue()

    return StreamingResponse(
        io.BytesIO(
            content.encode("utf-8")
        ),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                'attachment; filename="isl_history.csv"'
        },
    )


# ============================================================
# DASHBOARD STATISTICS
# IMPORTANT:
# Keep this BEFORE /{history_id}
# ============================================================

@router.get(
    "/dashboard/stats",
    response_model=DashboardStatsResponse,
)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # ========================================================
    # TOTAL TRANSLATIONS
    # ========================================================

    total_translations = (
        db.execute(
            select(
                func.count(History.id)
            ).where(
                History.user_id == current_user.id
            )
        )
        .scalar()
        or 0
    )

    # ========================================================
    # TRANSLATION MODE COUNTS
    # ========================================================

    sign_to_text = (
        db.execute(
            select(
                func.count(History.id)
            ).where(
                History.user_id == current_user.id,
                History.mode == "sign_to_text",
            )
        )
        .scalar()
        or 0
    )

    text_to_sign = (
        db.execute(
            select(
                func.count(History.id)
            ).where(
                History.user_id == current_user.id,
                History.mode == "text_to_sign",
            )
        )
        .scalar()
        or 0
    )

    speech_to_sign = (
        db.execute(
            select(
                func.count(History.id)
            ).where(
                History.user_id == current_user.id,
                History.mode == "speech_to_sign",
            )
        )
        .scalar()
        or 0
    )

    # ========================================================
    # LOAD USER HISTORY
    # ========================================================

    all_history = (
        db.execute(
            select(History)
            .where(
                History.user_id == current_user.id
            )
        )
        .scalars()
        .all()
    )

    # ========================================================
    # TODAY'S TRANSLATIONS
    # ========================================================

    today = datetime.now(
        timezone.utc
    ).date()

    today_translations = 0

    for item in all_history:
        if item.created_at is None:
            continue

        created_at = item.created_at

        if created_at.tzinfo is None:
            created_at = created_at.replace(
                tzinfo=timezone.utc
            )

        if created_at.date() == today:
            today_translations += 1

    # ========================================================
    # AVERAGE CONFIDENCE
    # ========================================================

    confidence_values = [
        item.confidence
        for item in all_history
        if item.confidence is not None
    ]

    if confidence_values:

        average_confidence = (
            sum(confidence_values)
            / len(confidence_values)
        )

        if average_confidence <= 1:
            average_confidence *= 100

    else:
        average_confidence = 0.0

    # ========================================================
    # RETURN
    # ========================================================

    return DashboardStatsResponse(
        total_translations=int(
            total_translations
        ),
        today_translations=int(
            today_translations
        ),

        sign_to_text=int(
            sign_to_text
        ),
        text_to_sign=int(
            text_to_sign
        ),
        speech_to_sign=int(
            speech_to_sign
        ),

        average_confidence=round(
            average_confidence,
            2,
        ),
    )


# ============================================================
# DELETE HISTORY ITEM
# IMPORTANT:
# Keep this AFTER all static routes
# ============================================================

@router.delete(
    "/{history_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_history(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statement = (
        select(History)
        .where(
            History.id == history_id,
            History.user_id == current_user.id,
        )
    )

    history = (
        db.execute(statement)
        .scalar_one_or_none()
    )

    if history is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History item not found",
        )

    db.delete(history)
    db.commit()

    return None