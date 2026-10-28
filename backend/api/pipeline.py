"""
Pipeline trigger endpoint.
POST /api/v1/applications/{app_id}/trigger
  — starts background validation
GET  /api/v1/applications/{app_id}/result
  — returns latest ValidationRun for this application
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.application import Application, AppStatus
from backend.models.validation import ValidationRun
from backend.services.pipeline import run_pipeline

router = APIRouter(prefix="/api/v1", tags=["pipeline"])

TRIGGERABLE_STATUSES = {AppStatus.SUBMITTED, AppStatus.RESUBMITTED}

@router.post("/applications/{app_id}/trigger", status_code=202)
def trigger_pipeline(
    app_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Triggers the validation pipeline for an application.
    Returns 202 Accepted immediately; processing happens in background.
    Only works if status is SUBMITTED or RESUBMITTED.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail=f"{app_id} not found.")

    if app.status not in TRIGGERABLE_STATUSES:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Cannot trigger pipeline: current status is '{app.status.value}'. "
                f"Only SUBMITTED or RESUBMITTED applications can be triggered."
            ),
        )

    background_tasks.add_task(run_pipeline, app_id)
    return {
        "message":        "Validation pipeline started.",
        "application_id": app_id,
        "status":         "PROCESSING (starting)",
    }


@router.get("/applications/{app_id}/result")
def get_result(app_id: str, db: Session = Depends(get_db)):
    """
    Returns the latest ValidationRun for this application.
    Includes trust_score, per-module scores, has_critical, full result JSON.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail=f"{app_id} not found.")

    run = (
        db.query(ValidationRun)
        .filter(ValidationRun.application_id == app_id)
        .order_by(ValidationRun.ran_at.desc())
        .first()
    )
    if not run:
        raise HTTPException(
            status_code=404,
            detail=f"No validation result yet for {app_id}. Trigger the pipeline first."
        )

    import json
    return {
        "application_id":     app_id,
        "current_status":     app.status.value,
        "trust_score":        run.trust_score,
        "authenticity_score": run.authenticity_score,
        "forgery_score":      run.forgery_score,
        "compliance_score":   run.compliance_score,
        "has_critical_flag":  run.has_critical,
        "ran_at":             run.ran_at.isoformat(),
        "result":             json.loads(run.result_json),
    }
