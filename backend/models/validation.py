"""
Stores the raw ValidationResult JSON and per-module scores in DB.
One row per pipeline run (application can be re-run on resubmission).
"""
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base

class ValidationRun(Base):
    __tablename__ = "validation_runs"

    id:               Mapped[int]        = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id:   Mapped[str]        = mapped_column(String(20), ForeignKey("applications.id"))
    trust_score:      Mapped[float]      = mapped_column(Float)
    authenticity_score: Mapped[float]    = mapped_column(Float, default=0.0)
    forgery_score:    Mapped[float]      = mapped_column(Float, default=0.0)
    compliance_score: Mapped[float]      = mapped_column(Float, default=0.0)
    has_critical:     Mapped[bool]       = mapped_column(default=False)
    result_status:    Mapped[str]        = mapped_column(String(20))   # CLEARED etc.
    result_json:      Mapped[str]        = mapped_column(Text)         # full ValidationResult as JSON
    ran_at:           Mapped[datetime]   = mapped_column(
                                            DateTime(timezone=True),
                                            default=lambda: datetime.now(timezone.utc)
                                          )
