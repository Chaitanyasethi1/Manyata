"""Evaluation script for the compliance verification module.

Generates engine/compliance/eval/report.md and prints summary tables to console.
"""

import json
import shutil
import tempfile
from pathlib import Path
from typing import Any, Dict, List

from engine.compliance.api import evaluate_compliance
from engine.compliance.rules_loader import load_rules_with_warnings

# Built-in synthetic ruleset for evaluation checkpoint (c)
SYNTHETIC_RULES = [
    {
        "rule_id": "S01_LAND_AREA",
        "category": "infrastructure",
        "field": "land_area_acre",
        "operator": ">=",
        "value": 10.0,
        "clause": "SYNTHETIC_TEST_NOT_AICTE",
        "severity": "critical",
    },
    {
        "rule_id": "S02_SFR",
        "category": "academics",
        "field": "student_faculty_ratio",
        "operator": "<=",
        "value": 15.0,
        "clause": "SYNTHETIC_TEST_NOT_AICTE",
        "severity": "high",
    },
    {
        "rule_id": "S03_FIRE_NOC_VALID",
        "category": "safety",
        "field": "noc_validity_ok",
        "operator": "==",
        "value": True,
        "clause": "SYNTHETIC_TEST_NOT_AICTE",
        "severity": "high",
    },
    {
        "rule_id": "S04_PENDING_EXAMPLE",
        "category": "governance",
        "field": "land_area_acre",
        "operator": ">=",
        "value": None,
        "clause": "SYNTHETIC_TEST_NOT_AICTE",
        "severity": "medium",
    },
]


