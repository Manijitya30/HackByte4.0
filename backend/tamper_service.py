import librosa
import numpy as np

def detect_tampering(file_path: str):
    try:
        y, sr = librosa.load(file_path, sr=16000, res_type="kaiser_fast")

        energy = librosa.feature.rms(y=y)[0]

        variation = float(np.std(energy))
        diff = np.abs(np.diff(energy))
        spikes = int(np.sum(diff > 0.12))

        if variation > 0.12 and spikes > 8:
            verdict = "Possible Splice Detected"
            tamper_score = 0.8
        elif variation > 0.06:
            verdict = "Uncertain"
            tamper_score = 0.5
        else:
            verdict = "No Tampering Detected"
            tamper_score = 0.2

        return {
            "tamper_score": round(tamper_score, 2),
            "verdict": verdict,
            "energy_variation": variation,
            "spike_count": spikes
        }

    except Exception as e:
        return {"error": str(e)}