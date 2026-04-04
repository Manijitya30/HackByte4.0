from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
import aiofiles

# ✅ FIXED IMPORTS
from ffprobe_service import analyze_metadata
from ai_detection_service import detect_ai_voice
from tamper_service import detect_tampering
from speaker_service import verify_speaker
from report_service import generate_final_report
from audio_report_service import generate_audio_report

router = APIRouter(prefix="/audio", tags=["Audio Analysis"])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/analyze")
async def full_analysis(
    file: UploadFile = File(...),
    reference: UploadFile = File(None)
):
    file_ext = os.path.splitext(file.filename)[-1].lower()

    temp_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_FOLDER, temp_filename)

    # Save uploaded file
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(await file.read())

    ref_path = None

    try:
        # ============================
        # METADATA
        # ============================
        metadata, metadata_extra = analyze_metadata(file_path, file.filename)

        # ============================
        # AI DETECTION
        # ============================
        ai_result = detect_ai_voice(file_path)

        # ============================
        # TAMPERING
        # ============================
        tamper_result = detect_tampering(file_path)

        # ============================
        # SPEAKER VERIFICATION
        # ============================
        speaker_result = {"verdict": "Not Provided", "similarity": 0}

        if reference:
            ref_filename = f"{uuid.uuid4()}.wav"
            ref_path = os.path.join(UPLOAD_FOLDER, ref_filename)

            async with aiofiles.open(ref_path, "wb") as f:
                await f.write(await reference.read())

            speaker_result = verify_speaker(file_path, ref_path)

        # ============================
        # FINAL SCORING
        # ============================
        final_report = generate_final_report(
            metadata,
            ai_result,
            speaker_result,
            tamper_result
        )

        # ============================
        # GENERATE PDF REPORT
        # ============================
        report_path = os.path.join(
            UPLOAD_FOLDER,
            f"audio_report_{uuid.uuid4()}.pdf"
        )

        generate_audio_report(
            report_path,
            file.filename,
            metadata,
            metadata_extra,
            ai_result,
            speaker_result,
            tamper_result,
            final_report["final"]
        )

        return {
    "metadata": {
        "main": metadata,
        "extra": metadata_extra
    },
    "ai_detection": ai_result,
    "tampering": tamper_result,
    "speaker": speaker_result,
    "final": final_report,

    "report_url": f"http://127.0.0.1:8000/audio/download/{os.path.basename(report_path)}"
    }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Cleanup files
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            if ref_path and os.path.exists(ref_path):
                os.remove(ref_path)
        except:
            pass

@router.get("/download/{filename}")
def download_audio_report(filename: str):
    path = os.path.join(UPLOAD_FOLDER, filename)
    return FileResponse(path, media_type="application/pdf")