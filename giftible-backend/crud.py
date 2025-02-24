from sqlalchemy.orm import Session
from models import User, NGO, Admin
from schemas import UserCreate, NGOCreate, AdminCreate
import bcrypt

# Hash Password
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Create a User
def create_user(db: Session, user: UserCreate):
    hashed_password = hash_password(user.password)
    db_user = User(**user.model_dump(exclude={"password"}), password=hashed_password, role="user")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Create an NGO
def create_ngo(db: Session, ngo: NGOCreate):
    hashed_password = hash_password(ngo.password)
    db_ngo = NGO(**ngo.model_dump(exclude={"password"}), password=hashed_password, role="ngo")
    db.add(db_ngo)
    db.commit()
    db.refresh(db_ngo)
    return db_ngo

# Create an Admin
def create_admin(db: Session, admin: AdminCreate):
    hashed_password = hash_password(admin.password)
    db_admin = Admin(**admin.model_dump(exclude={"password"}), password=hashed_password, role="admin")
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin
