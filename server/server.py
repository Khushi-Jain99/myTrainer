import os
import io
import time
import base64
import cv2
import numpy as np
import pandas as pd
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from groq import Groq
from services.persistence.exercise_repository import (
    init_db,
    get_or_create_user,
    get_users_exercises,
)
from services.config.workout_config import EXERCISE_OPTIONS
from services.coaching.llm import LLMCoach
from services.coaching.tts import TextToSpeech
from services.coaching.voice_pipeline import VoicePipeline, voice_bytes_to_base64
from services.vision.exercise_video_processor import PoseVideoProcessor
from services.tracking.metrics import WorkoutTracker

# Initialize Database
init_db()

# Initialize FastAPI App
app = FastAPI(title="My Trainer Backend", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global / Session State Storage
video_processor = PoseVideoProcessor()

# Initialize Groq Client & Voice Pipeline
groq_api_key = os.environ.get("GROQ_API_KEY", "")
try:
    groq_client = Groq(api_key=groq_api_key or "dummy_key")
except Exception:
    groq_client = None

llm_coach = LLMCoach(groq_client)
tts = TextToSpeech()
voice_pipeline = VoicePipeline(llm_coach, tts)

# Active session trackers keyed by user_id or default
active_trackers = {}


def get_tracker(user_id: int, exercise="Squats", target_sets=3, reps_per_set=10):
    if user_id not in active_trackers:
        active_trackers[user_id] = WorkoutTracker(
            user_id=user_id,
            exercise=exercise,
            target_sets=target_sets,
            reps_per_set=reps_per_set,
            voice_pipeline=voice_pipeline,
        )
    return active_trackers[user_id]


# Pydantic Schemas
class LoginRequest(BaseModel):
    username: str


class WorkoutStartRequest(BaseModel):
    user_id: int
    exercise: str
    target_sets: int
    reps_per_set: int


class WorkoutEndRequest(BaseModel):
    user_id: int
    exercise: str


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "My Trainer"}


@app.get("/api/config")
def get_config():
    return {"exercise_options": EXERCISE_OPTIONS}


@app.post("/api/auth/login")
def login(req: LoginRequest):
    username = req.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    user = get_or_create_user(username)
    return {"id": user["id"], "username": user["username"]}


@app.get("/api/user/history")
def get_history(user_id: int):
    history_rows = get_users_exercises(user_id)
    raw_list = [
        {
            "Exercise": row["exercise_name"],
            "Reps": row["reps"],
            "Sets": row["sets"],
            "Time (sec)": row["time"],
            "Date": row["created_at"],
        }
        for row in history_rows
    ]

    df = pd.DataFrame(raw_list)
    aggregated = []
    if not df.empty:
        df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
        agg_df = (
            df.groupby(["Exercise", "Date"])
            .agg({"Reps": "sum", "Sets": "sum", "Time (sec)": "sum"})
            .reset_index()
        )
        aggregated = agg_df.to_dict(orient="records")

    return {"raw": raw_list, "aggregated": aggregated}


@app.post("/api/workout/start")
def start_workout(req: WorkoutStartRequest):
    tracker = get_tracker(
        user_id=req.user_id,
        exercise=req.exercise,
        target_sets=req.target_sets,
        reps_per_set=req.reps_per_set,
    )
    tracker.update_plan(req.exercise, req.target_sets, req.reps_per_set)
    video_processor.set_exercise(req.exercise)

    audio_b64 = ""
    coach_text = ""

    if voice_pipeline:
        try:
            result = voice_pipeline.process_event(
                event="workout_started",
                exercise=req.exercise,
                metrics={},
            )
            if result:
                audio_bytes, coach_text = result
                audio_b64 = voice_bytes_to_base64(audio_bytes)
        except Exception as e:
            print(f"Warning: start_workout voice pipeline error: {e}")

    return {
        "success": True,
        "exercise": req.exercise,
        "target_sets": req.target_sets,
        "reps_per_set": req.reps_per_set,
        "coach_text": coach_text,
        "audio_base64": audio_b64,
    }


@app.post("/api/workout/end")
def end_workout(req: WorkoutEndRequest):
    audio_b64 = ""
    coach_text = ""

    if voice_pipeline:
        try:
            result = voice_pipeline.process_event(
                event="workout_completed",
                exercise=req.exercise,
                metrics={},
            )
            if result:
                audio_bytes, coach_text = result
                audio_b64 = voice_bytes_to_base64(audio_bytes)
        except Exception as e:
            print(f"Warning: end_workout voice pipeline error: {e}")
            audio_bytes, coach_text = result
            audio_b64 = voice_bytes_to_base64(audio_bytes)

    return {
        "success": True,
        "coach_text": coach_text,
        "audio_base64": audio_b64,
    }


@app.websocket("/ws/pose")
async def pose_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Expected client payload: { frame: "data:image/jpeg;base64,...", user_id: 1, exercise: "Squats" }
            frame_data = data.get("frame", "")
            user_id = data.get("user_id", 0)
            exercise = data.get("exercise", "Squats")

            if not frame_data:
                continue

            # Strip data URI prefix if present
            if "," in frame_data:
                frame_data = frame_data.split(",")[1]

            img_bytes = base64.b64decode(frame_data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if img_bgr is None:
                continue

            video_processor.set_exercise(exercise)
            annotated_img, raw_metrics = video_processor.process_frame(img_bgr)

            # Process tracker & voice pipeline
            tracker = get_tracker(user_id=user_id, exercise=exercise)
            if tracker.exercise != exercise:
                tracker.set_exercise(exercise)

            tracker_res = tracker.process_latest_metrics(raw_metrics)
            metrics_summary = {}
            voice_feedback = None

            if tracker_res:
                metrics_summary, voice_tuple = tracker_res
                if voice_tuple:
                    audio_bytes, text = voice_tuple
                    voice_feedback = {
                        "text": text,
                        "audio": voice_bytes_to_base64(audio_bytes),
                    }

            # Encode annotated frame to JPEG
            _, buffer = cv2.imencode(".jpg", annotated_img, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            processed_b64 = base64.b64encode(buffer).decode("utf-8")

            response_payload = {
                "processed_frame": f"data:image/jpeg;base64,{processed_b64}",
                "metrics": metrics_summary,
                "voice_feedback": voice_feedback,
            }

            await websocket.send_json(response_payload)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
