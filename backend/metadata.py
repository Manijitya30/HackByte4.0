from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔍 Analyze metadata rules
def analyze_metadata(metadata):
    flags = []

    software = str(metadata.get("Software", "")).lower()
    original = metadata.get("DateTimeOriginal")
    modified = metadata.get("ModifyDate")
    create = metadata.get("CreateDate")

    model = str(metadata.get("Model", "")).lower()
    make = str(metadata.get("Make", "")).lower()

    # Rule 1: Editing software
    if any(x in software for x in ["photoshop", "gimp", "canva", "snapseed"]):
        flags.append("Edited using image editing software")

    # Rule 2: Timestamp mismatch
    if original and modified and original != modified:
        flags.append("Image modified after capture")

    # Rule 3: Creation vs modification mismatch
    if create and modified and create != modified:
        flags.append("File metadata shows modification after creation")

    # Rule 4: Missing camera info
    if not metadata.get("Make") and not metadata.get("Model"):
        flags.append("No camera metadata (possible AI or stripped data)")

    # Rule 5: AI hints in software
    if "ai" in software or "generator" in software:
        flags.append("AI generation software detected")

    # Rule 6: Minimal metadata
    if len(metadata.keys()) < 5:
        flags.append("Metadata stripped or minimal")

    # Rule 7: Web/editor exports
    web_exports = ["adobe fireworks", "imagemagick", "libpng", "picasa"]
    if any(x in software for x in web_exports):
        flags.append("Processed via web optimization or legacy editor")

    # Rule 8: Mobile without GPS
    mobile_brands = ["iphone", "samsung", "pixel", "motorola", "xiaomi", "huawei", "oppo", "vivo"]
    if any(brand in model or brand in make for brand in mobile_brands):
        if not metadata.get("GPSLatitude"):
            flags.append("Mobile capture missing GPS data (possible stripping or privacy setting)")

    # Rule 9: XMP history
    if any("history" in str(k).lower() for k in metadata.keys()):
        flags.append("XMP history detected (file edited and resaved)")
    
    # Rule 10: No camera + no EXIF timestamps
    if not metadata.get("Make") and not metadata.get("Model"):
        if not metadata.get("DateTimeOriginal"):
            flags.append("Likely AI-generated (no camera + no capture timestamp)")

    # Rule 11: No EXIF at all
    if not metadata.get("DateTimeOriginal") and not metadata.get("ModifyDate"):
        flags.append("No EXIF timestamps present (possible AI or stripped image)")

    return flags


#  Scoring system
def score_flags(flags):
    score = 0

    for f in flags:
        if "Edited using image editing software" in f:
            score += 3
        elif "Image modified after capture" in f:
            score += 3
        elif "AI generation software detected" in f:
            score += 4
        elif "File metadata shows modification after creation" in f:
            score += 3
        elif "No camera metadata" in f:
            score += 2
        elif "Metadata stripped" in f:
            score += 2
        elif "Likely AI-generated" in f:
            score += 5  # strong signal
        else:
            score += 1

    return score


@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):

    file_path = f"temp_{file.filename}"

    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        #  Run ExifTool
        result = subprocess.run(
            ["C:\\Windows\\exiftool.exe", "-json", file_path],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return {
                "status": "ERROR",
                "message": "ExifTool failed",
                "details": result.stderr
            }

        if not result.stdout.strip():
            return {
                "status": "ERROR",
                "message": "No metadata found"
            }

        # ✅ Parse metadata
        try:
            data = json.loads(result.stdout)
            metadata = data[0] if isinstance(data, list) else data
        except Exception as e:
            return {
                "status": "ERROR",
                "message": "JSON parsing failed",
                "details": str(e)
            }

        # 🔥 Analyze
        flags = analyze_metadata(metadata)
        score = score_flags(flags)
        max_possible_score = 12 

        # 🎯 Status
        if score >= 5:
            status = "HIGHLY_SUSPICIOUS"
            risk = "HIGH"
        elif score >= 3:
            status = "SUSPICIOUS"
            risk = "MEDIUM"
        else:
            status = "LIKELY_CLEAN"
            risk = "LOW"

        
        clean_metadata = {
            "Make": metadata.get("Make"),
            "Model": metadata.get("Model"),
            "Software": metadata.get("Software"),
            "DateTimeOriginal": metadata.get("DateTimeOriginal"),
            "ModifyDate": metadata.get("ModifyDate"),
        }

        return {
        "filename": file.filename,
        "status": status,
        "risk_level": risk,
        "confidence_score": score,
        "max_possible_score": max_possible_score, 
        "tampering_flags": flags,
        "summary": (
            "Strong evidence of tampering based on metadata inconsistencies"
            if score >= 5 else
            "Some suspicious indicators found"
            if score >= 3 else
            "No strong evidence of tampering"
        ),
        "metadata": clean_metadata
    }

    except Exception as e:
        return {
            "status": "ERROR",
            "message": "Internal server error",
            "details": str(e)
        }

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)