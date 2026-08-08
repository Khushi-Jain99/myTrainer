from core.base_exercise import BaseExercise


class BicepsCurlDetector(BaseExercise):
    UP_THRESHOLD = 35
    DOWN_THRESHOLD = 150
    MIN_VISIBILITY = 0.7

    LEFT_SHOULDER = 11
    LEFT_ELBOW = 13
    LEFT_WRIST = 15
    RIGHT_SHOULDER = 12
    RIGHT_ELBOW = 14
    RIGHT_WRIST = 16
    LEFT_HIP = 23
    RIGHT_HIP = 24

    def __init__(self):
        super().__init__()
        self.prev_shoulder_y = None

    def reset(self) -> None:
        self.reps = 0
        self.stage = None
        self.prev_shoulder_y = None

    def process(self, landmarks) -> dict:
        left_vis = landmarks[self.LEFT_ELBOW].visibility
        right_vis = landmarks[self.RIGHT_ELBOW].visibility

        if left_vis >= right_vis:
            shoulder_idx = self.LEFT_SHOULDER
            elbow_idx = self.LEFT_ELBOW
            wrist_idx = self.LEFT_WRIST
            hip_idx = self.LEFT_HIP
        else:
            shoulder_idx = self.RIGHT_SHOULDER
            elbow_idx = self.RIGHT_ELBOW
            wrist_idx = self.RIGHT_WRIST
            hip_idx = self.RIGHT_HIP

        elbow_angle = self.calculate_angle(
            self.get_point(landmarks, shoulder_idx),
            self.get_point(landmarks, elbow_idx),
            self.get_point(landmarks, wrist_idx),
        )

        key_landmarks_visible = (
            landmarks[shoulder_idx].visibility > self.MIN_VISIBILITY and
            landmarks[elbow_idx].visibility > self.MIN_VISIBILITY and
            landmarks[wrist_idx].visibility > self.MIN_VISIBILITY
        )

        if key_landmarks_visible:
            if elbow_angle > self.DOWN_THRESHOLD:
                self.stage = "down"

            if elbow_angle < self.UP_THRESHOLD and self.stage == "down":
                self.stage = "up"
                self.reps += 1

        # Swing & elbow drift status
        elbow_x = landmarks[elbow_idx].x
        hip_x = landmarks[hip_idx].x
        shoulder_x = landmarks[shoulder_idx].x
        shoulder_y = landmarks[shoulder_idx].y

        elbow_drift = abs(elbow_x - shoulder_x)
        if elbow_drift > 0.12:
            shoulder_status = "ELBOW DRIFTING"
        else:
            shoulder_status = "STABLE"

        swing_status = "STABLE"
        if self.prev_shoulder_y is not None:
            if abs(shoulder_y - self.prev_shoulder_y) > 0.05:
                swing_status = "SWINGING"
        self.prev_shoulder_y = shoulder_y

        return {
            "reps": self.reps,
            "elbow_angle": int(elbow_angle),
            "shoulder_status": shoulder_status,
            "swing_status": swing_status,
        }
