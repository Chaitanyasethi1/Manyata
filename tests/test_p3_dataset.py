"""
Acceptance tests for P3.
Run: python -m pytest tests/test_p3_dataset.py -v
All 7 tests must pass before moving to P4.
"""
import csv
from pathlib import Path
import pytest

APPS = Path("dataset/apps")
LABELS = Path("dataset/labels.csv")

@pytest.fixture(scope="session", autouse=True)
def generate():
    """Generate dataset once for entire test session."""
    from dataset.generator.run import build_all, write_labels
    build_all()
    write_labels()

def test_all_bundles_exist():
    for i in range(1, 6):
        assert (APPS / f"app_0{i}").is_dir(), f"app_0{i} missing"

def test_each_bundle_has_four_docs():
    required = {"land_deed.pdf","trust_certificate.pdf",
                "faculty_list.pdf","fire_noc.pdf"}
    for i in range(1, 6):
        found = {f.name for f in (APPS / f"app_0{i}").glob("*.pdf")}
        assert required == found, f"app_0{i} missing docs: {required - found}"

def test_each_bundle_has_form_data():
    for i in range(1, 6):
        assert (APPS / f"app_0{i}" / "form_data.json").exists()

def test_labels_csv_exists_and_has_header():
    assert LABELS.exists()
    with open(LABELS) as f:
        reader = csv.DictReader(f)
        assert "bundle_id" in reader.fieldnames

def test_labels_csv_has_20_rows():
    with open(LABELS) as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 20

def test_app_04_form_faculty_mismatch():
    import json
    form = json.loads((APPS / "app_04" / "form_data.json").read_text())
    assert form["total_faculty"] == 30   # doc says 45, form says 30

def test_app_03_noc_expired_in_form():
    import json
    form = json.loads((APPS / "app_03" / "form_data.json").read_text())
    assert form["fire_noc_valid_until"] == "2024-11-01"
