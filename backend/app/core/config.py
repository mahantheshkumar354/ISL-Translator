from pathlib import Path
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# ============================================================
# PROJECT PATHS
# ============================================================

# backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]

# backend/app/
APP_DIR = BACKEND_DIR / "app"

# Data
DATA_DIR = BACKEND_DIR / "data"
IMAGE_DATASET_DIR = DATA_DIR / "isl_images"
VIDEO_DATASET_DIR = DATA_DIR / "isl_videos"

# ML model artifacts
MODELS_DIR = BACKEND_DIR / "models"
MODEL_FILE = MODELS_DIR / "model.keras"
CLASSES_FILE = MODELS_DIR / "classes.json"
LANDMARKS_FILE = MODELS_DIR / "landmarks.npz"
TRAINING_METADATA_FILE = MODELS_DIR / "training_metadata.json"

# Uploads
UPLOADS_DIR = BACKEND_DIR / "uploads"

# Database
DATABASE_FILE = BACKEND_DIR / "isl_translator.db"


# ============================================================
# APPLICATION SETTINGS
# ============================================================

class Settings(BaseSettings):
    """
    Central configuration for the ISL Translator backend.

    Values can be supplied through environment variables or
    a .env file.
    """

    # --------------------------------------------------------
    # Application
    # --------------------------------------------------------

    app_name: str = Field(
        default="ISL Translator API",
        alias="APP_NAME",
    )

    app_version: str = Field(
        default="1.0.0",
        alias="APP_VERSION",
    )

    debug: bool = Field(
        default=True,
        alias="DEBUG",
    )

    # --------------------------------------------------------
    # Server
    # --------------------------------------------------------

    host: str = Field(
        default="127.0.0.1",
        alias="HOST",
    )

    port: int = Field(
        default=8000,
        alias="PORT",
    )

    # --------------------------------------------------------
    # Database
    # --------------------------------------------------------

    database_url: str = Field(
        default=f"sqlite:///{DATABASE_FILE.as_posix()}",
        alias="DATABASE_URL",
    )

    # --------------------------------------------------------
    # JWT Authentication
    # --------------------------------------------------------

    secret_key: str = Field(
        default="change-this-development-secret-key",
        alias="SECRET_KEY",
    )

    algorithm: str = Field(
        default="HS256",
        alias="ALGORITHM",
    )

    access_token_expire_minutes: int = Field(
        default=60 * 24,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )

    # --------------------------------------------------------
    # CORS
    # --------------------------------------------------------

    cors_origins: str = Field(
        default=(
            "http://localhost:5173,"
            "http://127.0.0.1:5173"
        ),
        alias="CORS_ORIGINS",
    )

    # --------------------------------------------------------
    # ML Settings
    # --------------------------------------------------------

    confidence_threshold: float = Field(
        default=0.70,
        alias="CONFIDENCE_THRESHOLD",
    )

    max_hands: int = Field(
        default=2,
        alias="MAX_HANDS",
    )

    landmark_features: int = Field(
        default=126,
        alias="LANDMARK_FEATURES",
    )

    # --------------------------------------------------------
    # WebSocket
    # --------------------------------------------------------

    websocket_path: str = Field(
        default="/ws",
        alias="WEBSOCKET_PATH",
    )

    # --------------------------------------------------------
    # Video
    # --------------------------------------------------------

    max_video_size_mb: int = Field(
        default=200,
        alias="MAX_VIDEO_SIZE_MB",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

    # ========================================================
    # HELPERS
    # ========================================================

    @property
    def cors_origin_list(self) -> list[str]:
        """
        Convert comma-separated CORS origins into a list.
        """
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


# ============================================================
# SINGLE SETTINGS INSTANCE
# ============================================================

@lru_cache
def get_settings() -> Settings:
    """
    Return a cached application settings instance.

    Using a cached instance prevents repeatedly reading the
    environment configuration throughout the application.
    """
    return Settings()


settings = get_settings()


# ============================================================
# CREATE REQUIRED DIRECTORIES
# ============================================================

def create_required_directories() -> None:
    """
    Create directories required by the backend.

    Dataset directories are created as well so a fresh project
    starts cleanly. Existing directories are never modified or
    deleted.
    """

    DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    IMAGE_DATASET_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    VIDEO_DATASET_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    UPLOADS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


# ============================================================
# CONFIGURATION SUMMARY
# ============================================================

def get_config_summary() -> dict[str, object]:
    """
    Return a safe configuration summary for diagnostics.

    Sensitive values such as SECRET_KEY are intentionally
    excluded.
    """

    return {
        "app_name": settings.app_name,
        "app_version": settings.app_version,
        "debug": settings.debug,
        "host": settings.host,
        "port": settings.port,
        "database": str(DATABASE_FILE),
        "image_dataset": str(IMAGE_DATASET_DIR),
        "video_dataset": str(VIDEO_DATASET_DIR),
        "models_directory": str(MODELS_DIR),
        "model_file": str(MODEL_FILE),
        "classes_file": str(CLASSES_FILE),
        "landmarks_file": str(LANDMARKS_FILE),
        "training_metadata_file": str(TRAINING_METADATA_FILE),
        "confidence_threshold": settings.confidence_threshold,
        "max_hands": settings.max_hands,
        "landmark_features": settings.landmark_features,
        "websocket_path": settings.websocket_path,
        "cors_origins": settings.cors_origin_list,
    }


# ============================================================
# STANDALONE TEST
# ============================================================

if __name__ == "__main__":
    create_required_directories()

    print()
    print("=" * 65)
    print("ISL TRANSLATOR CONFIGURATION")
    print("=" * 65)
    print()

    summary = get_config_summary()

    for key, value in summary.items():
        print(f"{key}: {value}")

    print()
    print("=" * 65)
    print("Configuration loaded successfully.")
    print("=" * 65)
    print()