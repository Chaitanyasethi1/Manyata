import cv2, numpy as np
from engine.forgery.native import get_native_image
from engine.forgery.ela import analyze_ela

nat = get_native_image("dataset/applications/app_01/faculty_list.pdf")
regs, ela_map = analyze_ela(nat.bgr, est_quality=nat.est_quality)
for r in regs:
    print(r["kind"], r["score"], r["bbox_native"], r["message"])
