from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles



from PIL import Image
import io
import os
import subprocess
import json
import tempfile

# ===== ROUTERS =====
from routers import video_check
from report_router import router as report_router

# ===== MODELS =====
from ai_model import load_ai_model, predict_ai
from tamper_model import load_tamper_model, predict_full
from deepfakedetect import analyze_deepfake_image
from report import generate_report
from metadata import analyze_metadata, score_flags

# =====================================================
# ===== APP INIT ======================================
# =====================================================
app = FastAPI(
    title="Court Evidence Engine",
    description="Forensic video & image authentication API",
    version="1.0.0"
)

# =====================================================
# ===== CORS CONFIG ===================================
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# ===== INCLUDE ROUTERS ===============================
# =====================================================
app.include_router(video_check.router, prefix="", tags=["Video Analysis"])
app.include_router(report_router)
app.mount("/temp", StaticFiles(directory="temp"), name="temp")

# =====================================================
# ===== LOAD MODELS (ONLY ONCE) =======================
# =====================================================
ai_model, ai_device = load_ai_model()
tamper_model, tamper_device = load_tamper_model()

# Temp directory
os.makedirs("temp", exist_ok=True)

# =====================================================
# ===== ROOT ==========================================
# =====================================================
@app.get("/")
def root():
    return {"status": "Court Evidence Engine running 🚀"}

# =====================================================
# ===== MAIN ANALYSIS ENDPOINT ========================
# =====================================================
@app.post("/analyze/")
async def analyze(file: UploadFile = File(...)):

    contents = await file.read()

    image = Image.open(io.BytesIO(contents)).convert("RGB")

    input_path = "temp/input.jpg"
    overlay_path = "temp/overlay.jpg"
    report_path = "temp/report.pdf"

    image.save(input_path)

    # =====================================================
    # ===== LAYER 1: METADATA ANALYSIS =====================
    # =====================================================
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(contents)
        temp_file_path = tmp.name

    try:
        result = subprocess.run(
            ["exiftool", "-json", temp_file_path],
            capture_output=True,
            text=True
        )

        metadata_flags = []
        metadata_score = 0
        metadata_status = "UNKNOWN"

        if result.stdout:
            data = json.loads(result.stdout)
            metadata = data[0]

            metadata_flags = analyze_metadata(metadata)
            metadata_score = score_flags(metadata_flags)

            if metadata_score >= 5:
                metadata_status = "HIGHLY_SUSPICIOUS"
            elif metadata_score >= 3:
                metadata_status = "SUSPICIOUS"
            else:
                metadata_status = "LIKELY_CLEAN"

    except Exception as e:
        metadata_flags = ["Metadata extraction failed"]
        metadata_score = 0
        metadata_status = "ERROR"

    # =====================================================
    # ===== LAYER 2: AI DETECTION ==========================
    # =====================================================
    ai_result, ai_conf = predict_ai(ai_model, ai_device, image)

    # =====================================================
    # ===== LAYER 3: DEEPFAKE ==============================
    # =====================================================
    deepfake_result = analyze_deepfake_image(contents)

    # =====================================================
    # ===== LAYER 4: TAMPERING =============================
    # =====================================================
    tamper_output = predict_full(tamper_model, tamper_device, image)

    tampered = tamper_output["tampered"]
    tamper_conf = tamper_output["confidence"]

    tamper_output["overlay"].save(overlay_path)

    # =====================================================
    # ===== GENERATE REPORT ================================
    # =====================================================
    generate_report(
        report_path,
        input_path,
        overlay_path,
        metadata_status,
        metadata_score,
        metadata_flags,
        ai_result,
        ai_conf,
        deepfake_result,
        tampered,
        tamper_conf
    )

    return {
    "metadata": {
        "status": metadata_status,
        "score": metadata_score,
        "flags": metadata_flags
    },
    "ai_detection": {
        "result": ai_result,
        "confidence": ai_conf
    },
    "deepfake": deepfake_result,
    "tampering": {
        "tampered": tampered,
        "confidence": tamper_conf
    },
    "images": {
        "original": "http://127.0.0.1:8000/temp/input.jpg",
        "heatmap": "http://127.0.0.1:8000/temp/overlay.jpg"
    },
    "report_url": "http://127.0.0.1:8000/download-report"
    }

@app.get("/download-report")
def download_report():
    return FileResponse(
        "temp/report.pdf",
        media_type="application/pdf",
        filename="report.pdf"
    )