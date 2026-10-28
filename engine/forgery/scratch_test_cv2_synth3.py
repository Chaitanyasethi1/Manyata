import io, cv2, numpy as np
from PIL import Image, ImageDraw

w, h = 800, 600
img = np.ones((h, w, 3), dtype=np.uint8) * 245
for y in range(50, 550, 40):
    cv2.putText(img, f"Document verification standard line entry at row {y}", (50, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 2)

_, enc = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
base = cv2.imdecode(enc, cv2.IMREAD_COLOR)

tam = base.copy()
patch_box = [180, 200, 550, 320]
cv2.rectangle(tam, (patch_box[0], patch_box[1]), (patch_box[2], patch_box[3]), (245, 245, 245), -1)
cv2.putText(tam, "ALTERED FRAUDULENT ENTRY 9999", (patch_box[0] + 15, patch_box[1] + 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (10, 10, 10), 2)
cv2.putText(tam, "TAMPERED REGISTRATION RECORD", (patch_box[0] + 15, patch_box[1] + 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (10, 10, 10), 2)

_, enc2 = cv2.imencode(".jpg", tam, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
tam_jpg = cv2.imdecode(enc2, cv2.IMREAD_COLOR)

from engine.forgery.ela import analyze_ela

u_regs, _ = analyze_ela(base, est_quality=85)
t_regs, _ = analyze_ela(tam_jpg, est_quality=85)

print("Untouched regs:", len(u_regs))
print("Tampered regs:", len(t_regs))
for r in t_regs:
    b = r["bbox_native"]
    ix1, iy1 = max(b[0], patch_box[0]), max(b[1], patch_box[1])
    ix2, iy2 = min(b[2], patch_box[2]), min(b[3], patch_box[3])
    inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
    union = (b[2] - b[0]) * (b[3] - b[1]) + (patch_box[2] - patch_box[0]) * (patch_box[3] - patch_box[1]) - inter
    iou = inter / max(1.0, union)
    print(f"  bbox: {b}, score: {r['score']:.2f}, IoU: {iou:.3f}")
