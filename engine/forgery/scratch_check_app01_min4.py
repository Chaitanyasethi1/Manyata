from engine.forgery.ela import analyze_ela
from engine.forgery.native import get_native_image

for doc in ["land_deed.pdf", "trust_cert.pdf", "faculty_list.pdf", "fire_noc.pdf"]:
    nat_01 = get_native_image(f"dataset/applications/app_01/{doc}")
    r01, _ = analyze_ela(nat_01.bgr, est_quality=nat_01.est_quality, min_blocks=4)
    print(f"App 01 {doc}: {len(r01)} regions")
