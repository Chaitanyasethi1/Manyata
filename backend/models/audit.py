"""
Audit log — one row per status change or officer action.
Immutable — rows are never updated or deleted.
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id:             Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[str]           = mapped_column(String(20), ForeignKey("applications.id"))
    actor:          Mapped[str]           = mapped_column(String(100))  # "system" | "officer:<id>"
    action:         Mapped[str]           = mapped_column(String(50))   # e.g. "STATUS_CHANGE"
    from_status:    Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    to_status:      Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    comment:        Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json:  Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # extra context
    created_at:     Mapped[datetime]      = mapped_column(
                                             DateTime(timezone=True),
                                             default=lambda: datetime.now(timezone.utc)
                                           )
