"""
backend/api/reports.py
Endpoints for generating and downloading PDF reports.
"""
from __future__ import annotations

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.application import Application
from backend.models.document import Document
from backend.models.validation import ValidationRun
from backend.services.reports import build_clearance_package, build_deficiency_report

router = APIRouter(prefix="/reports", tags=["reports"])


def _get_app_vr_docs(app_id: str, db: Session):
    """Shared loader: raise 404 when entities are missing."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    vr = (
        db.query(ValidationRun)
        .filter(ValidationRun.application_id == app_id)
        .order_by(ValidationRun.ran_at.desc())
        .first()
    )
    if not vr:
        raise HTTPException(
            status_code=404, detail="No validation run found for this application"
        )

    docs: List[Document] = (
        db.query(Document).filter(Document.application_id == app_id).all()
    )
    return app, vr, docs


@router.post(
    "/clearance/{app_id}",
    summary="Generate Clearance Package PDF",
    response_class=Response,
    responses={
        200: {"content": {"application/pdf": {}}, "description": "PDF bytes"},
        404: {"description": "Application or validation run not found"},
        409: {"description": "Application is not CLEARED"},
    },
)
def generate_clearance(app_id: str, db: Session = Depends(get_db)):
    app, vr, docs = _get_app_vr_docs(app_id, db)
    if app.status.value != "CLEARED":
        raise HTTPException(
            status_code=409,
            detail=f"Application status is '{app.status.value}', not CLEARED",
        )
    pdf_bytes = build_clearance_package(app, vr, docs)
    filename = f"clearance_{app_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post(
    "/deficiency/{app_id}",
    summary="Generate Deficiency Report PDF",
    response_class=Response,
    responses={
        200: {"content": {"application/pdf": {}}, "description": "PDF bytes"},
        404: {"description": "Application or validation run not found"},
        409: {"description": "Application is not DEFICIENT"},
    },
)
def generate_deficiency(app_id: str, db: Session = Depends(get_db)):
    app, vr, docs = _get_app_vr_docs(app_id, db)
    if app.status.value != "DEFICIENT":
        raise HTTPException(
            status_code=409,
            detail=f"Application status is '{app.status.value}', not DEFICIENT",
        )
    pdf_bytes = build_deficiency_report(app, vr, docs)
    filename = f"deficiency_{app_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/list/{app_id}",
    summary="List available reports for an application",
)
def list_reports(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    available = []
    if app.status.value == "CLEARED":
        available.append(
            {
                "type": "clearance_package",
                "url": f"/reports/clearance/{app_id}",
                "description": "Official Clearance Package (PDF)",
            }
        )
    elif app.status.value == "DEFICIENT":
        available.append(
            {
                "type": "deficiency_report",
                "url": f"/reports/deficiency/{app_id}",
                "description": "Deficiency Report (PDF)",
            }
        )

    return {
        "application_id": app_id,
        "current_status": app.status.value,
        "available_reports": available,
    }
