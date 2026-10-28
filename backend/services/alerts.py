"""
Alert service.
  - Creates Alert rows in DB (in-app alerts).
  - Sends console email via SMTP (prints to console if SMTP unavailable).
  - Called by pipeline runner and review service.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from sqlalchemy.orm import Session
from backend.models.alert import Alert, AlertType
from backend.config import settings

logger = logging.getLogger(__name__)

def create_alert(
    db: Session,
    application_id: str,
    alert_type: AlertType,
    message: str,
) -> Alert:
    """Persists an in-app alert and attempts to send email."""
    alert = Alert(
        application_id = application_id,
        alert_type     = alert_type,
        message        = message,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    _send_email(
        subject=f"[AICTE Validator] {alert_type.value} — {application_id}",
        body=message,
    )
    return alert

def _send_email(subject: str, body: str):
    """
    Sends email via SMTP. Falls back to console log if SMTP unavailable.
    For dev: use MailHog or Python's `python -m smtpd -n -c DebuggingServer`.
    """
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"]    = settings.alert_email_from
        msg["To"]      = settings.alert_email_from   # send to self for demo

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=3) as s:
            s.sendmail(settings.alert_email_from, [settings.alert_email_from], msg.as_string())
        logger.info(f"Alert email sent: {subject}")
    except Exception as e:
        # Console fallback — always log even if SMTP fails
        logger.warning(f"[ALERT — email unavailable: {e}]")
        logger.warning(f"  Subject : {subject}")
        logger.warning(f"  Body    : {body}")

def raise_alerts_from_validation(
    db: Session,
    application_id: str,
    result_json: dict,
    missing_docs: list[str],
):
    """
    Called after pipeline completes.
    Raises alerts based on validation result.
    """
    # Critical flag alert
    for module in result_json.get("modules", []):
        for flag in module.get("flags", []):
            if flag.get("severity") == "critical":
                create_alert(
                    db, application_id,
                    AlertType.CRITICAL_FLAG,
                    f"Critical flag [{flag.get('id')}] on {flag.get('document')}: "
                    f"{flag.get('message')}",
                )

    # Missing document alert
    if missing_docs:
        create_alert(
            db, application_id,
            AlertType.MISSING_DOCUMENT,
            f"Missing mandatory documents: {', '.join(missing_docs)}",
        )
