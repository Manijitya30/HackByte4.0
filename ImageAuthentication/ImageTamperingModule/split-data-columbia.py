import os
import shutil
import csv
from tqdm import tqdm

# ===== PATHS (ADJUST THESE) =====
COL_ROOT = "/home/suryakrishnakishore/Documents/Hackbyte/Datasets/columbia/Columbia Uncompressed Image Splicing Detection/"


REAL_DIR = os.path.join(COL_ROOT, "4cam_auth", "4cam_auth")
FAKE_DIR = os.path.join(COL_ROOT, "4cam_splc", "4cam_splc")

OUT_DIR = "dataset/test/columbia/images"
LABEL_FILE = "dataset/test/columbia/labels.csv"

os.makedirs(OUT_DIR, exist_ok=True)

VALID_EXT = [".jpg", ".jpeg", ".png", ".tif"]

labels = []

# ===== PROCESS REAL IMAGES =====
for img in tqdm(os.listdir(REAL_DIR), desc="Processing REAL"):
    ext = os.path.splitext(img)[1].lower()
    if ext not in VALID_EXT:
        continue

    src = os.path.join(REAL_DIR, img)

    # Standardize name
    base = os.path.splitext(img)[0]
    new_name = f"real_{base}.jpg"

    dest = os.path.join(OUT_DIR, new_name)

    # Read + save as jpg (consistent format)
    import cv2
    image = cv2.imread(src)
    if image is None:
        print(f"Skipping (read error): {img}")
        continue

    cv2.imwrite(dest, image)

    labels.append([new_name, 0])  # 0 = real

# ===== PROCESS FAKE IMAGES =====
for img in tqdm(os.listdir(FAKE_DIR), desc="Processing FAKE"):
    ext = os.path.splitext(img)[1].lower()
    if ext not in VALID_EXT:
        continue

    src = os.path.join(FAKE_DIR, img)

    base = os.path.splitext(img)[0]
    new_name = f"fake_{base}.jpg"

    dest = os.path.join(OUT_DIR, new_name)

    import cv2
    image = cv2.imread(src)
    if image is None:
        print(f"Skipping (read error): {img}")
        continue

    cv2.imwrite(dest, image)

    labels.append([new_name, 1])  # 1 = tampered

# ===== SAVE LABEL FILE =====
os.makedirs(os.path.dirname(LABEL_FILE), exist_ok=True)

with open(LABEL_FILE, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["filename", "label"])
    writer.writerows(labels)

print("\n✅ Columbia dataset prepared successfully!")