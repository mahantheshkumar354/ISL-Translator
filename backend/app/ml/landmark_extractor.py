"""
Hand landmark extraction and visualization for ISL Translator.

Responsibilities:
- Detect up to 2 hands using MediaPipe Tasks Vision.
- Extract 21 landmarks per hand.
- Normalize landmarks into the existing 126-feature vector.
- Return landmark coordinates so the frontend can draw the hand skeleton.
- Keep prediction/training feature format unchanged.

Feature layout:
    LEFT  hand: 63 values
    RIGHT hand: 63 values
    TOTAL: 126 values
"""

from __future__ import annotations

import logging
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Union

import cv2
import numpy as np

import mediapipe as mp
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import (
    HandLandmarker,
    HandLandmarkerOptions,
    RunningMode,
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
# CONSTANTS
# ============================================================

NUM_LANDMARKS_PER_HAND = 21
COORDS_PER_LANDMARK = 3

FEATURES_PER_HAND = 21 * 3
NUM_HANDS = 2
FEATURE_VECTOR_SIZE = FEATURES_PER_HAND * NUM_HANDS

LEFT_HAND_SLOT = slice(0, FEATURES_PER_HAND)
RIGHT_HAND_SLOT = slice(FEATURES_PER_HAND, FEATURE_VECTOR_SIZE)

WRIST_LANDMARK_INDEX = 0
MIDDLE_FINGER_MCP_INDEX = 9
SCALE_NORMALIZATION_EPSILON = 1e-6

MAX_NUM_HANDS = 2

MIN_HAND_DETECTION_CONFIDENCE = 0.5
MIN_HAND_PRESENCE_CONFIDENCE = 0.5
MIN_TRACKING_CONFIDENCE = 0.5


# ============================================================
# MEDIAPIPE MODEL
# ============================================================

MODULE_DIR = Path(__file__).resolve().parent

MEDIAPIPE_MODELS_DIR = MODULE_DIR.parents[1] / "mediapipe_models"

HAND_LANDMARKER_TASK_PATH = (
    MEDIAPIPE_MODELS_DIR / "hand_landmarker.task"
)

HAND_LANDMARKER_TASK_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/"
    "hand_landmarker.task"
)


def _ensure_model_downloaded() -> Path:
    """
    Download MediaPipe hand landmarker model if necessary.
    """

    if (
        HAND_LANDMARKER_TASK_PATH.exists()
        and HAND_LANDMARKER_TASK_PATH.stat().st_size > 0
    ):
        return HAND_LANDMARKER_TASK_PATH

    MEDIAPIPE_MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    logger.info(
        "HandLandmarker model not found. Downloading..."
    )

    try:
        urllib.request.urlretrieve(
            HAND_LANDMARKER_TASK_URL,
            HAND_LANDMARKER_TASK_PATH,
        )

    except Exception as exc:
        raise RuntimeError(
            f"Failed to download MediaPipe model: {exc}"
        ) from exc

    if (
        not HAND_LANDMARKER_TASK_PATH.exists()
        or HAND_LANDMARKER_TASK_PATH.stat().st_size == 0
    ):
        raise RuntimeError(
            "MediaPipe hand_landmarker.task is missing or empty."
        )

    logger.info(
        "MediaPipe model downloaded to %s",
        HAND_LANDMARKER_TASK_PATH,
    )

    return HAND_LANDMARKER_TASK_PATH


# ============================================================
# RESULT
# ============================================================

@dataclass
class HandLandmarkResult:
    """
    Result returned by the extractor.

    features:
        126 normalized values used by the TensorFlow model.

    hand_detected:
        True when at least one hand is detected.

    number_of_hands:
        0, 1 or 2.

    landmarks:
        List containing detected hand landmark coordinates.

        Each hand contains 21 points:

        {
            "x": 0.45,
            "y": 0.62,
            "z": -0.03
        }

    handedness:
        "Left" or "Right" for each detected hand.
    """

    features: np.ndarray
    hand_detected: bool
    number_of_hands: int

    landmarks: list[list[dict[str, float]]]
    handedness: list[str]


def _empty_result() -> HandLandmarkResult:
    """
    Empty result when no hand is detected.
    """

    return HandLandmarkResult(
        features=np.zeros(
            FEATURE_VECTOR_SIZE,
            dtype=np.float32,
        ),
        hand_detected=False,
        number_of_hands=0,
        landmarks=[],
        handedness=[],
    )


# ============================================================
# NORMALIZATION
# ============================================================

