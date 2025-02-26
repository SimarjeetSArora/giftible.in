from pydantic import BaseModel, EmailStr, constr, Field
from typing import Optional, List
from models import UsageLimit, OrderStatus
from datetime import datetime

# Common schema for all users
class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    contact_number: str

# Schema for User Registration
class UserCreate(UserBase):
    password: str

# Schema for NGO Registration
from pydantic import BaseModel, EmailStr

class NGOCreate(BaseModel):
    ngo_name: str
    first_name: str
    last_name: str
    email: EmailStr
    contact_number: str
    password: str
    account_number: str  # ✅ Add this
    ifsc_code: str       # ✅ Add this

   
# Schema for Admin Registration
class AdminCreate(UserBase):
    password: str

# Response Schema
class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True  # Allows ORM response

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int

class AddressCreate(BaseModel):
    full_name: str = Field(..., max_length=100, description="Full name of the address holder")
    contact_number: str = Field(..., max_length=15, description="Contact number")
    address_line: str = Field(..., max_length=255, description="Street address")
    landmark: str = Field(None, max_length=100, description="Nearby landmark (optional)")
    pincode: str = Field(..., max_length=10, description="Pincode of the address")
    city: str = Field(..., max_length=50, description="City name")
    state: str = Field(..., max_length=50, description="State name")

class CouponApply(BaseModel):
    code: str

class CouponCreate(BaseModel):
    code: str
    discount_percentage: float
    max_discount: float  # ✅ Added
    usage_limit: UsageLimit
    minimum_order_amount: float
    is_active: bool = True

class CouponResponse(BaseModel):
    id: int
    code: str
    discount_percentage: float
    usage_limit: str
    minimum_order_amount: float
    is_active: bool

    class Config:
        orm_mode = True

class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    price: float

    class Config:
        orm_mode = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    ngo_id: int
    total_amount: float
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItemResponse]

    class Config:
        orm_mode = True

class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus




class ImageResponse(BaseModel):
    id: int
    image_url: str

    class Config:
        orm_mode = True

class ProductResponse(BaseModel):
    id: int
    name: str
    price: int
    description: Optional[str]
    images: List[ImageResponse] = []
    
    class Config:
        orm_mode = True

class OrderItemResponse(BaseModel):
    id: int
    quantity: int
    price: float
    product: ProductResponse

class OrderResponse(BaseModel):
    id: int
    status: str
    created_at: datetime
    total_amount: float
    order_items: List[OrderItemResponse]


class NGOResponse(BaseModel):
    id: int
    ngo_name: str
    logo: str
    is_approved: bool

    class Config:
        orm_mode = True


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_approved: bool

    class Config:
        orm_mode = True

class CategoryApproval(BaseModel):
    is_approved: bool

class ForgotPasswordRequest(BaseModel):
    contact_number: constr(min_length=10, max_length=15)

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: constr(min_length=6)

class SearchResult(BaseModel):
    id: int
    type: str
    name: str
    description: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: str

