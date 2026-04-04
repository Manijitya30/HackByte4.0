import cv2
import librosa
import numpy as np
import tempfile
import subprocess
import os


def extract_audio(video_path):
    temp_audio = tempfile.mktemp(suffix=".wav")

    command = [
        "ffmpeg",
        "-i", video_path,
        "-ac", "1",
        "-ar", "16000",
        "-y",
        temp_audio
    ]

    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(result.stderr)

    return temp_audio


def extract_audio_energy(video_path):
    audio_path = extract_audio(video_path)

    try:
        y, sr = librosa.load(audio_path, sr=16000)
        energy = librosa.feature.rms(y=y)[0]
        return energy
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


def extract_motion(video_path):
    cap = cv2.VideoCapture(video_path)

    prev = None
    motion = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev is not None:
            diff = cv2.absdiff(prev, gray)
            motion.append(np.mean(diff))

        prev = gray

    cap.release()
    return np.array(motion)


def check_sync(video_path):
    try:
        audio_energy = extract_audio_energy(video_path)
        motion = extract_motion(video_path)

        if len(motion) == 0:
            return {"status": "No motion", "confidence": 0}

        # Normalize
        audio_energy = (audio_energy - np.mean(audio_energy)) / (np.std(audio_energy) + 1e-6)
        motion = (motion - np.mean(motion)) / (np.std(motion) + 1e-6)

        min_len = min(len(audio_energy), len(motion))
        audio_energy = audio_energy[:min_len]
        motion = motion[:min_len]

        # Cross correlation (IMPORTANT FIX)
        correlation = np.correlate(audio_energy, motion, mode="full")
        lag = int(np.argmax(correlation) - len(audio_energy))

        confidence = float(np.max(correlation) / len(audio_energy))
        confidence = round(confidence, 3)

        if confidence > 0.4:
            status = "Strong Sync"
        elif confidence > 0.25:
            status = "Moderate Sync"
        else:
            status = "Out of Sync"

        return {
            "confidence": confidence,
            "status": status,
            "lag_frames": lag,
            "explanation": f"Audio-motion alignment peak at lag {lag} frames"
        }

    except Exception as e:
        return {"status": "Error", "confidence": 0, "reason": str(e)}