def _normalize_hand(
    hand_features_63: np.ndarray,
) -> np.ndarray:
    """
    Normalize one hand.

    1. Wrist becomes origin.
    2. Scale using wrist -> middle finger MCP.
    """

    landmarks = hand_features_63.reshape(
        NUM_LANDMARKS_PER_HAND,
        COORDS_PER_LANDMARK,
    )

    wrist = landmarks[WRIST_LANDMARK_INDEX].copy()

    centered = landmarks - wrist

    scale = float(
        np.linalg.norm(
            centered[MIDDLE_FINGER_MCP_INDEX]
        )
    )

    if scale < SCALE_NORMALIZATION_EPSILON:
        scale = SCALE_NORMALIZATION_EPSILON

    normalized = centered / scale

    return normalized.reshape(-1).astype(
        np.float32
    )


# ============================================================
# EXTRACTOR
# ============================================================

class HandLandmarkExtractor:
    """
    MediaPipe hand landmark detector.

    The same extractor is used for:
    - Dataset preparation
    - Training
    - Prediction
    - Webcam translation
    """

    def __init__(self) -> None:

        model_path = _ensure_model_downloaded()

        try:

            base_options = BaseOptions(
                model_asset_path=str(model_path)
            )

            options = HandLandmarkerOptions(
                base_options=base_options,
                running_mode=RunningMode.IMAGE,
                num_hands=MAX_NUM_HANDS,
                min_hand_detection_confidence=(
                    MIN_HAND_DETECTION_CONFIDENCE
                ),
                min_hand_presence_confidence=(
                    MIN_HAND_PRESENCE_CONFIDENCE
                ),
                min_tracking_confidence=(
                    MIN_TRACKING_CONFIDENCE
                ),
            )

            self._landmarker = (
                HandLandmarker.create_from_options(
                    options
                )
            )

        except Exception as exc:
            raise RuntimeError(
                f"Failed to initialize MediaPipe: {exc}"
            ) from exc

        logger.info(
            "HandLandmarkExtractor initialized "
            "(max_hands=%d)",
            MAX_NUM_HANDS,
        )

    # ========================================================
    # CLOSE
    # ========================================================

    def close(self) -> None:

        if self._landmarker is not None:

            self._landmarker.close()

            self._landmarker = None

            logger.info(
                "HandLandmarkExtractor resources released"
            )

    def __enter__(
        self,
    ) -> "HandLandmarkExtractor":

        return self

    def __exit__(
        self,
        exc_type,
        exc_val,
        exc_tb,
    ) -> None:

        self.close()

    def __del__(self) -> None:

        try:
            self.close()
        except Exception:
            pass

    # ========================================================
    # NUMPY IMAGE
    # ========================================================

    def extract_from_numpy(
        self,
        image_bgr: np.ndarray,
    ) -> HandLandmarkResult:
        """
        Detect hands from an OpenCV BGR image.

        Returns both:
        - 126 prediction features
        - 21-point landmark coordinates
        """

        if self._landmarker is None:

            raise RuntimeError(
                "HandLandmarkExtractor has been closed."
            )

        if (
            not isinstance(image_bgr, np.ndarray)
            or image_bgr.size == 0
        ):

            return _empty_result()

        if (
            image_bgr.ndim != 3
            or image_bgr.shape[2] != 3
        ):

            logger.warning(
                "Expected HxWx3 image."
            )

            return _empty_result()

        # ----------------------------------------------------
        # BGR -> RGB
        # ----------------------------------------------------

        try:

            rgb = cv2.cvtColor(
                image_bgr,
                cv2.COLOR_BGR2RGB,
            )

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb,
            )

            result = self._landmarker.detect(
                mp_image
            )

        except Exception as exc:

            logger.error(
                "MediaPipe detection failed: %s",
                exc,
            )

            return _empty_result()

        # ----------------------------------------------------
        # No hands
        # ----------------------------------------------------

        if not result.hand_landmarks:

            return _empty_result()

        # ----------------------------------------------------
        # Feature storage
        # ----------------------------------------------------

        features = np.zeros(
            FEATURE_VECTOR_SIZE,
            dtype=np.float32,
        )

        left_present = False
        right_present = False

        number_of_hands = 0

        # ----------------------------------------------------
        # Visualization landmark storage
        # ----------------------------------------------------

        detected_landmarks: list[
            list[dict[str, float]]
        ] = []

        detected_handedness: list[str] = []

        # ====================================================
        # PROCESS EACH HAND
        # ====================================================

        for hand_index in range(
            len(result.hand_landmarks)
        ):

            landmarks = result.hand_landmarks[
                hand_index
            ]

            handedness_list = (
                result.handedness[hand_index]
                if result.handedness
                else []
            )

            label = (
                handedness_list[0].category_name
                if handedness_list
                else "Unknown"
            )

            # ------------------------------------------------
            # Check landmark count
            # ------------------------------------------------

            if len(landmarks) != NUM_LANDMARKS_PER_HAND:

                logger.warning(
                    "Unexpected landmark count: %d",
                    len(landmarks),
                )

                continue

            # ------------------------------------------------
            # Store landmarks for frontend
            # ------------------------------------------------

            hand_points: list[
                dict[str, float]
            ] = []

            for lm in landmarks:

                hand_points.append(
                    {
                        "x": float(lm.x),
                        "y": float(lm.y),
                        "z": float(lm.z),
                    }
                )

            detected_landmarks.append(
                hand_points
            )

            detected_handedness.append(
                str(label)
            )

            # ------------------------------------------------
            # Build 63 feature vector
            # ------------------------------------------------

            raw_hand = np.array(
                [
                    [
                        lm.x,
                        lm.y,
                        lm.z,
                    ]
                    for lm in landmarks
                ],
                dtype=np.float32,
            ).reshape(-1)

            normalized_hand = _normalize_hand(
                raw_hand
            )

            # ------------------------------------------------
            # LEFT HAND
            # ------------------------------------------------

            if (
                label == "Left"
                and not left_present
            ):

                features[
                    LEFT_HAND_SLOT
                ] = normalized_hand

                left_present = True

                number_of_hands += 1

            # ------------------------------------------------
            # RIGHT HAND
            # ------------------------------------------------

            elif (
                label == "Right"
                and not right_present
            ):

                features[
                    RIGHT_HAND_SLOT
                ] = normalized_hand

                right_present = True

                number_of_hands += 1

            # ------------------------------------------------
            # UNKNOWN -> LEFT SLOT
            # ------------------------------------------------

            elif not left_present:

                features[
                    LEFT_HAND_SLOT
                ] = normalized_hand

                left_present = True

                number_of_hands += 1

            # ------------------------------------------------
            # UNKNOWN -> RIGHT SLOT
            # ------------------------------------------------

            elif not right_present:

                features[
                    RIGHT_HAND_SLOT
                ] = normalized_hand

                right_present = True

                number_of_hands += 1

            else:

                logger.warning(
                    "More than 2 hands detected."
                )

        # ====================================================
        # RETURN EVERYTHING
        # ====================================================

        return HandLandmarkResult(
            features=features,
            hand_detected=(
                number_of_hands > 0
            ),
            number_of_hands=number_of_hands,
            landmarks=detected_landmarks,
            handedness=detected_handedness,
        )

    # ========================================================
    # FILE PATH
    # ========================================================

    def extract_from_path(
        self,
        image_path: Union[str, Path],
    ) -> HandLandmarkResult:

        path = Path(image_path)

        if (
            not path.exists()
            or not path.is_file()
        ):

            logger.error(
                "Image path does not exist: %s",
                path,
            )

            return _empty_result()

        image_bgr = cv2.imread(
            str(path)
        )

        if image_bgr is None:

            logger.error(
                "Could not read image: %s",
                path,
            )

            return _empty_result()

        return self.extract_from_numpy(
            image_bgr
        )

    # ========================================================
    # BYTES / NUMPY
    # ========================================================

    def extract_from_image(
        self,
        image: Union[
            np.ndarray,
            bytes,
            bytearray,
        ],
    ) -> HandLandmarkResult:

        if isinstance(
            image,
            np.ndarray,
        ):

            return self.extract_from_numpy(
                image
            )

        if isinstance(
            image,
            (bytes, bytearray),
        ):

            if not image:

                return _empty_result()

            buffer = np.frombuffer(
                image,
                dtype=np.uint8,
            )

            decoded = cv2.imdecode(
                buffer,
                cv2.IMREAD_COLOR,
            )

            if decoded is None:

                logger.error(
                    "Could not decode image bytes."
                )

                return _empty_result()

            return self.extract_from_numpy(
                decoded
            )

        logger.error(
            "Unsupported image type: %s",
            type(image),
        )

        return _empty_result()


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    image_path = input(
        "Enter image path: "
    ).strip()

    extractor = None

    try:

        extractor = HandLandmarkExtractor()

        result = extractor.extract_from_path(
            image_path
        )

        print()
        print("=" * 60)

        print(
            f"Hand detected: "
            f"{result.hand_detected}"
        )

        print(
            f"Number of hands: "
            f"{result.number_of_hands}"
        )

        print(
            f"Vector length: "
            f"{result.features.shape[0]}"
        )

        print(
            f"Landmark hands returned: "
            f"{len(result.landmarks)}"
        )

        if result.landmarks:

            print(
                f"First hand landmarks: "
                f"{len(result.landmarks[0])}"
            )

        print("=" * 60)

    except Exception as exc:

        logger.error(
            "Failed to process image: %s",
            exc,
        )

    finally:

        if extractor is not None:
            extractor.close()