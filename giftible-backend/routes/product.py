from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Product, ProductImage, NGO
from typing import List
import shutil
import os
from datetime import datetime
from schemas import ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

UPLOAD_DIR = "uploads/products/"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure upload directory exists


# ----------------------------- NGO ROUTES ----------------------------- #

@router.post("/add", summary="NGO: Add a new product with multiple images")
async def add_product(
    ngo_id: int = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """NGOs can add new products with multiple images."""
    ngo = db.query(NGO).filter(NGO.id == ngo_id, NGO.is_approved == True).first()
    if not ngo:
        raise HTTPException(status_code=403, detail="Unauthorized or NGO not approved")

    new_product = Product(
        ngo_id=ngo_id,
        name=name,
        description=description,
        price=price,
        stock=stock,
        is_approved=False,  # Requires admin approval
        is_live=False,      # Not live until approved and made live
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # Save images
    for image in images:
        image_path = os.path.join(UPLOAD_DIR, f"{new_product.id}_{image.filename}")
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        product_image = ProductImage(product_id=new_product.id, image_url=image_path)
        db.add(product_image)

    db.commit()
    return {"message": "Product added. Awaiting admin approval."}


@router.put("/edit/{product_id}", summary="NGO: Edit product details")
def edit_product(
    product_id: int,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    db: Session = Depends(get_db)
):
    """NGOs can edit their products."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = name
    product.description = description
    product.price = price
    product.stock = stock
    product.updated_at = datetime.utcnow()
    db.commit()

    return {"message": f"Product '{product.name}' updated successfully."}


@router.delete("/delete/{product_id}", summary="NGO: Delete a product")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """NGOs can delete their products."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Delete product images from storage
    images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
    for image in images:
        if os.path.exists(image.image_url):
            os.remove(image.image_url)
        db.delete(image)

    db.delete(product)
    db.commit()
    return {"message": f"Product '{product.name}' deleted successfully."}


@router.post("/{product_id}/live", summary="NGO: Make product live")
def make_product_live(product_id: int, db: Session = Depends(get_db)):
    """NGOs can make approved products live."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_approved == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not approved")

    product.is_live = True
    db.commit()
    return {"message": f"Product '{product.name}' is now live."}


@router.post("/{product_id}/unlive", summary="NGO: Make product unlive")
def make_product_unlive(product_id: int, db: Session = Depends(get_db)):
    """NGOs can make their products unlive."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_live = False
    db.commit()
    return {"message": f"Product '{product.name}' is now unlive."}


@router.get("/ngo/{ngo_id}/products", summary="NGO: View all products of an NGO")
def get_products_by_ngo(ngo_id: int, db: Session = Depends(get_db)):
    """Fetch all products added by a specific NGO along with the NGO name."""

    # Fetch the NGO
    ngo = db.query(NGO).filter(NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")

    # Fetch products by the NGO
    products = db.query(Product).filter(Product.ngo_id == ngo_id).all()

    return {
        "message": "Products fetched successfully" if products else "No products found",
        "ngo_id": ngo.id,
        "ngo_name": ngo.ngo_name,  # Include NGO name
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "description": product.description,
                "images": [{"image_url": img.image_url} for img in product.images],  # Include images
            }
            for product in products
        ],
    }




# ----------------------------- ADMIN ROUTES ----------------------------- #

@router.get("/pending", summary="Admin: View pending products")
def get_pending_products(db: Session = Depends(get_db)):
    """Admin can view products awaiting approval."""
    pending_products = db.query(Product).filter(Product.is_approved == False).all()
    return pending_products


@router.post("/approve/{product_id}", summary="Admin: Approve product")
def approve_product(product_id: int, db: Session = Depends(get_db)):
    """Admin approves a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_approved = True
    db.commit()
    return {"message": f"Product '{product.name}' approved successfully."}


@router.post("/reject/{product_id}", summary="Admin: Reject product")
def reject_product(product_id: int, reason: str = Form(...), db: Session = Depends(get_db)):
    """Admin rejects a product with a reason."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": f"Product rejected. Reason: {reason}"}



# ----------------------------- USER ROUTES ----------------------------- #

@router.get("/", response_model=List[ProductResponse], summary="User: Browse all approved and live products")
def browse_products(db: Session = Depends(get_db)):
    """Users can view all products that are approved and live with images."""
    products = (
        db.query(Product)
        .filter(Product.is_approved == True, Product.is_live == True)
        .options(joinedload(Product.images))  # Preload images to avoid separate queries
        .all()
    )
    return products

@router.get("/{product_id}", summary="User: View product details")
def product_details(product_id: int, db: Session = Depends(get_db)):
    """Users can view detailed info of a product with NGO details."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_approved == True, Product.is_live == True).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Fetch related images
    images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
    image_urls = [{"image_url": img.image_url} for img in images]

    # Fetch the associated NGO
    ngo = db.query(NGO).filter(NGO.id == product.ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found for this product")

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "images": image_urls,
        "is_live": product.is_live,
        "created_at": product.created_at,
        "ngo": {
            "id": ngo.id,
            "ngo_name": ngo.ngo_name,
            "email": ngo.email,
            "contact_number": ngo.contact_number,
            "logo": ngo.logo
        }
    }
