from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
import aiofiles

from services.deepfake_service import analyze_deepfake
from services.compression_service import analyze_video_compression
from services.splice_detection import analyze_video_splice
from services.ffprobe_service import analyze_metadata
from services.sync_simple import check_sync
from services.video_report_service import generate_video_report

router = APIRouter(prefix="/video", tags=["Video Analysis"])

UPLOAD_DIR = "/tmp/evidence_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv"}


@router.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[-1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    async with aiofiles.open(temp_path, "wb") as f:
        await f.write(await file.read())

    try:
        # ==============================
        # RUN ALL ANALYSIS
        # ==============================
        metadata, metadata_extra = analyze_metadata(temp_path, file.filename)
        deepfake = analyze_deepfake(temp_path)
        compression = analyze_video_compression(temp_path)
        splice = analyze_video_splice(temp_path)
        sync = check_sync(temp_path)

        # ==============================
        # FINAL VERDICT LOGIC
        # ==============================
        risk_score = 0

        if deepfake["average_deepfake_score"] > 0.7:
            risk_score += 40

        if compression["overall_suspicious"]:
            risk_score += 20

        if splice["overall_suspicious"]:
            risk_score += 30

        if sync["status"] == "Out of Sync":
            risk_score += 20

        if metadata.risk_signals:
            risk_score += 10

        if risk_score >= 70:
            verdict = "❌ FAKE / TAMPERED VIDEO"
        elif risk_score >= 40:
            verdict = "⚠️ SUSPICIOUS VIDEO"
        else:
            verdict = "✅ LIKELY AUTHENTIC"

        # ==============================
        # GENERATE PDF REPORT
        # ==============================
        report_path = f"/tmp/report_{uuid.uuid4()}.pdf"

        generate_video_report(
            report_path,
            temp_path,
            metadata,
            metadata_extra,
            deepfake,
            compression,
            splice,
            sync
        )
        return {
    "verdict": verdict,
    "risk_score": risk_score,

    "metadata": {
        "main": metadata,
        "extra": metadata_extra,
    },

    "deepfake": deepfake,
    "compression": compression,
    "splice": splice,
    "sync": sync,

    "report_url": f"http://127.0.0.1:8000/video/download/{os.path.basename(report_path)}"
    }

        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/download/{filename}")
def download_report(filename: str):
    path = f"/tmp/{filename}"
    return FileResponse(path, media_type="application/pdf")