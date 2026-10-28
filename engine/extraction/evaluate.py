"""Evaluation pipeline comparing extracted fields against synthetic ground truth."""

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .api import extract_document


def _normalize_str(s: Any) -> str:
    """Normalize string for whitespace and case."""
    if s is None:
        return ""
    return " ".join(str(s).lower().split())


def _match_field(doc_type: str, field_name: str, extracted_val: Any, truth_val: Any) -> bool:
    """Compare extracted field value against truth printed field value."""
    if truth_val is None:
        return extracted_val is None

    if extracted_val is None:
        return False

    # Dates and IDs
    if field_name in ["registration_date", "issue_date", "validity_date", "registration_number", "noc_number"]:
        return str(extracted_val).strip() == str(truth_val).strip()

    # Areas
    if field_name in ["land_area_acre"]:
        try:
            return abs(float(extracted_val) - float(truth_val)) <= 0.05
        except (ValueError, TypeError):
            return False

    # Counts
    if field_name in ["faculty_count"]:
        try:
            return int(extracted_val) == int(truth_val)
        except (ValueError, TypeError):
            return False

    # Faculty row count
    if field_name == "faculty_row_count":
        try:
            truth_rows = truth_val if isinstance(truth_val, int) else len(truth_val)
            return int(extracted_val) == truth_rows
        except (ValueError, TypeError):
            return False

    # Trustees list
    if field_name == "trustees":
        if not isinstance(extracted_val, list) or not isinstance(truth_val, list):
            return False
        ext_set = {_normalize_str(t) for t in extracted_val}
        truth_set = {_normalize_str(t) for t in truth_val}
        return ext_set == truth_set

    # General strings (owner_name, institution_name, trust_name, city, address, issuing_authority, plot_number)
    return _normalize_str(extracted_val) == _normalize_str(truth_val)


