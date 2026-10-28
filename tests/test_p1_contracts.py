"""
Acceptance tests for P1.
Run: python -m pytest tests/test_p1_contracts.py -v
All 5 tests must pass before moving to P2.
"""
import pytest
from engine import run_validation
from engine.contracts import (
    ValidationResult, ModuleName, Severity
)

SAMPLE_FORM = {"application_id": "AICTE-2026-TEST"}
SAMPLE_DIR  = "/tmp"   # mock ignores this

def test_run_validation_returns_correct_type():
    result = run_validation(SAMPLE_DIR, SAMPLE_FORM)
    assert isinstance(result, ValidationResult)

def test_application_id_passed_through():
    result = run_validation(SAMPLE_DIR, SAMPLE_FORM)
    assert result.application_id == "AICTE-2026-TEST"

def test_three_modules_present():
    result = run_validation(SAMPLE_DIR, SAMPLE_FORM)
    names = {m.module for m in result.modules}
    assert names == {ModuleName.AUTHENTICITY, ModuleName.FORGERY, ModuleName.COMPLIANCE}

def test_sub_scores_in_range():
    result = run_validation(SAMPLE_DIR, SAMPLE_FORM)
    for m in result.modules:
        assert 0.0 <= m.sub_score <= 100.0

def test_flags_have_valid_severity():
    result = run_validation(SAMPLE_DIR, SAMPLE_FORM)
    valid = {s.value for s in Severity}
    for m in result.modules:
        for f in m.flags:
            assert f.severity.value in valid
