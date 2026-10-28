import io, cv2, numpy as np
from PIL import Image, ImageDraw

w, h = 800, 600
img = Image.new("RGB", (w, h), (250, 250, 250))
draw = ImageDraw.Draw(img)
for y in range(40, 560, 35):
    draw.text((50, y), f"Official Document Record Standard Line Entry at index {y}", fill=(20, 20, 20))

buf1 = io.BytesIO()
img.save(buf1, format="JPEG", quality=85)
buf1.seek(0)
img_q85 = Image.open(buf1)

# Tampered: paint + retype patch
img_tam = img_q85.copy()
draw_t = ImageDraw.Draw(img_tam)
patch_box = [150, 180, 550, 320]
# background slightly off or painted
draw_t.rectangle(patch_box, fill=(240, 240, 240))
draw_t.text((160, 200), "MODIFIED ENTRY FRAUDULENT 12345", fill=(10, 10, 10))
draw_t.text((160, 240), "ALTERED RECORD REGISTRATION 67890", fill=(10, 10, 10))
draw_t.text((160, 280), "THIRD LINE OF EDITED ENTRY 99999", fill=(10, 10, 10))

buf2 = io.BytesIO()
img_tam.save(buf2, format="JPEG", quality=85)

tam_arr = cv2.imdecode(np.frombuffer(buf2.getvalue(), np.uint8), cv2.IMREAD_COLOR)
unt_arr = cv2.imdecode(np.frombuffer(buf1.getvalue(), np.uint8), cv2.IMREAD_COLOR)

from engine.forgery.ela import analyze_ela

u_regs, _ = analyze_ela(unt_arr, est_quality=85)
t_regs, _ = analyze_ela(tam_arr, est_quality=85)

print("Untouched regs:", len(u_regs))
print("Tampered regs:", len(t_regs))
for r in t_regs:
    print("  bbox:", r["bbox_native"], "score:", r["score"])
