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
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# 🚀 Generate Refresh Token
def create_refresh_token(data: dict) -> tuple[str, datetime]:
    """Generates a JWT refresh token with expiration."""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {**data, "exp": expire}
    refresh_token = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return refresh_token, expire


# 💾 Save Refresh Token
def save_refresh_token(db: Session, user_id: int, token: str, expires_at: datetime):
    """Stores the refresh token in the database."""
    refresh_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(refresh_token)
    db.commit()


# ❌ Revoke Refresh Token
def revoke_refresh_token(db: Session, token: str) -> bool:
    """Deletes the refresh token from the database."""
    deleted = db.query(RefreshToken).filter_by(token=token).delete()
    db.commit()
    return bool(deleted)


# 🔑 Generate Password Reset Token
def generate_reset_token(db: Session, user_id: int) -> str:
    """Generates and stores a password reset token with expiration."""
    token = secrets.token_urlsafe(32)
    expiration = datetime.utcnow() + timedelta(minutes=30)

    reset_token = PasswordResetToken(
        user_id=user_id,
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


# 📧 Check Email or Contact Number Availability
def is_email_or_contact_taken(db: Session, email: str, contact_number: str) -> bool:
    """
    Checks if the given email or contact number is already registered 
    under any UniversalUser record.
    """
    return db.query(UniversalUser).filter(
        (UniversalUser.email == email) | (UniversalUser.contact_number == contact_number)
    ).first() is not None
