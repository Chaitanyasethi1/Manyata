import io
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
from engine.forgery.ela import analyze_ela

# 1. Create text-like image
w, h = 800, 600
img = Image.new("RGB", (w, h), (245, 245, 245))
draw = ImageDraw.Draw(img)

# Try loading Vera.ttf from dataset/generator/fonts
font_path = "dataset/generator/fonts/Vera.ttf"
try:
    font = ImageFont.truetype(font_path, 18)
    font_bold = ImageFont.truetype("dataset/generator/fonts/VeraBd.ttf", 20)
except Exception:
    font = font_bold = None

for y in range(60, 540, 40):
    if font:
        draw.text((60, y), f"Official AICTE Document Record Entry Section at index {y} - verified format", fill=(25, 25, 25), font=font)
    else:
        draw.text((60, y), f"Official AICTE Document Record Entry Section at index {y} - verified format", fill=(25, 25, 25))

buf1 = io.BytesIO()
img.save(buf1, format="JPEG", quality=85)
buf1.seek(0)
img_q85 = Image.open(buf1)

# Untouched
arr_untouched = cv2.imdecode(np.frombuffer(buf1.getvalue(), np.uint8), cv2.IMREAD_COLOR)
u_regs, _ = analyze_ela(arr_untouched, est_quality=85)
print("Untouched regions:", len(u_regs))

# Tampered: paint + retype patch
img_tampered = img_q85.copy()
draw_t = ImageDraw.Draw(img_tampered)
patch_box = [200, 220, 500, 300]
draw_t.rectangle(patch_box, fill=(253, 253, 253))
if font_bold:
    draw_t.text((210, 230), "FRAUDULENT ALTERED VALUE 99999", fill=(10, 10, 10), font=font_bold)
    draw_t.text((210, 260), "TAMPERED REGISTRATION RECORD", fill=(10, 10, 10), font=font_bold)
else:
    draw_t.text((210, 240), "FRAUDULENT ALTERED VALUE 99999", fill=(10, 10, 10))

buf2 = io.BytesIO()
img_tampered.save(buf2, format="JPEG", quality=85)
arr_tampered = cv2.imdecode(np.frombuffer(buf2.getvalue(), np.uint8), cv2.IMREAD_COLOR)

t_regs, _ = analyze_ela(arr_tampered, est_quality=85)
print("Tampered regions:", len(t_regs))
for r in t_regs:
    b = r["bbox_native"]
    ix1, iy1 = max(b[0], patch_box[0]), max(b[1], patch_box[1])
    ix2, iy2 = min(b[2], patch_box[2]), min(b[3], patch_box[3])
    inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
    union = (b[2] - b[0]) * (b[3] - b[1]) + (patch_box[2] - patch_box[0]) * (patch_box[3] - patch_box[1]) - inter
    iou = inter / max(1.0, union)
    print(f"  bbox: {b}, score: {r['score']:.2f}, IoU: {iou:.3f}")
