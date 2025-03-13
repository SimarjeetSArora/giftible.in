from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Cart, CartItem, Product, UniversalUser
from schemas import CartItemCreate
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import func  # ✅ Import func here
from .utils import SECRET_KEY, ALGORITHM


router = APIRouter(prefix="/cart", tags=["Cart"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ✅ Get the currently authenticated user
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


# ✅ Add Product to Cart
@router.post("/add", summary="Add or update product in cart")
def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.universal_user_id == current_user.id).first()
    if not cart:
        cart = Cart(universal_user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    cart_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == item.product_id).first()
    if cart_item:
        cart_item.quantity += item.quantity
    else:
        new_item = CartItem(cart_id=cart.id, product_id=item.product_id, quantity=item.quantity)
        db.add(new_item)

    db.commit()
    return {"message": "Item added to cart."}


# ✅ Fetch Cart Items
@router.get("/", summary="Get user cart")
def get_cart(db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.universal_user_id == current_user.id).first()
    if not cart:
        return {"cart_items": []}

    cart_items = [
        {
            "product_id": item.product.id,
            "product_name": item.product.name,
            "price": item.product.price,
            "quantity": item.quantity,
            "total_price": item.product.price * item.quantity,
            "image_url": item.product.images[0].image_url if item.product.images else None  # ✅ Include image URL
        }
        for item in cart.cart_items
    ]
    return {"cart_items": cart_items}


# ✅ Remove Product from Cart
@router.delete("/remove/{product_id}", summary="Remove item from cart")
def remove_from_cart(product_id: int, db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.universal_user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart."}


# ✅ Clear Entire Cart
@router.delete("/clear", summary="Clear the entire cart")
def clear_cart(db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.universal_user_id == current_user.id).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    return {"message": "Cart cleared."}


# ✅ Get Cart Item Count
@router.get("/count", summary="Get total cart item count")
def get_cart_item_count(db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.universal_user_id == current_user.id).first()

    if not cart:
        return {"count": 0}  # ✅ Return 0 instead of raising an error

    item_count = db.query(func.coalesce(func.sum(CartItem.quantity), 0)).filter(
        CartItem.cart_id == cart.id
    ).scalar()

    return {"count": item_count}