def evaluate(limit: Optional[int] = None) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Run full evaluation suite across genuine JPGs, genuine PDFs, tampered JPGs, and scanned JPGs."""
    truth_dir = Path("dataset/generated/truth")
    if not truth_dir.exists():
        print(f"Ground truth directory {truth_dir} not found.")
        return {}, []

    groups = {
        "genuine_jpg": sorted(Path("dataset/generated/genuine").glob("*.jpg")),
        "genuine_pdf": sorted(Path("dataset/generated/genuine").glob("*.pdf"))[:10],
        "tampered_jpg": sorted(Path("dataset/generated/tampered").glob("*.jpg")),
        "scanned_style_jpg": sorted(Path("dataset/generated/scanned_style").glob("*.jpg")),
    }

    group_stats: Dict[str, Dict[str, Any]] = {}
    field_stats: Dict[Tuple[str, str], Dict[str, int]] = {}
    failures: List[Dict[str, Any]] = []

    for group_name, files in groups.items():
        eval_files = files[:limit] if limit is not None else files
        doc_count = len(eval_files)
        classify_correct = 0
        total_conf = 0.0
        docs_with_low_conf = 0

        for fpath in eval_files:
            stem = fpath.stem
            # Map truth file: for PDFs, the truth file is <stem>.json
            truth_file = truth_dir / f"{stem}.json"
            if not truth_file.exists():
                # Check for base name
                base_stem = stem.replace("_scan", "").replace("_t", "")
                truth_file = truth_dir / f"{base_stem}.json"
                if not truth_file.exists():
                    continue

            with open(truth_file, "r", encoding="utf-8") as tf:
                truth_data = json.load(tf)

            true_doc_type = truth_data.get("doc_type")
            printed_fields = truth_data.get("printed_fields", truth_data.get("original_fields", {}))

            # Run extraction
            res = extract_document(fpath, expected_doc_type=true_doc_type)

            # Classification check
            pred_type = res.details.get("predicted_doc_type")
            if pred_type == true_doc_type:
                classify_correct += 1

            # Document confidence
            total_conf += res.confidence
            if res.fields.get("_low_confidence"):
                docs_with_low_conf += 1

            # Check individual fields
            for f_name, t_val in printed_fields.items():
                if f_name == "rows":
                    # Evaluate faculty_row_count
                    ext_frc = res.fields.get("faculty_row_count", 0)
                    key = (true_doc_type, "faculty_row_count")
                    if key not in field_stats:
                        field_stats[key] = {"correct": 0, "total": 0}
                    field_stats[key]["total"] += 1
                    is_match = _match_field(true_doc_type, "faculty_row_count", ext_frc, t_val)
                    if is_match:
                        field_stats[key]["correct"] += 1
                    else:
                        failures.append({
                            "file": fpath.name,
                            "group": group_name,
                            "doc_type": true_doc_type,
                            "field": "faculty_row_count",
                            "expected": len(t_val) if isinstance(t_val, list) else t_val,
                            "got": ext_frc,
                        })
                    continue

                ext_val = res.fields.get(f_name)
                key = (true_doc_type, f_name)
                if key not in field_stats:
                    field_stats[key] = {"correct": 0, "total": 0}
                field_stats[key]["total"] += 1

                is_match = _match_field(true_doc_type, f_name, ext_val, t_val)
                if is_match:
                    field_stats[key]["correct"] += 1
                else:
                    failures.append({
                        "file": fpath.name,
                        "group": group_name,
                        "doc_type": true_doc_type,
                        "field": f_name,
                        "expected": t_val,
                        "got": ext_val,
                    })

        mean_c = total_conf / doc_count if doc_count > 0 else 0.0
        class_acc = (classify_correct / doc_count) * 100.0 if doc_count > 0 else 0.0

        group_stats[group_name] = {
            "total_docs": doc_count,
            "classify_correct": classify_correct,
            "classify_acc_pct": round(class_acc, 1),
            "mean_confidence": round(mean_c, 4),
            "docs_with_low_conf": docs_with_low_conf,
        }

    return {
        "group_stats": group_stats,
        "field_stats": field_stats,
    }, failures


def generate_report(stats: Dict[str, Any], failures: List[Dict[str, Any]]) -> str:
    """Generate Markdown report from evaluation statistics."""
    lines = [
        "# Document Extraction Evaluation Report",
        "",
        "## Summary by Source Group",
        "",
        "| Group | Documents | Classification Accuracy | Mean Doc Confidence | Docs with _low_confidence |",
        "| :--- | :---: | :---: | :---: | :---: |",
    ]

    for g_name, g_info in stats.get("group_stats", {}).items():
        lines.append(
            f"| `{g_name}` | {g_info['total_docs']} | {g_info['classify_acc_pct']}% | "
            f"{g_info['mean_confidence']:.4f} | {g_info['docs_with_low_conf']} |"
        )

    lines.extend([
        "",
        "## Field-Level Accuracy",
        "",
        "| Document Type | Field | Matches / Total | Accuracy % |",
        "| :--- | :--- | :---: | :---: |",
    ])

    field_stats = stats.get("field_stats", {})
    for (doc_type, f_name), s_info in sorted(field_stats.items()):
        pct = (s_info["correct"] / s_info["total"] * 100.0) if s_info["total"] > 0 else 0.0
        lines.append(f"| `{doc_type}` | `{f_name}` | {s_info['correct']} / {s_info['total']} | {pct:.1f}% |")

    lines.extend([
        "",
        "## 10 Worst-Failing Fields (Sample Debug Log)",
        "",
        "| File | Doc Type | Field | Expected | Extracted |",
        "| :--- | :--- | :--- | :--- | :--- |",
    ])

    sample_failures = failures[:10]
    if not sample_failures:
        lines.append("| - | - | - | None (All fields matched!) | - |")
    else:
        for fail in sample_failures:
            exp_str = str(fail["expected"])[:40]
            got_str = str(fail["got"])[:40]
            lines.append(f"| `{fail['file']}` | `{fail['doc_type']}` | `{fail['field']}` | `{exp_str}` | `{got_str}` |")

    lines.append("")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Evaluate document extraction engine against synthetic truth.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of files per group for fast testing")
    args = parser.parse_args()

    print("Running document extraction evaluation...")
    stats, failures = evaluate(limit=args.limit)

    report_md = generate_report(stats, failures)
    print("\n" + report_md)

    # Save to engine/extraction/eval/report.md
    out_dir = Path("engine/extraction/eval")
    out_dir.mkdir(parents=True, exist_ok=True)
    report_file = out_dir / "report.md"
    report_file.write_text(report_md, encoding="utf-8")
    print(f"\nReport saved to {report_file.as_posix()}")


if __name__ == "__main__":
    main()
