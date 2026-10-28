from engine.forgery.ela import analyze_ela
from engine.forgery.native import get_native_image

nat = get_native_image("dataset/applications/app_02/land_deed.pdf")
regs, _ = analyze_ela(nat.bgr, est_quality=nat.est_quality, candidate_qualities=[nat.est_quality, 75, 95], min_blocks=4)
print("app_02 land_deed regions with [est_quality, 75, 95]:", len(regs))
for r in regs:
    print(" ", r["bbox_native"], r["score"], r["message"])
