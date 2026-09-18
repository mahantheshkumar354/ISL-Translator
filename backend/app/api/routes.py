from fastapi import APIRouter, UploadFile, File, HTTPException
import cv2
import numpy as np

from app.ml.predict import ISLPredictor


# ============================================================
# ROUTER
# ============================================================

router = APIRouter()


# ============================================================
# PREDICTOR
# ============================================================

# Load the trained model ONCE when the API starts.
# Do NOT create a new predictor for every request.
try:
    predictor = ISLPredictor()
except Exception as exc:
    predictor = None
    print(f"WARNING: Could not load ISL predictor: {exc}")


# ============================================================
# HEALTH CHECK FOR ML
# ============================================================

@router.get("/ml/health")
async def ml_health():
    """
    Check whether the trained ISL prediction model is loaded.
    """
    if predictor is None:
        return {
            "status": "error",
            "model_loaded": False,
            "message": "ISL prediction model is not loaded",
        }

    return {
        "status": "healthy",
        "model_loaded": True,
        "message": "ISL prediction model is ready",
    }


# ============================================================
# SIGN TO TEXT PREDICTION
# ============================================================

@router.post("/predict")
async def predict_sign(file: UploadFile = File(...)):
    """
    Receive an image from the React frontend and predict
    the Indian Sign Language gesture.
    """

    # Check predictor
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="ISL prediction model is not available",
        )

    # Check filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No image file provided",
        )

    # Read uploaded file
    try:
        image_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read uploaded image: {exc}",
        )

    # Check empty file
    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty",
        )

    # Convert bytes -> NumPy array
    try:
        image_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8,
        )

        # Decode image -> OpenCV BGR image
        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image data: {exc}",
        )

    # Make sure OpenCV decoded the image
    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid image",
        )

    # ========================================================
    # RUN ML PREDICTION
    # ========================================================

    try:
        result = predictor.predict_numpy(image)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {exc}",
        )

    # ========================================================
    # RETURN CLEAN RESPONSE
    # ========================================================

    return {
        "success": result.success,
        "prediction": result.prediction,
        "confidence": result.confidence,
        "hand_detected": result.hand_detected,
        "message": result.message,
    }