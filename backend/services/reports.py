"""
backend/services/reports.py
Renders Jinja2 HTML templates and converts to PDF via WeasyPrint.
"""
from __future__ import annotations

import io
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from jinja2 import Environment, FileSystemLoader, select_autoescape

try:
    from weasyprint import HTML as WeasyHTML  # type: ignore
    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError):  # OSError when system libs (pango/gobject) are missing
    WeasyHTML = None  # type: ignore
    WEASYPRINT_AVAILABLE = False

TEMPLATES_DIR = Path("reports/templates")


def _jinja_env() -> Environment:
    return Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html"]),
    )


def _render_html(template_name: str, context: Dict[str, Any]) -> str:
    env = _jinja_env()
    tmpl = env.get_template(template_name)
    return tmpl.render(**context)


def _html_to_pdf(html_string: str) -> bytes:
    if not WEASYPRINT_AVAILABLE:
        raise RuntimeError(
            "WeasyPrint is not installed or its system dependencies are missing. "
            "Run: pip install weasyprint  (and ensure pango/gobject are available)"
        )
    buf = io.BytesIO()
    WeasyHTML(string=html_string).write_pdf(buf)
    return buf.getvalue()


def _app_context(app: Any, vr: Any) -> Dict[str, Any]:
    """Build a template-friendly dict from the ORM objects."""
    form_data: Dict[str, Any] = {}
    try:
        form_data = json.loads(app.form_data_json or "{}")
    except (json.JSONDecodeError, AttributeError):
        pass

    result: Dict[str, Any] = {}
    try:
        result = json.loads(vr.result_json or "{}")
    except (json.JSONDecodeError, AttributeError):
        pass

    # Build a sub_scores dict from ValidationRun columns
    sub_scores = {
        "authenticity": getattr(vr, "authenticity_score", 0.0),
        "forgery":      getattr(vr, "forgery_score", 0.0),
        "compliance":   getattr(vr, "compliance_score", 0.0),
    }

    flags = result.get("flags", [])
    officer_comment = getattr(app, "officer_comment", None)
    created_at_raw = getattr(vr, "ran_at", None)
    created_at = (
        created_at_raw.isoformat() if created_at_raw else "N/A"
    )

    return {
        "app_id":           app.id,
        "institution_name": app.institution_name,
        "applicant_name":   form_data.get("applicant_name", "—"),
        "application_type": form_data.get("application_type", "—"),
        "submitted_at":     getattr(app, "created_at", "N/A"),
        "form_data":        form_data,
        "trust_score":      getattr(vr, "trust_score", 0.0),
        "sub_scores":       sub_scores,
        "flags":            flags,
        "officer_comment":  officer_comment,
        "created_at":       created_at,
        "status":           app.status.value,
    }


def _docs_context(docs: List[Any]) -> List[Dict[str, Any]]:
    return [
        {
            "doc_type": getattr(d, "doc_type").value if hasattr(d, "doc_type") else "—",
            "filename": getattr(d, "original_name", "—"),
            "status":   "uploaded",
        }
        for d in docs
    ]


# ── Public helpers ────────────────────────────────────────────────────────────

def build_clearance_package(app: Any, vr: Any, docs: List[Any]) -> bytes:
    """Return PDF bytes for a Clearance Package report."""
    ctx = _app_context(app, vr)
    context = {
        **ctx,
        "docs": _docs_context(docs),
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    html = _render_html("clearance_package.html", context)
    return _html_to_pdf(html)


def build_deficiency_report(app: Any, vr: Any, docs: List[Any]) -> bytes:
    """Return PDF bytes for a Deficiency Report."""
    ctx = _app_context(app, vr)
    context = {
        **ctx,
        "docs": _docs_context(docs),
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    html = _render_html("deficiency_report.html", context)
    return _html_to_pdf(html)
