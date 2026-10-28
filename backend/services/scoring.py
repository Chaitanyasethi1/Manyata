"""
Computes Trust Score and determines routing status.
All weights and thresholds come from config — never hardcoded here.
"""
from engine.contracts import ValidationResult, Severity, ModuleName
from backend.config import settings
from backend.models.application import AppStatus

def compute_trust_score(result: ValidationResult) -> float:
    """
    Weighted average of three module sub_scores.
    Returns float 0.0–100.0.
    If a module is missing, its score defaults to 0.
    """
    scores: dict[str, float] = {}
    for m in result.modules:
        scores[m.module.value] = m.sub_score

    trust = (
        settings.weight_authenticity * scores.get("authenticity", 0.0) +
        settings.weight_forgery      * scores.get("forgery",      0.0) +
        settings.weight_compliance   * scores.get("compliance",   0.0)
    )
    return round(trust, 2)

def has_critical_flag(result: ValidationResult) -> bool:
    """Returns True if ANY module has ANY critical severity flag."""
    for m in result.modules:
        for f in m.flags:
            if f.severity == Severity.CRITICAL:
                return True
    return False

def route(trust_score: float, critical: bool) -> AppStatus:
    """
    Applies routing rules and returns the new AppStatus.
    """
    # Critical flag caps the score
    effective_score = min(trust_score, settings.critical_cap) if critical else trust_score

    if effective_score >= settings.threshold_cleared:
        return AppStatus.CLEARED
    elif effective_score >= settings.threshold_under_review:
        return AppStatus.UNDER_REVIEW
    else:
        return AppStatus.DEFICIENT

def score_and_route(result: ValidationResult) -> tuple[float, AppStatus]:
    """
    Main entry point for scoring.
    Returns (trust_score, new_status).
    """
    trust_score = compute_trust_score(result)
    critical    = has_critical_flag(result)
    status      = route(trust_score, critical)
    return trust_score, status
