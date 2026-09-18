import base64
import logging

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ml.predict import ISLPredictor

logger = logging.getLogger(__name__)

router = APIRouter()

# Load model once when the server starts.
predictor = ISLPredictor()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    logger.info("WebSocket client connected")

    try:
        while True:
            # Receive image from React
            data = await websocket.receive_text()

            try:
                # Remove data URL prefix:
                # data:image/jpeg;base64,...
                if "," in data:
                    data = data.split(",", 1)[1]

                # Base64 -> bytes
                image_bytes = base64.b64decode(data)

                # Bytes -> OpenCV image
                image_array = np.frombuffer(image_bytes, dtype=np.uint8)
                frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

                if frame is None:
                    await websocket.send_json({
                        "success": False,
                        "prediction": "",
                        "confidence": 0,
                        "hand_detected": False,
                        "number_of_hands": 0,
                        "landmarks": [],
                        "message": "Invalid image",
                    })
                    continue

                # =====================================================
                # LANDMARK EXTRACTION
                # =====================================================

                extraction = predictor._extractor.extract_from_numpy(frame)

                # =====================================================
                # PREDICTION
                # =====================================================

                result = predictor._predict_from_extraction(extraction)

                # =====================================================
                # LANDMARKS FOR FRONTEND
                #
                # MediaPipe landmarks are not currently stored in
                # HandLandmarkResult, so prediction works normally.
                # We send the normalized feature data only if available.
                # =====================================================

                await websocket.send_json({
                    "success": result.success,
                    "prediction": result.prediction,
                    "confidence": result.confidence * 100,
                    "hand_detected": result.hand_detected,
                    "number_of_hands": extraction.number_of_hands,
                    "landmarks": [],
                    "message": result.message,
                })

            except Exception as exc:
                logger.exception("Error processing WebSocket frame")

                await websocket.send_json({
                    "success": False,
                    "prediction": "",
                    "confidence": 0,
                    "hand_detected": False,
                    "number_of_hands": 0,
                    "landmarks": [],
                    "message": f"Prediction error: {exc}",
                })

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

    except Exception:
        logger.exception("WebSocket connection error")