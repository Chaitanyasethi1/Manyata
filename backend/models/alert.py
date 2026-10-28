"""
In-app alerts. One row per alert event.
"""
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Enum as SAEnum
from backend.database import Base

class AlertType(str, enum.Enum):
    DOCUMENT_EXPIRY    = "DOCUMENT_EXPIRY"
    MISSING_DOCUMENT   = "MISSING_DOCUMENT"
    REVIEW_SLA_BREACH  = "REVIEW_SLA_BREACH"
    CRITICAL_FLAG      = "CRITICAL_FLAG"

class Alert(Base):
    __tablename__ = "alerts"

    id:             Mapped[int]       = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[str]       = mapped_column(String(20), ForeignKey("applications.id"))
    alert_type:     Mapped[AlertType] = mapped_column(SAEnum(AlertType))
    message:        Mapped[str]       = mapped_column(Text)
    is_read:        Mapped[bool]      = mapped_column(Boolean, default=False)
    created_at:     Mapped[datetime]  = mapped_column(
                                         DateTime(timezone=True),
                                         default=lambda: datetime.now(timezone.utc)
                                       )
