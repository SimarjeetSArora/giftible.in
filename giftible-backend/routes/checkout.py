import os
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Address, Coupon, Cart, CartItem, CouponUsage, UniversalUser
from schemas import AddressCreate, CouponApply, CouponCreate, CouponResponse, CouponToggle
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from jose import JWTError
from .utils import SECRET_KEY, ALGORITHM
from typing import Optional

router = APIRouter(prefix="/checkout", tags=["Checkout"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

load_dotenv()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UniversalUser:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = db.query(UniversalUser).filter(UniversalUser.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError as e:
        print("JWT Error:", e)  # Log the actual error
        raise HTTPException(status_code=401, detail="Invalid token.")


# ✅ Calculate Discount (Max Cap Applied)
def calculate_discount(coupon: Coupon, order_amount: float) -> float:
    potential_discount = (coupon.discount_percentage / 100) * order_amount
    return min(potential_discount, coupon.max_discount)

# ✅ Apply Coupon During Checkout
@router.post("/apply-coupon", summary="User: Apply a coupon during checkout")
def apply_coupon(
    coupon: CouponApply,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    coupon_entry = db.query(Coupon).filter(Coupon.code == coupon.code, Coupon.is_active == True).first()

    if not coupon_entry:
        raise HTTPException(status_code=404, detail="Invalid or inactive coupon code")

    cart = db.query(Cart).filter(Cart.universal_user_id == current_user.id).first()
    if not cart or not cart.cart_items:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    total = sum(item.product.price * item.quantity for item in cart.cart_items)
    if total < coupon_entry.minimum_order_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order amount is ₹{coupon_entry.minimum_order_amount}"
        )

    discount = calculate_discount(coupon_entry, total)  
    return {
        "message": "Coupon applied successfully",
        "discount_percentage": coupon_entry.discount_percentage,
        "discount": discount,
        "max_discount": coupon_entry.max_discount
    }

# ✅ Fetch Cart Summary with Coupon
@router.get("/cart-summary", summary="User: Get cart summary with applied coupon")
def get_cart_summary(
    coupon_code: Optional[str] = None,  # ✅ Optional coupon code
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    # ✅ Fetch the user's cart
    cart = db.query(Cart).filter(Cart.universal_user_id == current_user.id).first()
    if not cart or not cart.cart_items:
        raise HTTPException(status_code=404, detail="Cart is empty or not found")

    # ✅ Calculate the total price of items in the cart
    total = sum(item.product.price * item.quantity for item in cart.cart_items)

    # ✅ Initialize discount to 0
    discount = 0

    # ✅ Check if a valid coupon is applied
    if coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == coupon_code, Coupon.is_active == True).first()

        # ✅ Apply discount only if the coupon exists and meets the minimum order amount
        if coupon and total >= coupon.minimum_order_amount:
            discount = calculate_discount(coupon, total)
        else:
            discount = 0  # Coupon invalid or does not meet the minimum order amount

    # ✅ Ensure final total is not negative
    final_total = max(total - discount, 0)

    return {
        "total": total,
        "discount": discount,
        "final_total": final_total  # Ensures final amount is never negative
    }


# ✅ Admin: Create a Coupon
@router.post("/create-coupon", summary="Admin: Create a new coupon")
def create_coupon(
    coupon: CouponCreate,
    db: Session = Depends(get_db),
    current_admin: UniversalUser = Depends(get_current_user)
):
    if db.query(Coupon).filter(Coupon.code == coupon.code).first():
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    new_coupon = Coupon(
        code=coupon.code,
        discount_percentage=coupon.discount_percentage,
        max_discount=coupon.max_discount, 
        usage_limit=coupon.usage_limit,
        minimum_order_amount=coupon.minimum_order_amount,
        is_active=coupon.is_active
    )

    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return {"message": "Coupon created successfully", "coupon": new_coupon}

# ✅ Admin: View All Coupons
@router.get("/coupons", summary="Admin: View all coupons")
def get_all_coupons(db: Session = Depends(get_db), current_admin: UniversalUser = Depends(get_current_user)):
    return db.query(Coupon).all()

# ✅ Check Coupon Eligibility (Prevent Multiple Uses)
def check_coupon_eligibility(db: Session, coupon: Coupon, user: UniversalUser):
    usage = db.query(CouponUsage).filter(CouponUsage.universal_user_id == user.id, CouponUsage.coupon_id == coupon.id).first()

    if coupon.usage_limit == "one_time" and usage:
        raise HTTPException(status_code=400, detail="Coupon can be used only once per user.")

    if coupon.usage_limit == "one_per_day" and usage and (datetime.utcnow() - usage.used_at) < timedelta(days=1):
        raise HTTPException(status_code=400, detail="Coupon can be used only once in 24 hours.")

# ✅ Apply Coupon and Track Usage
def apply_coupon_usage(coupon: Coupon, user: UniversalUser, db: Session):
    check_coupon_eligibility(db, coupon, user)

    usage = CouponUsage(universal_user_id=user.id, coupon_id=coupon.id)
    db.add(usage)
    db.commit()

# ✅ Fetch Live Coupons (For Users)
@router.get("/coupons/live", response_model=list[CouponResponse], summary="Fetch all active coupons")
def get_live_coupons(db: Session = Depends(get_db)):
    coupons = db.query(Coupon).filter(Coupon.is_active == True).all()
    return coupons

# 🔄 API to Toggle Coupon Status
@router.patch("/toggle-coupon-status/{coupon_id}", summary="Admin: Toggle coupon live/unlive status")
def toggle_coupon_status(
    coupon_id: int,
    toggle_data: CouponToggle,
    db: Session = Depends(get_db),
    current_admin: UniversalUser = Depends(get_current_user),
):
    """Toggle a coupon's active (live/unlive) status."""
    
    # ✅ Check if coupon exists
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    # ✅ Update is_active status
    coupon.is_active = toggle_data.is_active

    db.commit()
    db.refresh(coupon)

    return {"message": f"Coupon '{coupon.code}' {'activated' if coupon.is_active else 'deactivated'} successfully", "coupon": coupon}