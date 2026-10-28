"""
Assembles each app_XX folder:
  - Generates base docs
  - Applies tampers
  - Writes form_data.json
"""
import json
from pathlib import Path
from dataset.generator.base_docs import (
    generate_land_deed, generate_trust_certificate,
    generate_faculty_list, generate_fire_noc,
)
from dataset.generator.tamper import tamper_seal_copy_paste

APPS_DIR = Path("dataset/apps")

def _write(path: Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)

def _write_json(path: Path, data: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2))

BASE_FORM = {
    "institution_name": "Greenfield Institute of Technology (SAMPLE)",
    "contact_email":    "admin@greenfield-sample.edu",
    "area_sqft":        45000,
    "total_faculty":    45,
    "trust_reg_no":     "TRUST/SAMPLE/2019/001",
    "fire_noc_valid_until": "2026-11-01",
    "sample_marker":    True,
}

def build_app_01():
    d = APPS_DIR / "app_01"
    _write(d / "land_deed.pdf",         generate_land_deed())
    _write(d / "trust_certificate.pdf", generate_trust_certificate())
    _write(d / "faculty_list.pdf",      generate_faculty_list())
    _write(d / "fire_noc.pdf",          generate_fire_noc())
    form = {**BASE_FORM, "application_id": "AICTE-2026-0001"}
    _write_json(d / "form_data.json", form)

def build_app_02():
    d = APPS_DIR / "app_02"
    _write(d / "land_deed.pdf",         generate_land_deed(area_sqft=4500))  # tampered
    _write(d / "trust_certificate.pdf", generate_trust_certificate())
    _write(d / "faculty_list.pdf",      generate_faculty_list())
    _write(d / "fire_noc.pdf",          generate_fire_noc())
    form = {**BASE_FORM, "application_id": "AICTE-2026-0002",
            "area_sqft": 45000}  # form still says 45000 — mismatch
    _write_json(d / "form_data.json", form)

def build_app_03():
    d = APPS_DIR / "app_03"
    _write(d / "land_deed.pdf",         generate_land_deed())
    _write(d / "trust_certificate.pdf", generate_trust_certificate())
    _write(d / "faculty_list.pdf",      generate_faculty_list())
    _write(d / "fire_noc.pdf",          generate_fire_noc(valid_until="2024-11-01"))  # expired
    form = {**BASE_FORM, "application_id": "AICTE-2026-0003",
            "fire_noc_valid_until": "2024-11-01"}
    _write_json(d / "form_data.json", form)

def build_app_04():
    d = APPS_DIR / "app_04"
    _write(d / "land_deed.pdf",         generate_land_deed())
    _write(d / "trust_certificate.pdf", generate_trust_certificate())
    _write(d / "faculty_list.pdf",      generate_faculty_list(total_faculty=45))
    _write(d / "fire_noc.pdf",          generate_fire_noc())
    form = {**BASE_FORM, "application_id": "AICTE-2026-0004",
            "total_faculty": 30}  # mismatch: doc=45, form=30
    _write_json(d / "form_data.json", form)

def build_app_05():
    d = APPS_DIR / "app_05"
    # Generate base docs first
    land_deed_bytes = generate_land_deed()
    fire_noc_bytes  = generate_fire_noc()
    # Tamper: paste fire dept seal onto land deed
    tampered_land_deed = tamper_seal_copy_paste(fire_noc_bytes, land_deed_bytes)
    _write(d / "land_deed.pdf",         tampered_land_deed)
    _write(d / "trust_certificate.pdf", generate_trust_certificate())
    _write(d / "faculty_list.pdf",      generate_faculty_list())
    _write(d / "fire_noc.pdf",          fire_noc_bytes)
    form = {**BASE_FORM, "application_id": "AICTE-2026-0005"}
    _write_json(d / "form_data.json", form)

def build_all():
    print("Building app_01 (clean)...")
    build_app_01()
    print("Building app_02 (value change)...")
    build_app_02()
    print("Building app_03 (expired NOC)...")
    build_app_03()
    print("Building app_04 (faculty mismatch)...")
    build_app_04()
    print("Building app_05 (seal copy-paste)...")
    build_app_05()
    print("All bundles built.")
