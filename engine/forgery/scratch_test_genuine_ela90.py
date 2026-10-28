import glob
import numpy as np
from PIL import Image
import io

def compute_ela(img, quality=90):
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    resaved = Image.open(buf).convert("RGB")
    arr_orig = np.array(img, dtype=np.float32)
    arr_resaved = np.array(resaved, dtype=np.float32)
    return np.mean(np.abs(arr_orig - arr_resaved), axis=2)

genuine_jpgs = sorted(glob.glob("dataset/generated/genuine/*.jpg"))
for p in genuine_jpgs[:8]:
    im = Image.open(p).convert("RGB")
    ela = compute_ela(im, 90)
    print(p, "max:", np.max(ela), "mean:", np.mean(ela), "median:", np.median(ela))
