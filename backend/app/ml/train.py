"""
Model training for the ISL Sign-to-Text classifier.

Loads `models/landmarks.npz` (X: float32 [N, 126], y: int32 [N]) and
`models/classes.json` (produced by `dataset_loader.py`), trains a
dense Keras classifier, and saves `models/model.keras`.

This file does NOT touch MediaPipe, does NOT process images, and does
NOT implement any feature normalization of its own — it consumes the
126-dimensional vectors exactly as produced by the landmark
extraction/normalization pipeline in `landmark_extractor.py` +
`dataset_loader.py`. Introducing a different normalization here would
silently break the assumption that training data and webcam
prediction data are processed identically, which is the exact bug
this project has previously suffered from ("become"/"stand"/"mother"
misclassifications) — so this module strictly stays out of that
concern and only trains on what it's given.

Run with:
    python -m app.ml.train
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight

# ============================================================
# LOGGING
# ============================================================

logger = logging.getLogger(__name__)
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
    )
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False

# ============================================================
# PATHS / CONSTANTS
# ============================================================

# app/ml/train.py -> app/ml -> app -> backend (project root)
BACKEND_ROOT: Path = Path(__file__).resolve().parents[2]
MODELS_DIR: Path = BACKEND_ROOT / "models"
LANDMARKS_NPZ_PATH: Path = MODELS_DIR / "landmarks.npz"
CLASSES_JSON_PATH: Path = MODELS_DIR / "classes.json"
MODEL_PATH: Path = MODELS_DIR / "model.keras"
TRAINING_METADATA_PATH: Path = MODELS_DIR / "training_metadata.json"

EXPECTED_FEATURE_SIZE: int = 126

RANDOM_SEED: int = 42
VALIDATION_SPLIT: float = 0.2
BATCH_SIZE: int = 32
MAX_EPOCHS: int = 150
LEARNING_RATE: float = 1e-3


# ============================================================
# DATA LOADING / VALIDATION
# ============================================================


@dataclass
class TrainingData:
    X: np.ndarray
    y: np.ndarray
    class_names: list[str]


def load_training_data(
    landmarks_path: Path = LANDMARKS_NPZ_PATH,
    classes_path: Path = CLASSES_JSON_PATH,
) -> TrainingData:
    """Load and validate landmarks.npz + classes.json.

    Raises:
        FileNotFoundError: if either file is missing.
        ValueError: if the data fails any consistency check (wrong
            feature dimension, out-of-range labels, empty dataset).
    """
    if not landmarks_path.exists():
        raise FileNotFoundError(
            f"{landmarks_path} not found. Run `python -m app.ml.dataset_loader` first."
        )
    if not classes_path.exists():
        raise FileNotFoundError(
            f"{classes_path} not found. Run `python -m app.ml.dataset_loader` first."
        )

    data = np.load(landmarks_path)
    if "X" not in data or "y" not in data:
        raise ValueError(
            f"{landmarks_path} does not contain both 'X' and 'y' arrays."
        )
    X = data["X"].astype(np.float32, copy=False)
    y = data["y"].astype(np.int32, copy=False)

    with open(classes_path, "r", encoding="utf-8") as f:
        class_names: list[str] = json.load(f)

    if X.shape[0] == 0:
        raise ValueError(
            f"{landmarks_path} contains zero samples — nothing to train on. "
            f"Re-run dataset_loader.py against a populated dataset."
        )
    if X.ndim != 2 or X.shape[1] != EXPECTED_FEATURE_SIZE:
        raise ValueError(
            f"Expected X with shape [N, {EXPECTED_FEATURE_SIZE}], got {X.shape}. "
            f"This usually means landmarks.npz was built with a different "
            f"landmark_extractor.py than the one currently in use — "
            f"re-run dataset_loader.py."
        )
    if y.shape[0] != X.shape[0]:
        raise ValueError(
            f"X has {X.shape[0]} rows but y has {y.shape[0]} — landmarks.npz is corrupt."
        )
    if not class_names:
        raise ValueError(f"{classes_path} is empty — no classes to train on.")

    min_label, max_label = int(y.min()), int(y.max())
    if min_label < 0 or max_label >= len(class_names):
        raise ValueError(
            f"Labels in {landmarks_path} range from {min_label} to {max_label}, "
            f"but {classes_path} only has {len(class_names)} classes (valid "
            f"indices 0..{len(class_names) - 1}). classes.json and landmarks.npz "
            f"are out of sync — re-run dataset_loader.py to regenerate both together."
        )

    logger.info(
        "Loaded %d samples, %d features, %d classes from %s / %s",
        X.shape[0],
        X.shape[1],
        len(class_names),
        landmarks_path,
        classes_path,
    )

    num_classes_with_samples = len(np.unique(y))
    if num_classes_with_samples < len(class_names):
        logger.warning(
            "%d of %d classes have zero samples in landmarks.npz — those classes "
            "will never be predicted by the trained model.",
            len(class_names) - num_classes_with_samples,
            len(class_names),
        )

    return TrainingData(X=X, y=y, class_names=class_names)


def split_train_validation(
    X: np.ndarray, y: np.ndarray
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Stratified train/validation split with a fixed random seed.

    Falls back to a non-stratified split (with a warning) if any class
    present has fewer than 2 samples, since stratified splitting
    requires at least 1 sample per class in each split.
    """
    class_counts = np.bincount(y)
    present_counts = class_counts[class_counts > 0]
    can_stratify = bool(np.all(present_counts >= 2))

    if not can_stratify:
        logger.warning(
            "At least one class has fewer than 2 samples — falling back to a "
            "non-stratified train/validation split. Consider collecting more "
            "samples for very small classes."
        )

    return train_test_split(
        X,
        y,
        test_size=VALIDATION_SPLIT,
        random_state=RANDOM_SEED,
        stratify=y if can_stratify else None,
    )


