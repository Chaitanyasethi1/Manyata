import json
import os
from engine.forgery import run_forgery

for i in range(1, 6):
    app_dir = f"dataset/applications/app_0{i}"
    form_data = {"application_id": f"AICTE-2026-000{i}"}
    res = run_forgery(app_dir, form_data, storage_dir="storage")
    print(f"\n==================== app_0{i} (sub_score: {res['sub_score']}) ====================")
    print(f"Total flags: {len(res['flags'])}")
    for f in res["flags"]:
        print(f"  [{f['severity'].upper()}] {f['id']}: {f['document']} - {f['message']}")
        print(f"    evidence: bbox={f['evidence']['bbox']}, heatmap={f['evidence']['heatmap_path']}")
