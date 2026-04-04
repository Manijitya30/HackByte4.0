import os
import random
import shutil

SRC_IMG = "dataset/train/images"
SRC_MASK = "dataset/train/masks"

DST_IMG = "dataset_small/train/images"
DST_MASK = "dataset_small/train/masks"

os.makedirs(DST_IMG, exist_ok=True)
os.makedirs(DST_MASK, exist_ok=True)

files = os.listdir(SRC_IMG)
random.shuffle(files)

subset_size = int(0.3 * len(files))  # 30%
subset = files[:subset_size]

for f in subset:
    shutil.copy2(os.path.join(SRC_IMG, f), os.path.join(DST_IMG, f))
    shutil.copy2(os.path.join(SRC_MASK, f.replace(".jpg", ".png")),
                 os.path.join(DST_MASK, f.replace(".jpg", ".png")))

print("✅ Subset created")