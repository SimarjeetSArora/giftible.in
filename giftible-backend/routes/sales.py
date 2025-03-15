from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Order, OrderItem, NGO, UniversalUser, Product, ProductImage, Payout, Category
from schemas import OrderResponse, ProductResponse, ImageResponse
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.sql.expression import func
from .auth import get_current_user  # Assuming you have an authentication dependency



router = APIRouter(prefix="/sales", tags=["Sales"])


# ✅ 1. Get Total Sales for Admin
@router.get("/total", response_model=float)
def get_total_sales(
    current_user: UniversalUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # ✅ Restrict access to only NGOs and Admins
    if current_user.role not in ["admin", "ngo"]:
        raise HTTPException(status_code=403, detail="Access denied. Only NGOs and Admins can access this.")

    # ✅ Ensure total_sales is always a float (default 0.0)
    total_sales = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.payment_id.isnot(None))
        .scalar()
    )
    total_sales = float(total_sales) if total_sales is not None else 0.0  # ✅ Fix here

    # ✅ Ensure cancelled_items_total is always a float (default 0.0)
    cancelled_items_total = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.payment_id.isnot(None), OrderItem.status == "Cancelled")
        .scalar()
    )
    cancelled_items_total = float(cancelled_items_total) if cancelled_items_total is not None else 0.0  # ✅ Fix here

    # ✅ Subtract cancelled order items from total sales (but keep platform fees)
    adjusted_sales = total_sales - cancelled_items_total

    return adjusted_sales




# ✅ 2. Get Sales Per NGO
@router.get("/ngo/{universal_user_id}", response_model=float)
def get_ngo_sales(
    universal_user_id: int,
    current_user: UniversalUser = Depends(get_current_user),  # ✅ Ensure authenticated user
    db: Session = Depends(get_db)
):
    # ✅ Check if the current user is authorized (Only Admin & NGO)
    if current_user.role not in ["admin", "ngo"]:
        raise HTTPException(status_code=403, detail="Access denied. Only NGOs and Admins can access this.")

    # ✅ Check if the provided user is an NGO
    user = db.query(UniversalUser).filter(UniversalUser.id == universal_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if user.role != "ngo":
        raise HTTPException(status_code=400, detail="The provided ID does not belong to an NGO.")

    # ✅ Calculate total sales excluding cancelled orders
    total_sales = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Order, Order.id == OrderItem.order_id)
        .join(Product, Product.id == OrderItem.product_id)  # ✅ Fix: Join `Product` instead of `NGO`
        .join(UniversalUser, UniversalUser.id == Product.universal_user_id)
        .filter(
            UniversalUser.id == universal_user_id,
            UniversalUser.role == "ngo",
            Order.payment_id.isnot(None),
            OrderItem.status != "Cancelled"
        )
        .scalar() or 0
    )

    
    return total_sales





# ✅ 3. Get Sales Per Product
@router.get("/product/{product_id}", response_model=float)
def get_product_sales(
    product_id: int,
    current_user: UniversalUser = Depends(get_current_user),  # ✅ Ensure authenticated user
    db: Session = Depends(get_db)
):
    # ✅ Restrict access to only Admins and NGOs
    if current_user.role not in ["admin", "ngo"]:
        raise HTTPException(status_code=403, detail="Access denied. Only NGOs and Admins can access this.")

    # ✅ Calculate total sales excluding cancelled orders
    total_sales = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Order, Order.id == OrderItem.order_id)
        .filter(
            OrderItem.product_id == product_id,
            OrderItem.status != "Cancelled",  # ✅ Exclude cancelled orders
            Order.payment_id.isnot(None)  # ✅ Ensure the order was paid
        )
        .scalar()
    )

    # ✅ Ensure it returns a valid float (default 0.0 if None)
    return float(total_sales) if total_sales is not None else 0.0



