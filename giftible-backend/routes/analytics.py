from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from database import get_db
from models import Order, Product, Payout, UniversalUser, OrderItem, Category, NGO
from .auth import get_current_user  



router = APIRouter(prefix="/analytics", tags=["Analytics"])

# ✅ Get NGO Analytics Data (Without Schema)
@router.get("/ngo")
def get_ngo_analytics(
    current_user: UniversalUser = Depends(get_current_user),  
    db: Session = Depends(get_db)
):
    """Fetches all analytics data for an NGO in a single API response (Raw JSON)."""
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Access forbidden. Only NGOs can view analytics.")

    # 📦 Orders Per Month (Using OrderItem → Product → UniversalUser)
    orders_per_month = (
        db.query(
            func.date_format(Order.created_at, "%Y-%m").label("month"),
            OrderItem.status.label("status"),
            func.count(Order.id).label("count")
        )
        .join(OrderItem, Order.id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.universal_user_id == current_user.id)
        .group_by(func.date_format(Order.created_at, "%Y-%m"), OrderItem.status)
        .all()
    )

    # ✅ Organizing data to include all order statuses, including cancelled
    orders_data = {}
    for month, status, count in orders_per_month:
        month = str(month)
        if month not in orders_data:
            orders_data[month] = {"total_orders": 0, "cancelled_orders": 0}

        orders_data[month]["total_orders"] += int(count)
        
        if status.lower() == "cancelled":  # ✅ Count cancelled orders separately
            orders_data[month]["cancelled_orders"] = int(count)

    # ✅ Convert dictionary to list
    orders_data = [
        {"month": month, "total_orders": data["total_orders"], "cancelled_orders": data["cancelled_orders"]}
        for month, data in orders_data.items()
    ]


    # 📉 Stock Trends (Products per Month)
    stock_trends = (
        db.query(
            func.date_format(Product.created_at, "%Y-%m").label("month"),
            Product.name.label("product_name"),
            func.sum(Product.stock).label("stock")
        )
        .filter(
            Product.universal_user_id == current_user.id,  # ✅ Filter by NGO's Products
            Product.is_approved == True,  # ✅ Only Approved Products
            Product.is_live == True  # ✅ Only Live Products
        )
        .group_by(func.date_format(Product.created_at, "%Y-%m"), Product.name)  # ✅ Group by Month & Product Name
        .all()
    )

    # ✅ Convert results into structured format
    stock_data = [
        {"month": str(month), "product_name": str(product_name), "stock": int(stock)}
        for month, product_name, stock in stock_trends
    ]



    # 📊 Products Per Category
    category_stats = (
        db.query(Category.name.label("category_name"), func.count(Product.id).label("product_count"))
        .join(Product, Product.category_id == Category.id)  # ✅ Join Category Table
        .filter(Product.universal_user_id == current_user.id)  # ✅ Filter by NGO's Products
        .group_by(Category.name)  # ✅ Group by Category Name
        .all()
    )

    # ✅ Convert results into structured format
    category_data = [
        {"category_name": str(category_name), "product_count": int(product_count)}
        for category_name, product_count in category_stats
    ]


    # 🛒 Top 5 Best-Selling Products (Using OrderItem)
    top_selling_products = (
        db.query(Product.name, func.count(OrderItem.id))
        .join(OrderItem, OrderItem.product_id == Product.id)  # ✅ Join OrderItem
        .filter(Product.universal_user_id == current_user.id)  # ✅ Filter by NGO's Products
        .filter(OrderItem.status != "Cancelled")  # 🚀 Exclude Cancelled Orders
        .group_by(Product.id)
        .order_by(func.count(OrderItem.id).desc())
        .limit(5)
        .all()
    )

    # ✅ Convert results into structured format
    top_products_data = [{"name": str(name), "sales": int(sales)} for name, sales in top_selling_products]


    
    # ✅ Revenue Growth (Total Sales Per Month)
    revenue_growth = (
        db.query(
            func.date_format(Order.created_at, "%Y-%m").label("month"),
            func.sum(OrderItem.price * OrderItem.quantity).label("revenue")
        )
        .join(Product, Product.id == OrderItem.product_id)  # ✅ Join OrderItem with Product
        .join(Order, Order.id == OrderItem.order_id)  # ✅ Join OrderItem with Order
        .filter(Product.universal_user_id == current_user.id)  # ✅ Ensure products belong to the NGO
        .filter(Order.payment_id.isnot(None))  # ✅ Ensure only paid orders
        .filter(OrderItem.status != "Cancelled")  # ✅ Exclude cancelled order items
        .group_by(func.date_format(Order.created_at, "%Y-%m"))  # ✅ Group by month
        .all()
    )

    revenue_data = [{"month": str(month), "revenue": float(revenue)} for month, revenue in revenue_growth]


    # 📌 Order Status Distribution (Using OrderItem)
    order_status_distribution = (
        db.query(OrderItem.status, func.count(OrderItem.id))
        .join(Product, OrderItem.product_id == Product.id)  
        .filter(Product.universal_user_id == current_user.id)  
        .group_by(OrderItem.status)
        .all()
    )
    order_status_data = [{"status": str(status), "count": int(count)} for status, count in order_status_distribution]

    # 💸 Payout Trends (Using correct date format)
    # ✅ Payout Trends (Using Only Completed Payouts & Remaining Payout Calculation)
    payout_trends = (
        db.query(
            func.date_format(Payout.created_at, "%Y-%m").label("month"),
            func.sum(Payout.amount).label("completed_payout")
        )
        .filter(Payout.universal_user_id == current_user.id)  # ✅ Ensure payouts belong to the NGO
        .filter(Payout.status == "Completed")  # ✅ Only include completed payouts
        .group_by(func.date_format(Payout.created_at, "%Y-%m"))  # ✅ Group by month
        .all()
    )

    payout_data = [{"month": str(month), "payout": float(payout)} for month, payout in payout_trends]

    return {
        "orders_per_month": orders_data,
        "stock_trends": stock_data,
        "products_per_category": category_data,
        "top_selling_products": top_products_data,
        "revenue_growth": revenue_data,
        "order_status_distribution": order_status_data,
        "payout_trends": payout_data
    }




