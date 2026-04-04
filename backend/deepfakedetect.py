import torch
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import io

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    processor = ViTImageProcessor.from_pretrained("image-weights/")
    model = ViTForImageClassification.from_pretrained("image-weights/")
    model.to(DEVICE)
    model.eval()
    return processor, model

print(f"Loading deepfake detection model on {DEVICE}...")
_processor, _model = load_model()
print("Model loaded.")


def analyze_deepfake_image(file_bytes: bytes, flag_threshold: float = 0.50) -> dict:
    """
    Deepfake analysis for uploaded image.

    Args:
        file_bytes: Image file in bytes (from upload)
        flag_threshold: Threshold for flagging

    Returns:
        dict result
    """

    try:
        # Convert uploaded bytes → PIL Image
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")

        # Preprocess
        inputs = _processor(images=image, return_tensors="pt").to(DEVICE)

        # Inference
        with torch.no_grad():
            outputs = _model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
            labels = _model.config.id2label

            fake_idx = next(i for i, l in labels.items() if "fake" in l.lower())
            score = round(probs[0][fake_idx].item(), 4)

        # Verdict logic
        if score >= 0.75:
            verdict = "HIGH_RISK"
        elif score >= 0.50:
            verdict = "SUSPICIOUS"
        elif score >= 0.30:
            verdict = "LOW_RISK"
        else:
            verdict = "LIKELY_AUTHENTIC"

        return {
            "deepfake_probability": score,
            "flagged": score >= flag_threshold,
            "verdict": verdict,
        }

    except Exception as e:
        return {
            "error": str(e),
            "status": "FAILED"
        }