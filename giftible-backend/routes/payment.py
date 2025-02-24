from fastapi import APIRouter, HTTPException, Depends
from services.razorpay_client import create_order, verify_payment_signature
from pydantic import BaseModel, confloat
import logging
from database import get_db
from sqlalchemy.orm import Session
import os


# ✅ Initialize Router and Logger
router = APIRouter(prefix="/payments", tags=["Payments"])
logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")



class PaymentOrderRequest(BaseModel):
    amount: confloat(gt=0)  # 🔒 Amount must be > 0


# 📝 Create Razorpay Order
class PaymentRequest(BaseModel):
    amount: float  # ✅ Amount should be a float

@router.post("/razorpay/order")
def create_razorpay_order(payment: PaymentRequest):
    print(f"Received Payment Payload: {payment}")
    try:
        order = create_order(amount=payment.amount)
        return {"order_id": order["id"], "amount": order["amount"] / 100}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PaymentVerificationRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/razorpay/verify")
def verify_razorpay_payment(request: PaymentVerificationRequest):
    try:
        is_valid = verify_payment_signature(
            request.razorpay_order_id, request.razorpay_payment_id, request.razorpay_signature
        )

        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid payment signature.")

        return {"status": "success", "message": "Payment verified successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying payment: {str(e)}")