git add .
git commit -m "Update ISL Translator"
git push origin main"""
Dataset loading for the ISL Sign-to-Text pipeline.

Discovers every class folder under `data/isl_images/`, streams each
image through the existing `HandLandmarkExtractor`, and assembles the
resulting normalized 126-feature vectors into `X`/`y` NumPy arrays,
which are then saved to `models/landmarks.npz` alongside
`models/classes.json`.

This module never re-implements landmark extraction or normalization
— every feature vector comes from
`app.ml.landmark_extractor.HandLandmarkExtractor.extract_from_path`,
so the data this produces is guaranteed to match whatever the webcam
prediction path produces later.

Designed for large datasets (the current dataset is ~195,721 images
across 110 classes): images are processed one at a time and only the
126-float feature vector is retained per image — full-resolution image
data is never accumulated in memory, and progress is logged
periodically rather than per-image.
"""

from __future__ import annotations

import argparse
import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import numpy as np

from app.ml.landmark_extractor import FEATURE_VECTOR_SIZE, HandLandmarkExtractor

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

# app/ml/dataset_loader.py -> app/ml -> app -> backend (project root)
BACKEND_ROOT: Path = Path(__file__).resolve().parents[2]
DEFAULT_IMAGES_DIR: Path = BACKEND_ROOT / "data" / "isl_images"
DEFAULT_MODELS_DIR: Path = BACKEND_ROOT / "models"
DEFAULT_LANDMARKS_NPZ_PATH: Path = DEFAULT_MODELS_DIR / "landmarks.npz"
DEFAULT_CLASSES_JSON_PATH: Path = DEFAULT_MODELS_DIR / "classes.json"

