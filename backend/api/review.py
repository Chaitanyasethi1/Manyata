"""
Review API endpoints.

POST /api/v1/applications/{app_id}/review
  — officer submits a decision

GET  /api/v1/applications/{app_id}/audit
  — full audit trail for an application

GET  /api/v1/alerts
  — list all alerts (optionally filter by application_id)

PATCH /api/v1/alerts/{alert_id}/read
  — mark alert as read
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.audit import AuditLog
from backend.models.alert import Alert
from backend.services.review import apply_officer_decision

router = APIRouter(prefix="/api/v1", tags=["review"])

# ── schemas ───────────────────────────────────────────────────────────────────

class ReviewRequest(BaseModel):
    decision:   str             # CONFIRM_CLEAR | RETURN_DEFICIENT | ASK_FOR_INFO
    comment:    Optional[str] = None
    officer_id: str           = "officer:demo"

# ── endpoints ─────────────────────────────────────────────────────────────────

@router.post("/applications/{app_id}/review")
def submit_review(
    app_id: str,
    body: ReviewRequest,
    db: Session = Depends(get_db),
):
    app = apply_officer_decision(
        db             = db,
        application_id = app_id,
        decision       = body.decision,
        comment        = body.comment,
        officer_id     = body.officer_id,
    )
    return {
        "application_id": app.id,
        "new_status":     app.status.value,
        "officer_comment":app.officer_comment,
        "message":        f"Decision '{body.decision}' applied successfully.",
    }


@router.get("/applications/{app_id}/audit")
def get_audit_log(app_id: str, db: Session = Depends(get_db)):
    entries = (
        db.query(AuditLog)
        .filter(AuditLog.application_id == app_id)
        .order_by(AuditLog.created_at.asc())
        .all()
    )
    return [
        {
            "id":           e.id,
            "actor":        e.actor,
            "action":       e.action,
            "from_status":  e.from_status,
            "to_status":    e.to_status,
            "comment":      e.comment,
            "created_at":   e.created_at.isoformat(),
        }
        for e in entries
    ]


@router.get("/alerts")
def list_alerts(
    application_id: Optional[str] = None,
    unread_only: bool = False,
    db: Session = Depends(get_db),
):
    q = db.query(Alert)
    if application_id:
        q = q.filter(Alert.application_id == application_id)
    if unread_only:
        q = q.filter(Alert.is_read == False)
    alerts = q.order_by(Alert.created_at.desc()).all()
    return [
        {
            "id":             a.id,
            "application_id": a.application_id,
            "alert_type":     a.alert_type.value,
            "message":        a.message,
            "is_read":        a.is_read,
            "created_at":     a.created_at.isoformat(),
        }
        for a in alerts
    ]


@router.patch("/alerts/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found.")
    alert.is_read = True
    db.commit()
    return {"alert_id": alert_id, "is_read": True}
