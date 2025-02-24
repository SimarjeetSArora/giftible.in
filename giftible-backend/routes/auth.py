import os
import jwt
import shutil
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from database import get_db
from models import User, NGO, Admin
from schemas import UserCreate, NGOCreate, AdminCreate, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
from .utils import generate_reset_token, verify_reset_token
from services.email_service import send_reset_email
from services.sms_service import send_reset_sms

# Initialize router and environment variables
router = APIRouter()
load_dotenv()

# Security and JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure upload directory exists


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Generates a JWT token with expiration."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register/user")
def register_user(data: UserCreate, db: Session = Depends(get_db)):
    """Registers a user."""
    existing_user = db.query(User).filter(
        (User.email == data.email) | (User.contact_number == data.contact_number)
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email or contact number already registered")

    hashed_password = pwd_context.hash(data.password)
    db_user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        contact_number=data.contact_number,
        password=hashed_password,
        role="user",
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {"message": "User registered successfully!"}


@router.post("/register/ngo")
def register_ngo(
    ngo_name: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    contact_number: str = Form(...),
    password: str = Form(...),
    account_holder_name: str = Form(...),  # ✅ New field added
    account_number: str = Form(...),
    ifsc_code: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    license: UploadFile = File(...),
    logo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Registers an NGO."""

    existing_ngo = db.query(NGO).filter(
        (NGO.ngo_name == ngo_name) | (NGO.contact_number == contact_number) | (NGO.email == email)
    ).first()

    if existing_ngo:
        raise HTTPException(status_code=400, detail="NGO already exists")

    license_path = f"uploads/{license.filename}"
    logo_path = f"uploads/{logo.filename}"

    with open(license_path, "wb") as buffer:
        shutil.copyfileobj(license.file, buffer)

    with open(logo_path, "wb") as buffer:
        shutil.copyfileobj(logo.file, buffer)

    hashed_password = pwd_context.hash(password)

    db_ngo = NGO(
        ngo_name=ngo_name,
        first_name=first_name,
        last_name=last_name,
        email=email,
        contact_number=contact_number,
        password=hashed_password,
        account_holder_name=account_holder_name,  # ✅ Added to model instance
        account_number=account_number,
        ifsc_code=ifsc_code,
        address=address,
        city=city,
        state=state,
        pincode=pincode,
        license=license_path,
        logo=logo_path,
        role="ngo",
        is_approved=False
    )

    db.add(db_ngo)
    db.commit()
    db.refresh(db_ngo)

    return {"message": "✅ NGO registered successfully! Awaiting admin approval."}


@router.post("/register/admin", response_model=UserResponse)
def register_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    """Registers an admin (No OTP required)."""
    existing_admin = db.query(Admin).filter(Admin.email == admin.email).first()

    if existing_admin:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(admin.password)
    db_admin = Admin(
        **admin.model_dump(exclude={"password"}),
        password=hashed_password,
        role="admin"
    )

    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)

    return db_admin


@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Logs in a user and generates an access token."""

    user = (
        db.query(User).filter(User.contact_number == form_data.username).first()
        or db.query(NGO).filter(NGO.contact_number == form_data.username).first()
        or db.query(Admin).filter(Admin.contact_number == form_data.username).first()
    )

    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect contact number or password")

    if isinstance(user, NGO) and not user.is_approved:
        raise HTTPException(status_code=403, detail="NGO not approved yet")

    if not user.role:
        raise HTTPException(status_code=400, detail="User role is missing. Contact support.")

    # Generate token with expiration
    access_token = create_access_token(data={"sub": user.contact_number, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "id": user.id,  # ✅ Include the user ID
    }

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # 🔍 Find the user based on contact number
    user = db.query(User).filter(User.contact_number == request.contact_number).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔑 Generate the password reset token
    token = generate_reset_token(db, user.id)
    reset_link = f"http://localhost:5173/reset-password?token={token}"  # Replace with actual frontend URL

    # ✅ Send both Email and SMS in parallel
    try:
        send_reset_email(user.email, reset_link)
        send_reset_sms(user.contact_number, reset_link)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send reset link: {e}")

    return {"message": "Password reset link sent successfully.", "reset_link": reset_link}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_entry = verify_reset_token(db, request.token)

    if not token_entry:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == token_entry.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = pwd_context.hash(request.new_password)
    db.delete(token_entry)  # Remove token after successful reset
    db.commit()

    return {"message": "Password reset successful."}