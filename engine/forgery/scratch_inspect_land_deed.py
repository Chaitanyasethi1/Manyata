import cv2, numpy as np
from engine.forgery.native import get_native_image

nat = get_native_image("dataset/generated/genuine/land_deed_01.pdf")
bgr = nat.bgr
h, w = bgr.shape[:2]
bh = bw = 32
nh, nw = h // bh, w // bw

gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

valid_mask = np.ones((nh, nw), dtype=bool)
for r in range(nh):
    for c in range(nw):
        y, x = r * bh, c * bw
        if y < 220 or y >= h - 140:
            valid_mask[r, c] = False
        elif 50 <= y <= 450 and x >= int(w * 0.65):
            valid_mask[r, c] = False
        elif y >= int(h * 0.65) and x <= int(w * 0.40):
            valid_mask[r, c] = False
        elif y >= 950 and x >= int(w * 0.55):
            valid_mask[r, c] = False

q = 85
_, enc = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), q])
rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
diff = np.max(np.abs(bgr.astype(np.float32) - rec.astype(np.float32)), axis=2)
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
    denom = max(mad, 0.25 * med, 0.10)
    z_map[mask] = (vals - med) / denom

anom = (valid_mask & (z_map > 4.0)).astype(np.uint8)
num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(anom, connectivity=8)
areas = [stats[l, cv2.CC_STAT_AREA] for l in range(1, num_labels) if stats[l, cv2.CC_STAT_AREA] >= 3]
print(f"Components with area>=3 on land_deed_01: {areas}")
