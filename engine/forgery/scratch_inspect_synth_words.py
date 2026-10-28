import cv2, numpy as np
from engine.forgery.scratch_test_synth3 import arr_tampered

gray = cv2.cvtColor(arr_tampered, cv2.COLOR_BGR2GRAY)
_, bin_inv = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
k = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 3))
closed = cv2.morphologyEx(bin_inv, cv2.MORPH_CLOSE, k)
cnts, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

_, enc = cv2.imencode(".jpg", arr_tampered, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
diff = np.max(np.abs(arr_tampered.astype(np.float32) - rec.astype(np.float32)), axis=2)
diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

word_diffs = []
word_boxes = []
for cnt in cnts:
    x_b, y_b, w_b, h_b = cv2.boundingRect(cnt)
    if w_b < 20 or w_b > 350 or h_b < 10 or h_b > 45:
        continue
    patch_ink = diff_smooth[y_b : y_b + h_b, x_b : x_b + w_b][bin_inv[y_b : y_b + h_b, x_b : x_b + w_b] > 0]
    if len(patch_ink) < 20:
        continue
    word_diffs.append(float(np.mean(patch_ink)))
    word_boxes.append([x_b, y_b, x_b + w_b, y_b + h_b])

print(f"Total word candidates: {len(word_diffs)}")
w_arr = np.array(word_diffs)
w_med = np.median(w_arr)
w_mad = np.median(np.abs(w_arr - w_med)) * 1.4826
w_denom = max(w_mad, 0.4)
w_zs = (w_arr - w_med) / w_denom
print(f"w_med: {w_med:.3f}, w_mad: {w_mad:.3f}, max_z: {np.max(w_zs):.2f}, min_z: {np.min(w_zs):.2f}")
for b, z in zip(word_boxes, w_zs):
    if abs(z) > 2.0:
        print("  box:", b, "z:", round(float(z), 2))
