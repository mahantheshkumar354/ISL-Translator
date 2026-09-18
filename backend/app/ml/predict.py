"""
Indian Sign Language - Sign to Text Prediction.

Pipeline:
    Image/Webcam Frame
        ↓
    MediaPipe HandLandmarkExtractor
        ↓
    126 landmark features
        ↓
    TensorFlow model.keras
        ↓
    Predicted class + confidence + landmarks
"""

from __future__ import annotations

import json
import logging
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Union

import numpy as np
import tensorflow as tf

from app.ml.landmark_extractor import (
    FEATURE_VECTOR_SIZE,
    HandLandmarkExtractor,
    HandLandmarkResult,
)


# ============================================================
# LOGGING
# ============================================================

logger = logging.getLogger(__name__)

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        )
    )
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False


# ============================================================
# PATHS
# ============================================================

BACKEND_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_MODEL_PATH = BACKEND_ROOT / "models" / "model.keras"
DEFAULT_CLASSES_PATH = BACKEND_ROOT / "models" / "classes.json"

DEFAULT_CONFIDENCE_THRESHOLD = 0.45


# ============================================================
# EXCEPTIONS
# ============================================================

class ModelLoadError(RuntimeError):
    pass


# ============================================================
# RESULT
# ============================================================

@dataclass
class PredictionResult:

    success: bool
    prediction: str
    confidence: float
    hand_detected: bool
    message: str

    # NEW: frontend visualization data
    landmarks: list[list[dict[str, float]]]
    handedness: list[str]

    def as_dict(self) -> dict:

        return {
            "success": self.success,
            "prediction": self.prediction,
            "confidence": self.confidence,
            "hand_detected": self.hand_detected,
            "message": self.message,
            "landmarks": self.landmarks,
            "handedness": self.handedness,
        }


# ============================================================
# NO HAND
# ============================================================

def no_hand_result() -> PredictionResult:

    return PredictionResult(
        success=False,
        prediction="",
        confidence=0.0,
        hand_detected=False,
        message="No hand detected",
        landmarks=[],
        handedness=[],
    )


# ============================================================
# PREDICTOR
# ============================================================

