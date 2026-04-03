import os
import cv2
import numpy as np
import shutil
from tqdm import tqdm

# ===== PATHS =====
COVERAGE_DIR = "/home/suryakrishnakishore/Documents/Hackbyte/Datasets/coverage/"
VAL_IMG_DIR = "dataset/val/images"
VAL_MASK_DIR = "dataset/val/masks"

os.makedirs(VAL_IMG_DIR, exist_ok=True)
os.makedirs(VAL_MASK_DIR, exist_ok=True)

VALID_EXT = [".tif", ".jpg", ".jpeg", ".png"]

# ===== GET FILES =====
files = [
    f for f in os.listdir(COVERAGE_DIR)
    if os.path.splitext(f)[1].lower() in VALID_EXT
]

# Separate original and tampered
originals = {}
tampered = {}

for f in files:
    name = os.path.splitext(f)[0]

    if name.endswith("t"):
        base = name[:-1]  # remove 't'
        tampered[base] = f
    else:
        originals[name] = f

# ===== PROCESS PAIRS =====
count = 0

for base in tqdm(originals.keys(), desc="Processing COVERAGE"):
    if base not in tampered:
        print(f"Skipping (no tampered): {base}")
        continue

    orig_path = os.path.join(COVERAGE_DIR, originals[base])
    tam_path = os.path.join(COVERAGE_DIR, tampered[base])

    # Read images
    orig = cv2.imread(orig_path)
    tam = cv2.imread(tam_path)

    if orig is None or tam is None:
        print(f"Skipping (read error): {base}")
        continue

    # Resize if mismatch
    if orig.shape != tam.shape:
        tam = cv2.resize(tam, (orig.shape[1], orig.shape[0]))

    # ===== CREATE MASK =====
    diff = cv2.absdiff(orig, tam)
    gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

    # Threshold (IMPORTANT)
    _, mask = cv2.threshold(gray, 25, 255, cv2.THRESH_BINARY)

    # Optional: clean mask
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # ===== SAVE =====
    new_name = f"cov_{base}"

    img_dest = os.path.join(VAL_IMG_DIR, new_name + ".jpg")
    mask_dest = os.path.join(VAL_MASK_DIR, new_name + ".png")

    cv2.imwrite(img_dest, tam)   # use tampered image
    cv2.imwrite(mask_dest, mask)

    count += 1

print(f"\n✅ Processed {count} COVERAGE samples")