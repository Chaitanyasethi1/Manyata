import cv2, numpy as np
from engine.forgery.scratch_sweep_q import tam_arr, patch_box

bh = bw = 32
h, w = tam_arr.shape[:2]
nh, nw = h // bh, w // bw

q = 85
_, enc = cv2.imencode(".jpg", tam_arr, [int(cv2.IMWRITE_JPEG_QUALITY), q])
rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
diff = np.max(np.abs(tam_arr.astype(np.float32) - rec.astype(np.float32)), axis=2)
diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

diff_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        diff_blocks[r, c] = np.mean(diff_smooth[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

gray = cv2.cvtColor(tam_arr, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

# Print diff of text blocks
# Row 7 is y=224..256 (where the text is)
print("Row 7 (patch text) diff_blocks:", [round(float(v), 4) for v in diff_blocks[7, 6:15]])
print("Row 7 (patch text) edge_blocks:", [round(float(v), 4) for v in edge_blocks[7, 6:15]])

print("Row 3 (untouched text) diff_blocks:", [round(float(v), 4) for v in diff_blocks[3, 6:15]])
print("Row 3 (untouched text) edge_blocks:", [round(float(v), 4) for v in edge_blocks[3, 6:15]])
