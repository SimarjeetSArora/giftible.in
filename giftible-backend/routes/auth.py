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
from models import UniversalUser, RefreshToken, User, NGO, Admin
from schemas import (
    UserCreate, NGOCreate, AdminCreate, UserResponse, ForgotPasswordRequest, ResetPasswordRequest, LogoutRequest, RefreshTokenRequest
)
from .utils import (
    create_access_token, create_refresh_token,
    generate_reset_token, verify_reset_token,
    save_refresh_token, revoke_refresh_token
)
from services.email_service import send_reset_email
from services.sms_service import send_reset_sms

# 🚀 Initialize router and environment variables
router = APIRouter()
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "your_refresh_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# 📝 Universal User Registration Helper
def register_universal_user(db: Session, contact_number: str, email: str, password: str, role: str):
    if db.query(UniversalUser).filter(
        (UniversalUser.contact_number == contact_number) | (UniversalUser.email == email)
    ).first():
        raise HTTPException(status_code=400, detail="Email or contact number already registered.")

    hashed_password = pwd_context.hash(password)
    user = UniversalUser(
        contact_number=contact_number,
        email=email,
        password=hashed_password,
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# 📝 User Registration
@router.post("/register/user", response_model=UserResponse)
def register_user(data: UserCreate, db: Session = Depends(get_db)):
    universal_user = register_universal_user(db, data.contact_number, data.email, data.password, "user")

    user_profile = User(
        universal_user_id=universal_user.id,
        first_name=data.first_name,
        last_name=data.last_name
    )

    db.add(user_profile)
    db.commit()
    db.refresh(user_profile)

    return {"message": "User registered successfully!", "user": user_profile}


# 📝 NGO Registration with Detailed Fields
@router.post("/register/ngo")
def register_ngo(
    ngo_name: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    contact_number: str = Form(...),
    password: str = Form(...),
    account_holder_name: str = Form(...),
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
    universal_user = register_universal_user(db, contact_number, email, password, "ngo")

    license_path = f"{UPLOAD_DIR}/{license.filename}"
    logo_path = f"{UPLOAD_DIR}/{logo.filename}"

    with open(license_path, "wb") as buffer:
        shutil.copyfileobj(license.file, buffer)

    with open(logo_path, "wb") as buffer:
        shutil.copyfileobj(logo.file, buffer)

    ngo_profile = NGO(
        universal_user_id=universal_user.id,
        ngo_name=ngo_name,
        first_name=first_name,
        last_name=last_name,
        account_holder_name=account_holder_name,
        account_number=account_number,
        ifsc_code=ifsc_code,
        address=address,
        city=city,
        state=state,
        pincode=pincode,
        license=license_path,
        logo=logo_path,
        is_approved=False
    )

    db.add(ngo_profile)
    db.commit()
    db.refresh(ngo_profile)

    return {"message": "✅ NGO registered successfully! Awaiting admin approval."}


# 📝 Admin Registration
@router.post("/register/admin", response_model=UserResponse)
def register_admin(data: AdminCreate, db: Session = Depends(get_db)):
    universal_user = register_universal_user(db, data.contact_number, data.email, data.password, "admin")

    admin_profile = Admin(
        universal_user_id=universal_user.id,
        first_name=data.first_name,
        last_name=data.last_name
    )

    db.add(admin_profile)
    db.commit()
    db.refresh(admin_profile)

    return {"message": "Admin registered successfully!", "admin": admin_profile}


# 🔑 Login (Universal for All Roles)
@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Unified login for all roles using universal_users table."""

    # ✅ Fetch the user from UniversalUser table
    user = db.query(UniversalUser).filter(UniversalUser.contact_number == form_data.username).first()

    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect contact number or password")

    # ✅ Create access and refresh tokens using the correct variable `user`
    access_token = create_access_token(data={"sub": user.contact_number, "role": user.role})
    refresh_token, expires_at = create_refresh_token(data={"sub": user.contact_number, "role": user.role})


    # ✅ Save refresh token with expiry
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    save_refresh_token(db, user.id, refresh_token, expires_at)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
        "id": user.id,
    }



# 🔄 Refresh Access Token
@router.post("/refresh-token")
def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    refresh_token = request.refresh_token  # ✅ Access from the request body

    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        token_entry = db.query(RefreshToken).filter_by(token=refresh_token, user_id=user_id).first()
        if not token_entry or token_entry.expires_at < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

        new_access_token = create_access_token({"sub": user_id, "role": payload.get("role")})
        return {"access_token": new_access_token}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")



# 🚪 Logout & Revoke Token
@router.post("/logout")
def logout(request: LogoutRequest, db: Session = Depends(get_db)):
    if not revoke_refresh_token(db, request.refresh_token):
        raise HTTPException(status_code=404, detail="Refresh token not found.")
    return {"message": "Logged out successfully."}