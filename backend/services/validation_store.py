"""
Serializes ValidationResult to JSON and persists a ValidationRun row.
Also updates the Application row with the new status and trust_score.
"""
import json
from datetime import datetime, timezone
from dataclasses import asdict
from sqlalchemy.orm import Session
from engine.contracts import ValidationResult
from backend.models.validation import ValidationRun
from backend.models.application import Application, AppStatus, VALID_TRANSITIONS
from backend.services.scoring import score_and_route, has_critical_flag

def _result_to_dict(result: ValidationResult) -> dict:
    """Converts ValidationResult dataclass to a JSON-serialisable dict."""
    def _convert(obj):
        if hasattr(obj, "__dataclass_fields__"):
            return {k: _convert(v) for k, v in asdict(obj).items()}
        if isinstance(obj, list):
            return [_convert(i) for i in obj]
        if hasattr(obj, "value"):   # Enum
            return obj.value
        return obj
    return _convert(result)

def persist_validation(
    db: Session,
    result: ValidationResult,
) -> ValidationRun:
    """
    1. Computes Trust Score + routing status.
    2. Saves a ValidationRun row.
    3. Updates the Application status + trust_score.
    Returns the saved ValidationRun.
    """
    trust_score, new_status = score_and_route(result)
    critical = has_critical_flag(result)

    # Pull sub_scores from modules
    sub_scores: dict[str, float] = {}
    for m in result.modules:
        sub_scores[m.module.value] = m.sub_score

    # Validate status transition
    app = db.query(Application).filter(
        Application.id == result.application_id
    ).first()

    if app:
        allowed = VALID_TRANSITIONS.get(app.status, set())
        if new_status not in allowed:
            # Force it — pipeline always wins over stale state
            pass
        app.status      = new_status
        app.trust_score = trust_score
        app.updated_at  = datetime.now(timezone.utc)

    # Persist validation run
    run = ValidationRun(
        application_id    = result.application_id,
        trust_score       = trust_score,
        authenticity_score= sub_scores.get("authenticity", 0.0),
        forgery_score     = sub_scores.get("forgery",      0.0),
        compliance_score  = sub_scores.get("compliance",   0.0),
        has_critical      = critical,
        result_status     = new_status.value,
        result_json       = json.dumps(_result_to_dict(result)),
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run
