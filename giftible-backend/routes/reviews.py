from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Review, OrderItem, UniversalUser, Product, NGO
from schemas import ReviewCreate, ReviewResponse
from typing import List
from datetime import datetime
from .auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


# ✅ POST: Submit a review (Only if the order is delivered)
@router.post("/", summary="User: Add a review for a delivered product")
def add_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    # ✅ Ensure rating is provided
    if review.rating is None:
        raise HTTPException(status_code=400, detail="Rating is required.")

    # ✅ Check if order item exists and belongs to the user
    order_item = db.query(OrderItem).filter(
        OrderItem.id == review.order_item_id,
        OrderItem.status == "Delivered",
        OrderItem.order.has(universal_user_id=current_user.id)
    ).first()

    if not order_item:
        raise HTTPException(status_code=400, detail="You can only review delivered orders.")

    # ✅ Ensure the user has not already reviewed this product
    try:
        existing_review = db.query(Review).filter(
            Review.order_item_id == review.order_item_id
        ).first()
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already reviewed this product.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error checking existing reviews: {str(e)}")

    # ✅ Create a new review (Allowing an empty comment)
    new_review = Review(
        universal_user_id=current_user.id,
        product_id=order_item.product_id,
        order_item_id=review.order_item_id,
        rating=review.rating,
        comment=review.comment if review.comment else None,  # ✅ Allow empty comments
        created_at=datetime.utcnow()
    )

    try:
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving review: {str(e)}")

    return {"message": "Review added successfully!"}




# ✅ GET: Fetch reviews for a specific product (For users on product details page)
# ✅ GET: Fetch reviews and average rating for a specific product
@router.get("/{product_id}", summary="Get all reviews and average rating for a product")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    """Retrieve all reviews for a product along with its average rating."""

    # 🔍 Fetch all reviews for the product
    reviews = db.query(Review).filter(Review.product_id == product_id).all()

    # 🔍 Calculate the average rating
    average_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar()

    return {
        "average_rating": round(average_rating, 1) if average_rating is not None else 0.0,  # ✅ Rounded to 1 decimal place
        "total_reviews": len(reviews),
        "reviews": [
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
    }



# ✅ DELETE: Allow Admins to delete a review
@router.delete("/{review_id}", summary="Admin: Delete a review")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    # ✅ Ensure only admins can delete reviews
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete reviews.")

    # ✅ Fetch the review
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    # ✅ Delete the review
    db.delete(review)
    db.commit()

    return {"message": "Review deleted successfully!"}
