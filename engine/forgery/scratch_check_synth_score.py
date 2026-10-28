import io, cv2, numpy as np
from PIL import Image, ImageDraw
from engine.forgery.ela import analyze_ela

w, h = 800, 600
img = Image.new("RGB", (w, h), (250, 250, 250))
draw = ImageDraw.Draw(img)
for y in range(50, 550, 30):
    draw.text((50, y), "==================================================================", fill=(20, 20, 20))
    draw.text((50, y + 10), "This is a standard line of text in an AICTE document format 1234567890", fill=(20, 20, 20))

buf1 = io.BytesIO()
img.save(buf1, format="JPEG", quality=85)
buf1.seek(0)
img_q85 = Image.open(buf1)

img_tampered = img_q85.copy()
draw_t = ImageDraw.Draw(img_tampered)
patch_box = [180, 200, 480, 320]
# background with slight delta as in tamper.py
draw_t.rectangle(patch_box, fill=(244, 244, 244))
for py in range(215, 305, 25):
    draw_t.text((190, py), "TAMPERED MODIFIED VALUE 999999", fill=(10, 10, 10))
    draw_t.text((190, py + 10), "SECOND ROW OF FRAUDULENT TEXT", fill=(10, 10, 10))

buf2 = io.BytesIO()
img_tampered.save(buf2, format="JPEG", quality=85)

arr_tampered = cv2.imdecode(np.frombuffer(buf2.getvalue(), np.uint8), cv2.IMREAD_COLOR)

t_regs, _ = analyze_ela(arr_tampered, est_quality=85, z_thresh=3.5)
print("Found regions with z_thresh=3.5:", len(t_regs))
for r in t_regs:
    print("Found region with score:", r["score"], "bbox:", r["bbox_native"])
