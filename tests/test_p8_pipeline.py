"""
Acceptance tests for P8.
Run: python -m pytest tests/test_p8_pipeline.py -v
All 8 tests must pass before moving to P9.
"""
import io, time, pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, engine

@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)
PDF = b"%PDF-1.4 1 0 obj<</Type/Catalog>>endobj"

def _submit():
    files = [
        ("documents", ("land_deed.pdf",        io.BytesIO(PDF), "application/pdf")),
        ("documents", ("trust_certificate.pdf", io.BytesIO(PDF), "application/pdf")),
        ("documents", ("faculty_list.pdf",      io.BytesIO(PDF), "application/pdf")),
        ("documents", ("fire_noc.pdf",          io.BytesIO(PDF), "application/pdf")),
    ]
    r = client.post("/api/v1/applications", data={
        "institution_name": "SAMPLE TRUST",
        "contact_email":    "test@sample.edu",
    }, files=files)
    assert r.status_code == 201
    return r.json()["application_id"]

def _trigger(app_id):
    return client.post(f"/api/v1/applications/{app_id}/trigger")

def _result(app_id):
    return client.get(f"/api/v1/applications/{app_id}/result")

# ── basic flow ────────────────────────────────────────────────────────────────

def test_trigger_returns_202():
    aid = _submit()
    r = _trigger(aid)
    assert r.status_code == 202

def test_trigger_unknown_app_returns_404():
    r = _trigger("AICTE-2026-9999")
    assert r.status_code == 404

def test_cannot_trigger_twice():
    aid = _submit()
    _trigger(aid)
    time.sleep(0.3)   # let background task run
    r = _trigger(aid)
    assert r.status_code == 409

def test_result_available_after_trigger():
    aid = _submit()
    _trigger(aid)
    time.sleep(0.5)
    r = _result(aid)
    assert r.status_code == 200

def test_result_has_trust_score():
    aid = _submit()
    _trigger(aid)
    time.sleep(0.5)
    data = _result(aid).json()
    assert "trust_score" in data
    assert 0.0 <= data["trust_score"] <= 100.0

def test_result_has_three_module_scores():
    aid = _submit()
    _trigger(aid)
    time.sleep(0.5)
    data = _result(aid).json()
    assert "authenticity_score" in data
    assert "forgery_score"      in data
    assert "compliance_score"   in data

def test_status_updated_after_pipeline():
    aid = _submit()
    _trigger(aid)
    time.sleep(0.5)
    r = client.get(f"/api/v1/applications/{aid}")
    status = r.json()["status"]
    assert status in {"CLEARED", "UNDER_REVIEW", "DEFICIENT"}

def test_no_result_before_trigger():
    aid = _submit()
    r = _result(aid)
    assert r.status_code == 404
