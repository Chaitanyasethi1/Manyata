"""Public API for the AICTE compliance verification module."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from engine.common.subscore import compute_sub_score
from engine.compliance import config
from engine.compliance.config import (
    DEFAULT_CHECKLIST_PATH,
    DEFAULT_RULES_PATH,
    SEVERITY_ORDER,
)
from engine.compliance.facts import build_facts
from engine.compliance.mandatory import check_mandatory
from engine.compliance.rules_engine import RuleResult, evaluate_rule
from engine.compliance.rules_loader import RulesError, load_rules_with_warnings

# Mapping from presence field names to document slot types for deduplication
PRESENCE_FIELD_TO_DOC: Dict[str, str] = {
    "noc_present": "fire_noc",
    "land_deed_present": "land_deed",
    "trust_cert_present": "trust_cert",
    "faculty_list_present": "faculty_list",
}


def evaluate_compliance(
    application_dir: Any,
    form_data: Optional[Dict[str, Any]] = None,
    bundle: Optional[Dict[str, Any]] = None,
    rules_path: Optional[Union[str, Path]] = None,
    checklist_path: Optional[Union[str, Path]] = None,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Evaluate compliance for an institution's application against rules and mandatory checklist.

    Args:
        application_dir: Path to application folder.
        form_data: Form data dictionary.
        bundle: Optional bundle extracted by engine.extraction.extract_bundle.
        rules_path: Optional path to rules.json.
        checklist_path: Optional path to mandatory_documents.json.

    Returns:
        (module_result, details)
          - module_result: Dict matching contract {"module": "compliance", "sub_score": float, "flags": list}
          - details: Dict {"rule_results": list, "missing_documents": list, "facts": dict, "warnings": list, "rules_version_info": dict}

    Raises:
        RulesError: If rules.json fails strict schema, syntax, or logical validation.
    """
    form = form_data or {}
    r_path = Path(rules_path) if rules_path is not None else Path(config.DEFAULT_RULES_PATH)
    c_path = Path(checklist_path) if checklist_path is not None else Path(config.DEFAULT_CHECKLIST_PATH)

    # 1. Load rules strictly (RulesError is not caught!)
    rules, loader_warnings = load_rules_with_warnings(r_path)

    warnings: List[str] = list(loader_warnings)

    # 2. Extract bundle if None, handling absent OCR gracefully without crashing
    if bundle is None and application_dir:
        try:
            from engine.extraction import extract_bundle
            bundle = extract_bundle(application_dir)
        except Exception as e:
            warnings.append(f"OCR/Tesseract extraction unavailable; evaluating form and presence facts only: {e}")
            bundle = None

    # 3. Build facts
    try:
        facts, sources, low_conf = build_facts(application_dir, form, bundle)
    except Exception as e:
        warnings.append(f"Encountered issue building application facts: {e}")
        facts, sources, low_conf = {}, {}, set()

    # 4. Mandatory documents checklist
    missing_docs, mandatory_flags, mand_warnings = check_mandatory(application_dir, form, c_path)
    warnings.extend(mand_warnings)

    # 5. Evaluate each rule
    rule_results: List[RuleResult] = []
    rule_flags: List[Dict[str, Any]] = []
    failed_presence_docs: Set[str] = set()

    for rule in rules:
        r_res, r_flag = evaluate_rule(rule, facts, sources, low_conf)
        rule_results.append(r_res)

        if r_res.status == "fail":
            # Track if this was a document presence rule
            if rule.field in PRESENCE_FIELD_TO_DOC:
                failed_presence_docs.add(PRESENCE_FIELD_TO_DOC[rule.field])

        if r_flag is not None:
            rule_flags.append(r_flag)

    # 6. Deduplication: if a rule on "<doc>_present" fails, drop C-MISSING for that doc
    combined_flags: List[Dict[str, Any]] = list(rule_flags)
    for m_flag in mandatory_flags:
        # Check if the missing document has a failing presence rule
        # m_flag["id"] is "C-MISSING-<doc_type>"
        doc_type = m_flag["id"].replace("C-MISSING-", "")
        if doc_type in failed_presence_docs:
            # Rule flag wins; drop C-MISSING
            continue
        combined_flags.append(m_flag)

    # 7. Order flags: critical first, then high, medium, low; tie-break by flag id
    combined_flags.sort(key=lambda f: (
        SEVERITY_ORDER.get(f.get("severity", "low"), 99),
        f.get("id", ""),
    ))

    # 8. Compute subscore
    sub_score = compute_sub_score(combined_flags)

    module_result = {
        "module": "compliance",
        "sub_score": float(sub_score),
        "flags": combined_flags,
    }

    rules_version_info = {
        "rules_path": str(r_path),
        "rules_count": len(rules),
        "checklist_path": str(c_path),
    }

    details = {
        "rule_results": [r.to_dict() for r in rule_results],
        "missing_documents": missing_docs,
        "facts": facts,
        "warnings": warnings,
        "rules_version_info": rules_version_info,
    }

    return module_result, details


def run_compliance(
    application_dir: Any,
    form_data: Optional[Dict[str, Any]] = None,
    bundle: Optional[Dict[str, Any]] = None,
    rules_path: Optional[Union[str, Path]] = None,
    checklist_path: Optional[Union[str, Path]] = None,
) -> Dict[str, Any]:
    """Execute compliance module validation, returning contract result.

    Args:
        application_dir: Path to application folder.
        form_data: Form data dictionary.
        bundle: Optional bundle extracted by engine.extraction.extract_bundle.
        rules_path: Optional path to rules.json.
        checklist_path: Optional path to mandatory_documents.json.

    Returns:
        Dict conforming to contract {"module": "compliance", "sub_score": float, "flags": list}
    """
    module_result, _ = evaluate_compliance(
        application_dir=application_dir,
        form_data=form_data,
        bundle=bundle,
        rules_path=rules_path,
        checklist_path=checklist_path,
    )
    return module_result
