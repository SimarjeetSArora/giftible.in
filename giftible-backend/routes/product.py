from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Product, ProductImage, Category, UniversalUser, NGO
from typing import List
import shutil
import os
from datetime import datetime
from schemas import ProductResponse
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv



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



@router.get("/browse", summary="Browse products with filters")
def browse_products(
    status: str = Query("all", description="Filter by product status: all, approved, unapproved, live, unlive"),
    ngo_id: int | None = Query(None, description="Filter by NGO ID"),
    category_id: int | None = Query(None, description="Filter by Category ID"),
    min_price: float | None = Query(None, description="Minimum Price"),
    max_price: float | None = Query(None, description="Maximum Price"),
    db: Session = Depends(get_db),
):
    """
    🛍️ **Browse products with filtering options:**
    - `status=all` → Fetch all products
    - `ngo_id=1` → Fetch products by NGO
    - `category_id=3` → Fetch products by Category
    - `min_price=100&max_price=500` → Price range
    """

    query = (
        db.query(Product)
        .join(UniversalUser, UniversalUser.id == Product.universal_user_id)  # 🔗 Join UniversalUser
        .outerjoin(NGO, NGO.universal_user_id == UniversalUser.id)  # 🔗 Join NGO
        .options(
            joinedload(Product.images),
            joinedload(Product.category),
            joinedload(Product.universal_user).joinedload(UniversalUser.ngo)  # ✅ Corrected NGO join
        )
    )

    # ✅ Apply Filters
    if status == "approved":
        query = query.filter(Product.is_approved == True)
    elif status == "unapproved":
        query = query.filter(Product.is_approved == False)
    elif status == "live":
        query = query.filter(Product.is_approved == True, Product.is_live == True)
    elif status == "unlive":
        query = query.filter(Product.is_approved == True, Product.is_live == False)

    if ngo_id:
        query = query.filter(Product.universal_user_id == ngo_id)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)

    products = query.all()

    # ✅ Corrected response format with `universal_user_id`
    return {
        "message": "✅ Products fetched successfully" if products else "⚠️ No products found.",
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "stock": product.stock,
                "is_approved": product.is_approved,
                "is_live": product.is_live,
                "created_at": product.created_at.strftime("%Y-%m-%d"),
                "category": {"id": product.category.id, "name": product.category.name} if product.category else None,
                "ngo": {
                    "id": product.universal_user.ngo.id if product.universal_user.ngo else None,  # ✅ Fetch NGO ID
                    "universal_user_id": product.universal_user.id,  # ✅ Include universal_user_id
                    "ngo_name": product.universal_user.ngo.ngo_name if product.universal_user.ngo else "No NGO",  # ✅ Fetch NGO Name
                    "contact_number": product.universal_user.contact_number,  # ✅ Fetch NGO contact
                    "email": product.universal_user.email,  # ✅ Fetch NGO email
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
@router.put("/edit/{product_id}", summary="NGO: Edit product details")
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
    """NGOs can edit their products."""
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can edit products.")

    product = db.query(Product).filter(Product.id == product_id, Product.universal_user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized.")

    category = db.query(Category).filter(Category.id == category_id, Category.is_approved == True).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category or category not approved.")

    product.category_id = category_id
    product.name = name
    product.description = description
    product.price = price
    product.stock = stock
    product.updated_at = datetime.utcnow()
    db.commit()

    return {"message": f"Product '{product.name}' updated successfully."}


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

    pending_products = db.query(Product).filter(Product.is_approved == False).all()
    return pending_products


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
@router.get("/my-products", summary="NGO: View all products added by the logged-in NGO")
def get_products_by_ngo(
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
):
    """NGOs can fetch all their products along with their details."""

    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can view their products.")

    # Fetch all products added by the logged-in NGO
    products = db.query(Product).filter(Product.universal_user_id == current_user.id).all()

    return {
        "message": "✅ Products fetched successfully" if products else "⚠️ No products found.",
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
            for product in products
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
        raise HTTPException(status_code=404, detail="Product not found")

    # 🛡️ Check if the logged-in user has the right permissions
    if current_user.role != "admin" and product.universal_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized. You cannot delete this product.")

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
    """Users can view detailed info of a product with its category and NGO details."""

    # 🔍 Fetch the product
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.is_approved == True, Product.is_live == True)
        .first()
    )

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
        "ngo_name": ngo.ngo_name,  # ✅ NGO name from `ngos` table
        "email": universal_user.email if universal_user else None,
        "contact_number": universal_user.contact_number if universal_user else None,
    } if ngo else None

    return {
        "product": {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "is_live": product.is_live,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
            "images": image_urls,
        },
        "category": category_details,
        "ngo": ngo_details,
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

