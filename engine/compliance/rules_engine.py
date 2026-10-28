"""Rules evaluation engine for compliance verification."""

from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional, Set, Tuple

from engine.compliance.config import FIELD_DOCUMENT
from engine.compliance.rules_loader import Rule


@dataclass
class RuleResult:
    """Outcome of evaluating one rule against application facts."""
    rule_id: str
    category: str
    field: str
    operator: str
    expected: Any
    found: Any
    status: str  # "pass" | "fail" | "pending_verification" | "not_evaluable" | "unknown_field"
    clause: Optional[str]
    severity: str
    source: Optional[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _compare_values(op: str, expected: Any, found: Any) -> Tuple[bool, bool]:
    """Execute operator comparison between expected (rule.value) and found (fact).

    Returns:
        (passed, is_evaluable)
    """
    if found is None:
        return False, False

    if op in (">=", "<="):
        # Numeric comparison
        if isinstance(found, bool) or not isinstance(found, (int, float)):
            return False, False
        if isinstance(expected, bool) or not isinstance(expected, (int, float)):
            return False, False

        f_val = float(found)
        e_val = float(expected)
        if op == ">=":
            return (f_val >= e_val), True
        else:
            return (f_val <= e_val), True

    elif op == "==":
        # Equality check supporting bool, number, string
        if isinstance(expected, bool):
            if isinstance(found, bool):
                return (found == expected), True
            return False, False

        if isinstance(expected, (int, float)):
            if isinstance(found, (int, float)) and not isinstance(found, bool):
                return (float(found) == float(expected)), True
            return False, False

        if isinstance(expected, str):
            if isinstance(found, str):
                return (found.strip().lower() == expected.strip().lower()), True
            return False, False

        return (found == expected), True

    elif op == "in":
        # Membership check
        if not isinstance(expected, list):
            return False, False

        if isinstance(found, str):
            str_expected = [str(x).strip().lower() for x in expected]
            return (found.strip().lower() in str_expected), True

        return (found in expected), True

    return False, False


def evaluate_rule(
    rule: Rule,
    facts: Dict[str, Any],
    sources: Dict[str, str],
    low_conf: Set[str],
) -> Tuple[RuleResult, Optional[Dict[str, Any]]]:
    """Evaluate a single rule against facts and determine its flag (if any).

    Args:
        rule: Rule instance.
        facts: Dict of extracted facts.
        sources: Dict mapping field names to provenance.
        low_conf: Set of field names derived from low OCR confidence.

    Returns:
        (rule_result, flag_dict_or_none)
    """
    field_name = rule.field
    source = sources.get(field_name)

    # 1. Unknown field check
    if field_name not in facts:
        res = RuleResult(
            rule_id=rule.rule_id,
            category=rule.category,
            field=field_name,
            operator=rule.operator,
            expected=rule.value,
            found=None,
            status="unknown_field",
            clause=rule.clause,
            severity=rule.severity,
            source=source,
        )
        return res, None

    found_val = facts.get(field_name)

    # 2. Pending verification (rule value is null)
    if rule.value is None:
        res = RuleResult(
            rule_id=rule.rule_id,
            category=rule.category,
            field=field_name,
            operator=rule.operator,
            expected=None,
            found=found_val,
            status="pending_verification",
            clause=rule.clause,
            severity=rule.severity,
            source=source,
        )
        return res, None

    # 3. Fact is missing or not evaluable
    if found_val is None:
        res = RuleResult(
            rule_id=rule.rule_id,
            category=rule.category,
            field=field_name,
            operator=rule.operator,
            expected=rule.value,
            found=None,
            status="not_evaluable",
            clause=rule.clause,
            severity=rule.severity,
            source=source,
        )
        doc_name = FIELD_DOCUMENT.get(field_name, "application_form")
        flag = {
            "id": f"C-DATA-{rule.rule_id}",
            "severity": "low",
            "message": f"Rule {rule.rule_id} could not be evaluated: {field_name} unavailable",
            "document": doc_name,
            "evidence": {
                "page": 1 if doc_name.endswith(".pdf") else None,
                "bbox": None,
                "heatmap_path": None,
            },
            "clause": rule.clause,
        }
        return res, flag

    # 4. Compare expected and found
    passed, is_evaluable = _compare_values(rule.operator, rule.value, found_val)

    if not is_evaluable:
        res = RuleResult(
            rule_id=rule.rule_id,
            category=rule.category,
            field=field_name,
            operator=rule.operator,
            expected=rule.value,
            found=found_val,
            status="not_evaluable",
            clause=rule.clause,
            severity=rule.severity,
            source=source,
        )
        doc_name = FIELD_DOCUMENT.get(field_name, "application_form")
        flag = {
            "id": f"C-DATA-{rule.rule_id}",
            "severity": "low",
            "message": f"Rule {rule.rule_id} could not be evaluated: {field_name} unavailable",
            "document": doc_name,
            "evidence": {
                "page": 1 if doc_name.endswith(".pdf") else None,
                "bbox": None,
                "heatmap_path": None,
            },
            "clause": rule.clause,
        }
        return res, flag

    if passed:
        res = RuleResult(
            rule_id=rule.rule_id,
            category=rule.category,
            field=field_name,
            operator=rule.operator,
            expected=rule.value,
            found=found_val,
            status="pass",
            clause=rule.clause,
            severity=rule.severity,
            source=source,
        )
        return res, None
    else:
        res = RuleResult(
            rule_id=rule.rule_id,
            category=rule.category,
            field=field_name,
            operator=rule.operator,
            expected=rule.value,
            found=found_val,
            status="fail",
            clause=rule.clause,
            severity=rule.severity,
            source=source,
        )

        # Flag handling for fail
        doc_name = FIELD_DOCUMENT.get(field_name, "application_form")
        is_low_conf = field_name in low_conf

        if is_low_conf:
            flag_severity = "low"
            msg = f"Rule {rule.rule_id} ({field_name} {rule.operator} {rule.value}) not met: found {found_val} (possible violation, low OCR confidence, verify manually)"
        else:
            flag_severity = rule.severity
            msg = f"Rule {rule.rule_id} ({field_name} {rule.operator} {rule.value}) not met: found {found_val}"

        flag = {
            "id": f"C-RULE-{rule.rule_id}",
            "severity": flag_severity,
            "message": msg,
            "document": doc_name,
            "evidence": {
                "page": 1 if doc_name.endswith(".pdf") else None,
                "bbox": None,
                "heatmap_path": None,
            },
            "clause": rule.clause,
        }
        return res, flag
