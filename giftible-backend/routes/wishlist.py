from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Wishlist, Product
from database import get_db
from .cart import get_current_user  # 🔑 JWT Authentication

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])




@router.post("/add/{product_id}", summary="Add a product to wishlist")
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Users can add a product to their wishlist."""

    # 🔍 Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # ❌ Prevent duplicate entries
    existing_wishlist = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id, Wishlist.product_id == product_id
    ).first()
    if existing_wishlist:
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    # ✅ Add to wishlist
    wishlist_item = Wishlist(user_id=current_user.id, product_id=product_id)
    db.add(wishlist_item)
    db.commit()
    return {"message": "Product added to wishlist"}

@router.delete("/remove/{product_id}", summary="Remove a product from wishlist")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Users can remove a product from their wishlist."""

    wishlist_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id, Wishlist.product_id == product_id
    ).first()

    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Product not in wishlist")

    db.delete(wishlist_item)
    db.commit()
    return {"message": "Product removed from wishlist"}

@router.get("/", summary="Fetch wishlist items", response_model=list[dict])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Fetch all products in the user's wishlist."""

    wishlist_items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()

    return [
        {
            "product_id": item.product.id,
            "name": item.product.name,
            "price": item.product.price,
            "stock": item.product.stock,
            "category": item.product.category.name if item.product.category else "No Category",
            "is_live": item.product.is_live,
            "created_at": item.created_at.strftime("%Y-%m-%d"),
            "image": item.product.images[0].image_url if item.product.images else None
        }
        for item in wishlist_items
    ]
