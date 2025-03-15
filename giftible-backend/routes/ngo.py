from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import NGO, UniversalUser
from schemas import NGOResponse, UserResponse, UserProfileUpdate, PaginatedNGOResponse
from .auth import get_current_user

router = APIRouter(prefix="/ngo", tags=["NGO"])


@router.get("/approved", response_model=PaginatedNGOResponse)  # ✅ Use new response model
def get_approved_ngos(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1),  # ✅ Limit for pagination
    offset: int = Query(0, ge=0),  # ✅ Offset for pagination
):
    """Retrieve paginated list of approved NGOs with relevant details."""

    # ✅ Get total count of approved NGOs
    total_ngos = db.query(NGO).filter(NGO.is_approved == True).count()

    ngos = (
        db.query(NGO, UniversalUser)
        .join(UniversalUser, UniversalUser.id == NGO.universal_user_id)
        .filter(NGO.is_approved == True)
        .limit(limit)
        .offset(offset)
        .all()
    )

    return {
        "total": total_ngos,  # ✅ Pagination metadata
        "limit": limit,
        "offset": offset,
        "ngos": [
            NGOResponse(
                id=ngo.id,
                universal_user_id=ngo.universal_user_id,
                ngo_name=ngo.ngo_name,
                is_approved=ngo.is_approved,
                logo=ngo.logo,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                contact_number=user.contact_number,
                address=ngo.address,
                city=ngo.city,
                state=ngo.state,
                pincode=ngo.pincode,
            )
            for ngo, user in ngos
        ],
    }


# ✅ Get NGO by ID
@router.get("/{ngo_id}", response_model=NGOResponse)
def get_ngo_by_id(ngo_id: int, db: Session = Depends(get_db)):
    ngo = db.query(NGO).filter(NGO.id == ngo_id, NGO.is_approved == True).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found or not approved.")
    return ngo

# ✅ View NGO Profile
@router.get("/profile", response_model=UserResponse)
def get_ngo_profile(db: Session = Depends(get_db), current_user: UniversalUser = Depends(get_current_user)):
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Not authorized")

    ngo_profile = db.query(NGO).filter(NGO.universal_user_id == current_user.id).first()
    if not ngo_profile:
        raise HTTPException(status_code=404, detail="NGO profile not found")

    return {
        "id": ngo_profile.id,
        "ngo_name": ngo_profile.ngo_name,
        "is_approved": ngo_profile.is_approved,
        "logo": ngo_profile.logo,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "contact_number": current_user.contact_number,
        "address": ngo_profile.address,
        "city": ngo_profile.city,
        "state": ngo_profile.state,
        "pincode": ngo_profile.pincode,
    }

# ✅ Edit NGO Profile
@router.put("/profile/edit", response_model=UserResponse)
def edit_ngo_profile(
    updated_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Not authorized")

    ngo_profile = db.query(NGO).filter(NGO.universal_user_id == current_user.id).first()
    if not ngo_profile:
        raise HTTPException(status_code=404, detail="NGO profile not found")

    if updated_data.first_name:
        current_user.first_name = updated_data.first_name
    if updated_data.last_name:
        current_user.last_name = updated_data.last_name
    if updated_data.address:
        ngo_profile.address = updated_data.address
    if updated_data.city:
        ngo_profile.city = updated_data.city
    if updated_data.state:
        ngo_profile.state = updated_data.state
    if updated_data.pincode:
        ngo_profile.pincode = updated_data.pincode

    db.commit()
    db.refresh(current_user)
    db.refresh(ngo_profile)

    return {
        "id": ngo_profile.id,
        "ngo_name": ngo_profile.ngo_name,
        "is_approved": ngo_profile.is_approved,
        "logo": ngo_profile.logo,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "contact_number": current_user.contact_number,
        "address": ngo_profile.address,
        "city": ngo_profile.city,
        "state": ngo_profile.state,
        "pincode": ngo_profile.pincode,
    }
