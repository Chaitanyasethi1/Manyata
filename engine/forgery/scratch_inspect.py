import numpy as np
import cv2

img = np.ones((600, 800, 3), dtype=np.uint8) * 255
for y in range(50, 550, 40):
    cv2.putText(img, f"Line of document text at y={y}", (50, y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (20, 20, 20), 2)
_, enc = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
base = cv2.imdecode(enc, 1)

tam = base.copy()
cv2.rectangle(tam, (200, 200), (550, 280), (255, 255, 255), -1)
cv2.putText(tam, "FRAUDULENT EDITED VALUE", (210, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (10, 10, 10), 2)
_, enc2 = cv2.imencode(".jpg", tam, [cv2.IMWRITE_JPEG_QUALITY, 85])
tam_jpg = cv2.imdecode(enc2, 1)

q = 85
bh = bw = 32
h, w = tam_jpg.shape[:2]
nh, nw = h // bh, w // bw

gray = cv2.cvtColor(tam_jpg, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

_, reenc = cv2.imencode(".jpg", tam_jpg, [cv2.IMWRITE_JPEG_QUALITY, q])
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
    denom = max(mad, 0.02)
    z_map[mask] = (vals - med) / denom
    print(f"bin {i} ({edge_bins[i]}..{edge_bins[i+1]}): count={len(vals)}, med={med:.4f}, mad={mad:.4f}")

# check patch blocks (rows 6..8, cols 6..17)
print("Patch z-scores:")
for r in range(6, 9):
    print(f"row {r}:", [round(float(z_map[r, c]), 2) for c in range(6, 18)])

print("Untouched text row 3 z-scores:")
print("row 3:", [round(float(z_map[3, c]), 2) for c in range(6, 18)])
