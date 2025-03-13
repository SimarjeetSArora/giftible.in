import os
import jwt
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Order, OrderItem, Cart, CartItem, UniversalUser, Product, ProductImage
from schemas import OrderResponse, UpdateOrderItemStatusRequest
from fastapi.security import OAuth2PasswordBearer
from services.razorpay_client import verify_payment_signature
from pydantic import BaseModel
from dotenv import load_dotenv
from jose import JWTError

router = APIRouter(prefix="/orders", tags=["Orders"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"

# 🔑 Utility: Get current user from token
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

# 📦 Define the expected request body for placing an order
class PlaceOrderRequest(BaseModel):
    address_id: int
    coupon_code: str | None = None
    payment_id: str
    order_id: str
    amount: float
    signature: str

# ✅ Route to place an order after payment verification
@router.post("/place-order", summary="User: Place an order after payment verification")
def place_order(
    order_request: PlaceOrderRequest,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    try:
        print(f"📦 Incoming Order Request: {order_request.dict()}")

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

        # ✅ Create a new order (No status field)
        order = Order(
            universal_user_id=current_user.id,
            address_id=order_request.address_id,
            total_amount=order_request.amount,
            razorpay_order_id=order_request.order_id,
            payment_id=order_request.payment_id
        )
        db.add(order)
        db.commit()
        db.refresh(order)

        # ✅ Fetch cart items and assign order items dynamically
        cart_items = db.query(CartItem).filter(CartItem.cart_id == current_user.id).all()

        for item in cart_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()

            if not product:
                raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")

            # ✅ Create OrderItem with status
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=product.price,
                status="Pending"
            )
            db.add(order_item)

        # ✅ Clear user's cart after order is placed
        db.query(CartItem).filter(CartItem.cart_id == current_user.id).delete()
        db.commit()

        print(f"✅ Order placed with ID: {order.id} | Cart cleared.")

        return {"message": "✅ Order placed successfully!", "order_id": order.id}

    except HTTPException as http_err:
        raise http_err

    except Exception as e:
        db.rollback()
        print(f"❌ Error placing order: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")



# 📦 Fetch user order history
@router.get("/user", response_model=list[OrderResponse], summary="User: Fetch order history")
def user_order_history(db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.universal_user_id == current_user.id).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found.")
    return orders

# 📋 NGO: View all received orders (Modified to get NGO dynamically from product owner)
@router.get("/ngo", response_model=list[OrderResponse], summary="NGO: View received orders")
def ngo_orders(db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can access this resource.")

    # ✅ Fetch orders where the NGO's products are involved
    orders = (
        db.query(Order)
        .join(OrderItem, Order.id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.universal_user_id == current_user.id)
        .all()
    )
    
    if not orders:
        raise HTTPException(status_code=404, detail="No orders received.")
    
    return orders

# 🔄 NGO: Update Order Status (Modified to fetch NGO dynamically from product owner)
@router.put("/ngo/{order_id}/update-status", summary="NGO: Update order status")
def update_order_status(
    order_id: int,
    status_request: UpdateOrderItemStatusRequest,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can update order statuses.")

    # ✅ Fetch order item where the product belongs to the current NGO
    order_item = (
        db.query(OrderItem)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(OrderItem.order_id == order_id, Product.universal_user_id == current_user.id)
        .first()
    )

    if not order_item:
        raise HTTPException(status_code=404, detail="Order item not found for your NGO.")

    order_item.status = status_request.status
    db.commit()
    return {"message": "✅ Order status updated successfully."}

# 📄 User: Get Order Details
@router.get("/{order_id}", response_model=OrderResponse, summary="User: Get detailed order information")
def get_order_details(order_id: int, db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    """Fetch detailed order information including order items and product details."""
    
    # ✅ Fetch Order for the current user
    order = db.query(Order).filter(Order.id == order_id, Order.universal_user_id == current_user.id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    # ✅ Fetch order items with associated products
    order_items = (
        db.query(OrderItem)
        .join(Product, Product.id == OrderItem.product_id)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    if not order_items:
        raise HTTPException(status_code=404, detail="No items found in this order.")

    # ✅ Fetch product images efficiently
    product_images_map = {}
    product_ids = [item.product_id for item in order_items]

    images = db.query(ProductImage).filter(ProductImage.product_id.in_(product_ids)).all()
    for img in images:
        if img.product_id not in product_images_map:
            product_images_map[img.product_id] = []
        product_images_map[img.product_id].append({"id": img.id, "image_url": img.image_url})

    # ✅ Construct Order Items Response (Now includes created_at & updated_at)
    order_items_response = [
        {
            "id": item.id,
            "order_id": item.order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": item.price,
            "status": item.status,
            "created_at": item.created_at,  # ✅ Added created_at field
            "updated_at": item.updated_at,  # ✅ Added updated_at field
            "product": {
                "id": item.product.id,
                "name": item.product.name,
                "description": item.product.description,
                "price": item.product.price,
                "images": product_images_map.get(item.product.id, [])  # ✅ Default to empty list if no images exist
            }
        }
        for item in order_items
    ]

    # ✅ Final Order Response
    return {
        "id": order.id,
        "universal_user_id": order.universal_user_id,
        "total_amount": order.total_amount,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "order_items": order_items_response  # ✅ Includes status in OrderItem instead of Order
    }
