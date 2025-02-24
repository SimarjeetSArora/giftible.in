from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Category, NGO, Admin
from schemas import CategoryCreate, CategoryResponse, CategoryApproval
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

router = APIRouter(prefix="/categories", tags=["Categories"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

# 🔑 Helper function: Get current user and check role
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        contact_number = payload.get("sub")

        if not role or not contact_number:
            raise HTTPException(status_code=401, detail="Invalid token payload.")

        if role == "ngo":
            user = db.query(NGO).filter(NGO.contact_number == contact_number).first()
        elif role == "admin":
            user = db.query(Admin).filter(Admin.contact_number == contact_number).first()
        else:
            raise HTTPException(status_code=403, detail="Unauthorized role.")

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"user": user, "role": role}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")


# 🚀 NGO: Create a new category (default: not approved)
@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can create categories.")

    # Check for existing category
    if db.query(Category).filter(Category.name == category.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")

    new_category = Category(
        name=category.name,
        description=category.description,
        is_approved=False,  # Default: Not approved until admin approves
        ngo_id=current_user["user"].id  # Link category to the NGO
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


# 📥 Public: Get only approved categories
@router.get("/", response_model=list[CategoryResponse])
def get_approved_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_approved == True).all()


# 🛡️ Admin: View all categories (approved & unapproved)
@router.get("/all", response_model=list[CategoryResponse])
def get_all_categories(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this resource.")
    return db.query(Category).all()


# ✅ Admin: Approve or reject categories
@router.patch("/{category_id}/approve", response_model=CategoryResponse)
def approve_category(
    category_id: int,
    approval: CategoryApproval,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve categories.")

    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.is_approved = approval.is_approved
    db.commit()
    db.refresh(category)
    return category
