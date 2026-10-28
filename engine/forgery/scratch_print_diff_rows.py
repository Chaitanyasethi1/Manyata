from engine.forgery.scratch_print_diff import test_abs_z
import cv2, numpy as np
from engine.forgery.scratch_debug_synth3 import arr_tampered

h, w = arr_tampered.shape[:2]
bh = bw = 32
nh, nw = h // bh, w // bw

gray = cv2.cvtColor(arr_tampered, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150) / 255.0
edge_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

valid_mask = np.ones((nh, nw), dtype=bool)

q = 75
encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), q]
_, enc = cv2.imencode(".jpg", arr_tampered, encode_param)
rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
diff = np.max(np.abs(arr_tampered.astype(np.float32) - rec.astype(np.float32)), axis=2)
diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

diff_blocks = np.zeros((nh, nw), dtype=np.float32)
for r in range(nh):
    for c in range(nw):
        diff_blocks[r, c] = np.mean(diff_smooth[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

print("diff_blocks for patch rows 7 and 8:")
print("Row 7 (patch):", [round(float(v), 2) for v in diff_blocks[7, 6:15]])
print("Row 8 (patch):", [round(float(v), 2) for v in diff_blocks[8, 6:15]])
print("Row 3 (untouched line):", [round(float(v), 2) for v in diff_blocks[3, 6:15]])
print("Row 4 (untouched line):", [round(float(v), 2) for v in diff_blocks[4, 6:15]])
