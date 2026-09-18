from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import base64
import io
import logging

import numpy as np
from PIL import Image

from app.ml.predict import ISLPredictor

router = APIRouter()

logger = logging.getLogger(__name__)

# Load the trained model ONCE when the server starts.
predictor = ISLPredictor()


@router.websocket("/ws")
async def websocket_translation(websocket: WebSocket):
    await websocket.accept()

    logger.info("WebSocket client connected")

    try:
        while True:
            # Receive image as a string from React
            data = await websocket.receive_text()

            try:
                # Frontend sends:
                # data:image/jpeg;base64,/9j/...
                if "," in data:
                    data = data.split(",", 1)[1]

                image_bytes = base64.b64decode(data)

                # Decode JPEG/PNG
                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

                # Convert RGB -> BGR because OpenCV/our extractor expects BGR
                image_array = np.array(image)
                image_array = image_array[:, :, ::-1].copy()

                # Run trained model
                result = predictor.predict_numpy(image_array)

                # Send prediction back to React
                await websocket.send_json({
                    "success": result.success,
                    "prediction": result.prediction,
                    "confidence": result.confidence * 100,
                    "hand_detected": result.hand_detected,
                    "message": result.message,
                })

            except Exception as exc:
                logger.exception("Error processing WebSocket frame")

                await websocket.send_json({
                    "success": False,
                    "prediction": "",
                    "confidence": 0,
                    "hand_detected": False,
                    "message": f"Frame processing error: {exc}",
                })

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

    except Exception:
        logger.exception("WebSocket connection error")


def shutdown_predictor():
    """Release MediaPipe resources when the application shuts down."""
    predictor.close()