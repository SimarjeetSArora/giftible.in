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
from models import UniversalUser, RefreshToken, NGO
from schemas import (
    UserCreate, AdminCreate, UserResponse, UserBase, NGOCreateForm,
    LogoutRequest, RefreshTokenRequest, RegistrationResponse
)

from .utils import (
    create_access_token, create_refresh_token,
    save_refresh_token, send_verification_email, send_contact_verification_link
)
from jose import jwt, JWTError
import re
import random


# 🚀 Load environment variables
router = APIRouter()
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "your_refresh_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

UPLOAD_DIR = "uploads/ngos"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Extracts and returns the current logged-in user based on JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")

        user = db.query(UniversalUser).filter(UniversalUser.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except jwt.ExpiredSignatureError:
        print("🔒 Token expired - forcing logout.")
        raise HTTPException(status_code=403, detail="Token expired. Please log in again.")  # 403 instead of 401

    except JWTError as e:
        print(f"❌ JWT Decode Error: {e}")  
        raise HTTPException(status_code=401, detail="Invalid token. Please log in again.")





# ✅ Universal User Registration







def register_universal_user(db: Session, data: UserCreate, role: str) -> RegistrationResponse:
    try:
        # ✅ Validate email format using regex
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, data.email):
            raise HTTPException(status_code=400, detail="Invalid email format.")

        # ✅ Validate contact number (10 digits, no alphabets)
        if not re.fullmatch(r"\d{10}", data.contact_number):
            raise HTTPException(status_code=400, detail="Invalid contact number. Must be exactly 10 digits.")

        # ✅ Check if user already exists
        existing_user = db.query(UniversalUser).filter(
            (UniversalUser.contact_number == data.contact_number) | 
            (UniversalUser.email == data.email)
        ).first()

        if existing_user:
            raise HTTPException(status_code=400, detail="Email or contact number already registered.")

        # ✅ Hash password
        hashed_password = pwd_context.hash(data.password)

        # ✅ Create new user (initially unverified)
        new_user = UniversalUser(
            first_name=data.first_name,
            last_name=data.last_name,
            contact_number=data.contact_number,
            email=data.email,
            password=hashed_password,
            role=role,
            email_verified=False,  # ✅ Ensure default False
            contact_verified=False  # ✅ Ensure default False
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # ✅ Send email verification link
        send_verification_email(new_user.email, new_user.id)

        # ✅ Send contact verification link via SMS
        send_contact_verification_link(new_user.contact_number, new_user.id)

        # ✅ Return `RegistrationResponse` with `UserResponse`
        return RegistrationResponse(
            message="Registration successful. Verify email and contact number to continue.",
            user=UserResponse(  # ✅ Ensure UserResponse is used correctly
                id=new_user.id,
                first_name=new_user.first_name,
                last_name=new_user.last_name,
                contact_number=new_user.contact_number,
                email=new_user.email,
                email_verified=new_user.email_verified,
                contact_verified=new_user.contact_verified
            ),
            verification_required=True
        )

    except HTTPException as http_err:
        db.rollback()
        raise http_err  # Re-raise FastAPI errors

    except Exception as e:
        db.rollback()
        print(f"❌ Error registering user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")







@router.get("/verify-contact/{user_id}")
def verify_contact(user_id: int, db: Session = Depends(get_db)):
    """Verifies the user's contact number when they click the link."""
    user = db.query(UniversalUser).filter(UniversalUser.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.contact_verified:
        return {"message": "Phone number already verified."}

    user.contact_verified = True
    db.commit()
    return {"message": "Phone number successfully verified!"}

@router.get("/verify-email/{user_id}")
def verify_email(user_id: int, db: Session = Depends(get_db)):
    """Verifies the user's email when they click the link."""
    user = db.query(UniversalUser).filter(UniversalUser.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.email_verified:
        return {"message": "Email already verified."}

    user.email_verified = True
    db.commit()
    return {"message": "Email successfully verified! You can now log in."}



# ✅ User Registration
@router.post("/register/user", response_model=RegistrationResponse)
def register_user(data: UserCreate, db: Session = Depends(get_db)):
    user = register_universal_user(db, data, "user")
    return user


# ✅ Admin Registration
@router.post("/register/admin", response_model=RegistrationResponse)
def register_admin(data: AdminCreate, db: Session = Depends(get_db)):
    return register_universal_user(db, data, role="admin")


# ✅ NGO Registration
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
    """Registers an NGO, stores authentication details in `UniversalUser`, 
    and NGO details in `NGO`, saving files in structured directories."""

    try:
        # ✅ Validate Form Data
        ngo_data = NGOCreateForm(
            ngo_name=ngo_name,
            first_name=first_name,
            last_name=last_name,
            email=email,
            contact_number=contact_number,
            password=password,
            account_holder_name=account_holder_name,
            account_number=account_number,
            ifsc_code=ifsc_code,
            address=address,
            city=city,
            state=state,
            pincode=pincode
        )

        # ✅ Convert to `UserCreate` Model for UniversalUser Registration
        universal_user_data = UserCreate(
            first_name=ngo_data.first_name,
            last_name=ngo_data.last_name,
            email=ngo_data.email,
            contact_number=ngo_data.contact_number,
            password=ngo_data.password
        )

        # ✅ Register Universal User
        universal_user_response = register_universal_user(db, universal_user_data, "ngo")

        # ✅ Fetch newly created NGO's ID
        ngo_id = universal_user_response.user.id  # Assuming universal_user_response contains the user ID

        # ✅ Create NGO-Specific Directory
        ngo_upload_dir = os.path.join(UPLOAD_DIR, str(ngo_id))
        os.makedirs(ngo_upload_dir, exist_ok=True)

        # ✅ Define File Paths
        license_ext = license.filename.split(".")[-1].lower()
        logo_ext = logo.filename.split(".")[-1].lower()

        license_filename = f"license.{license_ext}"
        logo_filename = f"logo.{logo_ext}"

        license_path = os.path.join(ngo_upload_dir, license_filename)
        logo_path = os.path.join(ngo_upload_dir, logo_filename)

        # ✅ Remove old files if they exist (Prevent duplicate issues)
        if os.path.exists(license_path):
            os.remove(license_path)
        if os.path.exists(logo_path):
            os.remove(logo_path)



        # ✅ Save License File
        with open(license_path, "wb") as buffer:
            shutil.copyfileobj(license.file, buffer)

        # ✅ Save Logo File
        with open(logo_path, "wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)

        # ✅ Insert NGO-Specific Details into `NGO` Table
        ngo_profile = NGO(
            universal_user_id=ngo_id,
            ngo_name=ngo_data.ngo_name,
            account_holder_name=ngo_data.account_holder_name,
            account_number=ngo_data.account_number,
            ifsc_code=ngo_data.ifsc_code,
            address=ngo_data.address,
            city=ngo_data.city,
            state=ngo_data.state,
            pincode=ngo_data.pincode,
            license=f"/uploads/ngos/{ngo_id}/{license_filename}",  # ✅ Store correct file path
            logo=f"/uploads/ngos/{ngo_id}/{logo_filename}",        # ✅ Store correct file path
            is_approved=False
        )

        db.add(ngo_profile)
        db.commit()
        db.refresh(ngo_profile)

        return {"message": "✅ NGO registered successfully! Awaiting admin approval."}

    except Exception as e:
        db.rollback()
        print(f"❌ Error during NGO registration: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")




# 🔑 Login (Universal for All Roles)
@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """Unified login for all users via UniversalUser table using contact number."""
    try:
        contact_number = form_data.username.strip()

        # ✅ Ensure the contact number has exactly 10 digits
        if not re.fullmatch(r"\d{10}", contact_number):
            raise HTTPException(status_code=400, detail="Invalid contact number format. Must be exactly 10 digits.")

        print(f"🔍 Attempting login for contact number: {contact_number}")

        # ✅ Query user by contact number
        user = db.query(UniversalUser).filter(UniversalUser.contact_number == contact_number).first()

        if not user:
            print("❌ Contact number not found")
            raise HTTPException(status_code=404, detail="Contact number not found, please register first.")

        if not pwd_context.verify(form_data.password, user.password):
            print("❌ Incorrect password")
            raise HTTPException(status_code=401, detail="Password incorrect, please try again.")

        # ✅ Check if email or contact is verified before allowing login
        if not user.email_verified and not user.contact_verified:
            raise HTTPException(status_code=403, detail="Email or contact not verified. Please verify to continue.")

        # ✅ Initialize ngo_id as None (for non-NGO users)
        ngo_id = None  

        # ✅ If the user is an NGO, check if they are approved & fetch NGO ID
        if user.role == "ngo":
            ngo_profile = db.query(NGO).filter(NGO.universal_user_id == user.id).first()
            if not ngo_profile:
                raise HTTPException(status_code=403, detail="NGO profile not found. Please contact support.")
            
            if not ngo_profile.is_approved:
                raise HTTPException(status_code=403, detail="NGO not approved yet. Please wait for admin approval.")
            
            ngo_id = ngo_profile.id  # ✅ Assign the NGO ID

        print("✅ Login successful!")

        # ✅ Generate tokens
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
        refresh_token, refresh_expiry = create_refresh_token(data={"sub": str(user.id), "role": user.role})

        save_refresh_token(db, user.id, refresh_token, refresh_expiry)

        # ✅ Construct the response payload
        response_data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": user.role,
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name
        }

        # ✅ If the user is an NGO, include NGO ID in response
        if ngo_id:
            response_data["ngo_id"] = ngo_id

        return response_data

    except HTTPException as http_err:
        raise http_err  # Directly return structured FastAPI errors

    except Exception as e:
        print(f"❌ Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")









# 🚪 Logout & Revoke Token
@router.post("/logout")
def logout(request: LogoutRequest, db: Session = Depends(get_db)):
    """Removes the user's refresh token to log them out."""
    try:
        refresh_token = request.refresh_token  # ✅ Extract refresh_token
        print(f"🔒 Logging out refresh token: {refresh_token}")

        # ✅ Correct query to delete refresh token
        deleted = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).delete()

        if deleted == 0:
            raise HTTPException(status_code=404, detail="Refresh token not found.")

        db.commit()
        return {"message": "✅ Successfully logged out"}

    except Exception as e:
        print(f"❌ Logout error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.post("/refresh-token")
def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    refresh_token = request.refresh_token

    try:
        print(f"🔄 Refresh Token Received: {refresh_token}")  # Debug log
        
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        user_id = str(payload.get("sub"))

        print(f"🔎 Decoded Payload: {payload}")  # Debug log

        # ✅ Correct the query (use `universal_user_id`)
        token_entry = db.query(RefreshToken).filter_by(token=refresh_token, universal_user_id=user_id).first()
        if not token_entry:
            print("❌ Refresh token not found in DB")  # Debug log
            raise HTTPException(status_code=401, detail="Invalid refresh token.")

        if token_entry.expires_at < datetime.utcnow():
            print("❌ Refresh token expired!")  # Debug log
            raise HTTPException(status_code=401, detail="Refresh token expired.")

        # ✅ Generate new access token
        new_access_token = create_access_token({"sub": user_id, "role": payload.get("role")})

        print(f"✅ New Access Token Generated: {new_access_token}")  # Debug log
        return {"access_token": new_access_token}

    except jwt.ExpiredSignatureError:
        print("❌ Refresh token expired!")  # Debug log
        raise HTTPException(status_code=401, detail="Refresh token expired.")

    except JWTError as e:
        print(f"❌ JWT Error: {e}")  # Debug log
        raise HTTPException(status_code=401, detail="Invalid token.")




