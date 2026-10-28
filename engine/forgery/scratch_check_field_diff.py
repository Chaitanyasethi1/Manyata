import cv2, numpy as np
from engine.forgery.native import get_native_image

nat = get_native_image("dataset/applications/app_02/land_deed.pdf")
bgr = nat.bgr
gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

q = 85
_, enc = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), q])
rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
diff = np.max(np.abs(bgr.astype(np.float32) - rec.astype(np.float32)), axis=2)
diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

# Tampered field: [497, 566, 536, 595]
patch_diff = diff_smooth[566:595, 497:536]
print("Tampered field patch diff mean:", np.mean(patch_diff), "max:", np.max(patch_diff))

# Similar field on app_01:
nat01 = get_native_image("dataset/applications/app_01/land_deed.pdf")
_, enc01 = cv2.imencode(".jpg", nat01.bgr, [int(cv2.IMWRITE_JPEG_QUALITY), q])
rec01 = cv2.imdecode(enc01, cv2.IMREAD_COLOR)
diff01 = cv2.GaussianBlur(np.max(np.abs(nat01.bgr.astype(np.float32) - rec01.astype(np.float32)), axis=2), (3, 3), 0)
untouched_diff = diff01[566:595, 497:536]
print("Untouched field patch diff mean:", np.mean(untouched_diff), "max:", np.max(untouched_diff))

# What about at q=75?
_, enc75 = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
rec75 = cv2.imdecode(enc75, cv2.IMREAD_COLOR)
diff75 = cv2.GaussianBlur(np.max(np.abs(bgr.astype(np.float32) - rec75.astype(np.float32)), axis=2), (3, 3), 0)
print("At q=75: tampered field mean:", np.mean(diff75[566:595, 497:536]))

_, enc75_01 = cv2.imencode(".jpg", nat01.bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
rec75_01 = cv2.imdecode(enc75_01, cv2.IMREAD_COLOR)
diff75_01 = cv2.GaussianBlur(np.max(np.abs(nat01.bgr.astype(np.float32) - rec75_01.astype(np.float32)), axis=2), (3, 3), 0)
print("At q=75: untouched field mean:", np.mean(diff75_01[566:595, 497:536]))
