from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import UniversalUser
from schemas import UserResponse, UserProfileUpdate
from .auth import get_current_user

router = APIRouter(prefix="/user", tags=["User"])


# ✅ View Profile
@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: UniversalUser = Depends(get_current_user)):
    return current_user


# ✅ Edit Profile
@router.put("/profile/edit", response_model=UserResponse)
def edit_user_profile(
    updated_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    if updated_data.first_name:
        current_user.first_name = updated_data.first_name
    if updated_data.last_name:
        current_user.last_name = updated_data.last_name
    if updated_data.email:
        current_user.email = updated_data.email
    if updated_data.contact_number:
        current_user.contact_number = updated_data.contact_number

    db.commit()
    db.refresh(current_user)

    return current_user


# ✅ Delete Account
@router.delete("/profile/delete")
def delete_account(db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}
