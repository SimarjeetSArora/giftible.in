from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import NGO
from schemas import NGOResponse

router = APIRouter(prefix="/ngo", tags=["NGO"])

# 1️⃣ Get All Approved NGOs
@router.get("/approved", response_model=list[NGOResponse])
def get_approved_ngos(db: Session = Depends(get_db)):
    ngos = db.query(NGO).filter(NGO.is_approved == True).all()
    return ngos

# 2️⃣ Get NGO by ID
@router.get("/{ngo_id}", response_model=NGOResponse)
def get_ngo_by_id(ngo_id: int, db: Session = Depends(get_db)):
    ngo = db.query(NGO).filter(NGO.id == ngo_id, NGO.is_approved == True).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found or not approved.")
    return ngo