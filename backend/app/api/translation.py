from __future__ import annotations

import base64
import logging

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ml.predict import ISLPredictor


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/translation",
    tags=["Translation"],
)


# ============================================================
# PREDICTOR
# ============================================================

_predictor: ISLPredictor | None = None


def get_predictor() -> ISLPredictor:
    global _predictor

    if _predictor is None:
        _predictor = ISLPredictor()

    return _predictor


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/status")
async def translation_status():
    """
    Check whether the Sign-to-Text ML system is ready.
    """

    try:
        predictor = get_predictor()

        return {
            "status": "ready",
            "model_loaded": predictor.model is not None,
            "classes": len(predictor.classes),
            "message": "Sign-to-Text model is ready",
        }

    except Exception as exc:
        logger.exception("Translation model is not ready")

        return {
            "status": "error",
            "model_loaded": False,
            "message": str(exc),
        }


# ============================================================
# IMAGE PREDICTION
# ============================================================

@router.post("/predict")
async def predict_image(image_base64: str):
    """
    Predict one sign from a base64 encoded image.
    """

    try:
        # Remove data URL prefix if React sends one.
        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]

        image_bytes = base64.b64decode(image_base64)

        image_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8,
        )

        frame = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR,
        )

        if frame is None:
            return {
                "success": False,
                "prediction": "",
                "confidence": 0.0,
                "hand_detected": False,
                "message": "Could not decode image",
            }

        predictor = get_predictor()

        result = predictor.predict_numpy(frame)

        return result.as_dict()

    except Exception as exc:
        logger.exception("Prediction request failed")

        return {
            "success": False,
            "prediction": "",
            "confidence": 0.0,
            "hand_detected": False,
            "message": f"Prediction failed: {exc}",
        }


# ============================================================
# WEBSOCKET — REAL-TIME SIGN TO TEXT
# ============================================================

@router.websocket("/ws")
async def translation_websocket(websocket: WebSocket):
    """
    Real-time Sign-to-Text WebSocket.

    React sends camera frames.

    Backend:
        base64 image
            ↓
        OpenCV
            ↓
        MediaPipe
            ↓
        126 landmarks
            ↓
        TensorFlow
            ↓
        prediction
    """

    await websocket.accept()

    logger.info("Sign-to-Text WebSocket connected")

    try:
        predictor = get_predictor()

        while True:

            # Receive camera frame from React.
            data = await websocket.receive_text()

            try:
                # Remove data URL prefix if present.
                if "," in data:
                    data = data.split(",", 1)[1]

                image_bytes = base64.b64decode(data)

                image_array = np.frombuffer(
                    image_bytes,
                    dtype=np.uint8,
                )

                frame = cv2.imdecode(
                    image_array,
                    cv2.IMREAD_COLOR,
                )

                if frame is None:
                    await websocket.send_json(
                        {
                            "success": False,
                            "prediction": "",
                            "confidence": 0.0,
                            "hand_detected": False,
                            "message": "Invalid camera frame",
                        }
                    )
                    continue

                # Run ML prediction.
                result = predictor.predict_numpy(frame)

                # Send prediction back to React.
                await websocket.send_json(
                    result.as_dict()
                )

            except Exception as exc:
                logger.exception(
                    "Error processing WebSocket frame"
                )

                await websocket.send_json(
                    {
                        "success": False,
                        "prediction": "",
                        "confidence": 0.0,
                        "hand_detected": False,
                        "message": f"Frame processing failed: {exc}",
                    }
                )

    except WebSocketDisconnect:
        logger.info("Sign-to-Text WebSocket disconnected")

    except Exception:
        logger.exception("Unexpected WebSocket error")

    finally:
        logger.info("Sign-to-Text WebSocket connection closed")