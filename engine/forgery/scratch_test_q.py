import cv2, numpy as np

img = np.ones((600, 800, 3), dtype=np.uint8) * 255
for y in range(50, 550, 40):
    cv2.putText(img, f"Document verification standard row data text at line index {y}", (50, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (30, 30, 30), 2)
_, enc = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
base = cv2.imdecode(enc, cv2.IMREAD_COLOR)

tam = base.copy()
patch_box = [200, 200, 550, 280]
cv2.rectangle(tam, (patch_box[0], patch_box[1]), (patch_box[2], patch_box[3]), (255, 255, 255), -1)
cv2.putText(tam, "ALTERED FRAUDULENT ENTRY 9999", (patch_box[0] + 10, patch_box[1] + 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (10, 10, 10), 2)
_, enc2 = cv2.imencode(".jpg", tam, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
tam_jpg = cv2.imdecode(enc2, cv2.IMREAD_COLOR)

for cand_q in [70, 75, 80, 85, 90, 95]:
    _, reenc = cv2.imencode(".jpg", tam_jpg, [int(cv2.IMWRITE_JPEG_QUALITY), cand_q])
    rec = cv2.imdecode(reenc, 1)
    diff = np.max(np.abs(tam_jpg.astype(np.float32) - rec.astype(np.float32)), axis=2)
    p_diff = np.mean(diff[200:280, 200:550])
    u_diff = np.mean(diff[50:180, 50:750])
    print(f"cand_q={cand_q}: patch_diff={p_diff:.3f}, untouched_diff={u_diff:.3f}, ratio={p_diff/max(u_diff, 1e-4):.3f}")
