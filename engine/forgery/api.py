"""Public API and runner for the forgery-detection engine module."""

import json
import math
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import cv2
import numpy as np

from engine.common.subscore import compute_sub_score

from .config import (
    DOCS_WITH_SEAL,
    PAGE_DPI,
    SEAL_NCC_REUSE,
    SEAL_ORB_MIN_INLIERS,
    SLOT_ORDER,
)
from .copymove import detect_copymove
from .ela import analyze_ela
from .native import get_native_image, scale_bbox_to_200dpi
from .overlay import write_overlay
from .reliability import assess_reliability
from .seal import check_seal_reuse_across_bundle, detect_seals
from .textfeatures import analyze_font_consistency, analyze_noise_consistency

# Load severity mapping from severity.json
_SEVERITY_FILE = Path(__file__).parent / "severity.json"
try:
    with open(_SEVERITY_FILE, "r", encoding="utf-8") as f:
        SEVERITY_MAP = json.load(f)
except Exception:
    SEVERITY_MAP = {
        "seal_reuse": "critical",
        "ela_region": "critical",
        "copy_move": "critical",
        "font_inconsistent": "medium",
        "noise_inconsistent": "medium",
        "seal_not_found": "low",
    }

SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}

CODE_TO_FLAG_ID = {
    "ela_region": "F-ELA-01",
    "seal_reuse": "F-SEAL-01",
    "copy_move": "F-CPMV-01",
    "font_inconsistent": "F-FONT-01",
    "noise_inconsistent": "F-NOISE-01",
    "seal_not_found": "F-SEALMISSING-01",
}


def _find_nearest_field(
    bbox_200dpi: List[int],
    field_bboxes: Optional[Dict[str, List[int]]],
) -> Optional[str]:
    """Find the nearest extracted field name in 200dpi page pixels."""
    if not field_bboxes:
        return None

    bx = (bbox_200dpi[0] + bbox_200dpi[2]) / 2.0
    by = (bbox_200dpi[1] + bbox_200dpi[3]) / 2.0

    best_dist = float("inf")
    best_field = None

    for fname, fbox in field_bboxes.items():
        if not fbox or len(fbox) != 4:
            continue
        fx = (fbox[0] + fbox[2]) / 2.0
        fy = (fbox[1] + fbox[3]) / 2.0
        dist = math.hypot(bx - fx, by - fy)
        if dist < best_dist and dist < 300:  # within 300px at 200dpi
            best_dist = dist
            best_field = fname

    return best_field


def _compute_iou(b1: List[int], b2: List[int]) -> float:
    ix1, iy1 = max(b1[0], b2[0]), max(b1[1], b2[1])
    ix2, iy2 = min(b1[2], b2[2]), min(b1[3], b2[3])
    if ix2 <= ix1 or iy2 <= iy1:
        return 0.0
    inter = (ix2 - ix1) * (iy2 - iy1)
    union = (b1[2] - b1[0]) * (b1[3] - b1[1]) + (b2[2] - b2[0]) * (b2[3] - b2[1]) - inter
    return inter / max(1.0, union)


