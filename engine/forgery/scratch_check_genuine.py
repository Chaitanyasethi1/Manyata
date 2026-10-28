import glob, os, cv2, numpy as np
from engine.forgery.native import get_native_image

files = sorted(glob.glob("dataset/generated/genuine/land_deed*.pdf")) + sorted(glob.glob("dataset/generated/genuine/trust_cert*.pdf"))
for p in files:
    native = get_native_image(p)
    bgr = native.bgr
    h, w = bgr.shape[:2]
    bh = bw = 32
    nh, nw = h // bh, w // bw

    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150) / 255.0
    edge_blocks = np.zeros((nh, nw), dtype=np.float32)
    for r in range(nh):
        for c in range(nw):
            edge_blocks[r, c] = np.mean(edges[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

    valid_mask = np.ones((nh, nw), dtype=bool)
    if h > 1000:
        for r in range(nh):
            for c in range(nw):
                y, x = r * bh, c * bw
                if y < 220:
                    valid_mask[r, c] = False
                elif y >= h - 140:
                    valid_mask[r, c] = False
                elif 50 <= y <= 450 and x >= int(w * 0.65):
                    valid_mask[r, c] = False
                elif y >= int(h * 0.65) and x <= int(w * 0.40):
                    valid_mask[r, c] = False
                elif 1180 <= y <= 1450 and 650 <= x <= 1100:
                    valid_mask[r, c] = False

    q = native.est_quality or 85
    _, enc = cv2.imencode(".jpg", bgr, [int(cv2.IMWRITE_JPEG_QUALITY), q])
    rec = cv2.imdecode(enc, cv2.IMREAD_COLOR)
    diff = np.max(np.abs(bgr.astype(np.float32) - rec.astype(np.float32)), axis=2)
    diff_smooth = cv2.GaussianBlur(diff, (3, 3), 0)

    diff_blocks = np.zeros((nh, nw), dtype=np.float32)
    for r in range(nh):
        for c in range(nw):
            diff_blocks[r, c] = np.mean(diff_smooth[r * bh : (r + 1) * bh, c * bw : (c + 1) * bw])

    edge_bins = [0.0, 0.01, 0.03, 0.07, 0.14, 1.0]
    z_map = np.zeros((nh, nw), dtype=np.float32)
    for i in range(len(edge_bins) - 1):
        mask = valid_mask & (edge_blocks >= edge_bins[i]) & (edge_blocks < edge_bins[i + 1])
        vals = diff_blocks[mask]
        if len(vals) < 5:
            continue
        med = np.median(vals)
        mad = np.median(np.abs(vals - med)) * 1.4826
        denom = max(mad, 0.15)
        z_map[mask] = (vals - med) / denom

    max_z = float(np.max(z_map[valid_mask])) if np.any(valid_mask) else 0.0
    doc_name = os.path.basename(p)
    print(f"{doc_name}: max_z={max_z:.2f}")
