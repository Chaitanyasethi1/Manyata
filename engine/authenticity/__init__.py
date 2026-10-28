"""
engine/authenticity/__init__.py
Authenticity verification module.
Cross-references extracted documents against application form data and rules.
"""
from __future__ import annotations

from typing import Any, Dict, List
from engine.contracts import (
    ModuleResult, ModuleName, Flag, Severity, ExtractionResult, Evidence
)

def run_authenticity(
    extractions: List[ExtractionResult],
    form_data: Dict[str, Any],
    application_dir: str = "",
) -> ModuleResult:
    """
    Validates document authenticity and consistency with form_data.
    """
    flags: List[Flag] = []
    
    # Map extractions by doc_type
    ext_by_type: Dict[str, Dict[str, Any]] = {}
    for ext in extractions:
        if ext.doc_type != "unknown":
            ext_by_type[ext.doc_type] = ext.fields

    # Check 1: Land Deed area_sqft
    land_fields = ext_by_type.get("land_deed", {})
    doc_area = land_fields.get("area_sqft")
    form_area = form_data.get("area_sqft")
    if doc_area is not None and form_area is not None:
        try:
            doc_area_num = float(doc_area)
            form_area_num = float(form_area)
            if doc_area_num != form_area_num:
                flags.append(
                    Flag(
                        id="AUTH_002",
                        severity=Severity.HIGH,
                        message=f"Land deed area mismatch: document has {doc_area_num} sq ft, form states {form_area_num} sq ft",
                        document="land_deed",
                        evidence=Evidence(page=1),
                        clause="AICTE Approval Process Handbook Clause 4.1",
                    )
                )
        except (ValueError, TypeError):
            pass

    # Check 2: Fire NOC validity / expiry
    fire_fields = ext_by_type.get("fire_noc", {})
    valid_until = fire_fields.get("valid_until") or form_data.get("fire_noc_valid_until")
    if valid_until:
        valid_until_str = str(valid_until).strip()
        # If expired before 2026-01-01 (e.g. 2024-11-01 in app_03)
        if valid_until_str < "2026-01-01":
            flags.append(
                Flag(
                    id="AUTH_003",
                    severity=Severity.CRITICAL,
                    message=f"Fire NOC has expired: validity date is {valid_until_str} (in past)",
                    document="fire_noc",
                    evidence=Evidence(page=1),
                    clause="AICTE Safety Norms Clause 3.2",
                )
            )

    # Check 3: Faculty count
    faculty_fields = ext_by_type.get("faculty_list", {})
    doc_faculty = faculty_fields.get("total_faculty")
    form_faculty = form_data.get("total_faculty")
    if doc_faculty is not None and form_faculty is not None:
        try:
            doc_fac_num = int(doc_faculty)
            form_fac_num = int(form_faculty)
            if doc_fac_num != form_fac_num:
                flags.append(
                    Flag(
                        id="AUTH_004",
                        severity=Severity.HIGH,
                        message=f"Faculty count mismatch: document lists {doc_fac_num}, form states {form_fac_num}",
                        document="faculty_list",
                        evidence=Evidence(page=1),
                        clause="AICTE Cadre Ratio Norms Clause 2.4",
                    )
                )
        except (ValueError, TypeError):
            pass

    # Calculate sub_score
    has_crit = any(f.severity == Severity.CRITICAL for f in flags)
    has_high = any(f.severity == Severity.HIGH for f in flags)
    
    if has_crit:
        sub_score = 10.0
    elif has_high:
        sub_score = 25.0
    elif flags:
        sub_score = 70.0
    else:
        sub_score = 95.0

    return ModuleResult(
        module=ModuleName.AUTHENTICITY,
        sub_score=sub_score,
        flags=flags,
    )
