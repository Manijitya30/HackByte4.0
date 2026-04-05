from services.frame_extractor import extract_keyframes, get_video_fps
from skimage.metrics import structural_similarity as ssim
import numpy as np
from PIL import Image
import cv2

def pil_to_gray(pil_image: Image.Image) -> np.ndarray:
    return np.array(pil_image.convert("L"))

def compute_ssim(frame_a: np.ndarray, frame_b: np.ndarray) -> float:
    h = min(frame_a.shape[0], frame_b.shape[0])
    w = min(frame_a.shape[1], frame_b.shape[1])
    score, _ = ssim(frame_a[:h, :w], frame_b[:h, :w], full=True)
    return round(float(score), 6)

def compute_histogram_correlation(frame_a: np.ndarray, frame_b: np.ndarray) -> float:
    hist_a = cv2.calcHist([frame_a], [0], None, [256], [0, 256])
    hist_b = cv2.calcHist([frame_b], [0], None, [256], [0, 256])
    return round(float(cv2.compareHist(hist_a, hist_b, cv2.HISTCMP_CORREL)), 6)

def compute_frame_difference(frame_a: np.ndarray, frame_b: np.ndarray) -> float:
    h = min(frame_a.shape[0], frame_b.shape[0])
    w = min(frame_a.shape[1], frame_b.shape[1])
    diff = np.abs(frame_a[:h, :w].astype(float) - frame_b[:h, :w].astype(float))
    return round(float(np.mean(diff)), 6)

def analyze_transition(
    frame_number_a: int,
    frame_number_b: int,
    gray_a: np.ndarray,
    gray_b: np.ndarray,
    fps: float,
) -> dict:
    return {
        "from_frame":        int(frame_number_a),
        "to_frame":          int(frame_number_b),
        "from_timestamp":    round(float(frame_number_a) / fps, 2) if fps > 0 else None,
        "to_timestamp":      round(float(frame_number_b) / fps, 2) if fps > 0 else None,
        "ssim_score":        compute_ssim(gray_a, gray_b),
        "hist_correlation":  compute_histogram_correlation(gray_a, gray_b),
        "frame_diff":        compute_frame_difference(gray_a, gray_b),
    }

def find_splice_points(transitions: list) -> tuple[list, list]:
    """
    All detection is relative to the video's own baseline.
    No fixed thresholds — works for both slow and fast-moving video.

    A true splice has a specific signature:
      - frame_diff spikes far above baseline (camera cuts look like this too)
      - BUT a real splice also causes hist_correlation to DROP simultaneously
      - Natural cuts: high frame_diff BUT hist_correlation stays reasonable
        because the overall brightness/contrast of the scene is similar
      - Splices from different sources: BOTH spike together because the
        two clips come from different environments entirely

    We use 3 std deviations for hard splices, 2 std for anomalies.
    Both ssim AND hist_corr must drop together to avoid flagging natural motion.
    """
    if len(transitions) < 4:
        return [], []

    ssim_vals = np.array([t["ssim_score"]       for t in transitions])
    hist_vals = np.array([t["hist_correlation"]  for t in transitions])
    diff_vals = np.array([t["frame_diff"]        for t in transitions])

    ssim_mean, ssim_std = float(np.mean(ssim_vals)), float(np.std(ssim_vals))
    hist_mean, hist_std = float(np.mean(hist_vals)), float(np.std(hist_vals))
    diff_mean, diff_std = float(np.mean(diff_vals)), float(np.std(diff_vals))

    hard_splices = []
    anomalies    = []

    for t in transitions:
        ssim_drop  = t["ssim_score"]      < ssim_mean - 3.0 * ssim_std
        hist_drop  = t["hist_correlation"] < hist_mean - 3.0 * hist_std
        diff_spike = t["frame_diff"]       > diff_mean + 3.0 * diff_std

        # Hard splice: frame_diff spikes AND hist drops together
        # Requiring both prevents natural camera movement from triggering
        if diff_spike and hist_drop:
            hard_splices.append({
                **t,
                "detection": "hard_splice",
                "reason": (
                    f"Frame diff spiked to {t['frame_diff']} "
                    f"(baseline {round(diff_mean, 1)} ± {round(diff_std, 1)}) "
                    f"with simultaneous histogram drop to {t['hist_correlation']} "
                    f"(baseline {round(hist_mean, 3)} ± {round(hist_std, 3)})"
                )
            })

        #Subtle anomaly - ssim AND hist both drop together
        elif ssim_drop and hist_drop:
            anomalies.append({
                **t,
                "detection": "statistical_anomaly",
                "reason": (
                    f"SSIM dropped to {t['ssim_score']} "
                    f"(baseline {round(ssim_mean, 3)} ± {round(ssim_std, 3)}) "
                    f"with histogram drop to {t['hist_correlation']} "
                    f"(baseline {round(hist_mean, 3)} ± {round(hist_std, 3)})"
                )
            })

    return hard_splices, anomalies

#-----Main Analysis Function-----
def analyze_video_splice(
    video_path: str,
    sample_every_n_frames: int = 5,
) -> dict:
    fps       = get_video_fps(video_path)
    keyframes = extract_keyframes(video_path, sample_every_n_frames)

    if len(keyframes) < 2:
        return {"error": "Not enough frames extracted to analyze transitions"}

    transitions = []
    for i in range(len(keyframes) - 1):
        frame_num_a, pil_a = keyframes[i]
        frame_num_b, pil_b = keyframes[i + 1]
        transitions.append(analyze_transition(
            frame_num_a, frame_num_b,
            pil_to_gray(pil_a), pil_to_gray(pil_b),
            fps
        ))

    hard_splices, anomalies = find_splice_points(transitions)
    overall_suspicious = bool(len(hard_splices) > 0 or len(anomalies) > 0)

    risk_signals = []
    if hard_splices:
        timestamps = [f"{s['from_timestamp']}s–{s['to_timestamp']}s" for s in hard_splices]
        risk_signals.append(
            f"{len(hard_splices)} splice point(s) detected at: {', '.join(timestamps)}"
        )
    if anomalies:
        timestamps = [f"{a['from_timestamp']}s–{a['to_timestamp']}s" for a in anomalies]
        risk_signals.append(
            f"{len(anomalies)} subtle anomalous transition(s) at: {', '.join(timestamps)}"
        )

    ssim_vals = [t["ssim_score"]      for t in transitions]
    hist_vals = [t["hist_correlation"] for t in transitions]
    
    for s in hard_splices:
        s["severity"] = "HIGH"

    for a in anomalies:
        a["severity"] = "MEDIUM"

    return {
        "transitions_analyzed": len(transitions),
        "splice_points_detected": len(hard_splices),
        "statistical_anomalies": len(anomalies),

        "overall_suspicious": overall_suspicious,

        "confidence": round(
            (len(hard_splices) * 0.7 + len(anomalies) * 0.3) / max(len(transitions), 1), 3
        ),

        "explanation": (
            "Multiple abrupt transitions detected inconsistent with natural video flow"
            if overall_suspicious else
            "No strong splice indicators found"
        ),

        "risk_signals": risk_signals,

        "splice_points": hard_splices,
        "anomalous_transitions": anomalies,
    }