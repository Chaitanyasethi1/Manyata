"""Subscore calculation based on severity penalties."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

DEFAULT_PENALTIES: Dict[str, Union[int, float]] = {
    "critical": 40,
    "high": 20,
    "medium": 10,
    "low": 3,
}

_CONFIG_PATH = Path("backend/config/scoring.json")


def _load_penalties(scoring_config: Optional[Dict[str, Any]] = None) -> Dict[str, Union[int, float]]:
    """Load penalty configuration from dict, file, or default fallback."""
    if scoring_config is not None:
        return scoring_config.get("penalties", DEFAULT_PENALTIES)

    if _CONFIG_PATH.exists():
        try:
            with open(_CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("penalties", DEFAULT_PENALTIES)
        except Exception:
            pass

    return DEFAULT_PENALTIES


def compute_sub_score(
    flags: List[Dict[str, Any]],
    scoring_config: Optional[Dict[str, Any]] = None,
) -> float:
    """Compute module sub-score: 100 minus sum of penalties by severity, floored at 0.

    Args:
        flags: List of flag dictionaries, each having a 'severity' key.
        scoring_config: Optional dictionary containing 'penalties' map.

    Returns:
        Sub-score as a number between 0 and 100.
    """
    penalties = _load_penalties(scoring_config)
    total_penalty = 0

    for flag in flags:
        sev = str(flag.get("severity", "")).lower()
        penalty = penalties.get(sev, 0)
        total_penalty += penalty

    sub_score = max(0, 100 - total_penalty)
    return float(sub_score)
