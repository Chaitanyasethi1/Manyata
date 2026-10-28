"""Evaluation pipeline for authenticity module."""

import argparse
import csv
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .api import check_single_document, run_authenticity
from .config import REF_DATE
from .dates import parse_ddmmyyyy


def evaluate_genuine_pdfs(limit: Optional[int] = None) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Evaluate genuine PDFs for false positive flags (severity >= medium)."""
    genuine_dir = Path("dataset/generated/genuine")
    if not genuine_dir.exists():
        return {"total": 0, "false_positives": 0, "fp_rate_pct": 0.0}, []

    pdf_files = sorted(genuine_dir.glob("*.pdf"))
    if limit is not None:
        pdf_files = pdf_files[:limit]

    total_docs = len(pdf_files)
    fp_flags: List[Dict[str, Any]] = []

    for pdf in pdf_files:
        stem = pdf.stem
        doc_type = None
        for dt in ["land_deed", "trust_cert", "faculty_list", "fire_noc"]:
            if dt in stem:
                doc_type = dt
                break

        # Check single document
        flags = check_single_document(pdf, doc_type=doc_type)
        # False positives: flags with severity >= medium
        medium_plus = [f for f in flags if f.get("severity") in ["critical", "high", "medium"]]
        for f in medium_plus:
            fp_flags.append({
                "file": pdf.name,
                "doc_type": doc_type,
                "code": f.get("id"),
                "severity": f.get("severity"),
                "message": f.get("message"),
            })

    fp_count = len({f["file"] for f in fp_flags})
    fp_rate = (fp_count / total_docs * 100.0) if total_docs > 0 else 0.0

    return {
        "total": total_docs,
        "docs_with_fp": fp_count,
        "total_fp_flags": len(fp_flags),
        "fp_rate_pct": round(fp_rate, 1),
    }, fp_flags


def evaluate_scanned_style_jpgs(limit: Optional[int] = None) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Evaluate scanned-style JPGs for false positives (severity >= medium; low is acceptable)."""
    scan_dir = Path("dataset/generated/scanned_style")
    if not scan_dir.exists():
        return {"total": 0, "false_positives": 0, "fp_rate_pct": 0.0}, []

    jpg_files = sorted(scan_dir.glob("*.jpg"))
    if limit is not None:
        jpg_files = jpg_files[:limit]

    total_docs = len(jpg_files)
    fp_flags: List[Dict[str, Any]] = []

    for jpg in jpg_files:
        stem = jpg.stem
        doc_type = None
        for dt in ["land_deed", "trust_cert", "faculty_list", "fire_noc"]:
            if dt in stem:
                doc_type = dt
                break

        flags = check_single_document(jpg, doc_type=doc_type)
        medium_plus = [f for f in flags if f.get("severity") in ["critical", "high", "medium"]]
        for f in medium_plus:
            fp_flags.append({
                "file": jpg.name,
                "doc_type": doc_type,
                "code": f.get("id"),
                "severity": f.get("severity"),
                "message": f.get("message"),
            })

    fp_count = len({f["file"] for f in fp_flags})
    fp_rate = (fp_count / total_docs * 100.0) if total_docs > 0 else 0.0

    return {
        "total": total_docs,
        "docs_with_fp": fp_count,
        "total_fp_flags": len(fp_flags),
        "fp_rate_pct": round(fp_rate, 1),
    }, fp_flags


def evaluate_tampered_documents(limit: Optional[int] = None) -> Dict[str, Dict[str, Any]]:
    """Evaluate tampered documents via labels.csv by tamper_type."""
    labels_csv = Path("dataset/labels.csv")
    tampered_dir = Path("dataset/generated/tampered")
    if not labels_csv.exists() or not tampered_dir.exists():
        return {}

    tamper_stats: Dict[str, Dict[str, Any]] = {}

    with open(labels_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader if r.get("is_tampered", "").strip().lower() == "true"]

    if limit is not None:
        rows = rows[:limit]

    for row in rows:
        t_type = row.get("tamper_type", "unknown")
        if t_type not in tamper_stats:
            tamper_stats[t_type] = {
                "total": 0,
                "flagged": 0,
                "checks_fired": set(),
            }
        tamper_stats[t_type]["total"] += 1

        pdf_name = row.get("pdf_file", "")
        jpg_name = row.get("filename", "")
        doc_type = row.get("doc_type")

        target_file = None
        if pdf_name and (tampered_dir / pdf_name).exists():
            target_file = tampered_dir / pdf_name
        elif jpg_name and (tampered_dir / jpg_name).exists():
            target_file = tampered_dir / jpg_name

        if not target_file:
            continue

        app_id = row.get("application_id", "")
        form_data = None
        if app_id:
            form_path = Path(f"dataset/applications/{app_id}/form.json")
            if form_path.exists():
                try:
                    with open(form_path, "r", encoding="utf-8") as ff:
                        form_data = json.load(ff)
                except Exception:
                    pass

        flags = check_single_document(target_file, doc_type=doc_type, form_data=form_data)
        if flags:
            tamper_stats[t_type]["flagged"] += 1
            for f in flags:
                raw_code = f.get("id", "").split("-")[1] if "-" in f.get("id", "") else f.get("id", "")
                tamper_stats[t_type]["checks_fired"].add(raw_code.lower())

    # Convert sets to sorted lists for reporting
    result: Dict[str, Dict[str, Any]] = {}
    for t_type, s in tamper_stats.items():
        pct = (s["flagged"] / s["total"] * 100.0) if s["total"] > 0 else 0.0
        result[t_type] = {
            "total": s["total"],
            "flagged": s["flagged"],
            "detection_pct": round(pct, 1),
            "checks_fired": sorted(list(s["checks_fired"])),
        }

    return result


