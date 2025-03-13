import os
import jwt
import secrets
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from models import (
    PasswordResetToken,
    UniversalUser,
    RefreshToken
)

from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText
from twilio.rest import Client

# 🔐 Load environment variables
load_dotenv()

# 🔑 JWT & Token Settings
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "default_refresh_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))


# 🚀 Generate Access Token
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Generates a JWT access token with expiration."""
    to_encode = data.copy()
    
    # ✅ Ensure `sub` (user ID) is always stored as a string
    to_encode["sub"] = str(to_encode.get("sub"))

    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)




# 🚀 Generate Refresh Token
# 🚀 Generate Refresh Token
def create_refresh_token(data: dict) -> tuple[str, datetime]:
    """Generates a JWT refresh token with expiration."""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {**data, "exp": expire}
    refresh_token = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    
    return refresh_token, expire  # ✅ Now returning both token and expiry time



# 💾 Save Refresh Token
# 💾 Save Refresh Token
def save_refresh_token(db: Session, user_id: int, token: str, expires_at: datetime):
    """Stores the refresh token in the database."""
    refresh_token = RefreshToken(
        universal_user_id=user_id,  # ✅ Ensure correct column name
        token=token,
        expires_at=expires_at
    )
    db.add(refresh_token)
    db.commit()



# ❌ Revoke Refresh Token
def revoke_refresh_token(db: Session, token: str) -> bool:
    """Deletes the refresh token from the database."""
    
    # ✅ Remove expired refresh tokens automatically
    db.query(RefreshToken).filter(RefreshToken.expires_at < datetime.utcnow()).delete()

    deleted = db.query(RefreshToken).filter_by(token=token).delete()
    db.commit()
    return bool(deleted)



# 🔑 Generate Password Reset Token
def generate_reset_token(db: Session, universal_user_id: int) -> str:
    """Generates and stores a password reset token with expiration."""
    token = secrets.token_urlsafe(32)
    expiration = datetime.utcnow() + timedelta(minutes=30)

    reset_token = PasswordResetToken(
        universal_user_id=universal_user_id,  # ✅ Ensure correct column name
        token=token,
        expires_at=expiration
    )

    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)

    return token


# ✅ Verify Password Reset Token
def verify_reset_token(db: Session, token: str) -> PasswordResetToken | None:
    """Verifies if the reset token is valid and not expired."""
    return db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.expires_at >= datetime.utcnow()
    ).first()


def send_verification_email(to_email: str, user_id: int):
    """Sends an email verification link to the user."""
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SENDER_EMAIL = os.getenv("SMTP_EMAIL")
    SENDER_PASSWORD = os.getenv("SMTP_PASSWORD")

    verification_link = f"http://giftible.in/verify-email/{user_id}"

    subject = "Verify Your Email - Giftible"
    body = f"""
    Hello,

    Please verify your email by clicking the link below:
    {verification_link}

    If you did not register, please ignore this email.

    Regards,
    Giftible Team
    """

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        print(f"✅ Email verification link sent to {to_email}")
    except Exception as e:
        print(f"❌ Error sending email verification: {e}")
        raise HTTPException(status_code=500, detail="Error sending verification email.")



# Load Twilio credentials from environment variables
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
BASE_URL = os.getenv("BASE_URL")  # Your frontend/backend domain

def send_contact_verification_link(contact_number: str, user_id: int):
    """Send a contact verification link via Twilio SMS."""
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        # Generate the verification link
        verification_link = f"{BASE_URL}/verify-contact/{user_id}"

        message_body = f"Verify your phone number for Giftible: {verification_link}"

        message = client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE_NUMBER,
            to=f"+91{contact_number}"  # Ensure correct country code
        )

        print(f"✅ Contact verification link sent to {contact_number}: {message.sid}")
        return {"message": "Verification link sent successfully!"}

    except Exception as e:
        print(f"❌ Error sending verification SMS: {e}")
        return {"error": "Failed to send verification SMS. Please try again."}
