"""Public API for document and application bundle extraction."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import numpy as np

from .classify import classify_document
from .confidence import (
    ALL_FIELDS,
    LOW_CONF_THRESHOLD,
    REQUIRED_FIELDS,
    compute_document_confidence,
)
from .fields import (
    extract_faculty_list_fields,
    extract_fire_noc_fields,
    extract_land_deed_fields,
    extract_trust_cert_fields,
)
from .loader import load_pages
from .ocr import run_ocr
from .preprocess import preprocess

SLOT_FILENAMES = {
    "land_deed": ["land_deed.pdf", "land_deed.jpg", "land_deed.png"],
    "trust_cert": ["trust_cert.pdf", "trust_cert.jpg", "trust_cert.png"],
    "faculty_list": ["faculty_list.pdf", "faculty_list.jpg", "faculty_list.png"],
    "fire_noc": ["fire_noc.pdf", "fire_noc.jpg", "fire_noc.png"],
}

DOC_EXTRACTORS = {
    "land_deed": extract_land_deed_fields,
    "trust_cert": extract_trust_cert_fields,
    "faculty_list": extract_faculty_list_fields,
    "fire_noc": extract_fire_noc_fields,
}


class DocResult(dict):
    """Extraction result for a single document, accessible as dict or attributes."""

    def __init__(self, doc_type: str, fields: Dict[str, Any], confidence: float, details: Dict[str, Any]):
        super().__init__(
            doc_type=doc_type,
            fields=fields,
            confidence=confidence,
            details=details,
        )
        self.doc_type = doc_type
        self.fields = fields
        self.confidence = confidence
        self.details = details

    def to_contract_item(self) -> Dict[str, Any]:
        """Return the strict contract item without details."""
        return {
            "doc_type": self.doc_type,
            "fields": self.fields,
            "confidence": self.confidence,
        }


def _make_error_result(
    source_file: str,
    doc_type: str,
    predicted_type: str = "unknown",
    score: float = 0.0,
    slot_mismatch: bool = False,
    page_count: int = 0,
) -> DocResult:
    """Build a safe 0.0-confidence error result for corrupted or missing documents."""
    all_f = ALL_FIELDS.get(doc_type, [])
    empty_fields: Dict[str, Any] = {f: None for f in all_f}
    empty_fields["_low_confidence"] = list(all_f)

    details = {
        "source_file": str(source_file),
        "slot_doc_type": doc_type,
        "predicted_doc_type": predicted_type,
        "classification_score": score,
        "slot_mismatch": slot_mismatch,
        "field_confidences": {f: 0.0 for f in all_f},
        "field_bboxes": {f: None for f in all_f},
        "ocr_mean_conf": 0.0,
        "page_count": page_count,
    }
    return DocResult(
        doc_type=doc_type,
        fields=empty_fields,
        confidence=0.0,
        details=details,
    )


def extract_document(
    path: Union[str, Path],
    expected_doc_type: Optional[str] = None,
) -> DocResult:
    """Extract structured fields and metadata from a single document image or PDF.

    Args:
        path: Path to the document file.
        expected_doc_type: Expected document slot type (land_deed, trust_cert, faculty_list, fire_noc).

    Returns:
        DocResult holding doc_type, fields (with _low_confidence), confidence, and details.
    """
    path_str = str(path)
    slot_type = expected_doc_type

    # Derive slot from filename if not explicitly provided
    if not slot_type:
        fname = Path(path).stem.lower()
        for candidate in ["land_deed", "trust_cert", "faculty_list", "fire_noc"]:
            if candidate in fname:
                slot_type = candidate
                break

    try:
        pages = load_pages(path, dpi=200)
    except Exception:
        return _make_error_result(path_str, slot_type or "land_deed")

    if not pages:
        return _make_error_result(path_str, slot_type or "land_deed")

    try:
        # Preprocess page 0
        raw_img = pages[0]
        proc_img = preprocess(raw_img)

        # Run OCR
        ocr_res = run_ocr(proc_img)

        # Classify document
        pred_type, class_score = classify_document(ocr_res.text)

        # Determine effective document type
        slot_mismatch = False
        if slot_type:
            effective_type = slot_type
            if pred_type != "unknown" and pred_type != slot_type:
                slot_mismatch = True
        else:
            effective_type = pred_type if pred_type != "unknown" else "land_deed"

        extractor = DOC_EXTRACTORS.get(effective_type)
        if not extractor:
            return _make_error_result(path_str, effective_type, pred_type, class_score, slot_mismatch, len(pages))

        # Extract raw fields internally {field: {value, conf, bbox}}
        raw_fields = extractor(ocr_res, img=raw_img)

        # Separate contract values, confidences, and bboxes
        contract_fields: Dict[str, Any] = {}
        field_confs: Dict[str, float] = {}
        field_bboxes: Dict[str, Optional[List[int]]] = {}

        all_doc_fields = ALL_FIELDS.get(effective_type, list(raw_fields.keys()))
        for f in all_doc_fields:
            if f in raw_fields:
                info = raw_fields[f]
                contract_fields[f] = info.get("value")
                field_confs[f] = info.get("conf", 0.0)
                field_bboxes[f] = info.get("bbox")
            else:
                contract_fields[f] = None
                field_confs[f] = 0.0
                field_bboxes[f] = None

        # Compute document confidence and low confidence list
        doc_conf, low_conf_list = compute_document_confidence(
            effective_type,
            contract_fields,
            field_confs,
        )
        contract_fields["_low_confidence"] = low_conf_list

        # OCR mean confidence
        ocr_confs = [w["conf"] for w in ocr_res.words]
        mean_ocr = round(sum(ocr_confs) / len(ocr_confs), 4) if ocr_confs else 0.0

        details = {
            "source_file": path_str,
            "slot_doc_type": slot_type or effective_type,
            "predicted_doc_type": pred_type,
            "classification_score": class_score,
            "slot_mismatch": slot_mismatch,
            "field_confidences": field_confs,
            "field_bboxes": field_bboxes,
            "ocr_mean_conf": mean_ocr,
            "page_count": len(pages),
        }

        return DocResult(
            doc_type=effective_type,
            fields=contract_fields,
            confidence=doc_conf,
            details=details,
        )

    except Exception:
        return _make_error_result(
            path_str,
            slot_type or "land_deed",
            page_count=len(pages),
        )


def extract_bundle(application_dir: Union[str, Path]) -> Dict[str, Any]:
    """Process an application bundle folder containing the 4 required document types.

    Args:
        application_dir: Path to application directory (e.g. dataset/applications/app_01).

    Returns:
        {
            "extraction": [contract items per document],
            "details": {doc_type: detail_dict}
        }
    """
    app_path = Path(application_dir)
    extraction_items: List[Dict[str, Any]] = []
    details_map: Dict[str, Any] = {}

    slots = ["land_deed", "trust_cert", "faculty_list", "fire_noc"]

    for slot in slots:
        # Find matching file for this slot
        target_file = None
        for candidate_name in SLOT_FILENAMES[slot]:
            cand_path = app_path / candidate_name
            if cand_path.exists():
                target_file = cand_path
                break

        if target_file is None:
            # Check for any file starting with slot name
            for f in app_path.glob(f"{slot}.*"):
                if f.is_file():
                    target_file = f
                    break

        if target_file is not None:
            doc_res = extract_document(target_file, expected_doc_type=slot)
        else:
            doc_res = _make_error_result(
                str(app_path / f"{slot}.pdf"),
                doc_type=slot,
            )

        extraction_items.append(doc_res.to_contract_item())
        details_map[slot] = doc_res.details

    return {
        "extraction": extraction_items,
        "details": details_map,
    }
