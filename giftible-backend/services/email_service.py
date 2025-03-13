import smtplib
import os
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL")  # Your Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # Your app password

def send_reset_email(to_email: str, reset_link: str):
    """Sends a password reset email after validating the email address"""
    if not is_valid_email(to_email):
        return {"error": "Invalid email address. Please enter a valid email."}

    try:
        subject = "Password Reset Link"
        body = f"Click the link below to reset your password:\n{reset_link}"

        msg = MIMEMultipart()
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        return {"message": "Email sent successfully!"}
    except Exception as e:
        return {"error": str(e)}
