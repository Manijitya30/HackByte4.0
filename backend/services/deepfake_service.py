import torch
import torch.nn as nn
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
from services.frame_extractor import extract_keyframes, get_video_fps
import numpy as np
import torchvision.transforms as transforms
# from facenet_pytorch import MTCNN

#Newly added changes (to check for errors) -
# i. Added face cropping (function + in predict_frame)
# ii. Changed the model being loaded

#Face-cropping before feeding to model
# mtcnn = MTCNN()
# def crop_face(image: Image.Image) -> Image.Image:
#     boxes, _ = mtcnn.detect(image)
#     if boxes is not None and len(boxes)>0:
#         box = boxes[0].astype(int)
#         #The four coordinates are (x1, y1, x2, y2)
#         return image.crop((box[0], box[1], box[2], box[3]))
#     return image #Return original if no face detected

#Loading the model and processor at startup
def load_model():
    processor = ViTImageProcessor.from_pretrained("image-weights/")
    model = ViTForImageClassification.from_pretrained("image-weights/")
    model.to(DEVICE)
    model.eval()
    return processor, model

#Image processing to match with what the model needs
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

#Predicting deepfake probability for a single frame
def predict_frame(image: Image.Image) -> float:
    # image = crop_face(image)
    inputs = _processor(images=image, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        outputs = _model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)
        # Check which label index corresponds to "fake"
        labels = _model.config.id2label
        fake_idx = next(i for i, l in labels.items() if "fake" in l.lower())
        return round(probs[0][fake_idx].item(), 4)

#-----Main Analysis Function-----
WEIGHTS_PATH = "weights/"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model once at startup
print(f"Loading deepfake detection model on {DEVICE}...")
_processor, _model = load_model()
print("Model loaded.")

def analyze_deepfake(
    video_path: str,
    sample_every_n_frames: int = 10,
    flag_threshold: float = 0.50
) -> dict:
    """
    Full deepfake analysis pipeline for a video.

    Args:
        video_path: Path to the video file
        sample_every_n_frames: How often to sample frames
        flag_threshold: Probability above which a frame is flagged

    Returns:
        Dictionary with per-frame scores and overall verdict
    """
    fps = get_video_fps(video_path)
    frames = extract_keyframes(video_path, sample_every_n_frames)

    if not frames:
        raise ValueError("No frames could be extracted from video")

    frame_results = []
    flagged_frames = []

    for frame_number, image in frames:
        score = predict_frame(image)
        timestamp = round(frame_number / fps, 2) if fps else None

        result = {
            "frame_number": frame_number,
            "timestamp_seconds": timestamp,
            "deepfake_probability": score,
            "flagged": score >= flag_threshold
        }

        frame_results.append(result)

        if score >= flag_threshold:
            flagged_frames.append(result)

    # Overall video score — average of all frame scores
    all_scores = [r["deepfake_probability"] for r in frame_results]
    average_score = round(float(np.mean(all_scores)), 4)
    max_score = round(float(np.max(all_scores)), 4)

    # Verdict logic
    if average_score >= 0.75:
        verdict = "HIGH_RISK"
    elif average_score >= 0.50:
        verdict = "SUSPICIOUS"
    elif average_score >= 0.30:
        verdict = "LOW_RISK"
    else:
        verdict = "LIKELY_AUTHENTIC"

    return {
        "frames_analyzed": len(frame_results),
        "frames_flagged": len(flagged_frames),
        "average_deepfake_score": average_score,
        "max_deepfake_score": max_score,
        "verdict": verdict,
        "flagged_frames": flagged_frames,
        "all_frame_scores": frame_results,
    }