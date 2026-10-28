import cv2, numpy as np

# A realistic document with 20 lines of text
img = np.ones((1000, 800, 3), dtype=np.uint8) * 255
for y in range(60, 940, 45):
    cv2.putText(img, f"Document verification standard row data text at line index {y}", (50, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 2)
_, enc = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
base = cv2.imdecode(enc, cv2.IMREAD_COLOR)

# Tampered: paint + retype one patch
tam = base.copy()
patch_box = [200, 350, 600, 420]
cv2.rectangle(tam, (patch_box[0], patch_box[1]), (patch_box[2], patch_box[3]), (255, 255, 255), -1)
cv2.putText(tam, "ALTERED FRAUDULENT ENTRY AMOUNT 9999", (patch_box[0] + 10, patch_box[1] + 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (10, 10, 10), 2)
_, enc2 = cv2.imencode(".jpg", tam, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
tam_jpg = cv2.imdecode(enc2, cv2.IMREAD_COLOR)

bh = bw = 32
h, w = tam_jpg.shape[:2]
nh, nw = h // bh, w // bw

gray = cv2.cvtColor(tam_jpg, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

valid_mask = np.ones((nh, nw), dtype=bool)
q = 85
_, reenc = cv2.imencode(".jpg", tam_jpg, [int(cv2.IMWRITE_JPEG_QUALITY), q])
rec = cv2.imdecode(reenc, 1)
diff = np.max(np.abs(tam_jpg.astype(np.float32) - rec.astype(np.float32)), axis=2)
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
    denom = max(mad, 0.08)
    z_map[mask] = (vals - med) / denom

print("Untouched max z in untouched image:")
# Run on base:
_, base_enc = cv2.imencode(".jpg", base, [int(cv2.IMWRITE_JPEG_QUALITY), q])
base_rec = cv2.imdecode(base_enc, 1)
base_diff = cv2.GaussianBlur(np.max(np.abs(base.astype(np.float32) - base_rec.astype(np.float32)), axis=2), (3, 3), 0)
base_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        base_blocks[r, c] = np.mean(base_diff[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])
base_z = np.zeros((nh, nw), dtype=np.float32)
for i in range(len(edge_bins) - 1):
    mask = (edge_blocks >= edge_bins[i]) & (edge_blocks < edge_bins[i + 1])
    vals = base_blocks[mask]
    if len(vals) < 5:
        continue
    med = np.median(vals)
    mad = np.median(np.abs(vals - med)) * 1.4826
    denom = max(mad, 0.08)
    base_z[mask] = (vals - med) / denom
print("  Untouched max z:", np.max(base_z))

print("Tampered max z:", np.max(z_map))
anom = (z_map > 3.0).astype(np.uint8)
num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(anom, connectivity=8)
print("Tampered components with z > 3.0:")
for l in range(1, num_labels):
    bx = stats[l, cv2.CC_STAT_LEFT] * 32
    by = stats[l, cv2.CC_STAT_TOP] * 32
    bw_c = stats[l, cv2.CC_STAT_WIDTH] * 32
    bh_c = stats[l, cv2.CC_STAT_HEIGHT] * 32
    print(f"  comp {l}: area={stats[l, cv2.CC_STAT_AREA]}, bbox=[{bx}, {by}, {bx+bw_c}, {by+bh_c}]")
