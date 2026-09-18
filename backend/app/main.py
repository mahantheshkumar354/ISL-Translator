from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.models.password_reset import PasswordResetToken

import base64
import logging

import cv2
import numpy as np

from app.ml.predict import ISLPredictor
from app.core.database import init_db

# Assumption: your existing authentication router module exposes an
# APIRouter instance named `router`. Adjust this import path only if
# your actual file/module name differs — nothing else in this file
# depends on it.
from app.api.auth import router as auth_router
from app.api.history import router as history_router
from app.api.password_reset import router as password_reset_router


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Bidirectional Indian Sign Language Translator",
    description="AI-powered Indian Sign Language translation system",
    version="1.0.0",
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

@app.on_event("startup")
async def on_startup():

    init_db()

    logger.info(
        "Database initialized"
    )


# Serve ISL sign videos
VIDEO_DIR = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "INDIAN SIGN LANGUAGE ANIMATED VIDEOS"
)

if VIDEO_DIR.exists():
    app.mount(
        "/videos",
        StaticFiles(directory=str(VIDEO_DIR)),
        name="videos"
    )

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# AUTH ROUTES
# ============================================================

app.include_router(auth_router)
app.include_router(history_router)
app.include_router(password_reset_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():

    return {
        "status": "online",
        "message": "ISL Translator API is running",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
async def health_check():

    return {
        "status": "healthy",
    }


# ============================================================
# WEBSOCKET
# ============================================================

@app.websocket("/ws")
async def websocket_sign_to_text(
    websocket: WebSocket
):

    await websocket.accept()

    logger.info(
        "Sign-to-text WebSocket connected"
    )

    predictor = None

    try:

        # ----------------------------------------------------
        # LOAD ONLY ONCE
        # ----------------------------------------------------

        predictor = ISLPredictor()

        logger.info(
            "Predictor loaded successfully"
        )

        # ----------------------------------------------------
        # RECEIVE FRAMES
        # ----------------------------------------------------

        while True:

            data = await websocket.receive_text()

            # Remove data URL prefix
            if "," in data:
                data = data.split(",", 1)[1]

            # ------------------------------------------------
            # BASE64
            # ------------------------------------------------

            try:

                image_bytes = base64.b64decode(
                    data
                )

            except Exception:

                await websocket.send_json({
                    "success": False,
                    "prediction": "",
                    "confidence": 0,
                    "hand_detected": False,
                    "number_of_hands": 0,
                    "landmarks": [],
                    "handedness": [],
                    "message": "Invalid image data",
                })

                continue

            # ------------------------------------------------
            # DECODE IMAGE
            # ------------------------------------------------

            image_array = np.frombuffer(
                image_bytes,
                dtype=np.uint8,
            )

            frame = cv2.imdecode(
                image_array,
                cv2.IMREAD_COLOR,
            )

            if frame is None:

                await websocket.send_json({
                    "success": False,
                    "prediction": "",
                    "confidence": 0,
                    "hand_detected": False,
                    "number_of_hands": 0,
                    "landmarks": [],
                    "handedness": [],
                    "message": "Could not decode image",
                })

                continue

            # ------------------------------------------------
            # PREDICT
            #
            # This performs MediaPipe only ONCE.
            # ------------------------------------------------

            result = predictor.predict_numpy(
                frame
            )

            # ------------------------------------------------
            # SEND RESULT
            # ------------------------------------------------

            await websocket.send_json({

                "success": result.success,

                "prediction": result.prediction,

                "confidence": round(
                    result.confidence * 100,
                    2,
                ),

                "hand_detected": (
                    result.hand_detected
                ),

                "number_of_hands": len(
                    result.landmarks
                ),

                "landmarks": (
                    result.landmarks
                ),

                "handedness": (
                    result.handedness
                ),

                "message": result.message,
            })

    except WebSocketDisconnect:

        logger.info(
            "Sign-to-text WebSocket disconnected"
        )

    except Exception as exc:

        logger.exception(
            "WebSocket error"
        )

        try:

            await websocket.send_json({

                "success": False,

                "prediction": "",

                "confidence": 0,

                "hand_detected": False,

                "number_of_hands": 0,

                "landmarks": [],

                "handedness": [],

                "message": f"Server error: {exc}",
            })

        except Exception:
            pass

    finally:

        if predictor is not None:

            predictor.close()

        logger.info(
            "WebSocket resources released"
        )