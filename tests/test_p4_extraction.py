"""
Acceptance tests for P4.
Run: python -m pytest tests/test_p4_extraction.py -v
All 8 tests must pass before moving to P5.

NOTE: These tests require dataset/apps/ to exist (run P3 first).
      They also require tesseract + poppler to be installed.
"""
import pytest
from pathlib import Path
from engine.extraction import extract_documents, extract_document
from engine.contracts import ExtractionResult

APPS = Path("dataset/apps")

@pytest.fixture(scope="session")
def ensure_dataset():
    if not (APPS / "app_01").exists():
        pytest.skip("Dataset not generated — run P3 first.")

def test_extract_document_returns_correct_type(ensure_dataset):
    fpath = str(APPS / "app_01" / "land_deed.pdf")
    result = extract_document(fpath)
    assert isinstance(result, ExtractionResult)

def test_land_deed_classified_correctly(ensure_dataset):
    result = extract_document(str(APPS / "app_01" / "land_deed.pdf"))
    assert result.doc_type == "land_deed"

def test_fire_noc_classified_correctly(ensure_dataset):
    result = extract_document(str(APPS / "app_01" / "fire_noc.pdf"))
    assert result.doc_type == "fire_noc"

def test_trust_cert_classified_correctly(ensure_dataset):
    result = extract_document(str(APPS / "app_01" / "trust_certificate.pdf"))
    assert result.doc_type == "trust_certificate"

def test_faculty_list_classified_correctly(ensure_dataset):
    result = extract_document(str(APPS / "app_01" / "faculty_list.pdf"))
    assert result.doc_type == "faculty_list"

def test_confidence_between_0_and_1(ensure_dataset):
    result = extract_document(str(APPS / "app_01" / "land_deed.pdf"))
    assert 0.0 <= result.confidence <= 1.0

def test_extract_documents_returns_four_results(ensure_dataset):
    results = extract_documents(str(APPS / "app_01"))
    pdf_results = [r for r in results if r.doc_type != "unknown"]
    assert len(pdf_results) >= 4

def test_app_04_faculty_total_extracted(ensure_dataset):
    """OCR must extract total_faculty=45 from the doc (form says 30 — mismatch)."""
    result = extract_document(str(APPS / "app_04" / "faculty_list.pdf"))
    assert result.fields.get("total_faculty") == 45
