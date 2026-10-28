"""
Intake API — Phase 1 of the pipeline.

Endpoints:
  POST /api/v1/applications          — submit new application + documents
  GET  /api/v1/applications/{app_id} — get status + document list
  GET  /api/v1/applications          — list all (for dashboard, no auth yet)
"""
from __future__ import annotations
import json
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Application, AppStatus, Document, DocType, MANDATORY_DOCS
from backend.services import save_upload, generate_application_id

router = APIRouter(prefix="/api/v1", tags=["intake"])


# ── helpers ──────────────────────────────────────────────────────────────────

def _doc_type_from_name(filename: str) -> DocType:
    """Best-effort type detection from filename. Engine will refine later."""
    name = filename.lower()
    if "land" in name or "deed" in name:
        return DocType.LAND_DEED
    if "trust" in name or "society" in name or "cert" in name:
        return DocType.TRUST_CERTIFICATE
    if "faculty" in name or "staff" in name:
        return DocType.FACULTY_LIST
    if "fire" in name or "noc" in name or "safety" in name:
        return DocType.FIRE_NOC
    return DocType.UNKNOWN


def _check_mandatory_docs(doc_types: list[DocType]) -> list[str]:
    """Returns list of missing mandatory doc type names."""
    present = set(doc_types)
    missing = MANDATORY_DOCS - present
    return [d.value for d in missing]


# ── endpoints ────────────────────────────────────────────────────────────────

@router.post("/applications", status_code=201)
async def submit_application(
    institution_name: str = Form(...),
    contact_email:    str = Form(...),
    form_data:        str = Form("{}"),      # JSON string of extra form fields
    documents: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """
    Accepts multipart/form-data with:
      - institution_name (str)
      - contact_email    (str)
      - form_data        (JSON string, optional extra fields)
      - documents        (one or more files: PDF/JPEG/PNG/TIFF, max 10 MB each)

    Returns Application ID, status, and any missing-document warnings.
    """
    if not documents:
        raise HTTPException(status_code=400, detail="At least one document is required.")

    app_id = generate_application_id(db)

    # Save all files
    saved_docs = []
    for upload in documents:
        meta = await save_upload(upload, app_id)
        doc_type = _doc_type_from_name(upload.filename)
        saved_docs.append(
            Document(
                application_id=app_id,
                doc_type=doc_type,
                original_name=upload.filename,
                stored_path=meta["stored_path"],
                sha256=meta["sha256"],
                file_size_bytes=meta["file_size_bytes"],
                mime_type=meta["mime_type"],
            )
        )

    # Mandatory-document completeness check
    uploaded_types = [d.doc_type for d in saved_docs]
    missing = _check_mandatory_docs(uploaded_types)

    # Parse extra form_data JSON
    try:
        extra = json.loads(form_data)
    except json.JSONDecodeError:
        extra = {}
    extra["application_id"] = app_id

    # Persist application
    application = Application(
        id=app_id,
        institution_name=institution_name,
        contact_email=contact_email,
        status=AppStatus.SUBMITTED,
        form_data_json=json.dumps(extra),
    )
    db.add(application)
    for doc in saved_docs:
        db.add(doc)
    db.commit()
    db.refresh(application)

    return JSONResponse(
        status_code=201,
        content={
            "application_id": app_id,
            "status": application.status.value,
            "documents_received": len(saved_docs),
            "missing_mandatory_documents": missing,
            "warnings": (
                [f"Missing mandatory documents: {', '.join(missing)}"]
                if missing else []
            ),
        },
    )


@router.get("/applications/{app_id}")
def get_application(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found.")
    docs = db.query(Document).filter(Document.application_id == app_id).all()
    return {
        "application_id": app.id,
        "institution_name": app.institution_name,
        "contact_email": app.contact_email,
        "status": app.status.value,
        "trust_score": app.trust_score,
        "created_at": app.created_at.isoformat(),
        "updated_at": app.updated_at.isoformat(),
        "documents": [
            {
                "id": d.id,
                "doc_type": d.doc_type.value,
                "original_name": d.original_name,
                "sha256": d.sha256,
                "file_size_bytes": d.file_size_bytes,
                "mime_type": d.mime_type,
                "uploaded_at": d.uploaded_at.isoformat(),
            }
            for d in docs
        ],
    }


@router.get("/applications")
def list_applications(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Application)
    if status:
        try:
            q = q.filter(Application.status == AppStatus(status.upper()))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    apps = q.order_by(Application.created_at.desc()).all()
    return [
        {
            "application_id": a.id,
            "institution_name": a.institution_name,
            "status": a.status.value,
            "trust_score": a.trust_score,
            "created_at": a.created_at.isoformat(),
            "updated_at": a.updated_at.isoformat() if a.updated_at else a.created_at.isoformat(),
            "form_data": json.loads(a.form_data_json or "{}"),
        }
        for a in apps
    ]


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """
    Aggregated stats for Admin dashboard KPIs.
    Returns counts per status and average trust score.
    """
    from sqlalchemy import func
    from backend.models.application import Application, AppStatus

    total = db.query(Application).count()

    counts = {}
    for status in AppStatus:
        counts[status.value] = db.query(Application).filter(
            Application.status == status
        ).count()

    avg_score = db.query(func.avg(Application.trust_score)).scalar()

    return {
        "total":        total,
        "by_status":    counts,
        "avg_trust_score": round(float(avg_score), 1) if avg_score else None,
    }

