from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from dotenv import load_dotenv
from email.mime.text import MIMEText
import smtplib
import os
import logging
from schemas import NGOResponse, NGOEditRequest, NGORejectionRequest, UserResponse
from database import get_db
from models import NGO, UniversalUser, Product, Order, OrderItem
import jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
import shutil
from datetime import datetime, timedelta


UPLOAD_DIR = "uploads/ngos"  # Directory where files will be stored
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure the directory exists

# ✅ Initialize Router and Logger
router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ✅ Load Environment Variables
load_dotenv()

# ✅ Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL = os.getenv("SMTP_EMAIL")
SENDER_PASSWORD = os.getenv("SMTP_PASSWORD")

# ✅ JWT Secret Key and Algorithm
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"


# ✅ Predefined Rejection Reasons
REJECTION_REASONS = [
    "Same NGO already exists",
    "NGO license not valid",
    "Incomplete or incorrect information",
    "Suspicious activity detected"
]



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

    except jwt.PyJWTError as e:
        print(f"❌ JWT Decode Error: {e}")  
        raise HTTPException(status_code=401, detail="Invalid token. Please log in again.")




# ---------------------------- #
# ✅ EMAIL FUNCTIONS
# ---------------------------- #

def send_email(to_email: str, subject: str, body: str):
    """Send an email with the given subject and body."""
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        logger.info(f"✅ Email sent to {to_email}")
    except Exception as e:
        logger.error(f"❌ Error sending email to {to_email}: {e}")

def send_approval_email(to_email: str, ngo_name: str):
    subject = "🎉 NGO Registration Approved!"
    body = f"""
    Dear {ngo_name},

    We are pleased to inform you that your NGO registration has been approved.
    You can now log in and start using Giftible.

    Best regards,
    Giftible Team
    """
    send_email(to_email, subject, body)

def send_rejection_email(to_email: str, ngo_name: str, rejection_reason: str):
    subject = "🚫 NGO Registration Rejected"
    body = f"""
    Dear {ngo_name},

    We regret to inform you that your NGO registration has been rejected.

    📝 Reason for rejection: {rejection_reason}

    You can review the reason and reapply at: http://giftible.in/register/ngo

    Best regards,
    Giftible Team
    """
    send_email(to_email, subject, body)

# ---------------------------- #
# ✅ ROUTES
# ---------------------------- #

@router.post("/approve-ngo/{ngo_id}")
def approve_ngo(
    ngo_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user)  # Ensure authentication
):
    """
    ✅ Approve NGO (Requires Authentication)
    - Updates NGO approval status
    - Sends approval email
    """

    # ✅ Ensure user is an admin
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins can approve NGOs")

    # ✅ Fetch the NGO
    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")
    if ngo.is_approved:
        raise HTTPException(status_code=400, detail="NGO is already approved")
    # ✅ Retrieve NGO's Universal User
    ngo_user = db.query(UniversalUser).filter(UniversalUser.id == ngo.universal_user_id).first()
    if not ngo_user:
        raise HTTPException(status_code=500, detail="Data inconsistency: Universal user not found for NGO")

    try:
        # ✅ Update NGO Approval Status
        ngo.is_approved = True
        db.commit()

        # 📧 Send Approval Email
        background_tasks.add_task(send_approval_email, ngo_user.email, ngo.ngo_name)

        return {"status": "success", "message": f"✅ NGO '{ngo.ngo_name}' approved successfully."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")


@router.post("/reject-ngo/{ngo_id}")
def reject_ngo(
    ngo_id: int,
    request: NGORejectionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user)  # Ensure authentication
):
    """
    🚫 Reject NGO (Requires Authentication)
    - Validate rejection reason
    - Send rejection email
    - Remove NGO and associated user from the database
    """

    # ✅ Ensure user is an admin
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins can reject NGOs")

    # ✅ Validate rejection reason
    if request.rejection_reason not in REJECTION_REASONS:
        raise HTTPException(status_code=400, detail="Invalid rejection reason.")

    # ✅ Fetch the NGO
    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")

    # ✅ Retrieve NGO's Universal User
    ngo_user = db.query(UniversalUser).filter(UniversalUser.id == ngo.universal_user_id).first()
    if not ngo_user:
        raise HTTPException(status_code=500, detail="Data inconsistency: Universal user not found for NGO")

    try:
        # 📧 Send Rejection Email
        background_tasks.add_task(send_rejection_email, ngo_user.email, ngo.ngo_name, request.rejection_reason)

        # 🗑️ Remove NGO & Associated Universal User
        db.delete(ngo)
        db.delete(ngo_user)  # ✅ Ensure universal user is also removed
        db.commit()

        logger.info(f"✅ NGO '{ngo.ngo_name}' rejected and removed.")
        return {"status": "success", "message": f"✅ NGO '{ngo.ngo_name}' rejected and removed from the database."}

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error rejecting NGO {ngo_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Rejection failed: {str(e)}")



@router.get("/ngos/pending", response_model=list[NGOResponse])
def get_pending_ngos(
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user)  # Ensure authentication
):
    """
    📄 Get all pending NGOs awaiting approval (Requires Authentication).
    """

    # ✅ Ensure user is an admin
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins can view pending NGOs")

    ngos = (
        db.query(NGO, UniversalUser)
        .join(UniversalUser, UniversalUser.id == NGO.universal_user_id)
        .filter(NGO.is_approved == False)
        .all()
    )

    response = [
        NGOResponse(
            id=ngo.id,
            ngo_name=ngo.ngo_name,
            is_approved=ngo.is_approved,
            logo=ngo.logo,
            license=ngo.license,  # ✅ Added license field
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            contact_number=user.contact_number,
            address=ngo.address,
            city=ngo.city,
            state=ngo.state,
            pincode=ngo.pincode,
        )
        for ngo, user in ngos
    ]

    return response


