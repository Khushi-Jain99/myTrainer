import time
from services.config.workout_config import METRICS_FIELDS
from services.persistence.exercise_repository import add_exercise


class WorkoutTracker:
    def __init__(self, user_id=0, exercise="Squats", target_sets=3, reps_per_set=10, voice_pipeline=None):
        self.user_id = user_id
        self.exercise = exercise
        self.target_sets = target_sets
        self.reps_per_set = reps_per_set
        self.voice_pipeline = voice_pipeline

        self.reps = 0
        self.sets_completed = 0
        self.current_set_reps = 0
        self.workout_completed = False
        self.last_saved_sets_completed = 0
        self.last_notified_workout_complete = False
        self.set_cycle_started_at = time.time()
        self.metrics_state = {}

    def update_plan(self, exercise, target_sets, reps_per_set):
        self.exercise = exercise
        self.target_sets = target_sets
        self.reps_per_set = reps_per_set
        self.reps = 0
        self.sets_completed = 0
        self.current_set_reps = 0
        self.workout_completed = False
        self.last_saved_sets_completed = 0
        self.last_notified_workout_complete = False
        self.set_cycle_started_at = time.time()

    def process_latest_metrics(self, latest_metrics):
        if not latest_metrics:
            return None

        reps = latest_metrics.get("reps", 0) or 0
        self.reps = reps

        fields = METRICS_FIELDS.get(self.exercise, {})
        for key, default in fields.items():
            self.metrics_state[key] = latest_metrics.get(key, default)

        if self.reps_per_set > 0 and self.target_sets > 0:
            self.sets_completed = self.reps // self.reps_per_set
            self.current_set_reps = self.reps % self.reps_per_set
            self.workout_completed = self.sets_completed >= self.target_sets
        else:
            self.sets_completed = 0
            self.current_set_reps = 0
            self.workout_completed = False

        voice_result = None

        if self.target_sets > 0 and self.reps_per_set > 0 and self.sets_completed > self.last_saved_sets_completed:
            newly_completed = self.sets_completed - self.last_saved_sets_completed
            now_ts = time.time()
            time_taken = int(now_ts - self.set_cycle_started_at)
            
            if self.user_id:
                add_exercise(self.user_id, self.exercise, newly_completed * self.reps_per_set, newly_completed, time_taken)

            if self.voice_pipeline:
                res = self.voice_pipeline.process_event(
                    event="set_completed",
                    exercise=self.exercise,
                    metrics=latest_metrics,
                )
                if res:
                    voice_result = res

            self.set_cycle_started_at = now_ts
            self.last_saved_sets_completed = self.sets_completed

        if self.workout_completed and not self.last_notified_workout_complete:
            self.last_notified_workout_complete = True
            if self.voice_pipeline:
                res = self.voice_pipeline.process_event(
                    event="workout_completed",
                    exercise=self.exercise,
                    metrics=latest_metrics,
                )
                if res:
                    voice_result = res

        pose_detected = latest_metrics.get("pose_detected", True)
        if not pose_detected and self.voice_pipeline and not voice_result:
            res = self.voice_pipeline.process_event(
                event="no_pose_detected",
                exercise=self.exercise,
                metrics={"issue": "No pose detected! Please step into the camera frame."},
            )
            if res:
                voice_result = res

        if self.voice_pipeline and not voice_result:
            res = self.voice_pipeline.process_event(
                event="ongoing_form_check",
                exercise=self.exercise,
                metrics=latest_metrics,
            )
            if res:
                voice_result = res

        metrics_summary = {
            "reps": self.reps,
            "current_set_reps": self.current_set_reps,
            "sets_completed": self.sets_completed,
            "target_sets": self.target_sets,
            "reps_per_set": self.reps_per_set,
            "workout_completed": self.workout_completed,
            **self.metrics_state
        }

        return metrics_summary, voice_result