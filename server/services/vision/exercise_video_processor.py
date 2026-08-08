import os
import cv2
import numpy as np
import mediapipe as mp
import threading
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from detectors.squat import SquatDetector
from detectors.pushup import PushUpDetector
from detectors.biceps_curl import BicepsCurlDetector
from detectors.shoulder_press import ShoulderPressDetector
from detectors.lunges import LungesDetector
from services.config.workout_config import POSE_CONNECTIONS


class PoseVideoProcessor:
    def __init__(self):
        self._lock = threading.Lock()
        self._latest_metrics = None
        self._exercise_type = "Squats"

        model_dir = os.path.join(os.getcwd(), "ml_models")
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, "pose_landmarker_full.task")
        if not os.path.exists(model_path):
            import urllib.request
            print("Downloading MediaPipe pose_landmarker_full.task model...")
            url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task"
            urllib.request.urlretrieve(url, model_path)
            print("Model downloaded successfully!")

        base_option = python.BaseOptions(model_asset_path=model_path)

        options = vision.PoseLandmarkerOptions(
            base_options=base_option,
            running_mode=vision.RunningMode.VIDEO,
            min_pose_detection_confidence=0.7,
            min_pose_presence_confidence=0.7,
            min_tracking_confidence=0.7,
            output_segmentation_masks=False
        )

        self._landmarker = vision.PoseLandmarker.create_from_options(options)

        self._detectors = {
            "Squats": SquatDetector(),
            "Push-ups": PushUpDetector(),
            "Biceps Curls (Dumbbell)": BicepsCurlDetector(),
            "Shoulder Press": ShoulderPressDetector(),
            "Lunges": LungesDetector(),
        }

        self._frame_timestamps_ms = 0

    def set_exercise(self, exercise_type):
        with self._lock:
            self._exercise_type = exercise_type
            if exercise_type in self._detectors:
                self._detectors[exercise_type].reset()

    def get_exercise(self):
        with self._lock:
            return self._exercise_type

    def _draw_skeleton(self, img, landmarks):
        h, w = img.shape[:2]

        for start_idx, end_idx in POSE_CONNECTIONS:
            p1 = landmarks[start_idx]
            p2 = landmarks[end_idx]

            if p1.visibility > 0.7 and p2.visibility > 0.7:
                cv2.line(
                    img,
                    (int(p1.x * w), int(p1.y * h)),
                    (int(p2.x * w), int(p2.y * h)),
                    (0, 255, 0),
                    4
                )

        for lm in landmarks:
            if lm.visibility > 0.7:
                cv2.circle(
                    img,
                    (int(lm.x * w), int(lm.y * h)),
                    6,
                    (255, 0, 0),
                    -1
                )

    def _draw_no_pose_warnings(self, img):
        cv2.putText(
            img,
            "NO POSE DETECTED",
            (30, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (0, 0, 255),
            2,
            cv2.LINE_AA,
        )

        cv2.putText(
            img,
            "PLEASE FACE THE CAMERA",
            (30, 90),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2,
            cv2.LINE_AA,
        )

    def _draw_overlays(self, img, metrics, ex_type):
        h, _ = img.shape[:2]
        text = ""
        if ex_type == "Squats":
            text = f"DEPTH: {metrics.get('depth_status', 'N/A')}"
        elif ex_type == "Push-ups":
            text = f"BODY: {metrics.get('body_alignment', 'N/A')} | HIP: {metrics.get('hip_status', 'N/A')}"
        elif ex_type == "Biceps Curls (Dumbbell)":
            text = f"SWING: {metrics.get('swing_status', 'N/A')}"
        elif ex_type == "Shoulder Press":
            text = f"EXT: {metrics.get('extension_status', 'N/A')} | BACK: {metrics.get('back_arch_status', 'N/A')}"
        elif ex_type == "Lunges":
            text = f"BALANCE: {metrics.get('balance_status', 'N/A')}"

        if text:
            cv2.putText(
                img,
                text,
                (20, h - 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2,
            )

    def process_frame(self, image_bgr):
        # Flip image horizontally for mirror view
        image = cv2.flip(image_bgr, 1)

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        )

        self._frame_timestamps_ms += 33
        result = self._landmarker.detect_for_video(mp_image, self._frame_timestamps_ms)

        metrics = {}
        if result.pose_landmarks:
            landmarks = result.pose_landmarks[0]
            self._draw_skeleton(image, landmarks)

            ex_type = self.get_exercise()
            detector = self._detectors.get(ex_type)

            if detector:
                metrics = detector.process(landmarks)
                metrics["pose_detected"] = True
                self._draw_overlays(image, metrics, ex_type)
        else:
            self._draw_no_pose_warnings(image)
            metrics = {"pose_detected": False}

        return image, metrics