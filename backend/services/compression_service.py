from services.frame_extractor import extract_keyframes, get_video_fps
from scipy.signal import find_peaks
from scipy.stats import entropy
import numpy as np
from PIL import Image
import cv2

ZIGZAG_INDEX = [
     0,  1,  8, 16,  9,  2,  3, 10,
    17, 24, 32, 25, 18, 11,  4,  5,
    12, 19, 26, 33, 40, 48, 41, 34,
    27, 20, 13,  6,  7, 14, 21, 28,
    35, 42, 49, 56, 57, 50, 43, 36,
    29, 22, 15, 23, 30, 37, 44, 51,
    58, 59, 52, 45, 38, 31, 39, 46,
    53, 60, 61, 54, 47, 55, 62, 63
]
MID_FREQ_ZIGZAG = ZIGZAG_INDEX[6:28]

def extract_dct_blocks(pil_image: Image.Image) -> np.ndarray:
    gray = np.array(pil_image.convert("L"), dtype=np.float32)
    h = (gray.shape[0] // 8) * 8
    w = (gray.shape[1] // 8) * 8
    gray = gray[:h, :w]
    blocks = []
    for i in range(0, h, 8):
        for j in range(0, w, 8):
            blocks.append(cv2.dct(gray[i:i+8, j:j+8]))
    return np.array(blocks)

def extract_mid_freq_coefficients(blocks: np.ndarray) -> np.ndarray:
    mid_freq_coeffs = []
    for block in blocks:
        flat = block.flatten()
        mid_freq_coeffs.extend([flat[idx] for idx in MID_FREQ_ZIGZAG])
    return np.array(mid_freq_coeffs)

def compute_benford_deviation(coefficients: np.ndarray) -> float:
    """
    Authentic DCT coefficients follow Benford's Law.
    Re-encoded video disrupts this distribution.
    """
    abs_coeffs = np.abs(coefficients[coefficients != 0])
    if len(abs_coeffs) == 0:
        return 0.0
    leading_digits = np.floor(
        abs_coeffs / (10 ** np.floor(np.log10(abs_coeffs + 1e-9)))
    ).astype(int)
    leading_digits = leading_digits[(leading_digits >= 1) & (leading_digits <= 9)]
    if len(leading_digits) == 0:
        return 0.0
    observed = np.bincount(leading_digits, minlength=10)[1:10].astype(float)
    observed /= observed.sum()
    expected = np.array([np.log10(1 + 1/d) for d in range(1, 10)])
    return round(float(entropy(observed + 1e-9, expected + 1e-9)), 6)

def compute_blocking_artifacts(blocks: np.ndarray) -> float:
    """
    Double compression amplifies discontinuities at 8x8 block boundaries.
    Measures DC coefficient variance across neighboring blocks.
    """
    dc_values = blocks[:, 0, 0]
    if len(dc_values) < 2:
        return 0.0
    dc_diff = np.abs(np.diff(dc_values))
    score = float(np.mean(dc_diff) / (np.std(dc_diff) + 1e-9))
    return round(min(score / 10.0, 1.0), 6)

def compute_dct_peak_periodicity(mid_freq: np.ndarray) -> int:
    """
    Double quantization leaves periodic peaks in the DCT histogram.
    Counts how many such peaks are present.
    """
    hist, _ = np.histogram(mid_freq, bins=256, range=(-128, 128))
    hist_normalized = hist / hist.max() if hist.max() > 0 else hist
    peaks, _ = find_peaks(hist_normalized, height=0.05, distance=2)
    return int(len(peaks))

def analyze_frame(frame_number: int, pil_image: Image.Image, fps: float) -> dict:
    blocks   = extract_dct_blocks(pil_image)
    mid_freq = extract_mid_freq_coefficients(blocks)

    benford_score  = compute_benford_deviation(mid_freq)
    blocking_score = compute_blocking_artifacts(blocks)
    peak_count     = compute_dct_peak_periodicity(mid_freq)

    # Only flag signals that proved discriminating across test videos
    benford_suspicious  = benford_score  > 0.003
    blocking_suspicious = blocking_score > 0.09
    peak_suspicious     = peak_count     > 10

    signals_triggered = int(sum([
        benford_suspicious,
        blocking_suspicious,
        peak_suspicious,
    ]))

    is_suspicious = signals_triggered >= 2

    if   signals_triggered == 0: suspicion_level = "clean"
    elif signals_triggered == 1: suspicion_level = "low"
    elif signals_triggered == 2: suspicion_level = "moderate"
    else:                        suspicion_level = "high"

    timestamp_seconds = round(float(frame_number) / fps, 2) if fps > 0 else None

    return {
        "frame_index":        int(frame_number),
        "timestamp_seconds":  timestamp_seconds,
        "benford_deviation":  benford_score,
        "blocking_score":     blocking_score,
        "peak_count":         peak_count,
        "signals_triggered":  signals_triggered,
        "is_suspicious":      bool(is_suspicious),
        "suspicion_level":    suspicion_level,
        "confidence":         round(signals_triggered / 3, 3),
    }

def check_interframe_uniformity(frame_results: list) -> dict:
    """
    Re-encoded video often has suspiciously low variance across frames
    because the second encode homogenizes the compression pattern.
    """
    benford_vals  = [r["benford_deviation"] for r in frame_results]
    blocking_vals = [r["blocking_score"]    for r in frame_results]
    peak_vals     = [r["peak_count"]        for r in frame_results]

    benford_std  = round(float(np.std(benford_vals)),  6)
    blocking_std = round(float(np.std(blocking_vals)), 6)
    peak_std     = round(float(np.std(peak_vals)),     3)

    # Both must be low — single signal too noisy
    uniformity_suspicious = bool(blocking_std < 0.003 and benford_std < 0.0005)

    return {
        "benford_std":            benford_std,
        "blocking_std":           blocking_std,
        "peak_std":               peak_std,
        "uniformity_suspicious":  uniformity_suspicious,
    }

def detect_social_media_recompression(frame_results: list, uniformity: dict) -> dict:
    """
    WhatsApp/Telegram signature: peak_count locked at 1 across all frames
    AND blocking_score uniformly below 0.035.
    These videos are forensically compromised — flag as unreliable rather
    than suspicious, since the chain of custody is already broken.
    """
    peak_counts    = [r["peak_count"]    for r in frame_results]
    blocking_vals  = [r["blocking_score"] for r in frame_results]

    all_peaks_one      = all(p <= 1 for p in peak_counts)
    low_blocking       = float(np.mean(blocking_vals)) < 0.035
    zero_peak_variance = uniformity["peak_std"] == 0

    detected = bool(all_peaks_one and low_blocking and zero_peak_variance)

    return {
        "detected": detected,
        "warning": (
            "Video appears to have been shared via WhatsApp or a similar platform "
            "which aggressively re-compresses video. Original forensic fingerprint "
            "is lost. Compression analysis results are unreliable. "
            "Request the original unshared file from the recording device."
        ) if detected else None,
    }

#-----Main Function-----
def analyze_video_compression(
    video_path: str,
    sample_every_n_frames: int = 10
) -> dict:
    fps       = get_video_fps(video_path)
    keyframes = extract_keyframes(video_path, sample_every_n_frames)

    if not keyframes:
        return {"error": "No frames could be extracted from video"}

    frame_results = [
        analyze_frame(frame_number, pil_image, fps)
        for frame_number, pil_image in keyframes
    ]

    uniformity   = check_interframe_uniformity(frame_results)
    social_media = detect_social_media_recompression(frame_results, uniformity)

    suspicious_frames = [r for r in frame_results if r["is_suspicious"]]
    suspicious_ratio  = round(len(suspicious_frames) / len(frame_results), 2)

    overall_suspicious = bool(
        suspicious_ratio >= 0.4
        or uniformity["uniformity_suspicious"]
    )

    risk_signals = []
    if suspicious_ratio >= 0.4:
        risk_signals.append(
            f"{int(suspicious_ratio * 100)}% of frames show double compression artifacts"
        )
    if uniformity["uniformity_suspicious"]:
        risk_signals.append(
            "Suspiciously uniform compression pattern across frames — "
            "consistent with re-encoding after editing"
        )
        
    top_suspicious = sorted(
        frame_results,
        key=lambda x: x["confidence"],
        reverse=True
    )[:5]

    return {
        "frames_analyzed": len(frame_results),
        "suspicious_frame_count": len(suspicious_frames),
        "suspicious_ratio": suspicious_ratio,
        "overall_suspicious": overall_suspicious,

        "top_suspicious_frames": top_suspicious,

        "explanation": (
            "High number of frames show compression artifacts consistent with re-encoding"
            if overall_suspicious else
            "No strong compression anomalies detected"
        ),

        "avg_benford_deviation": np.mean([r["benford_deviation"] for r in frame_results]),
        "avg_blocking_score": np.mean([r["blocking_score"] for r in frame_results]),

        "risk_signals": risk_signals,
        "frame_results": frame_results
    }