@router.get("/ngos", response_model=list[NGOResponse])
def get_ngos(
    verified: bool | None = Query(None, description="Filter by verification status"),
    start_date: str | None = Query(None, description="Filter by registration start date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="Filter by registration end date (YYYY-MM-DD)"),
    limit: int = Query(10, description="Number of results per page"),
    offset: int = Query(0, description="Pagination offset"),
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user)
):
    """
    📄 Retrieve NGOs with optional filters:
    - `verified=True` → Only approved NGOs
    - `verified=False` → Only unapproved NGOs
    - `verified=None` → All NGOs
    - `start_date` → Filter NGOs registered on or after this date
    - `end_date` → Filter NGOs registered on or before this date (Till 23:59:59)
    - `limit` & `offset` → Pagination support
    """

    # ✅ Ensure user is an admin
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins can view NGOs")

    query = db.query(NGO, UniversalUser).join(UniversalUser, UniversalUser.id == NGO.universal_user_id)

    if verified is not None:
        query = query.filter(NGO.is_approved == verified)

    # ✅ Handle start_date and end_date properly
    if start_date:
        try:
            start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(NGO.created_at >= start_date_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")

    if end_date:
        try:
            # ✅ Ensure `end_date` includes the full day till 23:59:59
            end_date_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
            query = query.filter(NGO.created_at <= end_date_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD.")

    # Apply Pagination
    ngos = query.offset(offset).limit(limit).all()

    response = [
        NGOResponse(
            id=ngo.id,
            universal_user_id= ngo.universal_user_id,  # ✅ Include Universal User ID
            ngo_name=ngo.ngo_name,
            is_approved=ngo.is_approved,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            contact_number=user.contact_number,
            address=ngo.address,
            city=ngo.city,
            state=ngo.state,
            pincode=ngo.pincode,
            account_holder_name=ngo.account_holder_name,
            account_number=ngo.account_number,
            ifsc_code=ngo.ifsc_code,
            created_at=ngo.created_at.strftime("%Y-%m-%d")  # Ensure formatted date
        )
        for ngo, user in ngos
    ]

    return response




# ✅ DELETE NGO Route
@router.delete("/ngos/{ngo_id}")
def delete_ngo(
    ngo_id: int,
    deletion_reason: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user)
):
    """
    🗑️ Delete an NGO and all related records (Products, Order Items) & Notify via Email.
    """

    # ✅ Ensure only admins can delete NGOs
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins can delete NGOs.")

    # ✅ Fetch the NGO
    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found.")

    # ✅ Fetch Universal User associated with the NGO
    ngo_user = db.query(UniversalUser).filter(UniversalUser.id == ngo.universal_user_id).first()
    if not ngo_user:
        raise HTTPException(status_code=500, detail="Universal user not found for this NGO.")

    # ✅ Get all products linked to this NGO (using universal_user_id)
    ngo_products = db.query(Product.id).filter(Product.universal_user_id == ngo.universal_user_id).all()
    product_ids = [product.id for product in ngo_products]

    # ✅ Check if any of these products are in active orders
    active_order_items = db.query(OrderItem).filter(OrderItem.product_id.in_(product_ids)).count()
    if active_order_items > 0:
        raise HTTPException(
            status_code=400,
            detail="Unable to delete NGO as its products are currently part of active orders. Please complete or cancel all orders first."
        )

    try:
        # ✅ Delete all products associated with this NGO
        db.query(Product).filter(Product.universal_user_id == ngo.universal_user_id).delete()

        # ✅ Delete NGO and Universal User
        db.delete(ngo)
        db.delete(ngo_user)
        db.commit()

        # 📧 Send Email Notification
        subject = "🚫 NGO Account Deleted"
        body = f"""
        Dear {ngo.ngo_name},

        Your NGO account has been deleted.

        📝 Reason for deletion: {deletion_reason}

        If you believe this was a mistake, please contact support.

        Best regards,  
        Giftible Team
        """
        background_tasks.add_task(send_email, ngo_user.email, subject, body)

        return {"status": "success", "message": f"✅ NGO '{ngo.ngo_name}' and its products were deleted successfully."}

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Unable to delete NGO due to existing foreign key constraints. Ensure all related records (such as orders) are removed first."
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")





# ✅ SEARCH NGO Route (by name, city, contact, or email)
@router.get("/ngos/search", response_model=list[NGOResponse])
def search_ngos(
    query: str,
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user)  # Ensure authentication
):
    """
    🔎 Search NGOs by name, city, contact number, or email (Requires Authentication)
    """

    # ✅ Ensure user is an admin
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins can search NGOs")

    # ✅ Perform search
    ngos = (
        db.query(NGO, UniversalUser)
        .join(UniversalUser, UniversalUser.id == NGO.universal_user_id)
        .filter(
            (NGO.ngo_name.ilike(f"%{query}%")) |
            (NGO.city.ilike(f"%{query}%")) |
            (UniversalUser.contact_number.ilike(f"%{query}%")) |
            (UniversalUser.email.ilike(f"%{query}%"))
        )
        .all()
    )

    if not ngos:
        raise HTTPException(status_code=404, detail="No NGOs found matching the query")

    response = [
        NGOResponse(
            id=ngo.id,
            ngo_name=ngo.ngo_name,
            is_approved=ngo.is_approved,
            logo=ngo.logo,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            contact_number=user.contact_number,
            address=ngo.address,
            city=ngo.city,
            state=ngo.state,
            pincode=ngo.pincode,
        )
        for ngo, user in ngos
    ]

    return response


