import os
import shutil
import random

# ===== PATHS =====
FLICKR_DIR = "/home/suryakrishnakishore/Documents/Hackbyte/Datasets/Flickr/flickr30k_images/flickr30k_images/"
SYNTH_DIR = "/home/suryakrishnakishore/Documents/Hackbyte/Datasets/synthbuster/"
BASE_DIR = "dataset"

# ===== SETTINGS =====
TOTAL_IMAGES = 9000
TRAIN_RATIO = 0.7
VAL_RATIO = 0.15

VALID_EXT = (".jpg", ".jpeg", ".png")

# ===== CREATE FOLDERS =====
for split in ["train", "val", "test"]:
    for cls in ["real", "fake"]:
        os.makedirs(os.path.join(BASE_DIR, split, cls), exist_ok=True)

# ===== LOAD REAL IMAGES =====
real_images = [
    f for f in os.listdir(FLICKR_DIR)
    if f.lower().endswith(VALID_EXT)
]

# ===== LOAD FAKE IMAGES (RECURSIVE) =====
fake_images = []

for root, dirs, files in os.walk(SYNTH_DIR):
    for file in files:
        if file.lower().endswith(VALID_EXT):
            full_path = os.path.join(root, file)
            fake_images.append(full_path)

# ===== SHUFFLE =====
random.shuffle(real_images)
random.shuffle(fake_images)

# ===== BALANCE =====
real_images = real_images[:TOTAL_IMAGES]
fake_images = fake_images[:TOTAL_IMAGES]

print("Real:", len(real_images))
print("Fake:", len(fake_images))

# ===== SPLIT FUNCTION =====
def split_data(images):
    train_end = int(TRAIN_RATIO * len(images))
    val_end = int((TRAIN_RATIO + VAL_RATIO) * len(images))
    
    return (
        images[:train_end],
        images[train_end:val_end],
        images[val_end:]
    )

real_train, real_val, real_test = split_data(real_images)
fake_train, fake_val, fake_test = split_data(fake_images)

# ===== COPY FUNCTIONS =====

# REAL (simple)
def copy_real(file_list, split):
    for img in file_list:
        src = os.path.join(FLICKR_DIR, img)
        dst = os.path.join(BASE_DIR, split, "real", img)
        
        try:
            shutil.copy2(src, dst)
        except:
            print("Error copying:", img)

# FAKE (already full path)
def copy_fake(file_list, split):
    for i, src in enumerate(file_list):
        filename = os.path.basename(src)
        
        # Prevent overwrite (IMPORTANT)
        new_name = f"fake_{i}_{filename}"
        
        dst = os.path.join(BASE_DIR, split, "fake", new_name)
        
        try:
            shutil.copy2(src, dst)
        except:
            print("Error copying:", src)

# ===== COPY =====
copy_real(real_train, "train")
copy_real(real_val, "val")
copy_real(real_test, "test")

copy_fake(fake_train, "train")
copy_fake(fake_val, "val")
copy_fake(fake_test, "test")

print("\n✅ Dataset created successfully!")