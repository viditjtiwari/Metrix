"""Email service for sending OTP codes via SMTP."""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings
from app.core.logging import logger


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """Send a 6-digit OTP code to the given email address.

    Returns True if sent successfully, False on failure.
    """
    subject = f"METRIX Login OTP: {otp_code}"

    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#059669;margin-bottom:8px;">METRIX Verification</h2>
        <p style="color:#475569;font-size:14px;">
            Your one-time login code is:
        </p>
        <div style="text-align:center;margin:24px 0;">
            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;
                         color:#0f172a;background:#f1f5f9;padding:12px 24px;
                         border-radius:8px;display:inline-block;">
                {otp_code}
            </span>
        </div>
        <p style="color:#94a3b8;font-size:12px;">
            This code expires in {settings.OTP_EXPIRE_MINUTES} minutes.
            Do not share it with anyone.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
        <p style="color:#cbd5e1;font-size:11px;">
            If you did not request this code, please ignore this email.
        </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg["To"] = to_email
    msg.attach(MIMEText(f"Your METRIX OTP is: {otp_code}", "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            if not settings.SMTP_SECURE:
                server.starttls()
                server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

        logger.info(f"OTP email sent to {to_email}")
        return True

    except Exception as exc:
        logger.error(f"Failed to send OTP email to {to_email}: {exc}")
        return False
