"""
One row per uploaded file attached to an application.
"""
from __future__ import annotations
import enum
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Float, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base

class DocType(str, enum.Enum):
    LAND_DEED          = "land_deed"
    TRUST_CERTIFICATE  = "trust_certificate"
    FACULTY_LIST       = "faculty_list"
    FIRE_NOC           = "fire_noc"
    UNKNOWN            = "unknown"

MANDATORY_DOCS: set[DocType] = {
    DocType.LAND_DEED,
    DocType.TRUST_CERTIFICATE,
    DocType.FACULTY_LIST,
    DocType.FIRE_NOC,
}

class Document(Base):
    __tablename__ = "documents"

    id:             Mapped[int]     = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[str]     = mapped_column(String(20), ForeignKey("applications.id"))
    doc_type:       Mapped[DocType] = mapped_column(SAEnum(DocType), default=DocType.UNKNOWN)
    original_name:  Mapped[str]     = mapped_column(String(255))
    stored_path:    Mapped[str]     = mapped_column(String(512))   # relative to upload_dir
    sha256:         Mapped[str]     = mapped_column(String(64))
    file_size_bytes:Mapped[int]     = mapped_column(Integer)
    mime_type:      Mapped[str]     = mapped_column(String(100))
    quality_score:  Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    uploaded_at:    Mapped[datetime]= mapped_column(
                                       DateTime(timezone=True),
                                       default=lambda: datetime.now(timezone.utc)
                                     )
