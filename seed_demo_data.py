"""
Seeds the SIH2026 database with demo applications app_01 to app_05,
copies their documents to uploads/, and executes validation runs
so all 3 dashboards show live, realistic, working data.
"""
import os
import shutil
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta

from backend.database import SessionLocal, Base, engine as db_engine
from backend.models.application import Application, AppStatus
from backend.models.document import Document, DocType
from backend.models.validation import ValidationRun
from backend.models.alert import Alert, AlertType
from backend.models.audit import AuditLog
from backend.services.pipeline import run_pipeline

DEMO_APPS = [
    {
        "id": "AICTE-2026-0001",
        "name": "Greenfield Institute of Technology",
        "email": "principal@greenfield.edu.in",
        "folder": "app_01",
        "city": "Bengaluru",
        "state": "Karnataka",
        "type": "Engineering",
    },
    {
        "id": "AICTE-2026-0002",
        "name": "Apex College of Engineering",
        "email": "contact@apexengg.ac.in",
        "folder": "app_02",
        "city": "Satna",
        "state": "Madhya Pradesh",
        "type": "Engineering",
    },
    {
        "id": "AICTE-2026-0003",
        "name": "National Polytechnic Institute",
        "email": "admin@nationalpoly.org",
        "folder": "app_03",
        "city": "Jaipur",
        "state": "Rajasthan",
        "type": "Diploma",
    },
    {
        "id": "AICTE-2026-0004",
        "name": "Horizon Institute of Management",
        "email": "director@horizonmba.edu",
        "folder": "app_04",
        "city": "Pune",
        "state": "Maharashtra",
        "type": "Management",
    },
    {
        "id": "AICTE-2026-0005",
        "name": "Starlight College of Pharmacy",
        "email": "info@starlightpharm.ac.in",
        "folder": "app_05",
        "city": "Lucknow",
        "state": "Uttar Pradesh",
        "type": "Pharmacy",
    },
]

def seed():
    Base.metadata.create_all(bind=db_engine)
    db = SessionLocal()

    # Clear previous seed
    db.query(Alert).delete()
    db.query(AuditLog).delete()
    db.query(ValidationRun).delete()
    db.query(Document).delete()
    db.query(Application).delete()
    db.commit()

    uploads_root = Path("uploads")
    uploads_root.mkdir(parents=True, exist_ok=True)

    dataset_root = Path("dataset/applications")

    for item in DEMO_APPS:
        app_id = item["id"]
        app_upload_dir = uploads_root / app_id
        app_upload_dir.mkdir(parents=True, exist_ok=True)

        source_dir = dataset_root / item["folder"]
        form_data = {}

        if source_dir.exists():
            form_file = source_dir / "form.json"
            if form_file.exists():
                with open(form_file, "r", encoding="utf-8") as f:
                    form_data = json.load(f)

            # Copy pdf files into uploads/<app_id>
            for f in source_dir.iterdir():
                if f.is_file() and f.suffix.lower() == ".pdf":
                    dest = app_upload_dir / f.name
                    shutil.copy2(f, dest)

        form_data["application_id"] = app_id
        form_data["institution_name"] = item["name"]
        form_data["city"] = item["city"]
        form_data["state"] = item["state"]
        form_data["institution_type"] = item["type"]

        app_obj = Application(
            id=app_id,
            institution_name=item["name"],
            contact_email=item["email"],
            status=AppStatus.SUBMITTED,
            form_data_json=json.dumps(form_data),
            created_at=datetime.now(timezone.utc) - timedelta(hours=2),
            updated_at=datetime.now(timezone.utc) - timedelta(hours=2),
        )
        db.add(app_obj)

        # Add documents
        for pdf_file in app_upload_dir.glob("*.pdf"):
            fname = pdf_file.name.lower()
            if "land" in fname:
                dtype = DocType.LAND_DEED
            elif "trust" in fname or "cert" in fname:
                dtype = DocType.TRUST_CERTIFICATE
            elif "faculty" in fname:
                dtype = DocType.FACULTY_LIST
            elif "fire" in fname or "noc" in fname:
                dtype = DocType.FIRE_NOC
            else:
                dtype = DocType.UNKNOWN

            doc_obj = Document(
                application_id=app_id,
                doc_type=dtype,
                original_name=pdf_file.name,
                stored_path=str(pdf_file),
                sha256="dummy_sha256_" + pdf_file.stem,
                file_size_bytes=pdf_file.stat().st_size,
                mime_type="application/pdf",
            )
            db.add(doc_obj)

        db.commit()

        # Run pipeline
        print(f"Executing validation pipeline for {app_id} ({item['name']})...")
        run_pipeline(app_id)

    # Add realistic alerts
    alerts_data = [
        (
            "AICTE-2026-0002",
            AlertType.CRITICAL_FLAG,
            "Possible tampering detected in land deed: Area digits modified.",
        ),
        (
            "AICTE-2026-0005",
            AlertType.CRITICAL_FLAG,
            "Seal copy-paste tampering detected: Fire Dept seal duplicated onto land deed.",
        ),
        (
            "AICTE-2026-0003",
            AlertType.DOCUMENT_EXPIRY,
            "Fire Safety NOC is expired beyond grace period.",
        ),
        (
            "AICTE-2026-0004",
            AlertType.CRITICAL_FLAG,
            "Student-Faculty Ratio (29.5:1) exceeds AICTE Handbook max norm (20:1).",
        ),
        (
            "AICTE-2026-0001",
            AlertType.REVIEW_SLA_BREACH,
            "Application review deadline approaching within 3 hours.",
        ),
    ]

    for app_id, atype, msg in alerts_data:
        alt = Alert(
            application_id=app_id,
            alert_type=atype,
            message=msg,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=15),
        )
        db.add(alt)

    db.commit()
    db.close()
    print("Database successfully seeded with 5 live demo applications, validation runs, and alerts!")

if __name__ == "__main__":
    seed()
