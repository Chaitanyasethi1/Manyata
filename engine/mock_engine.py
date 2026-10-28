"""
Mock implementation. Returns a deterministic CLEARED result.
Member A will replace this with the real pipeline in later parts.
Do NOT import anything from backend/.
"""
from pathlib import Path
from engine.contracts import (
    ValidationResult, ExtractionResult,
    ModuleResult, ModuleName, Flag, Severity, Evidence
)

def run_validation(application_dir: str, form_data: dict) -> ValidationResult:
    """
    Signature is the contract. Do not change parameter names or return type.

    application_dir : absolute path to the folder containing uploaded docs
    form_data       : dict parsed from the uploaded application form
    returns         : ValidationResult
    """
    app_id = form_data.get("application_id", "AICTE-2026-MOCK")

    extraction = [
        ExtractionResult(
            doc_type="land_deed",
            fields={"area_sqft": 5000, "owner": "SAMPLE TRUST"},
            confidence=0.95,
        ),
        ExtractionResult(
            doc_type="trust_certificate",
            fields={"name": "SAMPLE TRUST", "reg_no": "REG-SAMPLE-001"},
            confidence=0.92,
        ),
    ]

    modules = [
        ModuleResult(
            module=ModuleName.AUTHENTICITY,
            sub_score=90.0,
            flags=[
                Flag(
                    id="AUTH_001",
                    severity=Severity.LOW,
                    message="Mock: minor metadata inconsistency (sample flag)",
                    document="land_deed",
                    evidence=Evidence(page=1),
                    clause=None,
                )
            ],
        ),
        ModuleResult(
            module=ModuleName.FORGERY,
            sub_score=95.0,
            flags=[],
        ),
        ModuleResult(
            module=ModuleName.COMPLIANCE,
            sub_score=88.0,
            flags=[],
        ),
    ]

    return ValidationResult(
        application_id=app_id,
        extraction=extraction,
        modules=modules,
    )
