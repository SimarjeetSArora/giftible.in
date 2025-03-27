from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, distinct, case
from datetime import datetime, timedelta
from models import UniversalUser, Product, Order, Category, Payout, OrderItem, NGO
from database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard"])

@router.get("/admin")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    # ✅ Only Admins can access this data
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Only Admins can access dashboard.")

    # ✅ Count total users
    total_users = db.query(func.count(UniversalUser.id)).filter(UniversalUser.role == "user").scalar()

    # ✅ Count total NGOs
    total_ngos = db.query(func.count(UniversalUser.id)).filter(UniversalUser.role == "ngo").scalar()

    # ✅ Count total products
    total_products = db.query(func.count(Product.id)).scalar()

    # ✅ Count total categories
    total_categories = db.query(func.count(Category.id)).scalar()

    # ✅ Count total orders
    total_orders = db.query(func.count(OrderItem.id)).scalar()

    # ✅ Count pending orders
    pending_orders = db.query(func.count(OrderItem.id)).filter(OrderItem.status == "Pending").scalar()

    # ✅ Count pending NGOs (awaiting approval) from NGOs table
    pending_ngos = db.query(func.count(NGO.id)).filter(NGO.is_approved == 0).scalar()


    # ✅ Count pending payouts
    pending_payouts = db.query(func.count(Payout.id)).filter(Payout.status == "Pending").scalar()

    # ✅ Count pending products from Products table where is_approved = 0
    pending_products = db.query(func.count(Product.id)).filter(Product.is_approved == 0).scalar()

    # ✅ Count pending Categories
    pending_categories = db.query(func.count(Category.id)).filter(Category.is_approved == 0).scalar()

    # ✅ Calculate total sales (sum of all completed orders)
    total_sales = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.payment_id.isnot(None))
        .scalar()
    )
    total_sales = float(total_sales) if total_sales is not None else 0.0

    # ✅ Calculate total cancelled order items
    cancelled_items_total = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.payment_id.isnot(None), OrderItem.status == "Cancelled")
        .scalar()
    )
    cancelled_items_total = float(cancelled_items_total) if cancelled_items_total is not None else 0.0

    # ✅ Calculate adjusted total sales (excluding cancelled items)
    adjusted_sales = total_sales - cancelled_items_total

    # ✅ Calculate total cost (sum of price of all non-cancelled items)
    total_cost = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.payment_id.isnot(None), OrderItem.status != "Cancelled")
        .scalar()
    )
    total_cost = float(total_cost) if total_cost is not None else 0.0

    # ✅ Calculate total profit (Adjusted Sales - Total Cost)
    total_profit = adjusted_sales - total_cost

    # ✅ Fetch Recent Orders (Last 5)
    recent_orders = (
        db.query(
            Order.id,
            Order.universal_user_id,
            UniversalUser.first_name,  # ✅ Fetch user's first name
            UniversalUser.last_name,   # ✅ Fetch user's last name
            Order.total_amount,
            Order.created_at
        )
        .join(UniversalUser, UniversalUser.id == Order.universal_user_id)  # ✅ Join to get user details
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )


    # ✅ Fetch Recently Approved NGOs (Last 5)
    recent_ngos = (
        db.query(
            UniversalUser.id,
            UniversalUser.first_name,
            UniversalUser.last_name,
            NGO.ngo_name,  # ✅ Fetch NGO Name
            NGO.created_at
        )
        .join(NGO, NGO.universal_user_id == UniversalUser.id)  # ✅ Join NGO Table
        .filter(
            UniversalUser.role == "ngo",  # ✅ Ensure user is an NGO
            NGO.is_approved == 1  # ✅ Fetch only approved NGOs
        )
        .order_by(NGO.created_at.desc())  # ✅ Show the most recent approvals first
        .limit(5)
        .all()
    )


    # ✅ Fetch Recent Payout Requests (Last 5)
    recent_payouts = (
        db.query(Payout.id, Payout.universal_user_id, Payout.amount, Payout.status, Payout.created_at)
        .order_by(Payout.created_at.desc())
        .limit(5)
        .all()
    )

    # ✅ Generate Monthly Sales Trends for the Last 6 Months

    # ✅ Get the date 6 months ago from today
    six_months_ago = datetime.utcnow() - timedelta(days=180)

    # ✅ Query total sales per month for the last 6 months, excluding cancelled items
    last_6_months_sales = (
        db.query(
            extract("month", Order.created_at).label("month"),
            func.sum(Order.total_amount - func.coalesce(
                db.query(func.sum(OrderItem.price * OrderItem.quantity))
                .filter(OrderItem.order_id == Order.id, OrderItem.status == "Cancelled")
                .scalar_subquery(), 0
            )).label("sales")  # ✅ Exclude cancelled items dynamically
        )
        .filter(Order.payment_id.isnot(None), Order.created_at >= six_months_ago)
        .group_by("month")
        .order_by("month")
        .all()
    )

    # ✅ Format data for frontend
    sales_trends = [{"month": month, "sales": float(sales) if sales is not None else 0.0} for month, sales in last_6_months_sales]


    # ✅ Get Top 5 NGOs by Sales
    top_ngos = (
        db.query(
            NGO.ngo_name,
            func.sum(
                OrderItem.price * OrderItem.quantity
            ).label("total_sales")
        )
        .join(Product, Product.universal_user_id == NGO.universal_user_id)
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(
            Order.payment_id.isnot(None),
            ~OrderItem.status.in_(["Cancelled"])  # ✅ Exclude Cancelled Items Properly
        )
        .group_by(NGO.ngo_name)
        .order_by(func.sum(OrderItem.price * OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    # ✅ Format Data for Frontend
    top_ngos_data = [{"ngo_name": name, "total_sales": float(sales) if sales is not None else 0.0} for name, sales in top_ngos]


    # ✅ Get Monthly Payout Trends (Last 6 Months)
    last_6_months_payouts = (
        db.query(
            extract("month", Payout.processed_at).label("month"),
            func.sum(Payout.amount).label("payouts")
        )
        .filter(Payout.status == "Completed")
        .group_by("month")
        .order_by("month")
        .all()
    )

    payout_trends = [{"month": month, "payouts": payouts} for month, payouts in last_6_months_payouts]

    # ✅ Get Top 5 Categories by Sales
    top_categories = (
        db.query(
            Category.name,
            func.sum(OrderItem.price * OrderItem.quantity).label("total_sales")
        )
        .join(Product, Product.category_id == Category.id)
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(
            Order.payment_id.isnot(None),
            ~OrderItem.status.in_(["Cancelled"])  # ✅ Exclude Cancelled Items Properly
        )
        .group_by(Category.name)
        .order_by(func.sum(OrderItem.price * OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    # ✅ Format Data for Frontend
    top_categories_data = [{"category_name": name, "total_sales": float(sales) if sales is not None else 0.0} for name, sales in top_categories]


    # ✅ Return Dashboard Metrics
    return {
        "total_users": total_users,
        "total_ngos": total_ngos,
        "total_products": total_products,
        "total_categories": total_categories,
        "total_orders": total_orders,
        "total_sales": adjusted_sales,
        "total_profit": total_profit,
        "pending_orders": pending_orders,
        "pending_ngos": pending_ngos,
        "pending_payouts": pending_payouts,
        "pending_products": pending_products,
        "pending_categories": pending_categories,
        "recent_orders": [
            {
                "id": r[0],  # ✅ Order ID
                "universal_user_id": r[1],  # ✅ User ID (NGO or Customer)
                "first_name": r[2],  # ✅ First Name of the User
                "last_name": r[3],  # ✅ Last Name of the User
                "total_amount": float(r[4]),  # ✅ Ensure total_amount is a float
                "created_at": r[5].strftime("%Y-%m-%d %H:%M:%S")  # ✅ Format datetime
            }
            for r in recent_orders
        ],

        "recent_ngos": [
            {
                "id": r[0],  # ✅ NGO ID
                "name": f"{r[1]} {r[2]}",  # ✅ Full Name (First Name + Last Name)
                "ngo_name": r[3],  # ✅ NGO Name
                "created_at": r[4].strftime("%Y-%m-%d %H:%M:%S")  # ✅ Format datetime
            }
            for r in recent_ngos
        ],

        "recent_payouts": [{"id": r[0], "amount": r[2], "status": r[3], "date": r[4]} for r in recent_payouts],
        "sales_trends": sales_trends,
        "top_ngos": [{"ngo_name": r[0], "total_sales": r[1]} for r in top_ngos],
        "payout_trends": payout_trends,
        "top_categories": [{"category": r[0], "total_sales": r[1]} for r in top_categories]
    }





@router.get("/ngo")
def get_ngo_dashboard(
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    # ✅ Only NGOs can access this
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Access denied. Only NGOs can access this dashboard.")

    ngo_id = current_user.id

    # ✅ Total Products
    total_products = db.query(func.count(Product.id)).filter(Product.universal_user_id == ngo_id).scalar()

    # ✅ Total Orders
    total_orders = (
        db.query(func.count(OrderItem.id))
        .join(Product, Product.id == OrderItem.product_id)  # ✅ Join OrderItem with Product
        .filter(Product.universal_user_id == ngo_id)  # ✅ Filter for products belonging to the NGO
        .scalar()
    )


    # ✅ Total Sales (Sum of completed order amounts)
    total_sales = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Product, Product.id == OrderItem.product_id)  # ✅ Join OrderItem with Product
        .join(Order, Order.id == OrderItem.order_id)  # ✅ Join OrderItem with Order
        .filter(Product.universal_user_id == ngo_id)  # ✅ Ensure products belong to the given NGO
        .filter(Order.payment_id.isnot(None))  # ✅ Exclude unpaid orders
        .filter(OrderItem.status != "Cancelled")  # ✅ Exclude cancelled order items
        .scalar()
    ) or 0.0


    # ✅ Total Payouts (Completed Payouts)
    total_payouts = db.query(func.sum(Payout.amount))\
        .filter(Payout.universal_user_id == ngo_id, Payout.status == "Completed").scalar() or 0.0

    # ✅ Pending Orders (Orders that are not yet fulfilled)
    pending_orders = (
    db.query(func.count(OrderItem.id))
        .join(Product, Product.id == OrderItem.product_id)  # ✅ Join OrderItem with Product
        .join(Order, Order.id == OrderItem.order_id)  # ✅ Join OrderItem with Order
        .filter(Product.universal_user_id == ngo_id)  # ✅ Ensure products belong to the given NGO
        .filter(Order.payment_id.isnot(None))  # ✅ Exclude unpaid orders
        .filter(OrderItem.status == "Pending")  # ✅ Retrieve only pending items
        .scalar()
    ) or 0


    # ✅ Live Products (Approved & Active Products)
    live_products = db.query(func.count(Product.id))\
        .filter(Product.universal_user_id == ngo_id, Product.is_live == True).scalar()

    # ✅ Pending Products (Waiting for Approval)
    pending_products = db.query(func.count(Product.id))\
        .filter(Product.universal_user_id == ngo_id, Product.is_approved == False).scalar()

    # ✅ Upcoming Payouts (Payouts that are Requested but not yet completed)
    upcoming_payouts = db.query(func.sum(Payout.amount))\
        .filter(Payout.universal_user_id == ngo_id, Payout.status == "Pending").scalar() or 0.0

    # ✅ Sales Trends (Last 6 Months)
    sales_trends = db.query(
        extract("month", Order.created_at).label("month"),
        func.sum(OrderItem.price * OrderItem.quantity).label("sales")
    ).join(Order, Order.id == OrderItem.order_id)\
    .join(Product, Product.id == OrderItem.product_id)\
    .filter(Product.universal_user_id == ngo_id, Order.payment_id.isnot(None), OrderItem.status != "Cancelled")\
    .group_by("month").order_by("month").all()

    sales_trends = [{"month": int(month), "sales": float(sales)} for month, sales in sales_trends]


    # ✅ Order Trends (Last 6 Months)
    order_trends = db.query(
        func.extract("month", OrderItem.created_at).label("month"),
        func.count(OrderItem.id).label("total_orders"),  # ✅ Count all order items
        func.sum(case((OrderItem.status == "Cancelled", 1), else_=0)).label("cancelled_orders")  # ✅ Count only cancelled orders
    ).join(Order, Order.id == OrderItem.order_id)\
    .join(Product, Product.id == OrderItem.product_id)\
    .filter(Product.universal_user_id == ngo_id)\
    .group_by(func.extract("month", OrderItem.created_at))\
    .order_by(func.extract("month", OrderItem.created_at))\
    .all()

    # ✅ Ensure proper extraction & conversion
    order_trends = [{
        "month": int(month) if month is not None else 0,
        "total_orders": int(total_orders),
        "cancelled_orders": int(cancelled_orders)
    } for month, total_orders, cancelled_orders in order_trends]


    # ✅ Top Products (Best Selling Products)
    top_products = (
        db.query(
            Product.name, func.sum(OrderItem.quantity).label("total_sold")
        )
        .join(OrderItem, OrderItem.product_id == Product.id)  # ✅ Fetch from order items
        .join(Order, Order.id == OrderItem.order_id)  # ✅ Join Orders
        .filter(
            Product.universal_user_id == ngo_id,  # ✅ Ensure product belongs to the NGO
            Order.payment_id.isnot(None),  # ✅ Only count paid orders
            OrderItem.status != "Cancelled"  # ✅ Exclude cancelled items
        )
        .group_by(Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())  # ✅ Order by total sold (descending)
        .limit(5)
        .all()
    )

    # ✅ Convert response to JSON format
    top_products = [{"name": name, "total_sold": int(total_sold)} for name, total_sold in top_products]


    # ✅ Payout Trends (Last 6 Months)
    payout_trends = db.query(
        extract("month", Payout.created_at).label("month"),
        func.sum(Payout.amount).label("payouts")
    ).filter(Payout.universal_user_id == ngo_id, Payout.status == "Completed")\
     .group_by("month").order_by("month").all()

    payout_trends = [{"month": int(month), "payouts": float(payouts)} for month, payouts in payout_trends]

    # ✅ Recent Orders (Last 5 Orders)
    # ✅ Fetch Recent Orders for NGO from OrderItem, ensuring only their products are considered
    recent_orders = (
        db.query(
            OrderItem.id,
            OrderItem.price,  # Per unit price of the product
            OrderItem.quantity,
            OrderItem.status,
            Order.created_at,
            Product.name.label("product_name"),
            Order.id.label("order_id")
        )
        .join(Order, Order.id == OrderItem.order_id)
        .join(Product, Product.id == OrderItem.product_id)
        .filter(Product.universal_user_id == ngo_id)  # ✅ Only orders related to this NGO
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    # ✅ Format Response
    recent_orders = [
        {
            "id": r[0],
            "product_name": r[5],  # Product Name
            "order_id": r[6],  # Order ID
            "price": float(r[1]),  # Price per unit
            "quantity": int(r[2]),  # Quantity
            "total_price": float(r[1]) * int(r[2]),  # Total price for this order item
            "status": r[3],
            "created_at": r[4]
        }
        for r in recent_orders
    ]


    # ✅ Recent Product Approvals (Last 5 Approved Products)
    # ✅ Fetch Recently Approved Products for the NGO
    recent_approvals = (
        db.query(
            Product.id,
            Product.name,
            Product.updated_at  # ✅ Using updated_at as approval timestamp
        )
        .filter(Product.universal_user_id == ngo_id, Product.is_approved == 1)  # ✅ Approved Products Only
        .order_by(Product.updated_at.desc())  # ✅ Sort by last update (approval time)
        .limit(5)
        .all()
    )

    # ✅ Format Response
    recent_approvals = [
        {
            "id": r[0],
            "name": r[1],  # Product Name
            "approved_at": r[2]  # Using updated_at as approval timestamp
        }
        for r in recent_approvals
    ]


    # ✅ Recent Payouts (Last 5 Payouts)
    recent_payouts = db.query(
        Payout.id, Payout.amount, Payout.status, Payout.created_at
    ).filter(Payout.universal_user_id == ngo_id)\
     .order_by(Payout.created_at.desc()).limit(5).all()

    recent_payouts = [{"id": r[0], "amount": float(r[1]), "status": r[2], "date": r[3]} for r in recent_payouts]

    # ✅ Return Data
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": total_sales,
        "total_payouts": total_payouts,
        "pending_orders": pending_orders,
        "live_products": live_products,
        "pending_products": pending_products,
        "upcoming_payouts": upcoming_payouts,
        "sales_trends": sales_trends,
        "order_trends": order_trends,
        "top_products": top_products,
        "payout_trends": payout_trends,
        "recent_orders": recent_orders,
        "recent_approvals": recent_approvals,
        "recent_payouts": recent_payouts
    }