# ✅ 4. Get Sales in a Date Range
@router.get("/date-range", response_model=List[ProductResponse])
def get_sales_in_date_range(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    ngo_id: Optional[int] = None,
    category_id: Optional[int] = None,
    search_query: Optional[str] = Query(None, description="Search for products by name"),
    current_user: UniversalUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # ✅ Restrict access to only Admins and NGOs
    if current_user.role not in ["admin", "ngo"]:
        raise HTTPException(status_code=403, detail="Access denied. Only NGOs and Admins can access this.")

    # ✅ Parse start_date and end_date from string (Default: 1970-01-01 to Today)
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime(1970, 1, 1)
        end_date = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.utcnow()
        end_date = end_date.replace(hour=23, minute=59, second=59)  # Ensure full-day inclusion
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # ✅ Ensure start_date is before end_date
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date.")

    # ✅ Base query to calculate product-wise sales
    query = (
        db.query(
            Product.id,
            Product.name,
            Product.price,
            Product.description,
            NGO.ngo_name,  # ✅ Include NGO Name
            Product.category_id,  # ✅ Include Category ID
            Category.name.label("category_name"),  # ✅ Include Category Name
            func.sum(OrderItem.price * OrderItem.quantity).label("total_sales")
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .join(NGO, NGO.universal_user_id == Product.universal_user_id)
        .join(Category, Category.id == Product.category_id, isouter=True)  # ✅ Join Category (Optional)
        .filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.payment_id.isnot(None),
            OrderItem.status != "Cancelled"
        )
        .group_by(Product.id, Product.name, Product.price, Product.description, NGO.ngo_name, Product.category_id, Category.name)
    )

    # ✅ If NGO is logged in, filter only their products
    if current_user.role == "ngo":
        query = query.filter(Product.universal_user_id == current_user.id)

    # ✅ If admin provides ngo_id, filter by that NGO
    if ngo_id and current_user.role == "admin":
        query = query.filter(Product.universal_user_id == ngo_id)

    # ✅ Filter by category_id if provided
    if category_id:
        query = query.filter(Product.category_id == category_id)

    # ✅ Search filter for product name
    if search_query:
        query = query.filter(Product.name.ilike(f"%{search_query}%"))

    # ✅ Apply pagination
    results = (
        query.order_by(func.sum(OrderItem.price * OrderItem.quantity).desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    # ✅ Convert query results into response model format
    product_sales = [
        ProductResponse(
            id=row[0],
            name=row[1],
            price=float(row[2]) if row[2] is not None else 0.0,
            description=row[3],  # ✅ Include product description
            ngo_name=row[4],  # ✅ Include NGO name
            category_id=row[5],  # ✅ Include Category ID
            category_name=row[6],  # ✅ Include Category Name
            images=[
                ImageResponse(id=img.id, image_url=img.image_url)
                for img in db.query(ProductImage).filter(ProductImage.product_id == row[0]).all()
            ],  # ✅ Retrieve images
            total_sales=float(row[7]) if row[7] is not None else 0.0  # ✅ Retrieve total sales
        )
        for row in results
    ]

    return product_sales







# ✅ 5. Get Pending Payouts Per NGO
@router.get("/pending-payouts/{universal_user_id}", response_model=float)
def get_pending_payouts(
    universal_user_id: int, 
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)  # ✅ Ensure user is logged in
):
    # ✅ Restrict access: Only Admins & NGOs can access this route
    if current_user.role not in ["admin", "ngo"]:
        raise HTTPException(status_code=403, detail="Access denied. Only Admins and NGOs can view pending payouts.")

    # ✅ Admins can access all payouts, but NGOs can only see their own
    if current_user.role == "ngo" and current_user.id != universal_user_id:
        raise HTTPException(status_code=403, detail="NGOs can only access their own payout details.")

    # ✅ Check if the NGO exists before querying for sales
    ngo_exists = db.query(UniversalUser).filter(UniversalUser.id == universal_user_id, UniversalUser.role == "ngo").first()
    if not ngo_exists:
        raise HTTPException(status_code=404, detail="NGO not found.")

    # ✅ Calculate total sales for the NGO, excluding cancelled orders
    total_sales = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Order, Order.id == OrderItem.order_id)
        .join(Product, Product.id == OrderItem.product_id)  # ✅ Join Products table
        .filter(
            Product.universal_user_id == universal_user_id,  # ✅ Fetch NGO using universal_user_id
            Order.payment_id.isnot(None),  # ✅ Ensure order was paid
            OrderItem.status != "Cancelled"  # ✅ Exclude cancelled orders
        )
        .scalar()
        or 0.0
    )

    # ✅ Calculate total amount already paid to the NGO
    total_paid = (
        db.query(func.sum(Payout.amount))
        .filter(Payout.universal_user_id == universal_user_id, Payout.status == "Completed")  # ✅ Fixed Column Name
        .scalar()
        or 0.0
    )

    # ✅ Calculate pending payout (Ensure it does not return negative values)
    pending_payout = max(total_sales - total_paid, 0.0)

    return pending_payout
