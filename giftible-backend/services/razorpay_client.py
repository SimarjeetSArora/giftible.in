import razorpay
import os
from dotenv import load_dotenv
import time  # ✅ Add this
import hmac
import hashlib

# ✅ Load environment variables
load_dotenv()

# ✅ Environment Variables
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise ValueError("❌ Razorpay credentials are missing in the environment variables.")

# ✅ Initialize Razorpay Client
client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

def create_order(amount):
    return client.order.create({
        "amount": int(amount * 100),  # Amount in paise (e.g., ₹500 -> 50000)
        "currency": "INR",
        "receipt": f"receipt_{int(time.time())}",  # Unique receipt ID
        "payment_capture": 1,
    })





def verify_payment_signature(order_id: str, payment_id: str, signature: str):
    payload = f"{order_id}|{payment_id}".encode('utf-8')
    generated_signature = hmac.new(
        key=RAZORPAY_KEY_SECRET.encode('utf-8'),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()

    print(f"✅ Generated Signature: {generated_signature}")
    print(f"✅ Received Signature: {signature}")

    if generated_signature != signature:
        print("❌ Signature verification failed!")
        return False
    print("✅ Signature verified successfully!")
    return True
