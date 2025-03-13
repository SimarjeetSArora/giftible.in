from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Category, UniversalUser, NGO, Product
from schemas import CategoryCreate, CategoryResponse, CategoryApproval, CategoryRejection, PaginatedCategoryResponse
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from email.mime.text import MIMEText
import smtplib
import logging




# 🚀 Load environment variables
router = APIRouter(prefix="/categories", tags=["Categories"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"


# ✅ Load email credentials from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL = os.getenv("SMTP_EMAIL")
SENDER_PASSWORD = os.getenv("SMTP_PASSWORD")

logger = logging.getLogger(__name__)


# 🔑 Get current user from token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UniversalUser:
    try:
        if not token:
            raise HTTPException(status_code=401, detail="Token not provided.")

        # ✅ Decode Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        contact_number = payload.get("sub")  # This should match the user's contact_number or id
        role = payload.get("role")

        print(f"🛠️ DEBUG: Token Decoded - Contact Number/ID: {contact_number}, Role: {role}")

        # ✅ Check if user exists
        user = db.query(UniversalUser).filter(UniversalUser.id == int(contact_number)).first()

        if not user:
            print("❌ User not found in database.")  # Debugging line
            raise HTTPException(status_code=404, detail="User not found in database.")

        return user

    except JWTError as e:
        print(f"❌ JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token.")




def send_email(to_email: str, subject: str, body: str):
    """Send an email with the given subject and body."""
    msg = MIMEText(body, "html")
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        logger.info(f"✅ Email sent to {to_email}")
    except Exception as e:
        logger.error(f"❌ Error sending email to {to_email}: {e}")



def send_category_submission_email(to_email: str, ngo_name: str, category_name: str):
    """Send an email notification when a new category request is submitted."""
    subject = "📌 Category Submission Received - Giftible"
    body = f"""
     <html>
        <body>
            <p>Dear <b>{ngo_name}</b>,</p>
            <p>We have received your category request for <b>{category_name}</b>.</p>
            <p>Our team will review and approve it within <b>24-48 hours</b>.</p>
            <p>You will receive an email notification once the category is <b>approved</b> or <b>rejected</b>.</p>
            <p>If you have any concerns, feel free to contact us.</p>
            <p>Best regards,<br><b>Giftible Team</b></p>
        </body>
    </html>
    """
    send_email(to_email, subject, body)





def send_category_approval_email(to_email: str, ngo_name: str, category_name: str):
    """Send an email notification when a category is approved."""
    subject = "🎉 Category Approval Notification"
    body = f"""
    <html>
        <body>
            <p>Dear <b>{ngo_name}</b>,</p>
            <p>We are pleased to inform you that your category request for <b>{category_name}</b> has been <b>approved</b>! 🎉</p>
            <p>You can now start adding products under this category on the Giftible platform.</p>
            <p>Best regards,<br><b>Giftible Team</b></p>
        </body>
    </html>
    """
    send_email(to_email, subject, body)

def send_category_rejection_email(to_email: str, ngo_name: str, category_name: str, rejection_reason: str):
    """Send an email notification when a category is rejected with a reason."""
    subject = "🚫 Category Rejection Notification"
    body = f"""
    <html>
        <body>
            <p>Dear <b>{ngo_name}</b>,</p>
            <p>We regret to inform you that your category <b>{category_name}</b> has been <b>rejected</b>.</p>
            <p>📝 <b>Reason for rejection:</b> {rejection_reason}</p>
            <p>You can review the reason and submit a new category request if necessary.</p>
            <p>Best regards,<br><b>Giftible Team</b></p>
        </body>
    </html>
    """
    send_email(to_email, subject, body)






# 🚀 NGO: Create a new category (default: Not approved)
@router.post("/", response_model=CategoryResponse, summary="NGO: Create a new category (Needs approval)")
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Only NGOs can create categories.")

    # ✅ Ensure the user has an NGO account
    ngo = db.query(NGO).filter(NGO.universal_user_id == current_user.id, NGO.is_approved == True).first()
    if not ngo:
        raise HTTPException(status_code=403, detail="NGO not approved or does not exist.")

    # ✅ Fetch Email from UniversalUser
    universal_user = db.query(UniversalUser).filter(UniversalUser.id == current_user.id).first()
    if not universal_user:
        raise HTTPException(status_code=404, detail="Associated user not found.")

    # ✅ Check if category already exists
    if db.query(Category).filter(Category.name == category.name).first():
        raise HTTPException(status_code=400, detail="Category already exists.")

    # ✅ Create new category
    new_category = Category(
        name=category.name,
        description=category.description,
        is_approved=False,  # Admin must approve
        universal_user_id=current_user.id
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    # ✅ Send Email Notification to NGO (Fetching email from UniversalUser)
    send_category_submission_email(universal_user.email, ngo.ngo_name, category.name)

    return new_category



# 📥 Public: Get only approved categories
@router.get("/", response_model=list[CategoryResponse], summary="Public: Fetch only approved categories")
def get_approved_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_approved == True).all()





# 🛡️ Admin: View all categories (approved & unapproved)

@router.get("/all", response_model=dict, summary="Admin: Fetch all categories with search & pagination")
def get_all_categories(
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user),
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Items per page"),
    search: str = Query(None, description="Search category by name or description"),
    filter: str = Query(None, description="Filter by approval status (approved/not_approved)"),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this resource.")

    query = db.query(Category)

    # ✅ Apply search filter
    if search:
        query = query.filter(Category.name.ilike(f"%{search}%") | Category.description.ilike(f"%{search}%"))

    # ✅ Apply filter for approved/unapproved categories
    if filter == "approved":
        query = query.filter(Category.is_approved == True)
    elif filter == "not_approved":
        query = query.filter(Category.is_approved == False)

    # ✅ Apply pagination
    total = query.count()
    categories = query.offset((page - 1) * limit).limit(limit).all()

    # ✅ Convert ORM objects to Pydantic models
    category_list = [CategoryResponse(**category.__dict__) for category in categories]

    return {
        "categories": category_list,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total // limit) + (1 if total % limit > 0 else 0)
    }



@router.get("/search", response_model=list[CategoryResponse], summary="Search Categories by Name")
def search_categories(
    query: str = Query(..., description="Search term for category name"),
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    """
    🔍 Search for categories by name (Case-insensitive).
    - `query`: The search term to match category names.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can search categories.")

    # ✅ Case-insensitive search using `ilike` (for PostgreSQL, use `ilike`; for MySQL, use `like`)
    categories = db.query(Category).filter(Category.name.ilike(f"%{query}%")).all()

    return categories



# ✅ Admin: Approve or reject a category
@router.patch("/{category_id}/approve", response_model=CategoryResponse, summary="Admin: Approve/Reject category")
def approve_category(
    category_id: int,
    approval: CategoryApproval,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve/reject categories.")

    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    category.is_approved = approval.is_approved
    db.commit()
    db.refresh(category)

    # ✅ Fetch NGO details
    ngo = db.query(NGO).filter(NGO.universal_user_id == category.universal_user_id).first()
    universal_user = db.query(UniversalUser).filter(UniversalUser.id == category.universal_user_id).first()

    if ngo and universal_user:
        send_category_approval_email(universal_user.email, ngo.ngo_name, category.name)

    return category



@router.delete("/{category_id}/reject", summary="Admin: Reject and delete a category")
def reject_category(
    category_id: int,
    request: CategoryRejection,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    """Admin can reject a category and remove it from the database, 
       but ensures no products exist under this category before deletion.
    """
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can reject categories.")

    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    # ✅ Check if Products Exist in the Category
    product_exists = db.query(Product).filter(Product.category_id == category_id).first()
    if product_exists:
        raise HTTPException(
            status_code=400,
            detail=f"❌ Cannot delete category '{category.name}' because products exist under it. "
                   "Delete all products belonging to this category first."
        )

    rejection_reason = request.reason  

    print(f"🚫 Category '{category.name}' rejected. Reason: {rejection_reason}")

    try:
        # ✅ Fetch NGO and UniversalUser details
        ngo = db.query(NGO).filter(NGO.universal_user_id == category.universal_user_id).first()
        universal_user = db.query(UniversalUser).filter(UniversalUser.id == category.universal_user_id).first()

        if ngo and universal_user:
            send_category_rejection_email(universal_user.email, ngo.ngo_name, category.name, rejection_reason)

        # ✅ Delete the Category
        db.delete(category)
        db.commit()
        
        return {"message": f"🚫 Category '{category.name}' rejected and removed.", "reason": rejection_reason}
    
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error while deleting category.")
