from deepface import DeepFace
import cv2
import numpy as np
from collections import Counter

def get_dominant_emotion(video_path, num_samples=5):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError("Could not open video.")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sample_indices = np.linspace(0, total_frames - 1, num_samples, dtype=int)

    emotion_counts = Counter()
    current_frame = 0
    index_pointer = 0

    success, frame = cap.read()

    while success and index_pointer < len(sample_indices):
        if current_frame == sample_indices[index_pointer]:
            try:
                result = DeepFace.analyze(
                    frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    detector_backend="retinaface"  # ← use PyTorch-only backend
                )
                if isinstance(result, list):
                    emotion = result[0]["dominant_emotion"]
                else:
                    emotion = result["dominant_emotion"]
                emotion_counts[emotion] += 1
            except Exception as e:
                print(f"[Emotion Error] Frame {current_frame}: {e}")
            index_pointer += 1

        success, frame = cap.read()
        current_frame += 1

    cap.release()

    if not emotion_counts:
        return "unknown"

    return emotion_counts.most_common(1)[0][0]
