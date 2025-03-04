from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Address, Coupon, Cart, CartItem, User, CouponUsage, Admin, UniversalUser
from schemas import AddressCreate, CouponApply, CouponCreate, CouponResponse
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv


router = APIRouter(prefix="/checkout", tags=["Checkout"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        if not token:
            raise HTTPException(status_code=401, detail="Token not provided.")

        # 🔎 Decode token and verify its signature
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        contact_number = payload.get("sub")

        if not contact_number:
            raise HTTPException(status_code=401, detail="Invalid token payload. Missing 'sub' field.")

        # ✅ Query UniversalUser table (as per your universal user structure)
        user = db.query(UniversalUser).filter(UniversalUser.contact_number == contact_number).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        return user

    except JWTError as e:
        print(f"JWT Error: {e}")  # 🐛 Debug JWT issues
        raise HTTPException(status_code=401, detail="Invalid or expired token.")


def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        print(f"Received Token: {token}")  # 🔎 Debug token

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        contact_number = payload.get("sub")

        print(f"Decoded Payload: {payload}")  # ✅ Check payload content

        if not role or not contact_number:
            raise HTTPException(status_code=401, detail="Token missing required fields.")

        if role != "admin":
            raise HTTPException(status_code=403, detail="Only admins can access this resource.")

        admin = db.query(Admin).filter(Admin.contact_number == contact_number).first()
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")

        return admin

    except JWTError as e:
        print(f"JWTError: {e}")  # 🐛 Debug JWT issues
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

# 🏠 Address Management

@router.post("/address", summary="User: Add a new address")
def add_address(address: AddressCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_address = Address(user_id=current_user.id, **address.dict())
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return {"message": "Address added successfully", "address": new_address}


@router.get("/addresses", summary="User: Get saved addresses")
def get_addresses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    addresses = db.query(Address).filter(Address.user_id == current_user.id).all()
    return addresses


# 🎟️ Coupon Application

def calculate_discount(coupon: Coupon, order_amount: float):
    potential_discount = (coupon.discount_percentage / 100) * order_amount
    return min(potential_discount, coupon.max_discount)  # ✅ Apply max_discount cap



@router.post("/apply-coupon", summary="User: Apply a coupon during checkout")
def apply_coupon(
    coupon: CouponApply,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    coupon_entry = db.query(Coupon).filter(Coupon.code == coupon.code, Coupon.is_active == True).first()

    if not coupon_entry:
        raise HTTPException(status_code=404, detail="Invalid or inactive coupon code")

    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.cart_items:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    total = sum(item.product.price * item.quantity for item in cart.cart_items)
    if total < coupon_entry.minimum_order_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order amount is ₹{coupon_entry.minimum_order_amount}"
        )

    discount = calculate_discount(coupon_entry, total)  # ✅ Use capped discount
    return {
        "message": "Coupon applied successfully",
        "discount_percentage": coupon_entry.discount_percentage,
        "discount": discount,
        "max_discount": coupon_entry.max_discount
    }



@router.get("/cart-summary", summary="User: Get cart summary with applied coupon")
def get_cart_summary(
    coupon_code: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    total = sum(item.product.price * item.quantity for item in cart.cart_items)
    discount = 0

    if coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == coupon_code, Coupon.is_active == True).first()
        if coupon and total >= coupon.minimum_order_amount:
            discount = calculate_discount(coupon, total)  # ✅ Max discount applied

    return {
        "total": total,
        "discount": discount,
        "final_total": total - discount
    }



# 🛡️ Admin Coupon Management

@router.post("/create-coupon", summary="Admin: Create a new coupon")
def create_coupon(
    coupon: CouponCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    if db.query(Coupon).filter(Coupon.code == coupon.code).first():
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    new_coupon = Coupon(
        code=coupon.code,
        discount_percentage=coupon.discount_percentage,
        max_discount=coupon.max_discount,  # ✅ Added field
        usage_limit=coupon.usage_limit,
        minimum_order_amount=coupon.minimum_order_amount,
        is_active=coupon.is_active
    )

    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return {"message": "Coupon created successfully", "coupon": new_coupon}



@router.get("/coupons", summary="Admin: View all coupons")
def get_all_coupons(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    return db.query(Coupon).all()


def check_coupon_eligibility(db: Session, coupon: Coupon, user: User):
    usage = db.query(CouponUsage).filter(CouponUsage.user_id == user.id, CouponUsage.coupon_id == coupon.id).first()

    if coupon.usage_limit == "one_time" and usage:
        raise HTTPException(status_code=400, detail="Coupon can be used only once per user.")

    if coupon.usage_limit == "one_per_day" and usage and (datetime.utcnow() - usage.used_at) < timedelta(days=1):
        raise HTTPException(status_code=400, detail="Coupon can be used only once in 24 hours.")



def apply_coupon(coupon: Coupon, user: User, db: Session):
    check_coupon_eligibility(db, coupon, user)

    usage = CouponUsage(user_id=user.id, coupon_id=coupon.id)
    db.add(usage)
    db.commit()




@router.get("/coupons/live", response_model=list[CouponResponse], summary="Fetch all active coupons")
def get_live_coupons(db: Session = Depends(get_db)):
    coupons = db.query(Coupon).filter(Coupon.is_active == True).all()
    return coupons
