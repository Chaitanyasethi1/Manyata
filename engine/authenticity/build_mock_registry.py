"""Developer tool to build mock registry database from genuine dataset truth files.

Run once: python -m engine.authenticity.build_mock_registry
The runtime validation code never reads dataset/generated/truth/ directly.
"""

import json
from pathlib import Path
from typing import Any, Dict


def build_mock_registry() -> Path:
    """Build mock registry JSON from genuine documents' original fields."""
    truth_dir = Path("dataset/generated/truth")
    if not truth_dir.exists():
        raise FileNotFoundError(f"Truth directory not found at {truth_dir}")

    registry: Dict[str, Dict[str, Any]] = {
        "trusts": {},
        "lands": {},
        "nocs": {},
    }

    # Process all genuine truth files (exclude _t and _scan)
    for truth_file in sorted(truth_dir.glob("*.json")):
        fname = truth_file.stem
        if "_t" in fname or "_scan" in fname:
            continue

        with open(truth_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        doc_type = data.get("doc_type")
        orig_fields = data.get("original_fields", {})

        if doc_type == "trust_cert":
            reg_no = orig_fields.get("registration_number")
            if reg_no:
                registry["trusts"][reg_no] = {
                    "trust_name": orig_fields.get("trust_name"),
                    "institution_name": orig_fields.get("institution_name"),
                    "registration_date": orig_fields.get("registration_date"),
                }

        elif doc_type == "land_deed":
            reg_no = orig_fields.get("registration_number")
            if reg_no:
                registry["lands"][reg_no] = {
                    "owner_name": orig_fields.get("owner_name"),
                    "land_area_acre": orig_fields.get("land_area_acre"),
                    "registration_date": orig_fields.get("registration_date"),
                }

        elif doc_type == "fire_noc":
            noc_no = orig_fields.get("noc_number")
            if noc_no:
                registry["nocs"][noc_no] = {
                    "institution_name": orig_fields.get("institution_name"),
                    "issue_date": orig_fields.get("issue_date"),
                    "validity_date": orig_fields.get("validity_date"),
                }

    out_dir = Path("engine/authenticity/data")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "mock_registry.json"

    with open(out_path, "w", encoding="utf-8") as out_f:
        json.dump(registry, out_f, indent=2)

    print(
        f"Built mock registry at {out_path}: "
        f"{len(registry['trusts'])} trusts, {len(registry['lands'])} lands, {len(registry['nocs'])} NOCs."
    )
    return out_path


if __name__ == "__main__":
    build_mock_registry()
