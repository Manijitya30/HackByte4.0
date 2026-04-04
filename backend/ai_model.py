import torch
import timm
import torch.nn as nn
from torchvision import transforms

device = "cuda" if torch.cuda.is_available() else "cpu"

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def load_ai_model():

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = timm.create_model("efficientnet_b3", pretrained=False)
    model.classifier = nn.Linear(model.classifier.in_features, 1)

    model.load_state_dict(torch.load("models/ai_detector.pth", map_location=device))
    model.to(device)
    model.eval()

    return model, device

def predict_ai(model, device, image):
    from utils import preprocess_ai
    import torch

    x = preprocess_ai(image).to(device)

    with torch.no_grad():
        output = model(x)
        prob = torch.sigmoid(output).item()

    return ("FAKE" if prob > 0.5 else "REAL", prob)