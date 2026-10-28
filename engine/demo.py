"""Demo CLI script for running the complete AICTE validation engine on application bundles.

Usage:
    python -m engine.demo [--bundles app_01 app_02 ...] [--storage storage]
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from engine.orchestrator import run_validation_full

DEFAULT_BUNDLES = ["app_01", "app_02", "app_03", "app_04", "app_05"]


def _load_scoring_config() -> Dict[str, Any]:
    """Load backend scoring configuration (read only)."""
    cfg_path = Path("backend/config/scoring.json")
    if cfg_path.exists():
        with open(cfg_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "weights": {"authenticity": 0.30, "forgery": 0.35, "compliance": 0.35},
        "critical_cap": 74,
        "thresholds": {"cleared_min": 75, "under_review_min": 50},
    }


def compute_preview_score_and_status(
    modules: List[Dict[str, Any]],
    scoring_cfg: Dict[str, Any],
) -> Tuple[float, str, bool]:
    """Compute a preview trust score and lifecycle status from module results.

    Note: This is a preview demonstration only; production scoring and routing
    lives in the backend scoring service.
    """
    weights = scoring_cfg.get("weights", {"authenticity": 0.30, "forgery": 0.35, "compliance": 0.35})
    critical_cap = scoring_cfg.get("critical_cap", 74)
    thresholds = scoring_cfg.get("thresholds", {"cleared_min": 75, "under_review_min": 50})

    sub_scores: Dict[str, float] = {}
    has_critical = False

    for mod in modules:
        m_name = mod.get("module")
        s_score = float(mod.get("sub_score", 100.0))
        sub_scores[m_name] = s_score
        for flag in mod.get("flags", []):
            if flag.get("severity") == "critical":
                has_critical = True

    # Weighted sum
    w_auth = weights.get("authenticity", 0.30)
    w_forg = weights.get("forgery", 0.35)
    w_comp = weights.get("compliance", 0.35)

    raw_score = (
        sub_scores.get("authenticity", 100.0) * w_auth
        + sub_scores.get("forgery", 100.0) * w_forg
        + sub_scores.get("compliance", 100.0) * w_comp
    )
    raw_score = round(raw_score, 2)

    if has_critical:
        trust_score = min(raw_score, float(critical_cap))
    else:
        trust_score = raw_score

    # Determine status
    if trust_score >= thresholds.get("cleared_min", 75):
        status = "CLEARED"
    elif trust_score >= thresholds.get("under_review_min", 50):
        status = "UNDER_REVIEW"
    else:
        status = "REJECTED"

    return trust_score, status, has_critical


def run_demo(bundles: List[str], storage_dir: str) -> int:
    """Execute validation over the specified bundles and generate demo outputs."""
    scoring_cfg = _load_scoring_config()
    out_dir = Path("engine/demo_out")
    out_dir.mkdir(parents=True, exist_ok=True)

    summary_lines: List[str] = []

    def p(text: str = ""):
        summary_lines.append(text)
        print(text)

    p("====================================================================================================")
    p("AICTE SIH26261 Application Validation Engine - End-to-End Demo")
    p("====================================================================================================")
    p()

    table_header = f"{'Bundle':8} | {'Auth Sub':8} | {'Forg Sub':8} | {'Comp Sub':8} | {'Flags (C/H/M/L)':17} | {'Critical?':9} | {'Trust Score':11} | {'Status':12} | {'Time (s)':8} | {'Test'}"
    p(table_header)
    p("-" * len(table_header))

    all_passed = True
    bundle_data_list = []

    for b_name in bundles:
        app_dir = Path("dataset/applications") / b_name
        form_path = app_dir / "form.json"
        expected_path = app_dir / "expected.json"

        form_data = json.loads(form_path.read_text(encoding="utf-8")) if form_path.exists() else {}
        expected_data = json.loads(expected_path.read_text(encoding="utf-8")) if expected_path.exists() else {}

        t_start = time.perf_counter()
        result, details = run_validation_full(app_dir, form_data, storage_dir=storage_dir)
        elapsed = time.perf_counter() - t_start

        # Extract module subscores
        mod_map = {m["module"]: m for m in result.get("modules", [])}
        auth_sub = mod_map.get("authenticity", {}).get("sub_score", 100.0)
        forg_sub = mod_map.get("forgery", {}).get("sub_score", 100.0)
        comp_sub = mod_map.get("compliance", {}).get("sub_score", 100.0)

        # Count flags by severity
        sev_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        all_flags = []
        for m in result.get("modules", []):
            for f in m.get("flags", []):
                all_flags.append((m["module"], f))
                sev = f.get("severity", "low")
                if sev in sev_counts:
                    sev_counts[sev] += 1

        sev_str = f"{sev_counts['critical']}/{sev_counts['high']}/{sev_counts['medium']}/{sev_counts['low']}"
        has_crit = sev_counts["critical"] > 0
        crit_str = "YES" if has_crit else "NO"

        # Preview trust score
        trust_score, status, _ = compute_preview_score_and_status(result.get("modules", []), scoring_cfg)

        # Verify against expected.json
        must_not_be_cleared = expected_data.get("must_not_be_cleared", False)
        if must_not_be_cleared:
            bundle_passed = (status != "CLEARED")
        else:
            bundle_passed = (status == "CLEARED")

        if not bundle_passed:
            all_passed = False

        status_tag = "PASS" if bundle_passed else "FAIL"

        row = f"{b_name:8} | {auth_sub:8.1f} | {forg_sub:8.1f} | {comp_sub:8.1f} | {sev_str:17} | {crit_str:9} | {trust_score:11.2f} | {status:12} | {elapsed:8.2f} | {status_tag}"
        p(row)

        bundle_data_list.append({
            "bundle": b_name,
            "result": result,
            "details": details,
            "flags": all_flags,
            "preview_scoring": {
                "trust_score": trust_score,
                "status": status,
                "note": "preview, real routing lives in backend scoring service",
                "must_not_be_cleared": must_not_be_cleared,
                "passed": bundle_passed,
            },
        })

        # Write per-bundle output json
        b_out_file = out_dir / f"{b_name}.json"
        with open(b_out_file, "w", encoding="utf-8") as f:
            json.dump({
                "application_id": result.get("application_id"),
                "validation_result": result,
                "details": details,
                "preview_scoring": {
                    "trust_score": trust_score,
                    "status": status,
                    "passed": bundle_passed,
                },
            }, f, indent=2)

    p("-" * len(table_header))
    p()

    # Detailed flag listings
    p("====================================================================================================")
    p("Detailed Flag Breakdown Per Application")
    p("====================================================================================================")
    for b_item in bundle_data_list:
        b_name = b_item["bundle"]
        flags = b_item["flags"]
        prev = b_item["preview_scoring"]
        p(f"\n--- {b_name.upper()} (Preview Trust Score: {prev['trust_score']:.2f}, Status: {prev['status']}) ---")
        if not flags:
            p("  (No flags generated across all modules)")
        else:
            for mod_name, f in flags:
                p(f"  [{f['severity'].upper():8}] {f['id']:24} | {f['document']:15} | {f['message']}")
                if f.get("evidence", {}).get("heatmap_path"):
                    p(f"             heatmap: {f['evidence']['heatmap_path']}")
    p()

    # Write summary.md
    summary_file = out_dir / "summary.md"
    summary_file.write_text("\n".join(summary_lines), encoding="utf-8")
    print(f"\nDemo results successfully written to: {out_dir}")
    print(f"Summary markdown written to: {summary_file}")

    if all_passed:
        print("\nAll application bundles PASSED verification against expected criteria.")
        return 0
    else:
        print("\nOne or more application bundles FAILED verification.")
        return 1


def main():
    parser = argparse.ArgumentParser(description="AICTE Validation Engine Demo CLI")
    parser.add_argument(
        "--bundles",
        nargs="+",
        default=DEFAULT_BUNDLES,
        help="List of application bundles to evaluate (e.g., app_01 app_02)",
    )
    parser.add_argument(
        "--storage",
        default="storage",
        help="Directory to store artifacts and heatmaps",
    )
    args = parser.parse_args()

    exit_code = run_demo(bundles=args.bundles, storage_dir=args.storage)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
