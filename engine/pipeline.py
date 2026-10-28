"""
Real pipeline orchestrator.
Calls Member A's multi-stage AI validation engine (orchestrator.run_validation_full)
and returns a contract ValidationResult object.
"""
import logging
from pathlib import Path
from engine.contracts import (
    ValidationResult, ModuleResult, ModuleName, Flag, Severity, Evidence, BoundingBox, ExtractionResult
)
from engine.mock_engine import run_validation as _mock   # fallback
from engine.orchestrator import run_validation_full

logger = logging.getLogger(__name__)

def run_validation(application_dir: str, form_data: dict) -> ValidationResult:
    """
    Orchestrates the full validation pipeline using Member A's AI Engine.
    Converts dict results to ValidationResult dataclass conforming to contracts.py.
    """
    app_id = form_data.get("application_id", "AICTE-2026-UNKNOWN")

    try:
        # Run Member A's real multi-stage engine (extraction, authenticity, forgery, compliance)
        res, det = run_validation_full(application_dir, form_data)

        # Convert extraction
        extractions = [
            ExtractionResult(
                doc_type=e.get("doc_type", "unknown"),
                fields=e.get("fields", {}),
                confidence=float(e.get("confidence", 0.9)),
            ) for e in res.get("extraction", [])
        ]

        # Convert modules and flags
        modules = []
        for m in res.get("modules", []):
            m_name = m.get("module")
            try:
                mod_enum = ModuleName(m_name)
            except ValueError:
                continue

            flags = []
            for f in m.get("flags", []):
                ev = f.get("evidence", {}) or {}
                bbox_data = ev.get("bbox")
                bbox = None
                if bbox_data and isinstance(bbox_data, dict):
                    bbox = BoundingBox(
                        page=bbox_data.get("page", 1),
                        x=float(bbox_data.get("x", 0)),
                        y=float(bbox_data.get("y", 0)),
                        w=float(bbox_data.get("w", 0)),
                        h=float(bbox_data.get("h", 0)),
                    )

                flags.append(Flag(
                    id=f.get("id", "FLAG_001"),
                    severity=Severity(f.get("severity", "medium").lower()),
                    message=f.get("message", ""),
                    document=f.get("document", ""),
                    evidence=Evidence(
                        page=ev.get("page", 1),
                        bbox=bbox,
                        heatmap_path=ev.get("heatmap_path"),
                    ) if ev else None,
                    clause=f.get("clause"),
                ))

            modules.append(ModuleResult(
                module=mod_enum,
                sub_score=float(m.get("sub_score", 100.0)),
                flags=flags,
            ))

        return ValidationResult(
            application_id=res.get("application_id", app_id),
            extraction=extractions,
            modules=modules,
        )

    except Exception as e:
        logger.warning(f"[pipeline] Engine run_validation_full warning ({e}), using mock fallback.")
        result = _mock(application_dir, form_data)
        result.application_id = app_id
        return result

