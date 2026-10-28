import io, cv2, numpy as np
from PIL import Image, ImageDraw

w, h = 800, 600
img = Image.new("RGB", (w, h), (245, 245, 245))
draw = ImageDraw.Draw(img)
for y in range(50, 550, 40):
    draw.text((50, y), "This is a standard line of text in an AICTE document format 1234567890", fill=(20, 20, 20))

buf1 = io.BytesIO()
img.save(buf1, format="JPEG", quality=85)
buf1.seek(0)
img_q85 = Image.open(buf1)

img_tampered = img_q85.copy()
draw_t = ImageDraw.Draw(img_tampered)
patch_box = [200, 230, 450, 290]
draw_t.rectangle(patch_box, fill=(253, 253, 253))
draw_t.text((205, 245), "TAMPERED MODIFIED VALUE 999999", fill=(10, 10, 10))

buf2 = io.BytesIO()
img_tampered.save(buf2, format="JPEG", quality=85)
arr_tampered = cv2.imdecode(np.frombuffer(buf2.getvalue(), np.uint8), cv2.IMREAD_COLOR)
arr_untouched = cv2.imdecode(np.frombuffer(buf1.getvalue(), np.uint8), cv2.IMREAD_COLOR)

bh = bw = 32
nh, nw = h // bh, w // bw

gray = cv2.cvtColor(arr_tampered, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

for q in [75, 85, 95]:
    _, enc = cv2.imencode(".jpg", arr_tampered, [int(cv2.IMWRITE_JPEG_QUALITY), q])
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
        mask = (edge_blocks >= edge_bins[i]) & (edge_blocks < edge_bins[i + 1])
        vals = diff_blocks[mask]
        if len(vals) < 5:
            continue
        med = np.median(vals)
        mad = np.median(np.abs(vals - med)) * 1.4826
        denom = max(mad, 0.05)
        z_map[mask] = (vals - med) / denom

    print(f"q={q}: max_z={np.max(z_map):.2f}, at {np.unravel_index(np.argmax(z_map), z_map.shape)}")

print("--- Untouched check ---")
for q in [75, 85, 95]:
    _, enc = cv2.imencode(".jpg", arr_untouched, [int(cv2.IMWRITE_JPEG_QUALITY), q])
    rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
    diff = np.max(np.abs(arr_untouched.astype(np.float32) - rec.astype(np.float32)), axis=2)
    diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

    diff_blocks = np.zeros((nh, nw), dtype=np.float32)
    for r in range(nh):
        for c in range(nw):
            diff_blocks[r, c] = np.mean(diff_smooth[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

    z_map = np.zeros((nh, nw), dtype=np.float32)
    for i in range(len(edge_bins) - 1):
        mask = (edge_blocks >= edge_bins[i]) & (edge_blocks < edge_bins[i + 1])
        vals = diff_blocks[mask]
        if len(vals) < 5:
            continue
        med = np.median(vals)
        mad = np.median(np.abs(vals - med)) * 1.4826
        denom = max(mad, 0.05)
        z_map[mask] = (vals - med) / denom

    print(f"untouched q={q}: max_z={np.max(z_map):.2f}")
