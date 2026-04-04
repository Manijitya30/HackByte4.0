def load_tamper_model():
    import torch
    import segmentation_models_pytorch as smp

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = smp.Unet(
        encoder_name="efficientnet-b0",
        encoder_weights=None,
        in_channels=3,
        classes=1
    )

    model.load_state_dict(torch.load("models/best_model_finetuned.pth", map_location=device))
    model.to(device)
    model.eval()

    return model, device

def predict_tamper(model, device, image):
    import cv2
    import numpy as np
    import torch
    from PIL import Image

    # ===== Convert PIL → numpy =====
    image_np = np.array(image)
    original = image_np.copy()

    h, w = original.shape[:2]

    # ===== Preprocess (IMPORTANT: 128×128) =====
    img = cv2.resize(original, (128, 128)) / 255.0
    img = (img - 0.5) / 0.5  # normalization

    img = torch.tensor(img).permute(2, 0, 1).unsqueeze(0).float().to(device)

    # ===== Predict =====
    with torch.no_grad():
        pred = model(img)
        heatmap = torch.sigmoid(pred).cpu().squeeze().numpy()

    # ===== Resize back =====
    heatmap = cv2.resize(heatmap, (w, h))

    # ===== Smooth =====
    heatmap = cv2.GaussianBlur(heatmap, (5,5), 0)

    # ===== Convert to 0–255 =====
    heatmap = (heatmap * 255).astype(np.uint8)

    # ===== Convert to PIL =====
    heatmap_pil = Image.fromarray(heatmap)

    return heatmap_pil

def predict_full(model, device, image):
    import cv2
    import numpy as np
    import torch
    from PIL import Image

    image_np = np.array(image)
    original = image_np.copy()
    h, w = original.shape[:2]

    # Preprocess
    img = cv2.resize(original, (128, 128)) / 255.0
    img = (img - 0.5) / 0.5
    img = torch.tensor(img).permute(2,0,1).unsqueeze(0).float().to(device)

    # Predict
    with torch.no_grad():
        pred = model(img)
        heatmap = torch.sigmoid(pred).cpu().squeeze().numpy()

    heatmap = cv2.resize(heatmap, (w, h))
    heatmap = np.clip(heatmap, 0, 1)
    heatmap = cv2.GaussianBlur(heatmap, (7,7), 0)

    mask = (heatmap > 0.5).astype(np.uint8)

    mean_val = heatmap.mean()
    max_val = heatmap.max()
    area = mask.sum()

    if (max_val > 0.7) or (area > 1500) or (mean_val > 0.08):
        tampered = "YES"
    else:
        tampered = "NO"
    # Overlay
    overlay = (original * 0.6 + (heatmap[..., None]*255)*0.4).astype(np.uint8)

    return {
        "heatmap": Image.fromarray((heatmap*255).astype(np.uint8)),
        "mask": Image.fromarray(mask*255),
        "overlay": Image.fromarray(overlay),
        "tampered": tampered,
        "confidence": float(heatmap.mean())
    }
    
