import cv2, numpy as np
from engine.forgery.scratch_test_cv2_synth3 import base, tam_jpg, patch_box

for q in [75, 85, 95]:
    _, enc = cv2.imencode(".jpg", tam_jpg, [int(cv2.IMWRITE_JPEG_QUALITY), q])
    rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
    diff = np.max(np.abs(tam_jpg.astype(np.float32) - rec.astype(np.float32)), axis=2)
    p_diff = np.mean(diff[patch_box[1]:patch_box[3], patch_box[0]:patch_box[2]])
    u_diff = np.mean(diff[50:180, 50:700])
    print(f"q={q}: patch_diff={p_diff:.3f}, untouched_diff={u_diff:.3f}")
