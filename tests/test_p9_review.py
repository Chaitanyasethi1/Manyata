"""
Acceptance tests for P9.
Run: python -m pytest tests/test_p9_review.py -v
All 10 tests must pass before moving to P10.
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
    files = [("documents", ("land_deed.pdf", io.BytesIO(PDF), "application/pdf"))]
    r = client.post("/api/v1/applications", data={
        "institution_name": "SAMPLE TRUST",
        "contact_email": "test@sample.edu",
    }, files=files)
    return r.json()["application_id"]

def _trigger_and_wait(app_id, wait=0.5):
    client.post(f"/api/v1/applications/{app_id}/trigger")
    time.sleep(wait)

def _force_under_review(app_id):
    """Pipeline mock may return CLEARED — force UNDER_REVIEW for review tests."""
    from backend.database import SessionLocal
    from backend.models.application import Application, AppStatus
    from datetime import datetime, timezone
    db = SessionLocal()
    app = db.query(Application).filter(Application.id == app_id).first()
    if app:
        app.status = AppStatus.UNDER_REVIEW
        app.updated_at = datetime.now(timezone.utc)
        db.commit()
    db.close()

def _review(app_id, decision, comment=None, officer="officer:demo"):
    return client.post(f"/api/v1/applications/{app_id}/review", json={
        "decision": decision,
        "comment": comment,
        "officer_id": officer,
    })

# ── review decisions ──────────────────────────────────────────────────────────

def test_confirm_clear():
    aid = _submit()
    _trigger_and_wait(aid)
    _force_under_review(aid)
    r = _review(aid, "CONFIRM_CLEAR")
    assert r.status_code == 200
    assert r.json()["new_status"] == "CLEARED"

def test_return_deficient_with_comment():
    aid = _submit()
    _trigger_and_wait(aid)
    _force_under_review(aid)
    r = _review(aid, "RETURN_DEFICIENT", comment="Land deed area mismatch.")
    assert r.status_code == 200
    assert r.json()["new_status"] == "DEFICIENT"

def test_return_deficient_without_comment_fails():
    aid = _submit()
    _trigger_and_wait(aid)
    _force_under_review(aid)
    r = _review(aid, "RETURN_DEFICIENT", comment=None)
    assert r.status_code == 422

def test_ask_for_info_requires_comment():
    aid = _submit()
    _trigger_and_wait(aid)
    _force_under_review(aid)
    r = _review(aid, "ASK_FOR_INFO", comment=None)
    assert r.status_code == 422

def test_ask_for_info_status_unchanged():
    aid = _submit()
    _trigger_and_wait(aid)
    _force_under_review(aid)
    r = _review(aid, "ASK_FOR_INFO", comment="Please provide updated NOC.")
    assert r.status_code == 200
    assert r.json()["new_status"] == "UNDER_REVIEW"

def test_review_non_under_review_fails():
    aid = _submit()   # status = SUBMITTED
    r = _review(aid, "CONFIRM_CLEAR")
    assert r.status_code == 409

def test_invalid_decision_fails():
    aid = _submit()
    r = _review(aid, "INVALID_DECISION")
    assert r.status_code in {400, 409}

# ── audit log ─────────────────────────────────────────────────────────────────

def test_audit_log_records_decision():
    aid = _submit()
    _trigger_and_wait(aid)
    _force_under_review(aid)
    _review(aid, "CONFIRM_CLEAR", comment="All good.")
    r = client.get(f"/api/v1/applications/{aid}/audit")
    assert r.status_code == 200
    actions = [e["action"] for e in r.json()]
    assert "OFFICER_CONFIRM_CLEAR" in actions

# ── alerts ────────────────────────────────────────────────────────────────────

def test_alerts_endpoint_returns_list():
    r = client.get("/api/v1/alerts")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_mark_alert_read():
    from backend.database import SessionLocal
    from backend.models.alert import Alert, AlertType
    db = SessionLocal()
    alert = Alert(
        application_id="AICTE-2026-0001",
        alert_type=AlertType.CRITICAL_FLAG,
        message="Test alert"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    alert_id = alert.id
    db.close()

    r = client.patch(f"/api/v1/alerts/{alert_id}/read")
    assert r.status_code == 200
    assert r.json()["is_read"] == True
