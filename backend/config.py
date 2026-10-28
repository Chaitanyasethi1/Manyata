from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    app_name: str = "AICTE Validator"
    upload_dir: str = "uploads"
    sqlite_url: str = "sqlite:///./aicte_validator.db"

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
