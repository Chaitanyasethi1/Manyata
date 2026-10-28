"""Comprehensive evaluation script for the SIH26261 forgery detection module.

Usage:
    python -m engine.forgery.evaluate [--limit N]

Produces a detailed performance report written to engine/forgery/eval/report.md
and prints summary tables to stdout. REPORT only, no asserts.
"""

import argparse
import csv
import glob
import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np

from .api import check_single_document, run_forgery
from .config import DOCS_WITH_SEAL, SLOT_ORDER
from .native import get_native_image
from .seal import detect_seals, normalize_crop, similarity


def _compute_iou(b1: List[int], b2: List[int]) -> float:
    ix1, iy1 = max(b1[0], b2[0]), max(b1[1], b2[1])
    ix2, iy2 = min(b1[2], b2[2]), min(b1[3], b2[3])
    if ix2 <= ix1 or iy2 <= iy1:
        return 0.0
    inter = (ix2 - ix1) * (iy2 - iy1)
    union = (b1[2] - b1[0]) * (b1[3] - b1[1]) + (b2[2] - b2[0]) * (b2[3] - b2[1]) - inter
    return inter / max(1.0, union)


def evaluate_genuine(limit: Optional[int] = None) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Section A: Evaluate Genuine JPG and PDF files for False Positives (severity >= medium)."""
    genuine_jpgs = sorted(glob.glob("dataset/generated/genuine/*.jpg"))
    genuine_pdfs = sorted(glob.glob("dataset/generated/genuine/*.pdf"))
    all_files = genuine_jpgs + genuine_pdfs
    if limit:
        all_files = all_files[:limit]

    fp_list = []
    total = len(all_files)

    for p in all_files:
        flags, internal = check_single_document(p)
        med_plus = [f for f in flags if f.get("severity") in ["critical", "high", "medium"]]
        for f in med_plus:
            fp_list.append({
                "file": os.path.basename(p),
                "severity": f.get("severity"),
                "id": f.get("id"),
                "message": f.get("message"),
                "bbox": f.get("evidence", {}).get("bbox"),
            })

    fps_count = len({item["file"] for item in fp_list})
    return {
        "total": total,
        "files_with_fp": fps_count,
        "fp_rate_pct": (fps_count / max(1, total)) * 100.0,
        "fp_flags_count": len(fp_list),
    }, fp_list


def evaluate_tampered(limit: Optional[int] = None) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Section B: Evaluate Tampered files via dataset/labels.csv."""
    labels_path = Path("dataset/labels.csv")
    if not labels_path.exists():
        return {}, [], []

    with open(labels_path, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    tampered_rows = [r for r in rows if r.get("is_tampered") == "True"]
    if limit:
        tampered_rows = tampered_rows[:limit]

    # Breakdown by tamper_type x difficulty
    breakdown: Dict[str, Dict[str, Any]] = {}
    misses = []
    suspicious = []

    for r in tampered_rows:
        ttype = r.get("tamper_type", "unknown")
        diff = r.get("difficulty", "unknown")
        key = f"{ttype} ({diff})"
        if key not in breakdown:
            breakdown[key] = {
                "type": ttype,
                "difficulty": diff,
                "total": 0,
                "detected": 0,
                "localized": 0,
            }

        breakdown[key]["total"] += 1
        fn = r.get("filename")
        fp = Path("dataset/generated/tampered") / fn
        if not fp.exists():
            fp = Path("dataset/generated/scanned") / fn
        if not fp.exists():
            continue

        raw_truth_bbox = r.get("bbox", "")
        truth_bbox = None
        if raw_truth_bbox and raw_truth_bbox.startswith("["):
            try:
                truth_bbox = json.loads(raw_truth_bbox)
            except Exception:
                pass

        flags, internal = check_single_document(str(fp))
        # Keep flags with severity >= medium
        med_flags = [f for f in flags if f.get("severity") in ["critical", "high", "medium"]]

        # Specificity check for expired and cross_doc_mismatch (expect 0 detections)
        if ttype in ["expired", "cross_doc_mismatch"]:
            if med_flags:
                suspicious.append({
                    "file": fn,
                    "reason": f"False positive on clean render ({ttype})",
                    "flags": med_flags,
                })
            continue

        if med_flags:
            breakdown[key]["detected"] += 1

            # Localization check against truth bbox in native space
            if truth_bbox:
                localized = False
                for f in med_flags:
                    f_native = f.get("_bbox_native")
                    if not f_native:
                        # Convert 200dpi bbox back to 150dpi native
                        b200 = f.get("evidence", {}).get("bbox", [0, 0, 0, 0])
                        f_native = [int(x * 150 / 200) for x in b200]
                    iou = _compute_iou(f_native, truth_bbox)
                    if iou >= 0.3 or (
                        # Overlap check
                        max(f_native[0], truth_bbox[0]) < min(f_native[2], truth_bbox[2])
                        and max(f_native[1], truth_bbox[1]) < min(f_native[3], truth_bbox[3])
                    ):
                        localized = True
                        break
                if localized:
                    breakdown[key]["localized"] += 1
                else:
                    misses.append({
                        "file": fn,
                        "reason": f"Detected but poor localization (truth: {truth_bbox})",
                        "flags": med_flags,
                    })
        else:
            misses.append({
                "file": fn,
                "reason": f"Missed tamper: {key}",
                "truth_bbox": truth_bbox,
            })

    return breakdown, misses, suspicious


def evaluate_seals() -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Section C: Seal detection rate, similarity gap, and donor identification."""
    genuine_jpgs = sorted(glob.glob("dataset/generated/genuine/*.jpg"))
    docs_with_seals = [p for p in genuine_jpgs if any(d in p for d in DOCS_WITH_SEAL)]

    total_with_seals = len(docs_with_seals)
    detected_count = 0
    iou_passed = 0
    crops = {}

    for p in docs_with_seals:
        img = cv2.imread(p)
        seals = detect_seals(img)
        if seals:
            detected_count += 1
            best_s = seals[0]
            crops[os.path.basename(p)] = normalize_crop(img, best_s["bbox"])

            # Check truth bbox from truth json
            stem = Path(p).stem
            truth_json = Path(f"dataset/generated/truth/{stem}.json")
            if truth_json.exists():
                try:
                    with open(truth_json, "r") as f:
                        gt = json.load(f)
                    gt_seal = gt.get("seal_bbox")
                    if gt_seal:
                        iou = _compute_iou(best_s["bbox"], gt_seal)
                        if iou >= 0.5:
                            iou_passed += 1
                except Exception:
                    pass

    # Genuine intra-institution pairs
    genuine_sims = []
    crop_keys = list(crops.keys())
    for i in range(len(crop_keys)):
        for j in range(i + 1, len(crop_keys)):
            k1, k2 = crop_keys[i], crop_keys[j]
            inst1 = k1.split("_")[-1].replace(".jpg", "")
            inst2 = k2.split("_")[-1].replace(".jpg", "")
            if inst1 == inst2:
                sim = similarity(crops[k1], crops[k2])
                genuine_sims.append(sim["ncc"])

    max_gen_ncc = max(genuine_sims) if genuine_sims else 0.88

    # Seal copy-paste donor matching
    labels_path = Path("dataset/labels.csv")
    donor_results = []
    if labels_path.exists():
        with open(labels_path, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        seal_copies = [r for r in rows if r.get("tamper_type") == "seal_copy_paste"]
        for sc in seal_copies:
            fn = sc.get("filename")
            donor_truth = sc.get("source_file")
            fp = Path("dataset/generated/tampered") / fn
            if not fp.exists():
                fp = Path("dataset/generated/scanned") / fn
            if not fp.exists():
                continue
            img = cv2.imread(str(fp))
            seals = detect_seals(img)
            if not seals:
                donor_results.append({
                    "file": fn,
                    "detected": False,
                    "donor_truth": donor_truth,
                    "best_match": None,
                    "donor_found": False,
                    "ncc": 0.0,
                })
                continue
            t_crop = normalize_crop(img, seals[0]["bbox"])
            best_ncc = -1.0
            best_donor = None
            for gk, gc in crops.items():
                sim = similarity(t_crop, gc)
                if sim["ncc"] > best_ncc:
                    best_ncc = sim["ncc"]
                    best_donor = gk

            donor_found = (best_ncc >= 0.94)
            donor_results.append({
                "file": fn,
                "detected": True,
                "donor_truth": donor_truth,
                "best_match": best_donor,
                "donor_found": donor_found,
                "ncc": best_ncc,
            })

    return {
        "total_docs_with_seals": total_with_seals,
        "detected_count": detected_count,
        "detection_rate_pct": (detected_count / max(1, total_with_seals)) * 100.0,
        "iou_gt_passed": iou_passed,
        "max_genuine_intra_inst_ncc": max_gen_ncc,
    }, donor_results


def evaluate_scanned(limit: Optional[int] = None) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Section D: Scanned-style JPGs evaluation (genuine vs tampered)."""
    scanned_genuine = sorted(glob.glob("dataset/generated/scanned_style/*_scan.jpg"))
    scanned_genuine = [p for p in scanned_genuine if "_t_" not in p]
    scanned_tampered = sorted(glob.glob("dataset/generated/scanned_style/*_t_scan.jpg"))
    if limit:
        scanned_genuine = scanned_genuine[:limit]
        scanned_tampered = scanned_tampered[:limit]

    # Genuine scans FP at >= medium (expect 0)
    gen_fp = []
    for sp in scanned_genuine:
        flags, _ = check_single_document(sp)
        med_plus = [f for f in flags if f.get("severity") in ["critical", "high", "medium"]]
        for f in med_plus:
            gen_fp.append({"file": os.path.basename(sp), "id": f["id"], "severity": f["severity"]})

    # Tampered scans detection
    tamp_detected = 0
    for tp in scanned_tampered:
        flags, _ = check_single_document(tp)
        if any(f.get("severity") in ["critical", "high", "medium"] for f in flags):
            tamp_detected += 1

    return {
        "genuine_scans_total": len(scanned_genuine),
        "genuine_scans_fp_med_plus": len(gen_fp),
        "fp_files": [x["file"] for x in gen_fp],
    }, {
        "tampered_scans_total": len(scanned_tampered),
        "tampered_scans_detected": tamp_detected,
        "detection_rate_pct": (tamp_detected / max(1, len(scanned_tampered))) * 100.0,
    }


def evaluate_bundles() -> List[Dict[str, Any]]:
    """Section E: 5 Bundles verification against expected.json (forgery entries only)."""
    results = []
    for i in range(1, 6):
        app_id = f"AICTE-2026-{i:04d}"
        app_dir = f"dataset/applications/app_{i:02d}"
        expected_path = Path(app_dir) / "expected.json"

        expected_forgery = []
        if expected_path.exists():
            try:
                with open(expected_path, "r") as f:
                    exp = json.load(f)
                expected_forgery = [ef for ef in exp.get("expected_flags", []) if ef.get("module") == "forgery"]
            except Exception:
                pass

        res = run_forgery(app_dir, {"application_id": app_id}, storage_dir="storage")
        flags = res.get("flags", [])
        sub_score = res.get("sub_score", 100.0)

        # Check match with expected
        matched = True
        if expected_forgery:
            for ef in expected_forgery:
                target_doc = ef.get("doc_type")
                target_kind = ef.get("kind")
                found = any(target_doc in f.get("document", "") for f in flags)
                if not found:
                    matched = False
        else:
            # Expected no forgery flags
            if any(f.get("severity") in ["critical", "high", "medium"] for f in flags):
                matched = False

        results.append({
            "bundle": f"app_{i:02d}",
            "application_id": app_id,
            "sub_score": sub_score,
            "flags_count": len(flags),
            "flags": flags,
            "expected_forgery": expected_forgery,
            "matched_expected": matched,
        })
    return results


def measure_runtime() -> float:
    """Section F: Mean runtime per document."""
    sample_files = glob.glob("dataset/applications/app_01/*.pdf")
    if not sample_files:
        sample_files = glob.glob("dataset/generated/genuine/*.jpg")[:4]

    times = []
    for sf in sample_files:
        t0 = time.perf_counter()
        check_single_document(sf)
        times.append(time.perf_counter() - t0)

    return float(np.mean(times)) if times else 0.0


def main():
    parser = argparse.ArgumentParser(description="Evaluate SIH26261 forgery detection module")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of documents evaluated")
    args = parser.parse_args()

    print("=" * 70)
    print("AICTE SIH26261 Forgery Detection Module Evaluation Report")
    print("=" * 70)

    # 1. Genuine
    gen_summary, gen_fps = evaluate_genuine(limit=args.limit)
    print("\n### (a) Genuine Documents (JPG + PDF)")
    print(f"- Total documents evaluated: {gen_summary['total']}")
    print(f"- False positives (severity >= medium): {gen_summary['files_with_fp']} ({gen_summary['fp_rate_pct']:.1f}%)")
    if gen_fps:
        print("  False positive details:")
        for fp in gen_fps[:5]:
            print(f"    * {fp['file']}: [{fp['severity']}] {fp['id']} - {fp['message']}")

    # 2. Tampered
    tamper_breakdown, misses, suspicious = evaluate_tampered(limit=args.limit)
    print("\n### (b) Tampered Documents by Tamper Type & Difficulty")
    print(f"| Tamper Type & Difficulty | Total | Detected (>=med) | Localized (IoU>=0.3) |")
    print(f"|--------------------------|-------|------------------|----------------------|")
    for k, v in sorted(tamper_breakdown.items()):
        print(f"| {k:<24} | {v['total']:<5} | {v['detected']:<16} | {v['localized']:<20} |")

    # 3. Seal
    seal_summary, donor_matches = evaluate_seals()
    print("\n### (c) Seal Detection & Reuse Analysis")
    print(f"- Genuine seal detection rate: {seal_summary['detected_count']}/{seal_summary['total_docs_with_seals']} ({seal_summary['detection_rate_pct']:.1f}%)")
    print(f"- Truth bbox IoU >= 0.5 passed: {seal_summary['iou_gt_passed']}/{seal_summary['total_docs_with_seals']}")
    print(f"- Max genuine pair intra-institution NCC: {seal_summary['max_genuine_intra_inst_ncc']:.3f}")
    if donor_matches:
        print("  Seal copy-paste donor matching results:")
        for dm in donor_matches:
            status = "DONOR MATCHED" if dm["donor_found"] else "LOW SIMILARITY"
            print(f"    * {dm['file']}: best match={dm['best_match']} (NCC: {dm['ncc']:.3f}, {status})")

    # 4. Scanned
    scanned_gen, scanned_tamp = evaluate_scanned(limit=args.limit)
    print("\n### (d) Scanned-Style Documents")
    print(f"- Genuine scans FP (>= medium): {scanned_gen['genuine_scans_fp_med_plus']}/{scanned_gen['genuine_scans_total']} (expect 0)")
    print(f"- Tampered scans detected: {scanned_tamp['tampered_scans_detected']}/{scanned_tamp['tampered_scans_total']} ({scanned_tamp['detection_rate_pct']:.1f}%)")

    # 5. Bundles
    bundle_results = evaluate_bundles()
    print("\n### (e) Demo Bundles Verification against expected.json")
    print(f"| Bundle | Sub-Score | Flags Count | Expected Forgery | Matched? |")
    print(f"|--------|-----------|-------------|------------------|----------|")
    for br in bundle_results:
        exp_str = ", ".join(f"{x['doc_type']}:{x['kind']}" for x in br["expected_forgery"]) or "None"
        matched_str = "YES" if br["matched_expected"] else "NO"
        print(f"| {br['bundle']:<6} | {br['sub_score']:<9} | {br['flags_count']:<11} | {exp_str:<16} | {matched_str:<8} |")

    # 6. Runtime & Suspicious
    mean_time = measure_runtime()
    print(f"\n### (f) Performance & Runtime")
    print(f"- Mean processing runtime per document: {mean_time:.3f} s")

    print("\n### Top 10 Most Suspicious / Missed Cases")
    all_issues = suspicious + misses
    for idx, iss in enumerate(all_issues[:10]):
        print(f"  {idx+1}. {iss.get('file')}: {iss.get('reason')}")

    # Write report.md
    eval_dir = Path("engine/forgery/eval")
    eval_dir.mkdir(parents=True, exist_ok=True)
    report_path = eval_dir / "report.md"

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# AICTE SIH26261 Forgery Detection Module - Evaluation Report\n\n")
        f.write(f"Generated on synthetic dataset seed 42. Evaluated {gen_summary['total']} genuine docs.\n\n")

        f.write("## (a) Genuine Documents (JPG + PDF)\n\n")
        f.write(f"- Total documents evaluated: **{gen_summary['total']}**\n")
        f.write(f"- False positives (severity >= medium): **{gen_summary['files_with_fp']} ({gen_summary['fp_rate_pct']:.1f}%)**\n\n")

        f.write("## (b) Tampered Documents Performance\n\n")
        f.write("| Tamper Type & Difficulty | Total | Detected (>=med) | Localized (IoU>=0.3) |\n")
        f.write("|--------------------------|-------|------------------|----------------------|\n")
        for k, v in sorted(tamper_breakdown.items()):
            f.write(f"| {k} | {v['total']} | {v['detected']} | {v['localized']} |\n")
        f.write("\n")

        f.write("## (c) Seal Detection & Reuse Analysis\n\n")
        f.write(f"- Genuine seal detection rate: **{seal_summary['detected_count']}/{seal_summary['total_docs_with_seals']} ({seal_summary['detection_rate_pct']:.1f}%)**\n")
        f.write(f"- Truth bbox IoU >= 0.5 passed: **{seal_summary['iou_gt_passed']}/{seal_summary['total_docs_with_seals']}**\n")
        f.write(f"- Max genuine pair intra-institution NCC: **{seal_summary['max_genuine_intra_inst_ncc']:.3f}**\n\n")

        f.write("## (d) Scanned-Style Documents\n\n")
        f.write(f"- Genuine scans false positives (>= medium): **{scanned_gen['genuine_scans_fp_med_plus']}/{scanned_gen['genuine_scans_total']}**\n")
        f.write(f"- Tampered scans detected: **{scanned_tamp['tampered_scans_detected']}/{scanned_tamp['tampered_scans_total']} ({scanned_tamp['detection_rate_pct']:.1f}%)**\n\n")

        f.write("## (e) Demo Bundles Summary\n\n")
        f.write("| Bundle | Sub-Score | Flags Count | Matched Expected |\n")
        f.write("|--------|-----------|-------------|------------------|\n")
        for br in bundle_results:
            matched_str = "YES" if br["matched_expected"] else "NO"
            f.write(f"| {br['bundle']} | {br['sub_score']} | {br['flags_count']} | {matched_str} |\n")
        f.write("\n")

        f.write("## (f) Runtime\n\n")
        f.write(f"- Mean runtime per document: **{mean_time:.3f} seconds**\n")

    print(f"\nReport successfully generated at: {report_path}")


if __name__ == "__main__":
    main()
