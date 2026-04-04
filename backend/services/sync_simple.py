import cv2
import librosa
import numpy as np
import tempfile
import subprocess
import os

# ---------------- AUDIO EXTRACTION ----------------
def extract_audio(video_path):
    temp_audio = tempfile.mktemp(suffix=".wav")

    # CHANGE THIS: Use ffmpeg.exe, not ffprobe.exe

    command = [  # Now using ffmpeg.exe
        "ffmpeg",
        "-i", video_path,
        "-ac", "1",
        "-ar", "16000",
        "-y",
        temp_audio
    ]

    # Better to capture output for debugging
    result = subprocess.run(command, capture_output=True, text=True)
    
    # Check if it worked
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed: {result.stderr}")
    
    # Check if file was created
    if not os.path.exists(temp_audio) or os.path.getsize(temp_audio) == 0:
        raise RuntimeError(f"Audio file not created or empty")
    
    return temp_audio

# ---------------- AUDIO FEATURES ----------------
def extract_audio_features(video_path):
    audio_path = extract_audio(video_path)
    
    try:
        y, sr = librosa.load(audio_path, sr=16000)
        mfcc = librosa.feature.mfcc(y=y, sr=sr)
        return np.mean(mfcc, axis=1)
    finally:
        # Always clean up temp file
        if os.path.exists(audio_path):
            os.remove(audio_path)

# ---------------- VIDEO MOTION ----------------
def extract_video_motion(video_path):
    cap = cv2.VideoCapture(video_path)

    prev = None
    motions = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # speed optimization
        if frame_count % 2 != 0:
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev is not None:
            diff = cv2.absdiff(prev, gray)
            motion = np.mean(diff)
            motions.append(motion)

        prev = gray

        # limit frames (performance)
        if len(motions) > 200:
            break

    cap.release()
    return np.array(motions)

# ---------------- MAIN SYNC CHECK ----------------
def check_sync(video_path):
    try:
        audio_feat = extract_audio_features(video_path)
        motion_feat = extract_video_motion(video_path)

        if len(motion_feat) == 0:
            return {
                "confidence": 0,
                "status": "No Motion Detected",
                "reason": "Video has no detectable motion"
            }

        # normalize
        audio_feat = (audio_feat - np.mean(audio_feat)) / (np.std(audio_feat) + 1e-6)
        motion_feat = (motion_feat - np.mean(motion_feat)) / (np.std(motion_feat) + 1e-6)

        # match lengths
        min_len = min(len(audio_feat), len(motion_feat))
        audio_feat = audio_feat[:min_len]
        motion_feat = motion_feat[:min_len]

        # correlation
        corr = np.corrcoef(audio_feat, motion_feat)[0, 1]

        if np.isnan(corr):
            corr = 0.0

        corr = float(round(corr, 3))

        # DECISION LOGIC
        if corr > 0.35:
            status = "Strongly In Sync"
            reason = "High correlation between audio and motion"
        elif corr > 0.2:
            status = "Possibly In Sync"
            reason = "Moderate correlation detected"
        else:
            status = "Out of Sync"
            reason = "Low correlation between audio and motion"

        return {
            "confidence": corr,
            "status": status,
            "reason": reason
        }

    except Exception as e:
        return {
            "confidence": 0,
            "status": "Error",
            "reason": str(e)
        }