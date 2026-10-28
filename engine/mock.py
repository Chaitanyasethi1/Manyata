"""Mock engine for AICTE application validation (SIH26261)."""

import json
from pathlib import Path
from typing import Any, Dict


SAMPLE_MAP: Dict[str, str] = {
    "app_01": "app_01_cleared.json",
    "app_02": "app_02_forgery.json",
    "app_03": "app_03_expired.json",
    "app_04": "app_04_mismatch.json",
    "app_05": "app_05_seal.json",
}


def run_validation(application_dir: str, form_data: dict) -> dict:
    """Run validation mock returning a sample ValidationResult JSON.

    Args:
        application_dir: Path/directory of the application under validation.
        form_data: Dictionary containing application form fields.

    Returns:
        dict: A ValidationResult matching the frozen JSON schema contract.
    """
    samples_dir = Path(__file__).resolve().parent.parent / "contracts" / "samples"

    dir_str = str(application_dir).replace("\\", "/").rstrip("/")
    folder_name = dir_str.split("/")[-1].lower() if "/" in dir_str else dir_str.lower()

    selected_filename = "app_01_cleared.json"
    for key, filename in SAMPLE_MAP.items():
        if key in folder_name or key in dir_str.lower():
            selected_filename = filename
            break

    sample_path = samples_dir / selected_filename
    with open(sample_path, "r", encoding="utf-8") as f:
        result: Dict[str, Any] = json.load(f)

    if isinstance(form_data, dict) and "application_id" in form_data and form_data["application_id"]:
        result["application_id"] = form_data["application_id"]

    return result
