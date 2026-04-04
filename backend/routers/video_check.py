from services.deepfake_service import analyze_deepfake
import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.deepfake_service import analyze_deepfake
from services.compression_service import analyze_video_compression
from services.splice_detection import analyze_video_splice
from services.ffprobe_service import analyze_metadata
from services.sync_simple import check_sync

#Setup
router = APIRouter()
UPLOAD_DIR = "/tmp/evidence_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv"}

#Route for deepfake anaylsis
@router.post("/analyze/deepfake")
async def analyze_video_deepfake(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        #Save video to temporary location rather than overloading the RAM
        async with aiofiles.open(temp_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        report = analyze_deepfake(temp_path)
        return report

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    finally:
        #Cleaning up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

#Route for Compression Artifact Detection
@router.post("/analyze/compression")
async def analyze_video_compression_artifacts(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}"
        )

    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        async with aiofiles.open(temp_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        result = analyze_video_compression(temp_path)
        return result

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

#Route for Splice Detection
@router.post("/analyze/splice")
async def analyze_video_splice_tampering(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        async with aiofiles.open(temp_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        result = analyze_video_splice(temp_path)
        return result

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/analyze/metadata")
async def analyze_video_metadata(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        async with aiofiles.open(temp_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        report = analyze_metadata(temp_path, file.filename)
        return report

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/analyze/syncnet")
async def syncnet_check(file: UploadFile = File(...)):
    temp_path = f"temp_data/{uuid.uuid4()}.mp4"

    # save uploaded file
    async with aiofiles.open(temp_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    try:
        result = check_sync(temp_path)
        return result

    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except:
            pass