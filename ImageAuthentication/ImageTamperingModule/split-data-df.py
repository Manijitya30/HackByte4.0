import os
import shutil
import random
from tqdm import tqdm

# ===== CONFIG =====
DATASET_PATH = "/home/suryakrishnakishore/Documents/Hackbyte/Datasets/DF2023_Dataset/DF2023_V15_train/"
IMAGE_DIR = os.path.join(DATASET_PATH, "images")
MASK_DIR = os.path.join(DATASET_PATH, "masks")

OUTPUT_DIR = "dataset"

TRAIN_RATIO = 0.8
SEED = 42

VALID_EXT = [".jpg", ".jpeg", ".png"]

random.seed(SEED)

# ===== CREATE OUTPUT STRUCTURE =====
for split in ["train", "val"]:
    os.makedirs(os.path.join(OUTPUT_DIR, split, "images"), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, split, "masks"), exist_ok=True)

# ===== HELPER FUNCTIONS =====
def get_base_name(filename):
    return os.path.splitext(filename)[0]

def remove_gt_suffix(name):
    if name.endswith("_GT"):
        return name[:-3]
    return name

# ===== LOAD IMAGE FILES =====
image_files = [
    f for f in os.listdir(IMAGE_DIR)
    if os.path.splitext(f)[1].lower() in VALID_EXT
]

# ===== CREATE MASK MAP =====
mask_files = [
    f for f in os.listdir(MASK_DIR)
    if os.path.splitext(f)[1].lower() in VALID_EXT
]

# Map: base_name (without _GT) → mask file
mask_map = {}

for m in mask_files:
    base = get_base_name(m)
    base_clean = remove_gt_suffix(base)
    mask_map[base_clean] = m

# ===== MATCH PAIRS =====
valid_pairs = []

for img in image_files:
    base = get_base_name(img)

    if base in mask_map:
        valid_pairs.append((img, mask_map[base]))
    else:
        print(f"⚠️ Skipping image (no mask): {img}")

print(f"\n✅ Total valid pairs: {len(valid_pairs)}")

# ===== SHUFFLE =====
random.shuffle(valid_pairs)

# ===== SPLIT =====
split_idx = int(len(valid_pairs) * TRAIN_RATIO)

train_pairs = valid_pairs[:split_idx]
val_pairs = valid_pairs[split_idx:]

print(f"Train: {len(train_pairs)}")
print(f"Val: {len(val_pairs)}")

# ===== COPY FUNCTION =====
def copy_pairs(pairs, split):
    for img_name, mask_name in tqdm(pairs, desc=f"Copying {split}"):

        src_img = os.path.join(IMAGE_DIR, img_name)
        src_mask = os.path.join(MASK_DIR, mask_name)

        base = get_base_name(img_name)

        # Standardized output names
        dest_img = os.path.join(OUTPUT_DIR, split, "images", base + ".jpg")
        dest_mask = os.path.join(OUTPUT_DIR, split, "masks", base + ".png")

        shutil.copy2(src_img, dest_img)
        shutil.copy2(src_mask, dest_mask)

# ===== EXECUTE =====
copy_pairs(train_pairs, "train")
copy_pairs(val_pairs, "val")

print("\n🎉 Dataset split completed successfully!")