"""
tests/test_p10_reports.py
P10 acceptance tests: PDF report generation endpoints.
WeasyPrint is mocked so tests pass without system dependencies (gobject/pango).
Isolation: uses an in-memory SQLite that is set ONLY for the duration of this
module's client fixture, then cleared so other test modules are not affected.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base, get_db
from backend.main import app

# ── Isolated in-memory SQLite ─────────────────────────────────────────────────
TEST_DB_FILE = "./test_p10_reports.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_FILE}"
engine_test = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine_test, autoflush=False, autocommit=False)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Fake PDF bytes ─────────────────────────────────────────────────────────────
FAKE_PDF = b"%PDF-1.4 FAKE-SAMPLE-REPORT"


# ── Module-scoped fixtures ────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def client():
    """
    Create test DB, override DI, yield client, then restore DI and clean up DB.
    """
    Base.metadata.create_all(bind=engine_test)
    app.dependency_overrides[get_db] = _override_get_db
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.pop(get_db, None)
        Base.metadata.drop_all(bind=engine_test)
        if os.path.exists(TEST_DB_FILE):
            os.remove(TEST_DB_FILE)


# ── DB helpers ────────────────────────────────────────────────────────────────

def _create_app(status: str = "SUBMITTED") -> str:
    """Insert an Application row directly and return its id."""
    from backend.models.application import Application, AppStatus
    from backend.services.id_generator import generate_application_id

    db = TestingSessionLocal()
    try:
        app_id = generate_application_id(db)
        form_data = json.dumps({
            "applicant_name": "SAMPLE Applicant",
            "application_type": "new_institution",
            "state": "SAMPLE State",
            "city": "SAMPLE City",
        })
        application = Application(
            id=app_id,
            institution_name="SAMPLE Institute of Technology",
            contact_email="sample@example.com",
            status=AppStatus(status),
            form_data_json=form_data,
        )
        db.add(application)
        db.commit()
        return app_id
    finally:
        db.close()


def _create_validation_run(app_id: str) -> None:
    """Insert a ValidationRun row for the given app."""
    from backend.models.validation import ValidationRun

    db = TestingSessionLocal()
    try:
        vr = ValidationRun(
            application_id=app_id,
            trust_score=0.82,
            authenticity_score=0.88,
            forgery_score=0.79,
            compliance_score=0.80,
            has_critical=False,
            result_status="CLEARED",
            result_json=json.dumps({
                "flags": ["SAMPLE: minor discrepancy in land area"],
            }),
            ran_at=datetime.now(timezone.utc),
        )
        db.add(vr)
        db.commit()
    finally:
        db.close()


def _force_status(app_id: str, new_status: str) -> None:
    """Directly update application status in the test DB."""
    from backend.models.application import Application, AppStatus

    db = TestingSessionLocal()
    try:
        application = db.query(Application).filter(Application.id == app_id).first()
        application.status = AppStatus(new_status)
        db.commit()
    finally:
        db.close()


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestReportsList:
    def test_list_no_reports_pending(self, client: TestClient):
        """A SUBMITTED application should return an empty available_reports list."""
        app_id = _create_app("SUBMITTED")
        resp = client.get(f"/reports/list/{app_id}")
        assert resp.status_code == 200
        body = resp.json()
        assert body["application_id"] == app_id
        assert body["available_reports"] == []

    def test_list_cleared_shows_clearance(self, client: TestClient):
        app_id = _create_app("CLEARED")
        resp = client.get(f"/reports/list/{app_id}")
        assert resp.status_code == 200
        types_ = [r["type"] for r in resp.json()["available_reports"]]
        assert "clearance_package" in types_

    def test_list_deficient_shows_deficiency(self, client: TestClient):
        app_id = _create_app("DEFICIENT")
        resp = client.get(f"/reports/list/{app_id}")
        assert resp.status_code == 200
        types_ = [r["type"] for r in resp.json()["available_reports"]]
        assert "deficiency_report" in types_

    def test_list_unknown_app_404(self, client: TestClient):
        resp = client.get("/reports/list/NONEXISTENT-APP-ID")
        assert resp.status_code == 404


class TestClearanceReport:
    def test_clearance_409_if_not_cleared(self, client: TestClient):
        """Should return 409 if application is SUBMITTED (not CLEARED)."""
        app_id = _create_app("SUBMITTED")
        _create_validation_run(app_id)
        resp = client.post(f"/reports/clearance/{app_id}")
        assert resp.status_code == 409

    def test_clearance_returns_pdf(self, client: TestClient):
        """Force CLEARED status then generate PDF — must get application/pdf back."""
        app_id = _create_app("CLEARED")
        _create_validation_run(app_id)

        with patch("backend.services.reports.WEASYPRINT_AVAILABLE", True), \
             patch("backend.services.reports.WeasyHTML") as mock_html:
            mock_instance = MagicMock()
            mock_instance.write_pdf.side_effect = lambda buf: buf.write(FAKE_PDF)
            mock_html.return_value = mock_instance

            resp = client.post(f"/reports/clearance/{app_id}")

        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert b"PDF" in resp.content

    def test_clearance_404_unknown_app(self, client: TestClient):
        resp = client.post("/reports/clearance/BAD-ID-XYZ")
        assert resp.status_code == 404

    def test_clearance_404_no_validation_run(self, client: TestClient):
        """CLEARED app with no ValidationRun should return 404."""
        app_id = _create_app("CLEARED")
        # Do NOT create a ValidationRun
        resp = client.post(f"/reports/clearance/{app_id}")
        assert resp.status_code == 404


class TestDeficiencyReport:
    def test_deficiency_returns_pdf(self, client: TestClient):
        """Force DEFICIENT status then generate PDF."""
        app_id = _create_app("DEFICIENT")
        _create_validation_run(app_id)

        with patch("backend.services.reports.WEASYPRINT_AVAILABLE", True), \
             patch("backend.services.reports.WeasyHTML") as mock_html:
            mock_instance = MagicMock()
            mock_instance.write_pdf.side_effect = lambda buf: buf.write(FAKE_PDF)
            mock_html.return_value = mock_instance

            resp = client.post(f"/reports/deficiency/{app_id}")

        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"

    def test_deficiency_409_if_not_deficient(self, client: TestClient):
        app_id = _create_app("SUBMITTED")
        _create_validation_run(app_id)
        resp = client.post(f"/reports/deficiency/{app_id}")
        assert resp.status_code == 409

    def test_deficiency_404_unknown_app(self, client: TestClient):
        resp = client.post("/reports/deficiency/BAD-ID-789")
        assert resp.status_code == 404
