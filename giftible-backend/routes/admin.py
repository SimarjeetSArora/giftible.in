from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from dotenv import load_dotenv
from email.mime.text import MIMEText
import smtplib
import os
import logging

from database import get_db
from models import NGO

# ✅ Initialize Router and Logger
router = APIRouter()
logger = logging.getLogger(__name__)

# ✅ Load Environment Variables
load_dotenv()

# ✅ Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL = os.getenv("SMTP_EMAIL")
SENDER_PASSWORD = os.getenv("SMTP_PASSWORD")

# ✅ Predefined Rejection Reasons
REJECTION_REASONS = [
    "Same NGO already exists",
    "NGO license not valid",
    "Incomplete or incorrect information",
    "Suspicious activity detected"
]

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

    You can review the reason and reapply at: https://giftible.com/register

    Best regards,
    Giftible Team
    """
    send_email(to_email, subject, body)

# ---------------------------- #
# ✅ REQUEST MODELS
# ---------------------------- #

class NGORejectionRequest(BaseModel):
    rejection_reason: str

# ---------------------------- #
# ✅ ROUTES
# ---------------------------- #

@router.post("/approve-ngo/{ngo_id}")
def approve_ngo(ngo_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    ✅ Approve NGO:
    - Update NGO approval status
    - Send approval email
    """
    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()

    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")
    if ngo.is_approved:
        raise HTTPException(status_code=400, detail="NGO is already approved")

    try:
        # ✅ Update NGO Record
        ngo.is_approved = True
        db.commit()

        # 📧 Send Approval Email
        background_tasks.add_task(send_approval_email, ngo.email, ngo.ngo_name)

        return {"status": "success", "message": f"✅ NGO '{ngo.ngo_name}' approved."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")

@router.post("/reject-ngo/{ngo_id}")
def reject_ngo(
    ngo_id: int,
    request: NGORejectionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    🚫 Reject NGO:
    - Validate rejection reason
    - Send rejection email
    - Remove NGO from the database
    """
    if request.rejection_reason not in REJECTION_REASONS:
        raise HTTPException(status_code=400, detail="Invalid rejection reason.")

    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()

    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")

    try:
        # 📧 Send Rejection Email
        background_tasks.add_task(send_rejection_email, ngo.email, ngo.ngo_name, request.rejection_reason)

        # 🗑️ Remove NGO from Database
        db.delete(ngo)
        db.commit()

        logger.info(f"✅ NGO '{ngo.ngo_name}' rejected and removed.")
        return {"status": "success", "message": f"✅ NGO '{ngo.ngo_name}' rejected and removed from the database."}

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error rejecting NGO {ngo_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Rejection failed: {str(e)}")

@router.get("/ngos/pending")
def get_pending_ngos(db: Session = Depends(get_db)):
    """
    📄 Get all pending NGOs awaiting approval.
    """
    ngos = db.query(NGO).filter(NGO.is_approved.is_(False)).all()
    return {"status": "success", "pending_ngos": ngos}
