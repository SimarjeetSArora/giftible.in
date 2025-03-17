from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Product, ProductImage, Category, UniversalUser, NGO, OrderItem, Review
from typing import List, Optional
import shutil
import os
from datetime import datetime, timedelta
from schemas import ProductResponse
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from sqlalchemy import or_, and_
from sqlalchemy.sql.expression import func


router = APIRouter(prefix="/products", tags=["Products"])

UPLOAD_DIR = "uploads/products/"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure upload directory exists

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"


# 🔑 Get current user from token
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



from sqlalchemy.sql import func
from sqlalchemy.orm import joinedload
from sqlalchemy import or_

@router.get("/browse", summary="Browse products with filters")
def browse_products(
    status: str = Query("all", description="Filter by product status: all, approved, unapproved, live, unlive"),
    ngo_ids: List[int] = Query([], description="Filter by multiple NGO IDs"),
    category_ids: List[int] = Query([], description="Filter by multiple Category IDs"),
    min_price: Optional[float] = Query(None, description="Minimum Price"),
    max_price: Optional[float] = Query(None, description="Maximum Price"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    search_query: Optional[str] = Query(None, description="Search for products by name, description, or NGO name"),
    limit: int = Query(10, description="Number of products per page"),
    offset: int = Query(0, description="Pagination offset"),
    randomize: bool = Query(False, description="Set to `true` to fetch products randomly"),
    db: Session = Depends(get_db),
):
    """
    🛍️ **Browse products with filtering options:**
    - `status=all` → Fetch all products
    - `ngo_ids=1,2,3` → Fetch products by multiple NGOs
    - `category_ids=3,4,5` → Fetch products by multiple Categories
    - `min_price=100&max_price=500` → Price range filter
    - `start_date=2024-01-01&end_date=2024-02-01` → Date range filter
    - `search_query=bag` → Search products by name, description, or NGO name
    - `randomize=true` → Fetch products randomly
    """

    query = (
        db.query(Product)
        .join(UniversalUser, UniversalUser.id == Product.universal_user_id)
        .outerjoin(NGO, NGO.universal_user_id == UniversalUser.id)
        .options(
            joinedload(Product.images),
            joinedload(Product.category),
            joinedload(Product.universal_user).joinedload(UniversalUser.ngo)
        )
    )

    # ✅ Apply Status Filters
    if status == "approved":
        query = query.filter(Product.is_approved == True)
    elif status == "unapproved":
        query = query.filter(Product.is_approved == False)
    elif status == "live":
        query = query.filter(Product.is_approved == True, Product.is_live == True)
    elif status == "unlive":
        query = query.filter(Product.is_live == False)

    # ✅ Apply Multiple NGO Filters
    if ngo_ids:
        query = query.filter(Product.universal_user_id.in_(ngo_ids))

    # ✅ Apply Multiple Category Filters
    if category_ids:
        query = query.filter(Product.category_id.in_(category_ids))

    # ✅ Apply Price Range Filter
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # ✅ Apply Date Filter
    try:
        if start_date:
            start_date_parsed = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Product.created_at >= start_date_parsed)

        if end_date:
            end_date_parsed = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(hours=23, minutes=59, seconds=59)
        else:
            end_date_parsed = datetime.utcnow().replace(hour=23, minute=59, second=59)

        query = query.filter(Product.created_at <= end_date_parsed)

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # 🔎 Apply Search Query
    if search_query:
        search_filter = or_(
            Product.name.ilike(f"%{search_query}%"),
            Product.description.ilike(f"%{search_query}%"),
            NGO.ngo_name.ilike(f"%{search_query}%"),
            UniversalUser.email.ilike(f"%{search_query}%")
        )
        query = query.filter(search_filter)

    # ✅ Randomize results if `randomize=true`
    if randomize:
        query = query.order_by(func.random())

    # ✅ Apply Pagination
    total_count = query.count()
    products = query.limit(limit).offset(offset).all()

    # ✅ Fetch Average Ratings for Each Product
    product_ids = [product.id for product in products]
    ratings_query = db.query(
        Review.product_id, func.avg(Review.rating).label("average_rating")
    ).filter(Review.product_id.in_(product_ids)).group_by(Review.product_id).all()

    # ✅ Convert Ratings to Dictionary {product_id: avg_rating}
    ratings_map = {r.product_id: round(r.average_rating, 1) for r in ratings_query}

    # ✅ Corrected response format with `universal_user_id`
    return {
        "message": "✅ Products fetched successfully" if products else "⚠️ No products found.",
        "total": total_count,
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "stock": product.stock,
                "is_approved": product.is_approved,
                "is_live": product.is_live,
                "created_at": product.created_at.strftime("%Y-%m-%d"),
                "average_rating": ratings_map.get(product.id, 5.0),  # ✅ Added Average Rating
                "category": {
                    "id": product.category.id,
                    "name": product.category.name
                } if product.category else None,
                "ngo": {
                    "id": product.universal_user.ngo.id if product.universal_user.ngo else None,
                    "universal_user_id": product.universal_user.id,
                    "ngo_name": product.universal_user.ngo.ngo_name if product.universal_user.ngo else "No NGO",
                    "logo": product.universal_user.ngo.logo,
                    "contact_number": product.universal_user.contact_number,
                    "email": product.universal_user.email,
                } if product.universal_user.ngo else None,
                "images": [{"image_url": img.image_url} for img in product.images],
            }
            for product in products
        ]
    }












