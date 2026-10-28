"""Rules loader and validator for compliance engine."""

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

from engine.compliance.config import DEFAULT_RULES_PATH
from engine.compliance.facts import KNOWN_FIELDS

REQUIRED_KEYS = {"rule_id", "category", "field", "operator", "value", "clause", "severity"}
VALID_OPERATORS = {">=", "<=", "==", "in"}
VALID_SEVERITIES = {"critical", "high", "medium", "low"}


class RulesError(Exception):
    """Raised when rules.json fails strict schema, syntax, or logical validation."""
    pass


@dataclass
class Rule:
    """Represents a validated compliance rule."""
    rule_id: str
    category: str
    field: str
    operator: str
    value: Any
    clause: Optional[str]
    severity: str
    extra: Dict[str, Any] = field(default_factory=dict)
    warning: Optional[str] = None

    def __getitem__(self, item: str) -> Any:
        if hasattr(self, item):
            return getattr(self, item)
        if item in self.extra:
            return self.extra[item]
        raise KeyError(item)

    def get(self, item: str, default: Any = None) -> Any:
        try:
            return self[item]
        except KeyError:
            return default


def load_rules(path: Optional[Union[str, Path]] = None) -> List[Rule]:
    """Load and strictly validate compliance rules from a JSON file.

    Args:
        path: Path to rules.json. Defaults to DEFAULT_RULES_PATH (rules/rules.json).

    Returns:
        List of validated Rule instances.

    Raises:
        RulesError: If the file does not exist, is invalid JSON, is not a list,
                    or violates any structural/type constraints.
    """
    rules, _ = load_rules_with_warnings(path)
    return rules


def load_rules_with_warnings(
    path: Optional[Union[str, Path]] = None,
) -> Tuple[List[Rule], List[str]]:
    """Load and strictly validate compliance rules, returning rules and field warnings.

    Args:
        path: Path to rules.json. Defaults to DEFAULT_RULES_PATH.

    Returns:
        (rules, warnings)
          - rules: List[Rule]
          - warnings: List[str] with messages for unknown fields
    """
    rule_path = Path(path) if path is not None else DEFAULT_RULES_PATH

    if not rule_path.exists():
        raise RulesError(f"Rules file not found at: {rule_path}")

    try:
        with open(rule_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        raise RulesError(f"Failed to parse rules JSON from {rule_path}: {e}")

    if not isinstance(data, list):
        raise RulesError(f"Rules configuration must be a JSON array (list), found: {type(data).__name__}")

    rules: List[Rule] = []
    seen_rule_ids = set()
    warnings: List[str] = []

    for idx, item in enumerate(data):
        if not isinstance(item, dict):
            raise RulesError(f"Rule at index {idx} must be a JSON object, found: {type(item).__name__}")

        # Check required keys
        missing_keys = REQUIRED_KEYS - set(item.keys())
        if missing_keys:
            raise RulesError(f"Rule at index {idx} is missing required keys: {sorted(list(missing_keys))}")

        rule_id = item["rule_id"]
        if not isinstance(rule_id, str) or not rule_id.strip():
            raise RulesError(f"Rule at index {idx} has invalid or empty rule_id: {rule_id}")

        if rule_id in seen_rule_ids:
            raise RulesError(f"Duplicate rule_id '{rule_id}' found at index {idx}")
        seen_rule_ids.add(rule_id)

        operator = item["operator"]
        if operator not in VALID_OPERATORS:
            raise RulesError(
                f"Rule '{rule_id}' has invalid operator '{operator}'. Must be one of {sorted(list(VALID_OPERATORS))}"
            )

        severity = item["severity"]
        if severity not in VALID_SEVERITIES:
            raise RulesError(
                f"Rule '{rule_id}' has invalid severity '{severity}'. Must be one of {sorted(list(VALID_SEVERITIES))}"
            )

        val = item["value"]
        # Value must be null, number, bool, string, or list
        if val is not None:
            if not isinstance(val, (int, float, bool, str, list)):
                raise RulesError(
                    f"Rule '{rule_id}' has invalid value type '{type(val).__name__}'. "
                    "Must be null, number, bool, string, or list."
                )

            # Operator 'in' with non-null value that is not a list
            if operator == "in" and not isinstance(val, list):
                raise RulesError(f"Rule '{rule_id}' with operator 'in' must have a list value, found: {type(val).__name__}")

            # Ordering operators (>=, <=) with a non-null value that is not a number
            if operator in (">=", "<="):
                # In Python, bool is a subclass of int, so explicitly disallow bool for ordering
                if isinstance(val, bool) or not isinstance(val, (int, float)):
                    raise RulesError(
                        f"Rule '{rule_id}' with operator '{operator}' must have a numeric value, found: {type(val).__name__}"
                    )

        # Field check and warning
        field_name = item["field"]
        rule_warning = None
        if field_name not in KNOWN_FIELDS:
            rule_warning = f"Rule '{rule_id}' references unknown field '{field_name}'"
            warnings.append(rule_warning)

        # Extra keys
        extra_keys = {k: v for k, v in item.items() if k not in REQUIRED_KEYS}

        clause_val = item["clause"]
        if clause_val is not None and not isinstance(clause_val, str):
            clause_val = str(clause_val)

        rule = Rule(
            rule_id=rule_id,
            category=str(item["category"]),
            field=str(field_name),
            operator=str(operator),
            value=val,
            clause=clause_val,
            severity=str(severity),
            extra=extra_keys,
            warning=rule_warning,
        )
        rules.append(rule)

    return rules, warnings
