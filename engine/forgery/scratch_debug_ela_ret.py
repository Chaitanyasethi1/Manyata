import cv2, numpy as np
from engine.forgery.scratch_run_cpb import arr_tampered, patch_box

h, w = arr_tampered.shape[:2]
gray = cv2.cvtColor(arr_tampered, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
bh = bw = 32
nh, nw = h // bh, w // bw

edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

valid_mask = np.ones((nh, nw), dtype=bool)
edge_bins = [0.0, 0.01, 0.03, 0.07, 0.14, 1.0]

q = 85
encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), q]
_, enc = cv2.imencode(".jpg", arr_tampered, encode_param)
rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
diff = np.max(np.abs(arr_tampered.astype(np.float32) - rec.astype(np.float32)), axis=2)
diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

diff_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        diff_blocks[r, c] = np.mean(diff_smooth[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

z_map = np.zeros((nh, nw), dtype=np.float32)
for i in range(len(edge_bins) - 1):
    mask = valid_mask & (edge_blocks >= edge_bins[i]) & (edge_blocks < edge_bins[i + 1])
    vals = diff_blocks[mask]
    if len(vals) < 5:
        continue
    med = np.median(vals)
    mad = np.median(np.abs(vals - med)) * 1.4826
    denom = max(mad, 0.25 * med, 0.08)
    z_map[mask] = (vals - med) / denom

anom = (valid_mask & (z_map > 2.8)).astype(np.uint8)
num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(anom, connectivity=8)
for l in range(1, num_labels):
    area = stats[l, cv2.CC_STAT_AREA]
    bx = stats[l, 0] * 32
    by = stats[l, 1] * 32
    bw_c = stats[l, 2] * 32
    bh_c = stats[l, 3] * 32
    print(f"comp {l}: area={area}, bbox=[{bx}, {by}, {bx+bw_c}, {by+bh_c}]")

    b = [bx, by, bx+bw_c, by+bh_c]
    ix1, iy1 = max(b[0], patch_box[0]), max(b[1], patch_box[1])
    ix2, iy2 = min(b[2], patch_box[2]), min(b[3], patch_box[3])
    inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
    union = (b[2] - b[0]) * (b[3] - b[1]) + (patch_box[2] - patch_box[0]) * (patch_box[3] - patch_box[1]) - inter
    iou = inter / max(1.0, union)
    print(f"  IoU with patch_box: {iou:.3f}")
