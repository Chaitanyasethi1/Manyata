import os
import shutil
from pathlib import Path
from pydantic_settings import BaseSettings

# Vercel environment detection
IS_VERCEL = bool(os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"))

DEFAULT_UPLOAD_DIR = "uploads"
DEFAULT_SQLITE_URL = "sqlite:///./aicte_validator.db"

if IS_VERCEL:
    DEFAULT_UPLOAD_DIR = "/tmp/uploads"
    Path("/tmp/uploads").mkdir(parents=True, exist_ok=True)
    
    # Copy pre-seeded aicte_validator.db to /tmp if present
    repo_db = Path(__file__).resolve().parent.parent / "aicte_validator.db"
    tmp_db = Path("/tmp/aicte_validator.db")
    if repo_db.exists() and not tmp_db.exists():
        try:
            shutil.copy2(repo_db, tmp_db)
        except Exception:
            pass
    DEFAULT_SQLITE_URL = "sqlite:////tmp/aicte_validator.db"

class Settings(BaseSettings):
    # App
    app_name: str = "AICTE Validator"
    upload_dir: str = DEFAULT_UPLOAD_DIR
    sqlite_url: str = DEFAULT_SQLITE_URL

    # Email alerts
    smtp_host: str = "localhost"
    smtp_port: int = 1025
    alert_email_from: str = "noreply@aicte-validator.local"

    # Scoring weights (must sum to 1.0)
    weight_authenticity: float = 0.30
    weight_forgery:      float = 0.35
    weight_compliance:   float = 0.35

    # Routing thresholds
    threshold_cleared:      float = 75.0
    threshold_under_review: float = 50.0
    critical_cap:           float = 74.0   # max score if any critical flag

    class Config:
        env_file = ".env"

settings = Settings()