# ============================================================
# MODEL
# ============================================================


def build_model(num_classes: int) -> tf.keras.Model:
    """Dense classifier for 126-dimensional normalized landmark input."""
    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(EXPECTED_FEATURE_SIZE,)),
            tf.keras.layers.Dense(256, activation="relu"),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(128, activation="relu"),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(num_classes, activation="softmax"),
        ]
    )
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def build_class_weights(y_train: np.ndarray, num_classes: int) -> dict[int, float]:
    """Balanced class weights over classes actually present in y_train."""
    present_classes = np.unique(y_train)
    weights = compute_class_weight(
        class_weight="balanced", classes=present_classes, y=y_train
    )
    class_weight = {int(cls): float(w) for cls, w in zip(present_classes, weights)}

    missing = set(range(num_classes)) - set(present_classes.tolist())
    if missing:
        logger.warning(
            "%d classes have no samples in the training split (indices: %s) — "
            "they will never be learned by this training run.",
            len(missing),
            sorted(missing),
        )
    return class_weight


# ============================================================
# TRAINING ENTRYPOINT
# ============================================================


def train() -> None:
    tf.random.set_seed(RANDOM_SEED)
    np.random.seed(RANDOM_SEED)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    data = load_training_data()
    total_samples = data.X.shape[0]
    feature_dimension = data.X.shape[1]
    num_classes = len(data.class_names)

    X_train, X_val, y_train, y_val = split_train_validation(data.X, data.y)
    logger.info(
        "Split: %d training samples, %d validation samples", len(X_train), len(X_val)
    )

    class_weight = build_class_weights(y_train, num_classes)

    model = build_model(num_classes)
    model.summary(print_fn=logger.info)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=15, restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=5, min_lr=1e-6
        ),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(MODEL_PATH), monitor="val_accuracy", save_best_only=True
        ),
    ]

    logger.info("Starting training: max_epochs=%d, batch_size=%d", MAX_EPOCHS, BATCH_SIZE)
    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val),
        epochs=MAX_EPOCHS,
        batch_size=BATCH_SIZE,
        class_weight=class_weight,
        callbacks=callbacks,
        verbose=2,
    )

    # ModelCheckpoint already wrote the best model to disk, but save
    # again explicitly (with restore_best_weights already applied to
    # `model` by EarlyStopping) so models/model.keras always exists
    # even if save_best_only never triggered — e.g. a very short run.
    model.save(MODEL_PATH)

    val_loss, val_accuracy = model.evaluate(X_val, y_val, verbose=0)

    metadata = {
        "num_classes": num_classes,
        "class_names": data.class_names,
        "total_samples": int(total_samples),
        "feature_dimension": int(feature_dimension),
        "num_train_samples": int(len(X_train)),
        "num_val_samples": int(len(X_val)),
        "val_accuracy": float(val_accuracy),
        "val_loss": float(val_loss),
        "epochs_run": len(history.history.get("loss", [])),
        "training_config": {
            "batch_size": BATCH_SIZE,
            "max_epochs": MAX_EPOCHS,
            "learning_rate": LEARNING_RATE,
            "validation_split": VALIDATION_SPLIT,
            "random_seed": RANDOM_SEED,
            "optimizer": "adam",
            "loss": "sparse_categorical_crossentropy",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": (
            "val_accuracy/val_loss are measured on a held-out split from the "
            "same dataset distribution as training data. This is NOT a "
            "measurement of real-world webcam accuracy."
        ),
    }
    with open(TRAINING_METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(f"Total samples:      {total_samples}")
    print(f"Number of classes:  {num_classes}")
    print(f"Feature dimension:  {feature_dimension}")
    print(f"Training samples:   {len(X_train)}")
    print(f"Validation samples: {len(X_val)}")
    print(f"Validation accuracy:{val_accuracy:.4f}")
    print(f"Validation loss:    {val_loss:.4f}")
    print(f"Model path:         {MODEL_PATH}")
    print("=" * 60 + "\n")
    print(
        "NOTE: validation accuracy reflects held-out accuracy on your existing "
        "dataset images, not live webcam performance. Test with the actual "
        "webcam before relying on this number.\n"
    )

    logger.info(
        "Training complete: val_accuracy=%.4f, val_loss=%.4f, model saved to %s",
        val_accuracy,
        val_loss,
        MODEL_PATH,
    )


def main() -> None:
    train()


if __name__ == "__main__":
    main()