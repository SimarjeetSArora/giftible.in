from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Product, UniversalUser
from schemas import InventoryUpdate
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from .auth import get_current_user 

router = APIRouter(prefix="/inventory", tags=["Inventory"])

# 🔑 Load Secret Key
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"

# ✅ OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ✅ Fetch Inventory of a Single Product (NGO Only)
@router.get("/{product_id}")
def get_inventory(product_id: int, db: Session = Depends(get_db), current_ngo: UniversalUser = Depends(get_current_user)):
    """Fetches stock details of a single product (Only NGOs can access)."""
    product = db.query(Product).filter(Product.id == product_id, Product.universal_user_id == current_ngo.id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized.")

    return {
        "product_id": product.id,
        "name": product.name,
        "stock": product.stock
    }


# ✅ Update Stock for a Product (NGO Only)
@router.put("/{product_id}")
def update_stock(product_id: int, stock_data: InventoryUpdate, db: Session = Depends(get_db), current_ngo: UniversalUser = Depends(get_current_user)):
    """Updates the stock for a specific product (Only NGOs can access)."""
    product = db.query(Product).filter(Product.id == product_id, Product.universal_user_id == current_ngo.id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized.")

    if stock_data.stock < 0:
        raise HTTPException(status_code=400, detail="Stock quantity cannot be negative.")

    product.stock = stock_data.stock  # ✅ Update stock
    db.commit()
    db.refresh(product)

    return {
        "message": "Stock updated successfully.",
        "product_id": product.id,
        "new_stock": product.stock
    }
