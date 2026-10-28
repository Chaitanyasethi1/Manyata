import io, cv2, numpy as np
from PIL import Image, ImageDraw

w, h = 800, 600
img = Image.new("RGB", (w, h), (250, 250, 250))
draw = ImageDraw.Draw(img)
for y in range(50, 550, 40):
    draw.text((50, y), f"Official AICTE Document Record Entry Section at index {y}", fill=(20, 20, 20))

# 1. save q85
buf1 = io.BytesIO()
img.save(buf1, format="JPEG", quality=85)
buf1.seek(0)
img_q85 = Image.open(buf1)

# 2. paint + retype patch
img_tam = img_q85.copy()
draw_t = ImageDraw.Draw(img_tam)
patch_box = [200, 230, 450, 290]
draw_t.rectangle(patch_box, fill=(250, 250, 250))
draw_t.text((210, 250), "TAMPERED MODIFIED VALUE 999999", fill=(20, 20, 20))

# 3. save q85 again
buf2 = io.BytesIO()
img_tam.save(buf2, format="JPEG", quality=85)

tam_arr = cv2.imdecode(np.frombuffer(buf2.getvalue(), np.uint8), cv2.IMREAD_COLOR)

x1, y1, x2, y2 = patch_box

print(f"{'Quality':<10} | {'Patch diff':<12} | {'Untouched diff':<15} | {'Diff (U - P)':<12} | {'Ratio'}")
print("-" * 65)

for q in range(60, 96, 5):
    _, enc = cv2.imencode(".jpg", tam_arr, [int(cv2.IMWRITE_JPEG_QUALITY), q])
    rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
    diff = np.max(np.abs(tam_arr.astype(np.float32) - rec.astype(np.float32)), axis=2)

    p_val = np.mean(diff[y1:y2, x1:x2])
    u_val = np.mean(diff[50:150, 50:700])
    ratio = u_val / max(1e-4, p_val)
    print(f"{q:<10} | {p_val:<12.4f} | {u_val:<15.4f} | {u_val - p_val:<12.4f} | {ratio:.3f}x")