# ✅ Get Admin Analytics Data
@router.get("/admin")
def get_admin_analytics(
    current_user: UniversalUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches all analytics data for Admin in a single API response."""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden. Only Admins can view analytics.")

    # 🔢 **Total Count Statistics**
    total_users = db.query(func.count(UniversalUser.id)).filter(UniversalUser.role == "user").scalar()
    total_ngos = db.query(func.count(UniversalUser.id)).filter(UniversalUser.role == "ngo").scalar()
    total_products = db.query(func.count(Product.id)).scalar()
    total_orders = db.query(func.count(OrderItem.id)).scalar()

    # 🟢 **Order Status Distribution (Pie Chart)**
    order_status_distribution = (
        db.query(OrderItem.status, func.count(OrderItem.id))
        .group_by(OrderItem.status)
        .all()
    )
    order_status_data = [{"status": str(status), "count": int(count)} for status, count in order_status_distribution]

    # 📈 **Monthly Revenue Growth (Line Chart)**
    # ✅ Calculate Total Revenue Growth Over Time
    revenue_growth = (
        db.query(
            func.date_format(Order.created_at, "%Y-%m").label("month"),
            (
                func.sum(Order.total_amount) - 
                func.coalesce(
                    db.query(func.sum(OrderItem.price * OrderItem.quantity))
                    .join(Order, Order.id == OrderItem.order_id)  # ✅ Ensure proper join
                    .filter(Order.payment_id.isnot(None))  # ✅ Exclude unpaid orders
                    .filter(OrderItem.status == "Cancelled")  # ✅ Exclude cancelled items
                    .filter(func.date_format(Order.created_at, "%Y-%m") == func.date_format(OrderItem.created_at, "%Y-%m"))  # ✅ Month-wise cancellation filter
                    .scalar_subquery(),
                    0
                )
            ).label("adjusted_revenue")
        )
        .filter(Order.payment_id.isnot(None))  # ✅ Exclude unpaid orders
        .group_by(func.date_format(Order.created_at, "%Y-%m"))
        .all()
    )

    # ✅ Convert to structured format
    revenue_data = [
        {"month": str(month), "revenue": float(adjusted_revenue)}
        for month, adjusted_revenue in revenue_growth
    ]





    # 🛒 **Top 5 Best-Selling Products (Horizontal Bar Chart)**
    top_selling_products = (
        db.query(Product.name, func.count(OrderItem.id))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .filter(OrderItem.status != "Cancelled")  # Exclude cancelled orders
        .group_by(Product.id)
        .order_by(func.count(OrderItem.id).desc())
        .limit(5)
        .all()
    )
    top_products_data = [{"name": str(name), "sales": int(sales)} for name, sales in top_selling_products]

    # 🏷️ **Category-wise Product Count (Vertical Bar Chart)**
    category_stats = (
        db.query(Category.name, func.count(Product.id))
        .join(Product, Product.category_id == Category.id)
        .group_by(Category.id)
        .all()
    )
    category_data = [{"category_name": str(name), "product_count": int(count)} for name, count in category_stats]

    # 💸 **Payout Trends (Line Chart)**
    payout_trends = (
        db.query(func.date_format(Payout.created_at, "%Y-%m"), func.sum(Payout.amount))
        .filter(Payout.status == "Completed")  # Only completed payouts
        .group_by(func.date_format(Payout.created_at, "%Y-%m"))
        .all()
    )
    payout_data = [{"month": str(month), "payout": float(payout)} for month, payout in payout_trends]

    # 🔴 **Remaining Payouts (Donut Chart)**
    remaining_payouts = (
        db.query(Payout.status, func.sum(Payout.amount))
        .filter(Payout.status.in_(["Pending", "Rejected"]))  # Only Pending & Rejected payouts
        .group_by(Payout.status)
        .all()
    )
    remaining_payout_data = [{"status": str(status), "amount": float(amount)} for status, amount in remaining_payouts]

    return {
        "total_users": total_users,
        "total_ngos": total_ngos,
        "total_products": total_products,
        "total_orders": total_orders,
        "order_status_distribution": order_status_data,
        "revenue_growth": revenue_data,
        "top_selling_products": top_products_data,
        "category_distribution": category_data,
        "payout_trends": payout_data,
        "remaining_payouts": remaining_payout_data
    }
