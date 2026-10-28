"""
Application table. One row per submission.
Status lifecycle (enforced here as an Enum):
  SUBMITTED -> PROCESSING -> CLEARED | UNDER_REVIEW | DEFICIENT
  UNDER_REVIEW -> CLEARED | DEFICIENT
  DEFICIENT -> RESUBMITTED -> PROCESSING
  CLEARED -> FORWARDED
"""
from __future__ import annotations
import enum
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base

class AppStatus(str, enum.Enum):
    SUBMITTED    = "SUBMITTED"
    PROCESSING   = "PROCESSING"
    CLEARED      = "CLEARED"
    UNDER_REVIEW = "UNDER_REVIEW"
    DEFICIENT    = "DEFICIENT"
    RESUBMITTED  = "RESUBMITTED"
    FORWARDED    = "FORWARDED"

# Valid transitions — enforced by the service layer, not the DB
VALID_TRANSITIONS: dict[AppStatus, set[AppStatus]] = {
    AppStatus.SUBMITTED:    {AppStatus.PROCESSING},
    AppStatus.PROCESSING:   {AppStatus.CLEARED, AppStatus.UNDER_REVIEW, AppStatus.DEFICIENT},
    AppStatus.UNDER_REVIEW: {AppStatus.CLEARED, AppStatus.DEFICIENT},
    AppStatus.DEFICIENT:    {AppStatus.RESUBMITTED},
    AppStatus.RESUBMITTED:  {AppStatus.PROCESSING},
    AppStatus.CLEARED:      {AppStatus.FORWARDED},
    AppStatus.FORWARDED:    set(),
}

class Application(Base):
    __tablename__ = "applications"

    id:              Mapped[str]            = mapped_column(String(20), primary_key=True)
    institution_name:Mapped[str]            = mapped_column(String(255))
    contact_email:   Mapped[str]            = mapped_column(String(255))
    status:          Mapped[AppStatus]      = mapped_column(
                                               SAEnum(AppStatus), default=AppStatus.SUBMITTED
                                             )
    trust_score:     Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    form_data_json:  Mapped[Optional[str]]   = mapped_column(Text, nullable=True)  # raw JSON
    officer_comment: Mapped[Optional[str]]   = mapped_column(Text, nullable=True)
    created_at:      Mapped[datetime]       = mapped_column(
                                               DateTime(timezone=True),
                                               default=lambda: datetime.now(timezone.utc)
                                             )
    updated_at:      Mapped[datetime]       = mapped_column(
                                               DateTime(timezone=True),
                                               default=lambda: datetime.now(timezone.utc),
                                               onupdate=lambda: datetime.now(timezone.utc)
                                             )
