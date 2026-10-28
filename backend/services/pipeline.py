"""
Main pipeline runner.
Called as a FastAPI BackgroundTask — must not raise unhandled exceptions.
Transitions: SUBMITTED → PROCESSING → CLEARED | UNDER_REVIEW | DEFICIENT
"""
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from engine import run_validation
from backend.database import SessionLocal
from backend.models.application import Application, AppStatus
from backend.models.document import Document
from backend.services.validation_store import persist_validation
from backend.config import settings

logger = logging.getLogger(__name__)

def _set_status(db: Session, app_id: str, status: AppStatus):
    app = db.query(Application).filter(Application.id == app_id).first()
    if app:
        app.status     = status
        app.updated_at = datetime.now(timezone.utc)
        db.commit()

def run_pipeline(application_id: str):
    """
    Entry point for BackgroundTask.
    Opens its own DB session (background tasks run outside request scope).
    """
    db = SessionLocal()
    try:
        # 1. Load application
        app = db.query(Application).filter(
            Application.id == application_id
        ).first()
        if not app:
            logger.error(f"Pipeline: application {application_id} not found.")
            return

        # 2. Transition to PROCESSING
        _set_status(db, application_id, AppStatus.PROCESSING)
        logger.info(f"Pipeline: {application_id} → PROCESSING")

        # 3. Build application_dir path
        app_path = Path(settings.upload_dir) / application_id
        if not app_path.exists():
            app_path.mkdir(parents=True, exist_ok=True)
        app_dir = str(app_path)

        # 4. Parse form_data
        try:
            form_data = json.loads(app.form_data_json or "{}")
        except json.JSONDecodeError:
            form_data = {}
        form_data["application_id"] = application_id

        # 5. Call engine (mock until Member A ships real engine)
        result = run_validation(app_dir, form_data)

        # 6. Score + persist
        persist_validation(db, result)
        logger.info(
            f"Pipeline: {application_id} complete. "
            f"Trust Score: {result.application_id}"
        )

    except Exception as e:
        logger.exception(f"Pipeline: {application_id} FAILED — {e}")
        # Set back to SUBMITTED so officer can retry
        try:
            _set_status(db, application_id, AppStatus.SUBMITTED)
        except Exception:
            pass
    finally:
        db.close()
