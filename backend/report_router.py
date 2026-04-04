from fastapi import APIRouter, UploadFile, File
import os

from ffprobe_service import analyze_metadata
from ai_detection_service import detect_ai_voice
from tamper_service import detect_tampering
from speaker_service import verify_speaker
from report_service import generate_final_report

router = APIRouter(prefix="/audio", tags=["Final Report"])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/full-analysis")
async def full_analysis(
    file: UploadFile = File(...),
    reference: UploadFile = File(None)
):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Metadata
    metadata = analyze_metadata(file_path, file.filename)

    # AI Detection
    ai_result = detect_ai_voice(file_path)

    # Tampering
    tamper_result = detect_tampering(file_path)

    # Speaker Verification
    speaker_result = {"verdict": "Not Provided", "similarity": 0}

    if reference:
        ref_path = os.path.join(UPLOAD_FOLDER, reference.filename)
        with open(ref_path, "wb") as f:
            f.write(await reference.read())

        speaker_result = verify_speaker(file_path, ref_path)

    # Final Report
    final_report = generate_final_report(
        metadata,
        ai_result,
        speaker_result,
        tamper_result
    )

    return final_report