# ----------------------------- NGO ROUTES ----------------------------- #

# 🚀 Add Product - NGOs can add products with images and category
@router.post("/add", summary="UniversalUser: Add a new product with multiple images")
async def add_product(
    category_id: int = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)  # 🔄 Ensure logged-in user
):
    """Users (NGOs) can add new products with multiple images and category selection."""

    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Unauthorized. Only NGOs can add products.")

    category = db.query(Category).filter(Category.id == category_id, Category.is_approved == True).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category or category not approved.")

    new_product = Product(
        universal_user_id=current_user.id,  # 🔄 Updated
        category_id=category_id,
        name=name,
        description=description,
        price=price,
        stock=stock,
        is_approved=False,  
        is_live=False,     
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # ✅ Save images
    for image in images:
        image_path = os.path.join(UPLOAD_DIR, f"{new_product.id}_{image.filename}")
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        product_image = ProductImage(product_id=new_product.id, image_url=image_path)
        db.add(product_image)

    db.commit()
    return {"message": "Product added. Awaiting admin approval."}

# 🚀 Edit Product - NGOs can edit their product details
@router.put("/edit/{product_id}", summary="NGO/Admin: Edit product details")
def edit_product(
    product_id: int,
    category_id: int = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """NGOs can edit their own products, Admins can edit any product.
       If an NGO edits a product, it must be reapproved by an admin.
    """

    # 🔍 Fetch the product
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    # 🛡️ Permissions Check: NGOs can only edit their own products, Admins can edit any
    if current_user.role == "ngo" and product.universal_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized. NGOs can only edit their own products.")

    # ✅ Validate Category
    category = db.query(Category).filter(Category.id == category_id, Category.is_approved == True).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category or category not approved.")

    # 📝 Update Product Details
    product.category_id = category_id
    product.name = name
    product.description = description
    product.price = price
    product.stock = stock
    product.updated_at = datetime.utcnow()

    # 🚨 If the product is edited by an NGO, reset approval status to 0
    if current_user.role == "ngo":
        product.is_approved = False  # ✅ Reset approval status
        product.is_live = False  # ✅ Reset approval status

    db.commit()

    return {
        "message": f"✅ Product '{product.name}' updated successfully.",
        "is_approved": product.is_approved,
        "is_live": product.is_live
    }




# ----------------------------- ADMIN ROUTES ----------------------------- #

# 🚀 View Pending Products (Admin Only)

@router.get("/pending", summary="Admin: View pending products")
def get_pending_products(
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """Admin can view products awaiting approval."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view pending products.")

    # ✅ Fetch products along with their images
    pending_products = db.query(Product).options(joinedload(Product.images)).filter(Product.is_approved == False).all()
    
    # ✅ Convert SQLAlchemy objects to dictionaries for JSON response
    return [
        {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "is_approved": product.is_approved,
            "images": [{"image_url": img.image_url} for img in product.images]  # ✅ Include images
        }
        for product in pending_products
    ]



# 🚀 Approve Product (Admin Only)
@router.post("/approve/{product_id}", summary="Admin: Approve product")
def approve_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """Admin approves a product."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve products.")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    product.is_approved = True
    db.commit()
    return {"message": f"Product '{product.name}' approved successfully."}


# 🚀 Reject Product (Admin Only)
@router.post("/reject/{product_id}", summary="Admin: Reject product")
def reject_product(
    product_id: int,
    reason: str = Form(...),
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """Admin rejects a product with a reason."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can reject products.")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    db.delete(product)
    db.commit()
    return {"message": f"Product rejected. Reason: {reason}"}


# ----------------------------- USER ROUTES ----------------------------- #

# 🚀 Browse All Approved & Live Products
@router.get("/", response_model=List[ProductResponse], summary="User: Browse all approved and live products")
def browse_products(db: Session = Depends(get_db)):
    """Users can view all products that are approved and live with images."""
    products = (
        db.query(Product)
        .filter(Product.is_approved == True, Product.is_live == True)
        .options(joinedload(Product.images))
        .all()
    )
    return products

# 🚀 Make Product Live - NGOs can make their approved products live
@router.post("/{product_id}/live", summary="NGO: Make product live")
def make_product_live(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """NGOs can make approved products live."""
    
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can make products live.")

    product = db.query(Product).filter(Product.id == product_id, Product.universal_user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized.")

    if not product.is_approved:
        raise HTTPException(status_code=400, detail="Product must be approved before making it live.")

    product.is_live = True
    db.commit()
    return {"message": f"✅ Product '{product.name}' is now live."}


# 🚀 Make Product Unlive - NGOs can make their products unlive
@router.post("/{product_id}/unlive", summary="NGO: Make product unlive")
def make_product_unlive(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """NGOs can make their products unlive."""
    
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can make products unlive.")

    product = db.query(Product).filter(Product.id == product_id, Product.universal_user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized.")

    product.is_live = False
    db.commit()
    return {"message": f"🚫 Product '{product.name}' is now unlive."}

# 🚀 Get All Products by NGO (UniversalUser)
@router.get("/my-products", summary="NGO: View all approved products added by the logged-in NGO")
def get_approved_products_by_ngo(
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """NGOs can fetch all their approved products along with their details."""

    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can view their products.")

    # Fetch only approved products added by the logged-in NGO
    approved_products = (
        db.query(Product)
        .filter(Product.universal_user_id == current_user.id, Product.is_approved == True)
        .all()
    )

    return {
        "message": "✅ Approved products fetched successfully" if approved_products else "⚠️ No approved products found.",
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "stock": product.stock,
                "is_approved": product.is_approved,
                "is_live": product.is_live,
                "description": product.description,
                "created_at": product.created_at,
                "category": {
                    "id": product.category.id,
                    "name": product.category.name
                } if product.category else None,
                "images": [{"image_url": img.image_url} for img in product.images]
            }
            for product in approved_products
        ],
    }



# 🚀 Delete Product - NGOs can delete their own products, Admins can delete any product
@router.delete("/delete/{product_id}", summary="Admin/NGO: Delete a product")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """NGOs can delete their own products. Admins can delete any product."""

    # 🔍 Fetch the product
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return {"message": "❌ Product not found"}

    # 🛡️ Check if the logged-in user has the right permissions
    if current_user.role != "admin" and product.universal_user_id != current_user.id:
        return {"message": "⛔ Unauthorized. You cannot delete this product."}

    # 🚨 Check if product has active orders
    existing_orders = db.query(OrderItem).filter(OrderItem.product_id == product_id).count()
    if existing_orders > 0:
        return {"message": "⚠️ Cannot delete this product because orders are already placed. Please complete or cancel orders before deleting."}

    # ✅ Delete associated product images from storage
    images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
    for image in images:
        if os.path.exists(image.image_url):
            os.remove(image.image_url)  # Remove image file from storage
        db.delete(image)  # Delete image record from DB

    # ✅ Delete the product
    db.delete(product)
    db.commit()

    return {"message": f"✅ Product '{product.name}' deleted successfully."}



@router.get("/{product_id}", summary="User: View product details")
def get_product_details(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Users can view detailed info of a product with its category, NGO details, and reviews (including average rating)."""

    # 🔍 Fetch the product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not available.")

    # 🔍 Fetch related images
    images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
    image_urls = [{"image_url": img.image_url} for img in images]

    # 🔍 Fetch the associated category
    category = db.query(Category).filter(Category.id == product.category_id).first()
    category_details = {
        "id": category.id,
        "name": category.name,
        "description": category.description
    } if category else None

    # 🔍 Fetch the associated Universal User (NGO Admin)
    universal_user = db.query(UniversalUser).filter(UniversalUser.id == product.universal_user_id).first()

    # 🔍 Fetch the associated NGO (NGO Name from NGOs Table)
    ngo = db.query(NGO).filter(NGO.universal_user_id == product.universal_user_id).first()
    ngo_details = {
        "id": ngo.id,
        "universal_user_id": product.universal_user.id,  # ✅ Include universal_user_id
        "ngo_name": ngo.ngo_name,  # ✅ NGO name from `ngos` table
        "logo": ngo.logo,
        "email": universal_user.email if universal_user else None,
        "contact_number": universal_user.contact_number if universal_user else None,
    } if ngo else None

    # 🔍 Fetch Reviews for the Product
    reviews = (
        db.query(Review)
        .join(UniversalUser, Review.universal_user_id == UniversalUser.id)
        .filter(Review.product_id == product_id)
        .all()
    )

    # 🔍 Calculate the average rating (returns None if no reviews exist)
    average_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar()
    average_rating = round(average_rating, 1) if average_rating is not None else 0.0  # ✅ Rounded to 1 decimal place

    reviews_data = [
        {
            "id": review.id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
            "user": {
                "id": review.user.id,
                "first_name": review.user.first_name,
                "last_name": review.user.last_name,
            }
        }
        for review in reviews
    ]

    return {
        "product": {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "is_live": product.is_live,
            "is_approved": product.is_approved,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
            "images": image_urls,
            "average_rating": average_rating,  # ✅ Added Average Rating
        },
        "category": category_details,
        "ngo": ngo_details,
        "reviews": {
            "average_rating": average_rating,  # ✅ Also included here
            "total_reviews": len(reviews),
            "review_list": reviews_data  # ✅ List of all reviews
        },
    }



@router.get("/ngo/{universal_user_id}", summary="View all products by a specific NGO")
def get_products_by_ngo(universal_user_id: int, db: Session = Depends(get_db)):
    """
    Fetch all products added by a specific NGO using the Universal User ID.
    """

    # ✅ Step 1: Fetch NGO details (Retrieve Universal User ID from UniversalUser, NGO Name from NGOs table)
    ngo_details = (
        db.query(UniversalUser.id.label("universal_user_id"), NGO.ngo_name)
        .join(NGO, UniversalUser.id == NGO.universal_user_id)  # Ensure correct join
        .filter(UniversalUser.id == universal_user_id, UniversalUser.role == "ngo")
        .first()
    )

    if not ngo_details:
        raise HTTPException(status_code=404, detail="NGO not found")

    # ✅ Step 2: Fetch products listed by the NGO using Universal User ID
    products = (
        db.query(Product)
        .filter(Product.universal_user_id == universal_user_id, Product.is_approved == True, Product.is_live == True)
        .options(joinedload(Product.images), joinedload(Product.category))  # Load images & category
        .all()
    )

    # ✅ Debugging: Print response to verify correct Universal User ID
    print("📡 API Response:", {
        "ngo": {
            "universal_user_id": ngo_details.universal_user_id,  # Corrected
            "ngo_name": ngo_details.ngo_name,  # Retrieved from NGOs table
        },
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "category": product.category.name if product.category else None
            } for product in products
        ]
    })

    return {
        "ngo": {
            "universal_user_id": ngo_details.universal_user_id,  # ✅ Correct Universal User ID
            "ngo_name": ngo_details.ngo_name,  # ✅ Name from NGOs table
        },
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "stock": product.stock,
                "is_live": product.is_live,
                "created_at": product.created_at,
                "category": {
                    "id": product.category.id,
                    "name": product.category.name
                } if product.category else None,
                "images": [{"image_url": img.image_url} for img in product.images]
            }
            for product in products
        ]
    }

