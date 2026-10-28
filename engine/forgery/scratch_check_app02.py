from engine.forgery.native import get_native_image
from engine.forgery.ela import analyze_ela

nat = get_native_image("dataset/applications/app_02/land_deed.pdf")
regs, ela_map = analyze_ela(nat.bgr, est_quality=nat.est_quality)
print("app_02 land_deed regs:", len(regs))
for r in regs:
    print(" ", r["bbox_native"], r["score"], r["message"])
