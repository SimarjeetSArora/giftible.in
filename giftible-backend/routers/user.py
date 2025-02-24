from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import UserCreate, NGOCreate, AdminCreate, UserResponse
from crud import create_user, create_ngo, create_admin

router = APIRouter()

# Dependency: Get Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User Registration
@router.post("/register/user", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

# NGO Registration
@router.post("/register/ngo", response_model=UserResponse)
def register_ngo(ngo: NGOCreate, db: Session = Depends(get_db)):
    return create_ngo(db, ngo)

# Admin Registration
@router.post("/register/admin", response_model=UserResponse)
def register_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    return create_admin(db, admin)
