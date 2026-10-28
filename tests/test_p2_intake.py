"""
Acceptance tests for P2.
Run: python -m pytest tests/test_p2_intake.py -v
All 8 tests must pass before moving to P3.
"""
import io
import pytest
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

SAMPLE_PDF = b"%PDF-1.4 1 0 obj<</Type/Catalog>>endobj"  # minimal fake PDF

def _make_file(name="land_deed.pdf", content=SAMPLE_PDF):
    return ("documents", (name, io.BytesIO(content), "application/pdf"))

def _submit(**kwargs):
    data = {
        "institution_name": kwargs.get("institution_name", "SAMPLE TRUST"),
        "contact_email":    kwargs.get("contact_email", "test@sample.edu"),
    }
    files = kwargs.get("files", [_make_file()])
    return client.post("/api/v1/applications", data=data, files=files)


def test_submit_returns_201():
    r = _submit()
    assert r.status_code == 201

def test_application_id_format():
    r = _submit()
    aid = r.json()["application_id"]
    import re
    assert re.match(r"AICTE-2026-\d{4}", aid)

def test_status_is_submitted():
    r = _submit()
    assert r.json()["status"] == "SUBMITTED"

def test_sequential_ids():
    id1 = _submit().json()["application_id"]
    id2 = _submit().json()["application_id"]
    n1 = int(id1.split("-")[-1])
    n2 = int(id2.split("-")[-1])
    assert n2 == n1 + 1

def test_get_application_returns_data():
    aid = _submit().json()["application_id"]
    r = client.get(f"/api/v1/applications/{aid}")
    assert r.status_code == 200
    assert r.json()["application_id"] == aid

def test_get_missing_application_returns_404():
    r = client.get("/api/v1/applications/AICTE-2026-9999")
    assert r.status_code == 404

def test_missing_mandatory_docs_warning():
    # Upload only land deed — should warn about 3 missing types
    r = _submit(files=[_make_file("land_deed.pdf")])
    assert r.status_code == 201
    assert len(r.json()["missing_mandatory_documents"]) == 3

def test_invalid_mime_type_rejected():
    files = [("documents", ("bad.exe", io.BytesIO(b"MZ"), "application/octet-stream"))]
    r = _submit(files=files)
    assert r.status_code == 400
