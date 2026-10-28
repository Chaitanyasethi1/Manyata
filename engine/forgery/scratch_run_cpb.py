import io, cv2, numpy as np
from PIL import Image, ImageDraw

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
patch_box = [150, 180, 500, 360]
draw_t.rectangle(patch_box, fill=(250, 250, 250))
for py in range(200, 340, 25):
    draw_t.text((160, py), "TAMPERED MODIFIED VALUE 999999", fill=(10, 10, 10))
    draw_t.text((160, py + 10), "SECOND ROW OF FRAUDULENT TEXT", fill=(10, 10, 10))

buf2 = io.BytesIO()
img_tampered.save(buf2, format="JPEG", quality=85)

arr_tampered = cv2.imdecode(np.frombuffer(buf2.getvalue(), np.uint8), cv2.IMREAD_COLOR)

bh = bw = 32
nh, nw = h // bh, w // bw

gray = cv2.cvtColor(arr_tampered, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

valid_mask = np.ones((nh, nw), dtype=bool)

for q in [75, 85, 95]:
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), q]
    _, enc = cv2.imencode(".jpg", arr_tampered, encode_param)
    rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
    diff = np.max(np.abs(arr_tampered.astype(np.float32) - rec.astype(np.float32)), axis=2)
    diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

    diff_blocks = np.zeros((nh, nw), dtype=np.float32)
    for r in range(nh):
        for c in range(nw):
            diff_blocks[r, c] = np.mean(diff_smooth[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

    edge_bins = [0.0, 0.01, 0.03, 0.07, 0.14, 1.0]
    z_map = np.zeros((nh, nw), dtype=np.float32)
    for i in range(len(edge_bins) - 1):
        mask = valid_mask & (edge_blocks >= edge_bins[i]) & (edge_blocks < edge_bins[i + 1])
        vals = diff_blocks[mask]
        if len(vals) < 5:
            continue
        med = np.median(vals)
        mad = np.median(np.abs(vals - med)) * 1.4826
        denom = max(mad, 0.25 * med, 0.04)
        z_map[mask] = (vals - med) / denom

    print(f"q={q}: min_z={np.min(z_map):.2f}, max_z={np.max(z_map):.2f}")
    high_r, high_c = np.where(z_map > 3.0)
    for r, c in zip(high_r, high_c):
        print(f"  q={q} ({r}, {c}) y={r*32}, x={c*32}, z={z_map[r, c]:.2f}")
