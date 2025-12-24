"""
Configuration settings for the application.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Upload settings
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)


ALLOWED_EXTENSIONS = {".pdf"}

MAX_FILE_SIZE = 50 * 1024 * 1024

# Java Backend Configuration
# These can be overridden by environment variables
JAVA_API_URL = os.getenv("JAVA_API_URL", "http://localhost:8080/api")
JAVA_API_KEY = os.getenv("JAVA_API_KEY", "hhfkshdkfhskdfhksfdshduf8584375hkhkhsdfy9dfsfdjsdft87fsdfsdhfkhhh9909865743dgtgdg")

class Settings:
    """Application settings."""
    upload_folder: Path = UPLOAD_FOLDER
    allowed_extensions: set = ALLOWED_EXTENSIONS
    max_file_size: int = MAX_FILE_SIZE
    api_title: str = "Order Form Extraction API"
    api_version: str = "1.0.0"
    cors_origins: list = ["*"]  # In production, specify actual origins

    # Java backend settings
    java_api_url: str = JAVA_API_URL
    java_api_key: str = JAVA_API_KEY

settings = Settings()