# ✅ EDIT NGO Route
@router.put("/ngos/{ngo_id}")
async def edit_ngo(
    ngo_id: int,
    ngo_name: str = Form(...),
    account_holder_name: str = Form(...),
    account_number: str = Form(...),
    ifsc_code: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    contact_number: str = Form(...),
    logo: UploadFile = File(None),
    license: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    ✏️ **Edit NGO Details**
    - Update text fields (NGO details, admin info).
    - Upload **Logo (JPG/PNG)**.
    - Upload **License (JPG/PNG/PDF)**.
    """
    print(f"🚀 Received NGO Update: {ngo_name}, {email}, {contact_number}")
    print(f"🚀 Logo: {logo.filename if logo else 'No Logo'}")
    print(f"🚀 License: {license.filename if license else 'No License'}")

    # ✅ Fetch the NGO
    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")

    # ✅ Fetch the Universal User
    ngo_user = db.query(UniversalUser).filter(UniversalUser.id == ngo.universal_user_id).first()
    if not ngo_user:
        raise HTTPException(status_code=500, detail="Universal user not found")

    try:
        # ✅ Update NGO details
        ngo.ngo_name = ngo_name
        ngo.account_holder_name = account_holder_name
        ngo.account_number = account_number
        ngo.ifsc_code = ifsc_code
        ngo.address = address
        ngo.city = city
        ngo.state = state
        ngo.pincode = pincode

        # ✅ Handle File Uploads
        ngo_dir = os.path.join(UPLOAD_DIR, str(ngo_id))
        os.makedirs(ngo_dir, exist_ok=True)

        if logo:
            logo_ext = logo.filename.split(".")[-1].lower()
            if logo_ext not in ["jpg", "jpeg", "png"]:
                raise HTTPException(status_code=400, detail="Invalid logo format. Only JPG, PNG allowed.")
            logo_filename = f"logo.{logo_ext}"
            logo_path = os.path.join(ngo_dir, logo_filename)
            with open(logo_path, "wb") as buffer:
                shutil.copyfileobj(logo.file, buffer)
            ngo.logo = f"/uploads/ngos/{ngo_id}/{logo_filename}"



        if license:
            license_ext = license.filename.split(".")[-1].lower()
            if license_ext not in ["jpg", "jpeg", "png", "pdf"]:
                raise HTTPException(status_code=400, detail="Invalid license format. Only JPG, PNG, PDF allowed.")
            license_filename = f"license.{license_ext}"
            license_path = os.path.join(ngo_dir, license_filename)
            with open(license_path, "wb") as buffer:
                shutil.copyfileobj(license.file, buffer)
            ngo.license = f"/uploads/ngos/{ngo_id}/{license_filename}"

        # ✅ Update User details
        ngo_user.first_name = first_name
        ngo_user.last_name = last_name
        ngo_user.email = email
        ngo_user.contact_number = contact_number

        db.commit()
        return {
            "status": "success",
            "message": f"✅ NGO '{ngo.ngo_name}' updated successfully.",
            "logo_url": ngo.logo,
            "license_url": ngo.license
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")





@router.get("/ngos/{ngo_id}", response_model=NGOResponse)
def get_ngo_details(
    ngo_id: int,
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user)
):
    """
    📄 Retrieve a single NGO's details by ID.
    """

    # ✅ Ensure user is an admin
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins can view NGO details.")

    # ✅ Fetch the NGO
    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found.")

    # ✅ Fetch Universal User associated with this NGO
    ngo_user = db.query(UniversalUser).filter(UniversalUser.id == ngo.universal_user_id).first()
    if not ngo_user:
        raise HTTPException(status_code=500, detail="Data inconsistency: Universal user not found for NGO.")

    # ✅ Debugging: Print logo and license URLs
    print(f"🚀 DEBUG: NGO Logo URL: {ngo.logo}")
    print(f"🚀 DEBUG: NGO License URL: {ngo.license}")

    return NGOResponse(
        id=ngo.id,
        ngo_name=ngo.ngo_name,
        is_approved=ngo.is_approved,
        logo=ngo.logo,
        license=ngo.license,
        address=ngo.address,
        city=ngo.city,
        state=ngo.state,
        pincode=ngo.pincode,
        first_name=ngo_user.first_name,
        last_name=ngo_user.last_name,
        email=ngo_user.email,
        contact_number=ngo_user.contact_number,
        account_holder_name=ngo.account_holder_name,
        account_number=ngo.account_number,
        ifsc_code=ngo.ifsc_code,
        created_at=ngo.created_at.strftime("%Y-%m-%d") if ngo.created_at else None,  # ✅ Handle missing created_at
    )


@router.get("/users", response_model=list[UserResponse])
def get_users(
    start_date: str | None = Query(None, description="Filter by registration start date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="Filter by registration end date (YYYY-MM-DD)"),
    limit: int = Query(10, description="Number of results per page"),
    offset: int = Query(0, description="Pagination offset"),
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user),
):
    """
    📄 Retrieve Users with optional filters:
    - `start_date` → Filter users registered on or after this date
    - `end_date` → Filter users registered on or before this date (Till 23:59:59)
    - `limit` & `offset` → Pagination support
    """

    # ✅ Ensure user is an admin
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins can view users")

    query = db.query(UniversalUser).filter(UniversalUser.role == "user")  # Only normal users

    # ✅ Handle start_date and end_date properly
    if start_date:
        try:
            start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(UniversalUser.created_at >= start_date_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")

    if end_date:
        try:
            # ✅ Ensure `end_date` includes the full day till 23:59:59
            end_date_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - timedelta(seconds=1)
            query = query.filter(UniversalUser.created_at <= end_date_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD.")

    # Apply Pagination
    users = query.offset(offset).limit(limit).all()

    response = [
        UserResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            email_verified=user.email_verified if user.email_verified is not None else False,  # ✅ Handle missing field
            contact_number=user.contact_number,
            contact_verified=user.contact_verified if user.contact_verified is not None else False,  # ✅ Handle missing field
            role=user.role,
            created_at=user.created_at.strftime("%Y-%m-%d") if user.created_at else None,  # ✅ Handle missing created_at
        )

        for user in users
    ]

    return response


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    deletion_reason: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    """
    🗑️ Delete a User and related records (Orders) & Notify via Email.

    - Admins can delete any user.
    - Users can delete only their own account.
    """

    # ✅ Fetch the User
    user_to_delete = db.query(UniversalUser).filter(UniversalUser.id == user_id, UniversalUser.role == "user").first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found.")

    # ✅ Ensure Admins can delete any user, but Users can delete only their own account
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized: You can only delete your own account.")

    # ✅ Check if user has any active orders
    active_orders = db.query(Order).filter(Order.user_id == user_id, Order.status.notin_(["completed", "cancelled"])).count()
    if active_orders > 0:
        raise HTTPException(
            status_code=400,
            detail="Unable to delete account as there are active orders. Please complete or cancel all orders first."
        )

    try:
        # ✅ Delete order items linked to this user
        db.query(OrderItem).filter(OrderItem.order_id.in_(
            db.query(Order.id).filter(Order.user_id == user_id)
        )).delete(synchronize_session=False)

        # ✅ Delete orders associated with the user
        db.query(Order).filter(Order.user_id == user_id).delete(synchronize_session=False)

        # ✅ Delete the user from UniversalUser table
        db.delete(user_to_delete)
        db.commit()

        # 📧 Send Email Notification
        subject = "🚫 Account Deleted"
        body = f"""
        Dear {user_to_delete.first_name},

        Your Giftible account has been deleted.

        📝 Reason for deletion: {deletion_reason}

        If you believe this was a mistake, please contact support.

        Best regards,  
        Giftible Team
        """
        background_tasks.add_task(send_email, user_to_delete.email, subject, body)

        return {"status": "success", "message": f"✅ User '{user_to_delete.first_name} {user_to_delete.last_name}' was deleted successfully."}

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Unable to delete user due to existing foreign key constraints. Ensure all related records (such as orders) are removed first."
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    """
    📄 Retrieve a single User's details by ID.
    
    - Admins can fetch any user's details.
    - Users can fetch only their own details.
    """

    # ✅ Allow Admins to access any user, but Users can access only their own details
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized: You can only view your own profile.")

    # ✅ Fetch the User (ONLY users with role="user")
    user = db.query(UniversalUser).filter(UniversalUser.id == user_id, UniversalUser.role == "user").first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found or not a regular user.")

    # ✅ Ensure all required fields are included
    return UserResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        email_verified=user.email_verified if user.email_verified is not None else False,  # ✅ Handle missing field
        contact_number=user.contact_number,
        contact_verified=user.contact_verified if user.contact_verified is not None else False,  # ✅ Handle missing field
        role=user.role,
        created_at=user.created_at.strftime("%Y-%m-%d") if user.created_at else None,  # ✅ Handle missing created_at
    )


@router.get("/users/search/", response_model=list[UserResponse])
def search_users(
    query: str,
    db: Session = Depends(get_db),
    user: UniversalUser = Depends(get_current_user)
):
    """
    🔎 Search Users by name, email, contact number, or city (Requires Authentication)
    - This API only fetches users with the role **user**
    """

    # ✅ Allow access to both Admins & Users
    if user.role not in ["admin", "user"]:
        raise HTTPException(status_code=403, detail="Unauthorized: Only admins and users can search")

    # ✅ Perform search, but only fetch users with the "user" role
    users = (
        db.query(UniversalUser)
        .filter(
            (UniversalUser.role == "user") &  # ✅ Ensure only users are fetched
            (
                (UniversalUser.first_name.ilike(f"%{query}%")) |
                (UniversalUser.last_name.ilike(f"%{query}%")) |
                (UniversalUser.email.ilike(f"%{query}%")) |
                (UniversalUser.contact_number.ilike(f"%{query}%"))
            )
        )
        .all()
    )

    if not users:
        raise HTTPException(status_code=404, detail="No users found matching the query")

    response = [
        UserResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            contact_number=user.contact_number,
            role=user.role,  # ✅ Ensuring only "user" role is retrieved
            email_verified=user.email_verified if hasattr(user, "email_verified") else False,
            contact_verified=user.contact_verified if hasattr(user, "contact_verified") else False,
            created_at=user.created_at.strftime("%Y-%m-%d") if user.created_at else None,
        )
        for user in users
    ]

    return response
