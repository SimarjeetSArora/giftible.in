import os
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Order, OrderItem, Cart, CartItem, UniversalUser, Product, ProductImage, NGO
from schemas import OrderResponse, UpdateOrderItemStatusRequest, OrderItemResponse, OrderStatus, CancelOrderItemRequest, ProductResponse
from fastapi.security import OAuth2PasswordBearer
from services.razorpay_client import verify_payment_signature
from pydantic import BaseModel
from dotenv import load_dotenv
from jose import JWTError
from sqlalchemy.sql import func
from typing import Optional



router = APIRouter(prefix="/orders", tags=["Orders"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"

# 🔑 Utility: Get current user from token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UniversalUser:
    try:
        if not token:
            raise HTTPException(status_code=401, detail="Token not provided.")

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")

        if not user_id or not role:
            raise HTTPException(status_code=401, detail="Invalid token payload.")

        user = db.query(UniversalUser).filter(UniversalUser.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

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




@router.get("/ngo", response_model=dict, summary="Admin/NGO: View received orders with filters & pagination")
def view_orders(
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
    page: int = Query(1, description="Page number"),
    page_size: int = Query(10, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search by product name or order ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter by order item status")
):
    """✅ Admins can view all order items with NGO names, while NGOs can only view their own order items."""

    if current_user.role not in ["admin", "ngo"]:
        raise HTTPException(status_code=403, detail="Unauthorized access.")

    # ✅ Base query for order items
    query = db.query(OrderItem).join(Order, OrderItem.order_id == Order.id).join(Product, OrderItem.product_id == Product.id)

    # ✅ Restrict NGOs to only their order items
    if current_user.role == "ngo":
        query = query.filter(Product.universal_user_id == current_user.id)
    else:
        # ✅ Admins can view all order items + fetch NGO name
        query = query.join(UniversalUser, UniversalUser.id == Product.universal_user_id)

    # 🔍 Apply search filter (by product name or order ID)
    if search:
        query = query.filter((Order.id.ilike(f"%{search}%")) | (Product.name.ilike(f"%{search}%")))

    # 📅 Apply date range filter
    if start_date:
        query = query.filter(Order.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
    
    if end_date:
        # ✅ Convert end_date to datetime and set time to 23:59:59
        end_datetime = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(hours=23, minutes=59, seconds=59)
        query = query.filter(Order.created_at <= end_datetime)

    # 🏷️ Apply status filter properly at the order item level
    if status:
        query = query.filter(OrderItem.status == status)

    # 📌 Pagination
    total_order_items = query.distinct().count()
    order_items = query.distinct().offset((page - 1) * page_size).limit(page_size).all()

    if not order_items:
        raise HTTPException(status_code=404, detail="No order items found with given filters.")

    # ✅ Process order items based on role
    filtered_order_items = []
    for item in order_items:
        order_item_data = {
            "id": item.id,
            "order_id": item.order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": item.price,
            "status": item.status,
            "cancellation_reason": item.cancellation_reason,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
            "product": {
                "id": item.product.id,
                "name": item.product.name,
                "price": item.product.price,
                "description": item.product.description,
            }
        }

        # ✅ Add NGO Name for Admins
        if current_user.role == "admin":
          ngo_name = (
            db.query(NGO.ngo_name)
            .join(Product, Product.universal_user_id == NGO.universal_user_id)  # ✅ Correct Join Condition
            .filter(Product.id == item.product_id)  # ✅ Get NGO Based on OrderItem's Product ID
            .scalar()  # ✅ Return a Single Value Instead of an SQLAlchemy Row
          )
          order_item_data["ngo_name"] = ngo_name if ngo_name else "N/A"  # ✅ Default to "N/A" if no NGO found


        filtered_order_items.append(order_item_data)

    # ✅ Fetch products matching the applied filters
    product_query = db.query(Product)
    
    # Restrict products based on NGO access
    if current_user.role == "ngo":
        product_query = product_query.filter(Product.universal_user_id == current_user.id)

    # Apply search filter for products
    if search:
        product_query = product_query.filter(Product.name.ilike(f"%{search}%"))

    # Fetch distinct filtered products
    products = product_query.distinct().all()
    filtered_products = [
        {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "description": product.description,
        }
        for product in products
    ]

    return {
        "total_order_items": total_order_items,
        "current_page": page,
        "page_size": page_size,
        "total_pages": (total_order_items + page_size - 1) // page_size,
        "order_items": filtered_order_items,
        "products": filtered_products
    }






# 🔄 NGO: Update Order Status (Modified to fetch NGO dynamically from product owner)
@router.put("/ngo/order-item/{order_item_id}/update-status", summary="NGO: Update individual order item status")
def update_order_item_status(
    order_item_id: int,
    status_request: UpdateOrderItemStatusRequest,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can update order item statuses.")

    # ✅ Fetch the specific order item that belongs to the NGO's products
    order_item = (
        db.query(OrderItem)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(OrderItem.id == order_item_id, Product.universal_user_id == current_user.id)
        .first()
    )

    if not order_item:
        raise HTTPException(status_code=404, detail="Order item not found for your NGO.")

    # ✅ Validate if the new status is a valid enum value
    try:
        new_status = OrderStatus(status_request.status)  # Convert to lowercase for consistency
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order status provided.")

    # ✅ Update status for the specific order item
    order_item.status = new_status.value  # Store the string value from the Enum
    order_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order_item)

    return {"message": f"✅ Order item {order_item_id} status updated to {new_status.value}."}




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
            "cancellation_reason": item.cancellation_reason,  # ✅ Include reason
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


@router.put("/cancel/{order_item_id}", summary="User/NGO: Cancel an order item with reason")
def cancel_order_item(
    order_item_id: int,
    cancel_request: CancelOrderItemRequest,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    # ✅ Fetch the order item
    order_item = db.query(OrderItem).filter(OrderItem.id == order_item_id).first()

    if not order_item:
        raise HTTPException(status_code=404, detail="Order item not found.")

    # ✅ Restrict Users: Cannot cancel after "Shipped" or "Delivered"
    if current_user.role == "user":
        if order_item.status in [OrderStatus.shipped.value, OrderStatus.delivered.value]:
            raise HTTPException(status_code=400, detail="Users cannot cancel an order after it is shipped or delivered.")

    # ✅ Restrict NGOs: Cannot cancel after "Delivered"
    if current_user.role == "ngo":
        if order_item.status == OrderStatus.delivered.value:
            raise HTTPException(status_code=400, detail="NGOs cannot cancel an order after it is delivered.")

        # ✅ NGO can only cancel its own products
        product = db.query(Product).filter(Product.id == order_item.product_id, Product.universal_user_id == current_user.id).first()
        if not product:
            raise HTTPException(status_code=403, detail="You can only cancel your own products.")

    # ✅ Update order item status & store cancellation reason
    order_item.status = OrderStatus.cancelled.value
    order_item.cancellation_reason = cancel_request.reason
    order_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order_item)

    return {
        "message": "✅ Order item cancelled successfully.",
        "order_item_id": order_item_id,
        "reason": cancel_request.reason
    }
