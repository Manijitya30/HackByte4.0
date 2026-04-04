import librosa
import numpy as np

def detect_ai_voice(file_path: str):
    try:
        y, sr = librosa.load(file_path, sr=16000, res_type="kaiser_fast")

        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)

        variance = float(np.var(mfcc))

        if variance < 40:
            ai_score = 0.85
            verdict = "Likely AI-generated"
        elif variance < 80:
            ai_score = 0.5
            verdict = "Uncertain"
        else:
            ai_score = 0.2
            verdict = "Likely Human"

        return {
            "ai_probability": round(ai_score, 2),
            "verdict": verdict,
            "mfcc_variance": variance
        }

    except Exception as e:
        return {"error": str(e)}