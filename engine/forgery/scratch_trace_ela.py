import cv2, numpy as np
from engine.forgery.scratch_debug_synth3 import arr_tampered
from engine.forgery.ela import analyze_ela

# Let's inspect each candidate quality in analyze_ela
from engine.forgery.config import ELA_BLOCK, ELA_MIN_BLOCKS, ELA_Z_THRESH
bh = bw = ELA_BLOCK
h, w = arr_tampered.shape[:2]
nh, nw = h // bh, w // bw

gray = cv2.cvtColor(arr_tampered, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

valid_mask = np.ones((nh, nw), dtype=bool)

for q in [70, 75, 80, 85, 90, 95]:
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
        denom = max(mad, 0.20)
        z_map[mask] = (vals - med) / denom

    anom = (valid_mask & (z_map > 4.0)).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(anom, connectivity=8)
    print(f"q={q}: max_z={np.max(z_map):.2f}, num_anom_labels={num_labels}")
    for l in range(1, num_labels):
        print(f"  label {l}: area={stats[l, cv2.CC_STAT_AREA]}, box=[{stats[l, 0]*32}, {stats[l, 1]*32}, {stats[l, 2]*32}, {stats[l, 3]*32}]")
