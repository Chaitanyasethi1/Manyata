"""
Officer review service.
Handles three decisions on UNDER_REVIEW applications:
  CONFIRM_CLEAR   → status becomes CLEARED
  RETURN_DEFICIENT → status becomes DEFICIENT
  ASK_FOR_INFO    → status stays UNDER_REVIEW, comment recorded in audit

Rules:
  - Only UNDER_REVIEW applications can be reviewed.
  - Comment is MANDATORY for RETURN_DEFICIENT and ASK_FOR_INFO.
  - Comment is optional for CONFIRM_CLEAR.
  - Every decision is written to audit log.
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.models.application import Application, AppStatus
from backend.services.audit import log_action
from fastapi import HTTPException

DECISION_TO_STATUS = {
    "CONFIRM_CLEAR":    AppStatus.CLEARED,
    "RETURN_DEFICIENT": AppStatus.DEFICIENT,
    "ASK_FOR_INFO":     None,   # status unchanged
}

COMMENT_REQUIRED = {"RETURN_DEFICIENT", "ASK_FOR_INFO"}

def apply_officer_decision(
    db: Session,
    application_id: str,
    decision: str,
    comment: str | None,
    officer_id: str = "officer:demo",
) -> Application:
    """
    Applies an officer decision to an UNDER_REVIEW application.
    Returns the updated Application.
    Raises HTTPException on invalid input.
    """
    # Validate decision value
    if decision not in DECISION_TO_STATUS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision '{decision}'. "
                   f"Must be one of: {list(DECISION_TO_STATUS.keys())}"
        )

    # Load application
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail=f"{application_id} not found.")

    # Must be UNDER_REVIEW
    if app.status != AppStatus.UNDER_REVIEW:
        raise HTTPException(
            status_code=409,
            detail=f"Application is '{app.status.value}', not UNDER_REVIEW. "
                   f"Only UNDER_REVIEW applications can be reviewed."
        )

    # Comment required check
    if decision in COMMENT_REQUIRED and not (comment and comment.strip()):
        raise HTTPException(
            status_code=422,
            detail=f"Comment is mandatory for decision '{decision}'."
        )

    old_status = app.status.value

    # Apply status change
    new_status = DECISION_TO_STATUS[decision]
    if new_status:
        app.status         = new_status
        app.officer_comment= comment
        app.updated_at     = datetime.now(timezone.utc)

    db.commit()
    db.refresh(app)

    # Audit log
    log_action(
        db             = db,
        application_id = application_id,
        actor          = officer_id,
        action         = f"OFFICER_{decision}",
        from_status    = old_status,
        to_status      = new_status.value if new_status else old_status,
        comment        = comment,
    )

    return app
