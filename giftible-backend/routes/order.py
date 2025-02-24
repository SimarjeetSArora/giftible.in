from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Order, OrderItem, Product, Cart, CartItem, NGO, User
from schemas import OrderResponse, UpdateOrderStatusRequest
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from services.razorpay_client import create_order, verify_payment_signature
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["Orders"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 🔑 Utility: Get current user from token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, "your_secret_key", algorithms=["HS256"])
        user = db.query(User).filter(User.contact_number == payload.get("sub")).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token.")

# 🛒 Place Order (After Payment Verification)

# 📦 Define the expected request body
class PlaceOrderRequest(BaseModel):
    address_id: int
    coupon_code: str | None = None
    payment_id: str
    order_id: str
    amount: float
    signature: str

# ✅ Route to place order after payment verification
@router.post("/place-order")
def place_order(
    order_request: PlaceOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        print("📦 Incoming Order Request:", order_request.dict())
        print(f"📥 Received Order Request Dict: {order_request.dict()}")  # ✅ Check this log

        # ✅ Verify payment signature
        is_verified = verify_payment_signature(
            order_request.order_id,
            order_request.payment_id,
            order_request.signature
        )

        if not is_verified:
            print("❌ Payment verification failed!")
            raise HTTPException(status_code=400, detail="❌ Payment verification failed.")

        print("✅ Payment verified successfully!")

        # ✅ Create order in the database
        order = Order(
            user_id=current_user.id,
            address_id=order_request.address_id,
            total_amount=order_request.amount,
            razorpay_order_id=order_request.order_id,
            payment_id=order_request.payment_id,
            status="PLACED"
        )
        db.add(order)
        db.commit()
        db.refresh(order)

        print(f"✅ Order placed with ID: {order.id}")

        return {"message": "✅ Order placed successfully!", "order_id": order.id}

    except HTTPException as http_err:
        raise http_err

    except Exception as e:
        db.rollback()
        print(f"❌ Error placing order: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# 📦 User Order History
@router.get("/user", response_model=list[OrderResponse], summary="User order history")
def user_order_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found.")
    return orders

# 📋 NGO: View Orders
@router.get("/ngo", response_model=list[OrderResponse], summary="NGO: View received orders")
def ngo_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can access this resource.")
    orders = db.query(Order).join(OrderItem).filter(OrderItem.ngo_id == current_user.id).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders received.")
    return orders

# 🔄 NGO: Update Order Status
@router.put("/ngo/{order_id}/update-status", summary="NGO: Update order status")
def update_order_status(
    order_id: int,
    status_request: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can update order statuses.")

    order_item = db.query(OrderItem).filter(OrderItem.order_id == order_id, OrderItem.ngo_id == current_user.id).first()
    if not order_item:
        raise HTTPException(status_code=404, detail="Order item not found for your NGO.")

    order_item.status = status_request.status
    db.commit()
    return {"message": "✅ Order status updated successfully."}

# 📄 User: Get Order Details
@router.get("/{order_id}", response_model=OrderResponse, summary="Get detailed order information")
def get_order_details(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order