VALID_IMAGE_EXTENSIONS: frozenset[str] = frozenset(
    {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
)

DEFAULT_MIN_VALID_SAMPLES_PER_CLASS: int = 5
DEFAULT_LOG_EVERY: int = 1000


# ============================================================
# CLASS DISCOVERY
# ============================================================


@dataclass
class ClassDiscovery:
    """Deterministic class discovery result.

    class_names is sorted alphabetically — this sort order is what
    defines each class's integer index, and MUST be preserved between
    dataset preparation, training, and prediction.
    """

    class_names: list[str]
    image_paths_by_class: dict[str, list[Path]]
    ignored_entries: list[str] = field(default_factory=list)


def _is_valid_image_file(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in VALID_IMAGE_EXTENSIONS


def discover_classes(images_dir: Path) -> ClassDiscovery:
    """Scan `images_dir` and treat every immediate subdirectory as a
    class. Never hardcodes class names — the folders on disk are the
    only source of truth.

    Raises:
        FileNotFoundError: if images_dir does not exist.
    """
    if not images_dir.exists() or not images_dir.is_dir():
        raise FileNotFoundError(
            f"Dataset directory not found: {images_dir}. "
            f"Create it with one subfolder per class before running this loader."
        )

    ignored_entries: list[str] = []
    image_paths_by_class: dict[str, list[Path]] = {}

    for entry in sorted(images_dir.iterdir(), key=lambda p: p.name):
        if not entry.is_dir():
            ignored_entries.append(entry.name)
            continue

        image_paths = sorted(
            (p for p in entry.iterdir() if _is_valid_image_file(p)),
            key=lambda p: p.name,
        )
        image_paths_by_class[entry.name] = image_paths

    class_names = sorted(image_paths_by_class.keys())

    if ignored_entries:
        logger.info(
            "Ignored %d non-directory entr%s directly under %s: %s",
            len(ignored_entries),
            "y" if len(ignored_entries) == 1 else "ies",
            images_dir,
            ignored_entries,
        )

    return ClassDiscovery(
        class_names=class_names,
        image_paths_by_class=image_paths_by_class,
        ignored_entries=ignored_entries,
    )


# ============================================================
# DATASET BUILD
# ============================================================


@dataclass
class DatasetBuildReport:
    total_images_considered: int
    total_valid_samples: int
    total_failed_images: int
    per_class_valid_counts: dict[str, int]
    per_class_failed_counts: dict[str, int]
    classes_below_minimum: list[str]
    sample_failed_paths: list[str]  # capped, not exhaustive, for readability


def build_landmark_dataset(
    images_dir: Path = DEFAULT_IMAGES_DIR,
    max_images_per_class: Optional[int] = None,
    min_valid_samples_per_class: int = DEFAULT_MIN_VALID_SAMPLES_PER_CLASS,
    log_every: int = DEFAULT_LOG_EVERY,
) -> tuple[np.ndarray, np.ndarray, list[str], DatasetBuildReport]:
    """Build the full landmark dataset from `images_dir`.

    Args:
        images_dir: root directory containing one subfolder per class.
        max_images_per_class: if set, only the first N images (by
            sorted filename) are processed per class — useful for a
            quick smoke run on a huge dataset.
        min_valid_samples_per_class: classes with fewer valid samples
            than this are reported (not dropped — dropping would break
            index/name alignment for downstream code expecting a fixed
            class list).
        log_every: how many images between progress log lines.

    Returns:
        X: float32 array, shape (N, 126).
        y: int32 array, shape (N,) — class indices aligned with
           `class_names`.
        class_names: sorted list of class names; class_names[i] is the
           label for every row where y == i.
        report: counts and diagnostics from the build.
    """
    discovery = discover_classes(images_dir)
    class_names = discovery.class_names
    num_classes = len(class_names)

    if num_classes == 0:
        raise ValueError(
            f"No class folders found under {images_dir}. "
            f"Each class must be a subfolder containing image files."
        )

    class_to_index = {name: idx for idx, name in enumerate(class_names)}

    # Precompute how many images will actually be considered, for
    # accurate progress percentages.
    total_to_consider = 0
    truncated_paths_by_class: dict[str, list[Path]] = {}
    for class_name in class_names:
        paths = discovery.image_paths_by_class[class_name]
        if max_images_per_class is not None:
            paths = paths[:max_images_per_class]
        truncated_paths_by_class[class_name] = paths
        total_to_consider += len(paths)

    logger.info(
        "Discovered %d classes, %d images to process (max_images_per_class=%s)",
        num_classes,
        total_to_consider,
        max_images_per_class if max_images_per_class is not None else "unlimited",
    )

    features_list: list[np.ndarray] = []
    labels_list: list[int] = []

    per_class_valid_counts: dict[str, int] = {name: 0 for name in class_names}
    per_class_failed_counts: dict[str, int] = {name: 0 for name in class_names}
    sample_failed_paths: list[str] = []
    max_sample_failed_paths = 200

    processed_count = 0

    extractor = HandLandmarkExtractor()
    try:
        for class_index, class_name in enumerate(class_names):
            paths = truncated_paths_by_class[class_name]
            logger.info(
                "Processing class %d/%d: '%s' (%d images)",
                class_index + 1,
                num_classes,
                class_name,
                len(paths),
            )

            for image_path in paths:
                processed_count += 1

                try:
                    result = extractor.extract_from_path(image_path)
                except Exception as exc:  # noqa: BLE001 - never let one bad image kill the run
                    logger.warning("Unexpected error processing %s: %s", image_path, exc)
                    per_class_failed_counts[class_name] += 1
                    if len(sample_failed_paths) < max_sample_failed_paths:
                        sample_failed_paths.append(str(image_path))
                    _maybe_log_progress(processed_count, total_to_consider, log_every)
                    continue

                if not result.hand_detected:
                    per_class_failed_counts[class_name] += 1
                    if len(sample_failed_paths) < max_sample_failed_paths:
                        sample_failed_paths.append(str(image_path))
                    _maybe_log_progress(processed_count, total_to_consider, log_every)
                    continue

                if result.features.shape[0] != FEATURE_VECTOR_SIZE:
                    logger.warning(
                        "Unexpected feature vector size %d from %s (expected %d) — skipping",
                        result.features.shape[0],
                        image_path,
                        FEATURE_VECTOR_SIZE,
                    )
                    per_class_failed_counts[class_name] += 1
                    if len(sample_failed_paths) < max_sample_failed_paths:
                        sample_failed_paths.append(str(image_path))
                    _maybe_log_progress(processed_count, total_to_consider, log_every)
                    continue

                features_list.append(result.features.astype(np.float32, copy=False))
                labels_list.append(class_to_index[class_name])
                per_class_valid_counts[class_name] += 1

                _maybe_log_progress(processed_count, total_to_consider, log_every)

            if per_class_valid_counts[class_name] < min_valid_samples_per_class:
                logger.warning(
                    "Class '%s' has only %d valid samples (below minimum of %d)",
                    class_name,
                    per_class_valid_counts[class_name],
                    min_valid_samples_per_class,
                )
    finally:
        extractor.close()

    if features_list:
        X = np.stack(features_list).astype(np.float32, copy=False)
    else:
        X = np.zeros((0, FEATURE_VECTOR_SIZE), dtype=np.float32)
    y = np.array(labels_list, dtype=np.int32)

    classes_below_minimum = [
        name
        for name in class_names
        if per_class_valid_counts[name] < min_valid_samples_per_class
    ]

    total_valid = int(sum(per_class_valid_counts.values()))
    total_failed = int(sum(per_class_failed_counts.values()))

    report = DatasetBuildReport(
        total_images_considered=total_to_consider,
        total_valid_samples=total_valid,
        total_failed_images=total_failed,
        per_class_valid_counts=per_class_valid_counts,
        per_class_failed_counts=per_class_failed_counts,
        classes_below_minimum=classes_below_minimum,
        sample_failed_paths=sample_failed_paths,
    )

    logger.info(
        "Dataset build complete: %d valid samples, %d failed, %d classes",
        total_valid,
        total_failed,
        num_classes,
    )

    return X, y, class_names, report


def _maybe_log_progress(processed_count: int, total_to_consider: int, log_every: int) -> None:
    if log_every > 0 and processed_count % log_every == 0:
        percent = (processed_count / total_to_consider * 100) if total_to_consider else 0.0
        logger.info(
            "Progress: %d/%d images processed (%.1f%%)",
            processed_count,
            total_to_consider,
            percent,
        )


# ============================================================
# SAVE / LOAD
# ============================================================


def save_landmark_dataset(
    X: np.ndarray,
    y: np.ndarray,
    class_names: list[str],
    landmarks_path: Path = DEFAULT_LANDMARKS_NPZ_PATH,
    classes_path: Path = DEFAULT_CLASSES_JSON_PATH,
) -> None:
    """Persist X, y to `landmarks_path` (compressed) and class_names to
    `classes_path`.
    """
    landmarks_path.parent.mkdir(parents=True, exist_ok=True)
    classes_path.parent.mkdir(parents=True, exist_ok=True)

    np.savez_compressed(landmarks_path, X=X, y=y)
    logger.info("Saved landmarks to %s (X=%s, y=%s)", landmarks_path, X.shape, y.shape)

    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=2, ensure_ascii=False)
    logger.info("Saved %d class names to %s", len(class_names), classes_path)


def load_landmark_dataset(
    landmarks_path: Path = DEFAULT_LANDMARKS_NPZ_PATH,
    classes_path: Path = DEFAULT_CLASSES_JSON_PATH,
) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Load a previously saved landmarks.npz + classes.json."""
    if not landmarks_path.exists():
        raise FileNotFoundError(
            f"{landmarks_path} not found. Run `python -m app.ml.dataset_loader` first."
        )
    if not classes_path.exists():
        raise FileNotFoundError(
            f"{classes_path} not found. Run `python -m app.ml.dataset_loader` first."
        )

    data = np.load(landmarks_path)
    X, y = data["X"], data["y"]

    with open(classes_path, "r", encoding="utf-8") as f:
        class_names: list[str] = json.load(f)

    return X, y, class_names


# ============================================================
# RUNNABLE MAIN SECTION
# ============================================================


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build the ISL landmark dataset.")
    parser.add_argument(
        "--images-dir",
        type=Path,
        default=DEFAULT_IMAGES_DIR,
        help="Root directory containing one subfolder per class.",
    )
    parser.add_argument(
        "--max-images-per-class",
        type=int,
        default=None,
        help="Optional cap on images processed per class (useful for a quick smoke run).",
    )
    parser.add_argument(
        "--min-valid-samples-per-class",
        type=int,
        default=DEFAULT_MIN_VALID_SAMPLES_PER_CLASS,
        help="Classes with fewer valid samples than this are flagged in the report.",
    )
    parser.add_argument(
        "--log-every",
        type=int,
        default=DEFAULT_LOG_EVERY,
        help="How many images between progress log lines.",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()

    print("=" * 60)
    print("ISL DATASET LANDMARK PREPARATION")
    print("=" * 60)
    print(f"\nDataset: {args.images_dir}")

    discovery = discover_classes(args.images_dir)
    print(f"Classes found: {len(discovery.class_names)}")
    print("\nProcessing...\n")

    X, y, class_names, report = build_landmark_dataset(
        images_dir=args.images_dir,
        max_images_per_class=args.max_images_per_class,
        min_valid_samples_per_class=args.min_valid_samples_per_class,
        log_every=args.log_every,
    )

    if report.total_valid_samples == 0:
        print(
            "\nNo valid samples were produced. Check that MediaPipe can detect "
            "hands in your images before saving an empty dataset."
        )
    else:
        save_landmark_dataset(X, y, class_names)

    print(f"\nTotal valid samples: {report.total_valid_samples}")
    print(f"Total classes: {len(class_names)}")
    print(f"Feature dimension: {X.shape[1] if X.ndim == 2 else FEATURE_VECTOR_SIZE}")
    print(f"Total failed/skipped images: {report.total_failed_images}")

    if report.classes_below_minimum:
        print(
            f"\nClasses below minimum valid-sample threshold "
            f"({args.min_valid_samples_per_class}): {report.classes_below_minimum}"
        )

    if report.sample_failed_paths:
        print(f"\nSample of failed/skipped image paths (up to 200 shown):")
        for path in report.sample_failed_paths[:20]:
            print(f"  {path}")
        if len(report.sample_failed_paths) > 20:
            print(f"  ... and {len(report.sample_failed_paths) - 20} more")

    if report.total_valid_samples > 0:
        print(f"\nLandmarks saved to:\n{DEFAULT_LANDMARKS_NPZ_PATH}")
        print(f"\nClasses saved to:\n{DEFAULT_CLASSES_JSON_PATH}")

    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    main()