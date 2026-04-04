from resemblyzer import VoiceEncoder, preprocess_wav
import numpy as np

encoder = VoiceEncoder()

def verify_speaker(file1_path: str, file2_path: str):
    wav1 = preprocess_wav(file1_path)
    wav2 = preprocess_wav(file2_path)

    emb1 = encoder.embed_utterance(wav1)
    emb2 = encoder.embed_utterance(wav2)

    similarity = float(np.dot(emb1, emb2))

    if similarity > 0.88:
        verdict = "MATCH"
    elif similarity > 0.75:
        verdict = "UNCERTAIN"
    else:
        verdict = "DIFFERENT"

    return {
        "similarity": round(similarity, 3),
        "verdict": verdict
    }