def run_evaluation() -> str:
    """Run compliance evaluation and compile report markdown."""
    report_lines: List[str] = []

    def p(text: str = ""):
        report_lines.append(text)
        print(text)

    p("======================================================================")
    p("AICTE SIH26261 Compliance Module Evaluation Report")
    p("======================================================================")
    p()

    # --- (a) Load REAL rules/rules.json ---
    p("### (a) Real rules/rules.json Verification")
    rules_path = Path("rules/rules.json")
    rules, loader_warnings = load_rules_with_warnings(rules_path)
    p(f"- Total rules loaded: {len(rules)}")
    p(f"- Loader warnings: {len(loader_warnings)}")
    for w in loader_warnings:
        p(f"  * Warning: {w}")

    # Evaluate status distribution across 5 bundles with real rules
    rule_status_counts: Dict[str, Dict[str, int]] = {
        r.rule_id: {"pass": 0, "fail": 0, "pending_verification": 0, "not_evaluable": 0, "unknown_field": 0}
        for r in rules
    }

    bundle_ids = ["app_01", "app_02", "app_03", "app_04", "app_05"]
    bundle_facts: Dict[str, Dict[str, Any]] = {}
    bundle_results: Dict[str, Dict[str, Any]] = {}

    for b_id in bundle_ids:
        b_dir = Path("dataset/applications") / b_id
        form_file = b_dir / "form.json"
        form_data = json.loads(form_file.read_text(encoding="utf-8")) if form_file.exists() else {}
        mod_res, details = evaluate_compliance(str(b_dir), form_data, rules_path=rules_path)
        bundle_results[b_id] = mod_res
        bundle_facts[b_id] = details["facts"]

        for r_res in details["rule_results"]:
            rid = r_res["rule_id"]
            st = r_res["status"]
            if rid in rule_status_counts and st in rule_status_counts[rid]:
                rule_status_counts[rid][st] += 1

    p()
    p("| Rule ID | Category | Field | Op | Value | Pending | Pass | Fail | Not Eval | Unknown |")
    p("|---------|----------|-------|----|-------|---------|------|------|----------|---------|")
    for r in rules:
        sc = rule_status_counts[r.rule_id]
        v_str = str(r.value) if r.value is not None else "null"
        p(f"| {r.rule_id} | {r.category} | {r.field} | {r.operator} | {v_str} | {sc['pending_verification']} | {sc['pass']} | {sc['fail']} | {sc['not_evaluable']} | {sc['unknown_field']} |")
    p()

    # --- (b) 5 Bundles with REAL rules ---
    p("### (b) 5 Applications Evaluation (Real rules.json)")
    p()
    p("| Bundle | Sub-Score | Flags Count | Missing Docs | Flags Summary |")
    p("|--------|-----------|-------------|--------------|---------------|")
    for b_id in bundle_ids:
        res = bundle_results[b_id]
        flags_desc = ", ".join(f"{f['id']} ({f['severity']})" for f in res["flags"]) if res["flags"] else "None"
        p(f"| {b_id} | {res['sub_score']} | {len(res['flags'])} | 0 | {flags_desc} |")
    p()

    p("#### Bundle Facts Table:")
    p("| Field | app_01 | app_02 | app_03 | app_04 | app_05 |")
    p("|-------|--------|--------|--------|--------|--------|")
    all_fields = sorted(list(bundle_facts["app_01"].keys()))
    for fld in all_fields:
        vals = [str(bundle_facts[b].get(fld)) for b in bundle_ids]
        p(f"| {fld} | {vals[0]} | {vals[1]} | {vals[2]} | {vals[3]} | {vals[4]} |")
    p()

    # --- (c) Synthetic Ruleset Evaluation ---
    p("### (c) Synthetic Ruleset Evaluation (S01..S04)")
    with tempfile.TemporaryDirectory() as tmp_dir:
        synth_file = Path(tmp_dir) / "synth_rules.json"
        synth_file.write_text(json.dumps(SYNTHETIC_RULES, indent=2), encoding="utf-8")

        p("| Bundle | Rule ID | Field | Op | Expected | Found | Status | Severity |")
        p("|--------|---------|-------|----|----------|-------|--------|----------|")
        for b_id in bundle_ids:
            b_dir = Path("dataset/applications") / b_id
            form_file = b_dir / "form.json"
            form_data = json.loads(form_file.read_text(encoding="utf-8")) if form_file.exists() else {}
            mod_res, details = evaluate_compliance(str(b_dir), form_data, rules_path=synth_file)
            for rr in details["rule_results"]:
                p(f"| {b_id} | {rr['rule_id']} | {rr['field']} | {rr['operator']} | {rr['expected']} | {rr['found']} | {rr['status']} | {rr['severity']} |")
    p()

    # --- (d) Mandatory Document Absence Test ---
    p("### (d) Missing Mandatory Document Verification")
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_app = Path(tmp_dir) / "app_missing_noc"
        shutil.copytree("dataset/applications/app_01", tmp_app)

        # Remove fire_noc.pdf
        noc_file = tmp_app / "fire_noc.pdf"
        if noc_file.exists():
            noc_file.unlink()

        form_file = tmp_app / "form.json"
        form_data = json.loads(form_file.read_text(encoding="utf-8")) if form_file.exists() else {}
        mod_res, details = evaluate_compliance(str(tmp_app), form_data, rules_path=rules_path)

        p(f"- Application directory: {tmp_app.name} (fire_noc.pdf deleted)")
        p(f"- Sub-Score: {mod_res['sub_score']}")
        p(f"- Missing documents identified: {details['missing_documents']}")
        p(f"- Total flags emitted: {len(mod_res['flags'])}")
        for f in mod_res["flags"]:
            p(f"  * [{f['severity'].upper()}] {f['id']}: {f['message']} (clause: {f['clause']})")

    p()
    p("======================================================================")
    p("Evaluation complete.")

    report_content = "\n".join(report_lines)
    eval_dir = Path("engine/compliance/eval")
    eval_dir.mkdir(parents=True, exist_ok=True)
    report_file = eval_dir / "report.md"
    report_file.write_text(report_content, encoding="utf-8")
    print(f"\nReport successfully saved to: {report_file}")
    return report_content


if __name__ == "__main__":
    run_evaluation()
