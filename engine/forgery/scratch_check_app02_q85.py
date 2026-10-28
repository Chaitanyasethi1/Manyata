import cv2, numpy as np
from engine.forgery.native import get_native_image

nat = get_native_image("dataset/applications/app_02/land_deed.pdf")
bgr = nat.bgr
h, w = bgr.shape[:2]
gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

q = nat.est_quality or 85
_, enc = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), q])
rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
diff = np.max(np.abs(bgr.astype(np.float32) - rec.astype(np.float32)), axis=2)
diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

_, bin_inv = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
k = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 3))
closed = cv2.morphologyEx(bin_inv, cv2.MORPH_CLOSE, k)
cnts, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

word_diffs = []
word_boxes = []
for cnt in cnts:
    x_b, y_b, w_b, h_b = cv2.boundingRect(cnt)
    if w_b < 20 or w_b > 350 or h_b < 10 or h_b > 45:
        continue
    if (
        (h > 1000 and (y_b < 220 or y_b > h - 140))
        or (h > 1000 and x_b > w * 0.65 and y_b < 450)
        or (h > 1000 and x_b < w * 0.40 and y_b > h * 0.65)
        or (h > 1000 and x_b >= w * 0.55 and y_b >= 950)
    ):
        continue
    patch_ink = diff_smooth[y_b : y_b + h_b, x_b : x_b + w_b][bin_inv[y_b : y_b + h_b, x_b : x_b + w_b] > 0]
    if len(patch_ink) < 20:
        continue
    word_diffs.append(float(np.mean(patch_ink)))
    word_boxes.append([x_b, y_b, x_b + w_b, y_b + h_b])

w_arr = np.array(word_diffs)
w_med = np.median(w_arr)
w_mad = np.median(np.abs(w_arr - w_med)) * 1.4826
w_denom = max(w_mad, 0.05)
w_zs = (w_arr - w_med) / w_denom
print(f"app_02 at q={q}: total_words={len(w_arr)}, med={w_med:.4f}, mad={w_mad:.4f}, max_z={np.max(w_zs):.2f}")
top_indices = np.argsort(w_zs)[-5:]
for idx in reversed(top_indices):
    print(f"  word box: {word_boxes[idx]}, diff={w_arr[idx]:.4f}, z={w_zs[idx]:.2f}")
