"""
Audit log writer. Called by any service that changes application status.
"""
from __future__ import annotations
from typing import Optional
import json
from sqlalchemy.orm import Session
from backend.models.audit import AuditLog

def log_action(
    db: Session,
    application_id: str,
    actor: str,
    action: str,
    from_status: str | None = None,
    to_status: str | None = None,
    comment: str | None = None,
    metadata: dict | None = None,
):
    entry = AuditLog(
        application_id = application_id,
        actor          = actor,
        action         = action,
        from_status    = from_status,
        to_status      = to_status,
        comment        = comment,
        metadata_json  = json.dumps(metadata) if metadata else None,
    )
    db.add(entry)
    db.commit()