def evaluate_bundles() -> List[Dict[str, Any]]:
    """Evaluate the 5 demo bundles against expected authenticity flags."""
    bundle_results: List[Dict[str, Any]] = []

    for app in ["app_01", "app_02", "app_03", "app_04", "app_05"]:
        app_dir = Path(f"dataset/applications/{app}")
        if not app_dir.exists():
            continue

        form_data = {}
        form_path = app_dir / "form.json"
        if form_path.exists():
            with open(form_path, "r", encoding="utf-8") as f:
                form_data = json.load(f)

        expected_data = {}
        exp_path = app_dir / "expected.json"
        if exp_path.exists():
            with open(exp_path, "r", encoding="utf-8") as f:
                expected_data = json.load(f)

        auth_result = run_authenticity(app_dir, form_data)

        auth_expected = [
            f for f in expected_data.get("expected_flags", [])
            if f.get("module") == "authenticity"
        ]

        bundle_results.append({
            "application_id": expected_data.get("application_id", app),
            "scenario": expected_data.get("scenario", ""),
            "sub_score": auth_result["sub_score"],
            "flags_count": len(auth_result["flags"]),
            "flags": auth_result["flags"],
            "expected_flags": auth_expected,
        })

    return bundle_results


def generate_report(
    genuine_stats: Dict[str, Any],
    genuine_fps: List[Dict[str, Any]],
    scan_stats: Dict[str, Any],
    scan_fps: List[Dict[str, Any]],
    tamper_stats: Dict[str, Any],
    bundle_results: List[Dict[str, Any]],
) -> str:
    """Build Markdown evaluation report."""
    lines = [
        "# Authenticity Module Evaluation Report",
        "",
        "## 1. Genuine PDFs (False Positive Check)",
        "",
        f"- Total Documents Evaluated: {genuine_stats.get('total', 0)}",
        f"- Documents with Flags ($\ge$ medium): {genuine_stats.get('docs_with_fp', 0)}",
        f"- False Positive Rate: {genuine_stats.get('fp_rate_pct', 0.0)}%",
        "",
        "## 2. Scanned-Style Documents (Noise Robustness Check)",
        "",
        f"- Total Documents Evaluated: {scan_stats.get('total', 0)}",
        f"- Documents with Flags ($\ge$ medium): {scan_stats.get('docs_with_fp', 0)}",
        f"- False Positive Rate: {scan_stats.get('fp_rate_pct', 0.0)}% (low-severity unreadable fields allowed)",
        "",
        "## 3. Tampered Documents Detection by Tamper Type",
        "",
        "| Tamper Type | Total | Flagged | Detection Rate % | Primary Checks Fired |",
        "| :--- | :---: | :---: | :---: | :--- |",
    ]

    for t_type, s in sorted(tamper_stats.items()):
        checks_str = ", ".join(s["checks_fired"]) if s["checks_fired"] else "none"
        lines.append(f"| `{t_type}` | {s['total']} | {s['flagged']} | {s['detection_pct']}% | {checks_str} |")

    lines.extend([
        "",
        "> [!NOTE]",
        "> Authenticity detects structural, chronological, QR, registry, and metadata mismatches.",
        "> Visual raster tampers (copy-move, splice, seal cloning) are targeted by the forgery module.",
        "",
        "## 4. Demo Bundles (app_01 .. app_05)",
        "",
        "| Bundle | Scenario | Sub-score | Flag Count | Critical Flags |",
        "| :--- | :--- | :---: | :---: | :--- |",
    ])

    for b in bundle_results:
        crits = [f["id"] + " (" + f["message"][:45] + "...)" for f in b["flags"] if f["severity"] == "critical"]
        crit_str = "; ".join(crits) if crits else "None"
        lines.append(f"| `{b['application_id']}` | {b['scenario']} | {b['sub_score']:.1f} | {b['flags_count']} | {crit_str} |")

    lines.extend([
        "",
        "## 5. Most Suspicious False Positives",
        "",
        "| File | Doc Type | Severity | Flag ID | Message |",
        "| :--- | :--- | :--- | :--- | :--- |",
    ])

    all_fps = (genuine_fps + scan_fps)[:10]
    if not all_fps:
        lines.append("| - | - | - | - | None (Zero false positives at severity $\ge$ medium) |")
    else:
        for fp in all_fps:
            lines.append(f"| `{fp['file']}` | `{fp['doc_type']}` | `{fp['severity']}` | `{fp['code']}` | {fp['message']} |")

    lines.append("")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Evaluate authenticity module against synthetic dataset.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of documents per evaluation set")
    args = parser.parse_args()

    print("Evaluating genuine PDFs...")
    gen_stats, gen_fps = evaluate_genuine_pdfs(limit=args.limit)

    print("Evaluating scanned-style JPGs...")
    scan_stats, scan_fps = evaluate_scanned_style_jpgs(limit=args.limit)

    print("Evaluating tampered documents via labels.csv...")
    tamper_stats = evaluate_tampered_documents(limit=args.limit)

    print("Evaluating application bundles...")
    bundle_results = evaluate_bundles()

    report_md = generate_report(
        gen_stats, gen_fps,
        scan_stats, scan_fps,
        tamper_stats,
        bundle_results,
    )

    print("\n" + report_md)

    out_dir = Path("engine/authenticity/eval")
    out_dir.mkdir(parents=True, exist_ok=True)
    report_file = out_dir / "report.md"
    report_file.write_text(report_md, encoding="utf-8")
    print(f"\nReport written to {report_file.as_posix()}")


if __name__ == "__main__":
    main()
