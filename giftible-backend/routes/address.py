from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Address, UniversalUser
from schemas import AddressCreate, AddressUpdate
from database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/addresses", tags=["Addresses"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # ✅ Ensure we fetch user from `universal_users`
        user = db.query(UniversalUser).filter(UniversalUser.id == int(user_id)).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError as e:
        print("JWT Error:", e)  # Log the actual error
        raise HTTPException(status_code=401, detail="Invalid token.")



# ✅ Add New Address
@router.post("/", summary="User: Add a new address")
def add_address(address: AddressCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user = db.query(UniversalUser).filter(UniversalUser.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")

    new_address = Address(
        universal_user_id=current_user.id,
        full_name=address.full_name,
        contact_number=address.contact_number,
        address_line=address.address_line,
        landmark=address.landmark,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        is_default=address.is_default,
    )

    db.add(new_address)
    db.commit()
    db.refresh(new_address)

    return {"message": "✅ Address added successfully", "address": new_address}




# ✅ Fix all queries to use `universal_user_id`
@router.get("/", summary="User: Get saved addresses")
def get_addresses(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Fetches all addresses for the current user."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized - Invalid token.")

    addresses = db.query(Address).filter(Address.universal_user_id == current_user.id).all()

    # ✅ Always return an array, even if empty
    return addresses if addresses else []





# ✅ Edit Address
@router.put("/{address_id}", summary="User: Edit an existing address")
def edit_address(address_id: int, updated_address: AddressUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    address = db.query(Address).filter(Address.id == address_id, Address.universal_user_id == current_user.id).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    for key, value in updated_address.dict(exclude_unset=True).items():
        setattr(address, key, value)

    db.commit()
    db.refresh(address)
    return {"message": "Address updated successfully", "address": address}



# ✅ Delete Address

@router.delete("/{address_id}", summary="User: Delete an address")
def delete_address(address_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    address = db.query(Address).filter(Address.id == address_id, Address.universal_user_id == current_user.id).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    try:
        db.delete(address)
        db.commit()
        return {"message": "Address deleted successfully"}

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="An order is already placed with this address")



# ✅ Set Default Address
@router.put("/{address_id}/set-default", summary="User: Set an address as default")
def set_default_address(address_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Sets an address as the user's default address."""
    
    address = db.query(Address).filter(Address.id == address_id, Address.universal_user_id == current_user.id).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # ✅ Ensure at least one address exists before setting a default
    if db.query(Address).filter(Address.universal_user_id == current_user.id).count() == 0:
        raise HTTPException(status_code=400, detail="You must have at least one address.")

    # Remove previous default address
    db.query(Address).filter(Address.universal_user_id == current_user.id, Address.is_default == True).update({"is_default": False})

    # Set the new default address
    address.is_default = True
    db.commit()
    db.refresh(address)

    return {"message": "Default address set successfully", "address": address}




# ✅ Get a Single Address (Needed for Editing)
@router.get("/{address_id}", summary="User: Get a single address")
def get_address(address_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    address = db.query(Address).filter(Address.id == address_id, Address.universal_user_id == current_user.id).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    return address