class ISLPredictor:

    def __init__(
        self,
        model_path: Path = DEFAULT_MODEL_PATH,
        classes_path: Path = DEFAULT_CLASSES_PATH,
        confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
    ) -> None:

        self.model_path = Path(model_path)
        self.classes_path = Path(classes_path)
        self.confidence_threshold = confidence_threshold

        # ----------------------------------------------------
        # MODEL
        # ----------------------------------------------------

        if not self.model_path.exists():
            raise ModelLoadError(
                f"Trained model not found:\n{self.model_path}"
            )

        if not self.classes_path.exists():
            raise ModelLoadError(
                f"Class file not found:\n{self.classes_path}"
            )

        # ----------------------------------------------------
        # CLASSES
        # ----------------------------------------------------

        try:

            with open(
                self.classes_path,
                "r",
                encoding="utf-8",
            ) as file:

                classes = json.load(file)

        except Exception as exc:

            raise ModelLoadError(
                f"Unable to load classes.json: {exc}"
            ) from exc

        if not isinstance(classes, list) or not classes:
            raise ModelLoadError(
                "classes.json must contain a non-empty list."
            )

        self.classes = classes

        # ----------------------------------------------------
        # LOAD MODEL
        # ----------------------------------------------------

        try:

            self.model: tf.keras.Model = (
                tf.keras.models.load_model(
                    self.model_path
                )
            )

        except Exception as exc:

            raise ModelLoadError(
                f"Unable to load TensorFlow model:\n{exc}"
            ) from exc

        # ----------------------------------------------------
        # VALIDATE INPUT
        # ----------------------------------------------------

        model_input_size = self.model.input_shape[-1]

        if model_input_size != FEATURE_VECTOR_SIZE:

            raise ModelLoadError(
                f"Model expects {model_input_size} features, "
                f"but extractor produces {FEATURE_VECTOR_SIZE}."
            )

        # ----------------------------------------------------
        # VALIDATE OUTPUT
        # ----------------------------------------------------

        model_output_size = self.model.output_shape[-1]

        if model_output_size != len(self.classes):

            raise ModelLoadError(
                f"Model outputs {model_output_size} classes, "
                f"but classes.json contains {len(self.classes)}."
            )

        # ----------------------------------------------------
        # ONE MEDIAPIPE INSTANCE
        # ----------------------------------------------------

        self.extractor = HandLandmarkExtractor()

        self._prediction_lock = threading.Lock()

        logger.info(
            "ISL Predictor initialized"
        )

        logger.info(
            "Classes: %d",
            len(self.classes)
        )

        logger.info(
            "Confidence threshold: %.2f",
            self.confidence_threshold
        )

    # ========================================================
    # INTERNAL
    # ========================================================

    def _predict_result(
        self,
        landmark_result: HandLandmarkResult,
    ) -> PredictionResult:

        if not landmark_result.hand_detected:

            return no_hand_result()

        features = landmark_result.features.astype(
            np.float32,
            copy=False,
        )

        if features.shape[0] != FEATURE_VECTOR_SIZE:

            return PredictionResult(
                success=False,
                prediction="",
                confidence=0.0,
                hand_detected=True,
                message="Invalid landmark feature vector",
                landmarks=landmark_result.landmarks,
                handedness=landmark_result.handedness,
            )

        batch = np.expand_dims(
            features,
            axis=0,
        )

        try:

            with self._prediction_lock:

                probabilities = self.model(
                    batch,
                    training=False,
                ).numpy()[0]

        except Exception as exc:

            logger.exception(
                "Model inference failed"
            )

            return PredictionResult(
                success=False,
                prediction="",
                confidence=0.0,
                hand_detected=True,
                message=f"Prediction failed: {exc}",
                landmarks=landmark_result.landmarks,
                handedness=landmark_result.handedness,
            )

        predicted_index = int(
            np.argmax(probabilities)
        )

        confidence = float(
            probabilities[predicted_index]
        )

        prediction = str(
            self.classes[predicted_index]
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # We still return the prediction even when confidence
        # is lower than threshold.
        #
        # This prevents the UI from constantly going blank.
        # ----------------------------------------------------

        success = confidence >= self.confidence_threshold

        message = (
            "Prediction successful"
            if success
            else "Low confidence prediction"
        )

        return PredictionResult(
            success=success,
            prediction=prediction,
            confidence=confidence,
            hand_detected=True,
            message=message,
            landmarks=landmark_result.landmarks,
            handedness=landmark_result.handedness,
        )

    # ========================================================
    # NUMPY IMAGE
    # ========================================================

    def predict_numpy(
        self,
        image: np.ndarray,
    ) -> PredictionResult:

        try:

            landmark_result = (
                self.extractor.extract_from_numpy(
                    image
                )
            )

        except Exception as exc:

            logger.exception(
                "Landmark extraction failed"
            )

            return PredictionResult(
                success=False,
                prediction="",
                confidence=0.0,
                hand_detected=False,
                message=f"Landmark extraction failed: {exc}",
                landmarks=[],
                handedness=[],
            )

        return self._predict_result(
            landmark_result
        )

    # ========================================================
    # PATH
    # ========================================================

    def predict_path(
        self,
        image_path: Union[str, Path],
    ) -> PredictionResult:

        try:

            landmark_result = (
                self.extractor.extract_from_path(
                    image_path
                )
            )

        except Exception as exc:

            return PredictionResult(
                success=False,
                prediction="",
                confidence=0.0,
                hand_detected=False,
                message=f"Invalid image data: {exc}",
                landmarks=[],
                handedness=[],
            )

        return self._predict_result(
            landmark_result
        )

    # ========================================================
    # CLOSE
    # ========================================================

    def close(self) -> None:

        extractor = getattr(
            self,
            "extractor",
            None,
        )

        if extractor is not None:

            try:
                extractor.close()
            except Exception:
                logger.exception(
                    "Error closing extractor"
                )

            self.extractor = None

    # ========================================================
    # CONTEXT
    # ========================================================

    def __enter__(self) -> "ISLPredictor":
        return self

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ) -> None:

        self.close()


# ============================================================
# TEST
# ============================================================

def main():

    predictor = None

    try:

        predictor = ISLPredictor()

        image_path = input(
            "Enter image path: "
        ).strip()

        result = predictor.predict_path(
            image_path
        )

        print()
        print("Hand detected:", result.hand_detected)
        print("Prediction:", result.prediction)
        print(
            "Confidence:",
            f"{result.confidence * 100:.2f}%"
        )
        print(
            "Hands:",
            len(result.landmarks)
        )

    except Exception as exc:

        print("ERROR:", exc)

    finally:

        if predictor:
            predictor.close()


if __name__ == "__main__":
    main()