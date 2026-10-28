import os, glob
from engine.forgery.native import get_native_image
from engine.forgery.ela import analyze_ela

for app in ["app_01", "app_03", "app_04", "app_05"]:
    for doc in ["land_deed.pdf", "trust_cert.pdf", "faculty_list.pdf", "fire_noc.pdf"]:
        p = f"dataset/applications/{app}/{doc}"
        if not os.path.exists(p):
            continue
        nat = get_native_image(p)
        regs, _ = analyze_ela(nat.bgr, est_quality=nat.est_quality)
        if regs:
            print(f"FP in {app}/{doc}: {len(regs)} regions:", [r["bbox_native"] for r in regs])
        else:
            print(f"OK {app}/{doc}: 0 regions")
