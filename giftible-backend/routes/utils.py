import os
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import secrets
from sqlalchemy.orm import Session
from models import PasswordResetToken, User

# Load environment variables
load_dotenv()

# Security and JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Generates a JWT token with expiration."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def generate_reset_token(db: Session, user_id: int):
    token = secrets.token_urlsafe(32)
    expiration = datetime.utcnow() + timedelta(minutes=30)

    reset_token = PasswordResetToken(user_id=user_id, token=token, expires_at=expiration)
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)

    return token

def verify_reset_token(db: Session, token: str):
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.expires_at >= datetime.utcnow()
    ).first()
    return reset_token