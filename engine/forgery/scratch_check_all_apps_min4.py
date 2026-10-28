from engine.forgery.ela import analyze_ela
from engine.forgery.native import get_native_image

for app in ["app_01", "app_03", "app_04", "app_05"]:
    for doc in ["land_deed.pdf", "trust_cert.pdf", "faculty_list.pdf", "fire_noc.pdf"]:
        nat = get_native_image(f"dataset/applications/{app}/{doc}")
        regs, _ = analyze_ela(nat.bgr, est_quality=nat.est_quality, candidate_qualities=[nat.est_quality, 75, 95], min_blocks=4)
        if regs:
            print(f"FP in {app}/{doc}: {len(regs)} regions:", [r["bbox_native"] for r in regs])
        else:
            print(f"OK {app}/{doc}: 0 regions")
