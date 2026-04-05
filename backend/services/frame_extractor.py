import cv2
import numpy as np
from PIL import Image
from typing import List, Tuple

#Extracts frames from video at regular intervals.
#Returns list of (frame_number, PIL Image) tuples.
def extract_keyframes(
    video_path: str,
    sample_every_n_frames: int = 30
) -> List[Tuple[int, Image.Image]]:
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    frames = []
    frame_number = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_number % sample_every_n_frames == 0:
            #Convert BGR (OpenCV) to RGB (PIL)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb_frame)
            frames.append((frame_number, pil_image))

        frame_number += 1

    cap.release()
    return frames

#Get FPS of video for converting frame numbers to timestamps.
def get_video_fps(video_path: str) -> float:
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    return fps