def check_single_document(
    path: str,
    doc_type: Optional[str] = None,
    bundle_details: Optional[Dict[str, Any]] = None,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Inspect a single document for localized forgery indicators.

    Args:
        path: Path to document PDF or image.
        doc_type: Expected document type (e.g. "land_deed").
        bundle_details: Optional bundle details containing field_bboxes.

    Returns:
        (flags_list, internal_findings_dict)
    """
    cv2.setRNGSeed(0)

    try:
        native = get_native_image(path)
    except Exception:
        return [], {}

    if native.bgr is None or native.bgr.size == 0:
        return [], {}

    filename = os.path.basename(path)
    if doc_type is None:
        doc_type = Path(path).stem
        for slot in SLOT_ORDER:
            if slot in doc_type:
                doc_type = slot
                break

    rel_mode = assess_reliability(native)
    is_degraded = rel_mode == "degraded"

    flags: List[Dict[str, Any]] = []
    internal: Dict[str, Any] = {
        "native": native,
        "doc_type": doc_type,
        "filename": filename,
        "detected_seals": [],
        "ela_map": None,
        "findings": [],
        "is_degraded": is_degraded,
    }

    # 1. Seal detection
    detected_seals = []
    if doc_type is None or doc_type in DOCS_WITH_SEAL:
        detected_seals = detect_seals(native.bgr)
    internal["detected_seals"] = detected_seals

    if doc_type in DOCS_WITH_SEAL and not detected_seals:
        # Generate low severity seal_not_found flag
        # Place evidence bbox at nominal seal location: bottom left
        nominal_seal_native = [
            int(native.width * 0.10),
            int(native.height * 0.70),
            int(native.width * 0.35),
            int(native.height * 0.90),
        ]
        s_bbox_200 = scale_bbox_to_200dpi(nominal_seal_native, native)
        flags.append({
            "id": CODE_TO_FLAG_ID["seal_not_found"],
            "code": "seal_not_found",
            "severity": "low",
            "message": "No institutional seal detected on document; verify manually",
            "document": filename,
            "evidence": {
                "page": 1,
                "bbox": s_bbox_200,
                "heatmap_path": None,
            },
            "clause": None,
            "_raw_score": 0.0,
            "_bbox_native": nominal_seal_native,
        })

    # Prepare skip regions for ELA / text analysis
    skip_regions = []
    for s in detected_seals:
        skip_regions.append(s["bbox"])

    # 2. ELA analysis
    ela_findings: List[Dict[str, Any]] = []
    ela_map = None
    if native.jpeg_bytes is not None or native.source_kind in ("pdf_embedded", "image_file", "jpeg_stream"):
        ela_findings, ela_map = analyze_ela(
            native.bgr,
            est_quality=native.est_quality,
            skip_regions=skip_regions,
        )
    internal["ela_map"] = ela_map

    # Extract field_bboxes from bundle details if available
    field_bboxes_200 = None
    if bundle_details:
        if isinstance(bundle_details.get(doc_type), dict) and "field_bboxes" in bundle_details[doc_type]:
            field_bboxes_200 = bundle_details[doc_type]["field_bboxes"]
        elif "field_bboxes" in bundle_details and isinstance(bundle_details["field_bboxes"], dict):
            field_bboxes_200 = bundle_details["field_bboxes"].get(doc_type) or bundle_details["field_bboxes"].get(filename)
        elif isinstance(bundle_details.get(filename), dict) and "field_bboxes" in bundle_details[filename]:
            field_bboxes_200 = bundle_details[filename]["field_bboxes"]

    for ef in ela_findings:
        b_native = ef["bbox_native"]
        b_200 = scale_bbox_to_200dpi(b_native, native)
        near_field = _find_nearest_field(b_200, field_bboxes_200)

        msg = f"Possible text edit near ({b_200[0]}, {b_200[1]}) (ELA anomaly)"
        if near_field:
            msg = f"Possible text edit near the {near_field} field (ELA anomaly)"

        sev = SEVERITY_MAP.get(ef["code"], "critical")
        if is_degraded:
            sev = "low"
            msg += " (low reliability scan, verify manually)"

        flags.append({
            "id": CODE_TO_FLAG_ID.get(ef["code"], "F-ELA-01"),
            "code": ef["code"],
            "severity": sev,
            "message": msg,
            "document": filename,
            "evidence": {
                "page": 1,
                "bbox": b_200,
                "heatmap_path": None,
            },
            "clause": None,
            "_raw_score": ef["score"],
            "_bbox_native": b_native,
        })

    # 3. Copy-Move detection
    cm_findings = detect_copymove(native.bgr, doc_type=doc_type)
    for cm in cm_findings:
        t_native = cm.get("target_bbox") or cm.get("bbox_native")
        t_200 = scale_bbox_to_200dpi(t_native, native)
        s_native = cm["source_bbox"]
        s_200 = scale_bbox_to_200dpi(s_native, native)

        msg = (
            f"Duplicated content detected (copy-move forgery); content at "
            f"({t_200[0]}, {t_200[1]}) duplicated from ({s_200[0]}, {s_200[1]})"
        )
        sev = SEVERITY_MAP.get(cm["code"], "critical")
        flags.append({
            "id": CODE_TO_FLAG_ID.get(cm["code"], "F-CPMV-01"),
            "code": cm["code"],
            "severity": sev,
            "message": msg,
            "document": filename,
            "evidence": {
                "page": 1,
                "bbox": t_200,
                "heatmap_path": None,
            },
            "clause": None,
            "_raw_score": cm["score"],
            "_bbox_native": t_native,
        })

    # 4. Text & noise consistency
    font_findings = analyze_font_consistency(native.bgr, skip_regions=skip_regions)
    for ff in font_findings:
        b_native = ff["bbox_native"]
        b_200 = scale_bbox_to_200dpi(b_native, native)
        near_field = _find_nearest_field(b_200, field_bboxes_200)

        msg = ff["message"]
        if near_field:
            msg = f"Inconsistent typography near the {near_field} field"

        sev = SEVERITY_MAP.get(ff["code"], "medium")
        if is_degraded:
            sev = "low"
            msg += " (low reliability scan, verify manually)"

        flags.append({
            "id": CODE_TO_FLAG_ID.get(ff["code"], "F-FONT-01"),
            "code": ff["code"],
            "severity": sev,
            "message": msg,
            "document": filename,
            "evidence": {
                "page": 1,
                "bbox": b_200,
                "heatmap_path": None,
            },
            "clause": None,
            "_raw_score": ff["score"],
            "_bbox_native": b_native,
        })

    noise_findings = analyze_noise_consistency(native.bgr, skip_regions=skip_regions)
    for nf in noise_findings:
        b_native = nf["bbox_native"]
        b_200 = scale_bbox_to_200dpi(b_native, native)
        msg = nf["message"]
        sev = SEVERITY_MAP.get(nf["code"], "medium")
        if is_degraded:
            sev = "low"
            msg += " (low reliability scan, verify manually)"

        flags.append({
            "id": CODE_TO_FLAG_ID.get(nf["code"], "F-NOISE-01"),
            "code": nf["code"],
            "severity": sev,
            "message": msg,
            "document": filename,
            "evidence": {
                "page": 1,
                "bbox": b_200,
                "heatmap_path": None,
            },
            "clause": None,
            "_raw_score": nf["score"],
            "_bbox_native": b_native,
        })

    internal["findings"] = flags
    return flags, internal


def run_forgery(
    application_dir: str,
    form_data: dict,
    bundle: Optional[dict] = None,
    storage_dir: str = "storage",
) -> dict:
    """Run full forgery-detection module on an application bundle.

    Args:
        application_dir: Directory containing application documents.
        form_data: Application metadata.
        bundle: Optional result of engine.extraction.extract_bundle.
        storage_dir: Base directory for saving output heatmaps.

    Returns:
        ValidationResult module dictionary obeying schema.
    """
    cv2.setRNGSeed(0)
    app_path = Path(application_dir)
    app_name = app_path.name if app_path.exists() else "application"

    if not app_path.is_dir():
        return {
            "module": "forgery",
            "sub_score": 100,
            "flags": [],
        }

    heatmaps_dir = Path(storage_dir) / "heatmaps"
    heatmaps_dir.mkdir(parents=True, exist_ok=True)

    bundle_details = bundle.get("details") if bundle else None

    # Discover documents in fixed SLOT_ORDER
    # Accepts .pdf, .jpg, .jpeg, .png with the slot stem
    discovered_docs: Dict[str, str] = {}
    extensions = [".pdf", ".jpg", ".jpeg", ".png"]

    for slot in SLOT_ORDER:
        for ext in extensions:
            cand = app_path / f"{slot}{ext}"
            if cand.is_file():
                discovered_docs[slot] = str(cand)
                break

    all_flags: List[Dict[str, Any]] = []
    doc_internals: Dict[str, Dict[str, Any]] = {}
    doc_flags_map: Dict[str, List[Dict[str, Any]]] = {}

    # 1. Single document checks
    for slot, doc_path in discovered_docs.items():
        try:
            d_flags, d_internal = check_single_document(
                doc_path,
                doc_type=slot,
                bundle_details=bundle_details,
            )
            doc_internals[slot] = d_internal
            doc_flags_map[slot] = d_flags
        except Exception:
            doc_flags_map[slot] = []

    # 2. Cross-document seal reuse check
    from .seal import normalize_crop
    doc_seals = {}
    for slot in SLOT_ORDER:
        if slot in doc_internals and doc_internals[slot]["detected_seals"]:
            best_s = doc_internals[slot]["detected_seals"][0]
            nat_img = doc_internals[slot]["native"]
            crp = normalize_crop(nat_img.bgr, best_s["bbox"])
            doc_seals[doc_internals[slot]["filename"]] = (best_s, crp)

    reuse_flags = check_seal_reuse_across_bundle(
        doc_seals,
        slot_order=SLOT_ORDER,
        ncc_thresh=SEAL_NCC_REUSE,
        orb_inliers_thresh=SEAL_ORB_MIN_INLIERS,
    )

    for rf in reuse_flags:
        target_doc = rf["document"]
        target_slot = None
        for slot in SLOT_ORDER:
            if slot in doc_internals and doc_internals[slot]["filename"] == target_doc:
                target_slot = slot
                break

        if target_slot and target_slot in doc_internals:
            nat = doc_internals[target_slot]["native"]
            b_200 = scale_bbox_to_200dpi(rf["bbox_native"], nat)
            sev = SEVERITY_MAP.get(rf["code"], "critical")
            rf_dict = {
                "id": CODE_TO_FLAG_ID.get(rf["code"], "F-SEAL-01"),
                "code": rf["code"],
                "severity": sev,
                "message": rf["message"],
                "document": target_doc,
                "evidence": {
                    "page": 1,
                    "bbox": b_200,
                    "heatmap_path": None,
                },
                "clause": None,
                "_raw_score": rf["score"],
                "_bbox_native": rf["bbox_native"],
            }
            doc_flags_map[target_slot].append(rf_dict)

    # 3. Generate overlays and attach relative heatmap_path
    for slot, flags in doc_flags_map.items():
        if not flags or slot not in doc_internals:
            continue

        internal = doc_internals[slot]
        native = internal["native"]
        filename = internal["filename"]

        heatmap_rel = f"heatmaps/{app_name}_{slot}_forgery.png"
        heatmap_abs = heatmaps_dir / f"{app_name}_{slot}_forgery.png"

        # Prepare findings for overlay drawing
        overlay_findings = []
        for f in flags:
            b_nat = f.get("_bbox_native") or [0, 0, 10, 10]
            overlay_findings.append({
                "bbox_native": b_nat,
                "code": f["code"],
            })

        write_overlay(
            native_bgr=native.bgr,
            ela_map=internal.get("ela_map"),
            findings=overlay_findings,
            out_path=str(heatmap_abs),
        )

        for f in flags:
            f["evidence"]["heatmap_path"] = heatmap_rel
            all_flags.append(f)

    # 4. Deduplicate flags
    # Same (code, document, bbox overlap IoU > 0.5) once
    deduped_flags = []
    for f in all_flags:
        is_dup = False
        for ex in deduped_flags:
            if f["code"] == ex["code"] and f["document"] == ex["document"]:
                iou = _compute_iou(f["evidence"]["bbox"], ex["evidence"]["bbox"])
                if iou > 0.5:
                    is_dup = True
                    break
        if not is_dup:
            deduped_flags.append(f)

    # 5. Clean internal temporary keys and sort flags
    # Order flags by severity (critical first), then document
    def _sort_key(fl: Dict[str, Any]) -> Tuple[int, str]:
        sev_rank = SEVERITY_ORDER.get(fl.get("severity", "low"), 99)
        doc_name = fl.get("document", "")
        return (sev_rank, doc_name)

    deduped_flags.sort(key=_sort_key)

    clean_flags = []
    for fl in deduped_flags:
        clean_flags.append({
            "id": fl["id"],
            "severity": fl["severity"],
            "message": fl["message"],
            "document": fl["document"],
            "evidence": {
                "page": 1,
                "bbox": fl["evidence"]["bbox"],
                "heatmap_path": fl["evidence"]["heatmap_path"],
            },
            "clause": None,
        })

    sub_score = compute_sub_score(clean_flags)

    return {
        "module": "forgery",
        "sub_score": sub_score,
        "flags": clean_flags,
    }
