from pydantic import BaseModel, EmailStr, constr, Field
from typing import Optional, List, Dict
from models import UsageLimit, OrderStatus
from datetime import datetime

# ✅ Common Schema for All Users
class UserBase(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    contact_number: str
    


# ✅ Schema for User Registration
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    contact_number: str
    email: EmailStr
    password: str


# ✅ Schema for NGO Registration
class NGOCreateForm(BaseModel):
    ngo_name: str
    first_name: str
    last_name: str
    email: EmailStr
    contact_number: str
    password: str
    account_holder_name: str
    account_number: str
    ifsc_code: str
    address: str
    city: str
    state: str
    pincode: str


# ✅ Schema for Admin Registration
class AdminCreate(BaseModel):
    first_name: str
    last_name: str
    contact_number: str
    email: EmailStr
    password: str



# ✅ Response Schema for Users
class UserResponse(UserBase):
    id: int
    first_name: str
    last_name: str
    contact_number: str
    email: EmailStr
    email_verified: bool
    contact_verified: bool
    created_at: Optional[datetime] = None


    class Config:
        from_attributes = True


# ✅ Schema for Registration Response
class RegistrationResponse(BaseModel):
    message: str
    user: UserResponse  # ✅ Embedding UserBase for simplicity
    verification_required: bool  # ✅ Indicates email/contact verification is needed

    class Config:
        from_attributes = True


# ✅ CartItem Create Schema
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int


# ✅ Address Create & Update Schemas
class AddressCreate(BaseModel):
    full_name: str = Field(..., max_length=100, description="Full name of the address holder")
    contact_number: str = Field(..., max_length=15, description="Contact number")
    address_line: str = Field(..., max_length=255, description="Street address")
    landmark: Optional[str] = Field(None, max_length=100, description="Nearby landmark (optional)")
    pincode: str = Field(..., max_length=10, description="Pincode of the address")
    city: str = Field(..., max_length=50, description="City name")
    state: str = Field(..., max_length=50, description="State name")
    is_default: Optional[bool] = False  # ✅ Fixed


class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    contact_number: Optional[str] = None
    address_line: Optional[str] = None
    landmark: Optional[str] = None
    pincode: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None


# ✅ Coupon Schemas
class CouponApply(BaseModel):
    code: str


class CouponCreate(BaseModel):
    code: str
    discount_percentage: float
    max_discount: float  
    usage_limit: UsageLimit
    minimum_order_amount: float
    is_active: bool = True


class CouponResponse(BaseModel):
    id: int
    code: str
    discount_percentage: float
    max_discount: float
    usage_limit: str
    minimum_order_amount: float
    is_active: bool

    class Config:
        from_attributes = True

class CouponToggle(BaseModel):
    is_active: bool  # ✅ Expecting True/False to activate or deactivate


# ✅ Product Schemas
class ImageResponse(BaseModel):
    id: int
    image_url: str

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str]
    images: List[ImageResponse]
    total_sales: Optional[float] = None  # ✅ Added total_sales as optional
    ngo_name: Optional[str] = None  # ✅ Added NGO name as optional
    category_id: Optional[int] = None  # ✅ Added category_id as optional
    category_name: Optional[str] = None  # ✅ Added NGO name as optional

    class Config:
        from_attributes = True



# ✅ Order Item Response (Now contains status)
class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float
    status: OrderStatus  # ✅ Now each order item has its own status
    cancellation_reason: Optional[str] = None  # ✅ Added Cancellation Reason
    created_at: datetime
    updated_at: datetime
    product: ProductResponse  # ✅ Ensure product details are included

    class Config:
        from_attributes = True



# ✅ Order Response (No `status` at order level)
class OrderResponse(BaseModel):
    id: int
    universal_user_id: int  # ✅ Match `universal_user_id` in `Order`
    total_amount: float
    created_at: datetime
    updated_at: Optional[datetime]
    order_items: List[OrderItemResponse]  # ✅ Each order item has status, timestamps

    class Config:
        from_attributes = True


# ✅ Request model to update order item status
class UpdateOrderItemStatusRequest(BaseModel):
    status: OrderStatus  # ✅ Change status at `OrderItem` level


class CancelOrderItemRequest(BaseModel):
    reason: str  # ✅ Store the cancellation reason



# ✅ NGO Response Schema
class NGOResponse(BaseModel):
    id: int
    universal_user_id: Optional[int] = None
    ngo_name: str
    is_approved: bool
    logo: Optional[str] = None
    license: Optional[str] = None
    account_holder_name: Optional[str] = None  # ✅ Make optional
    account_number: Optional[str] = None  # ✅ Make optional
    ifsc_code: Optional[str] = None  # ✅ Make optional
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaginatedNGOResponse(BaseModel):
    total: int
    limit: int
    offset: int
    ngos: List[NGOResponse]  # ✅ Ensure NGOs are inside a list



# ✅ Category Schemas
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_approved: bool

    class Config:
        from_attributes = True

class PaginatedCategoryResponse(BaseModel):
    categories: List[CategoryResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class CategoryApproval(BaseModel):
    is_approved: bool

class CategoryRejection(BaseModel):
    reason: str  # Required reason for rejection


# ✅ Password Reset Schemas
class ForgotPasswordRequest(BaseModel):
    contact_number: constr(min_length=10, max_length=15)


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: constr(min_length=6)


# ✅ Search Result Schema
class SearchResult(BaseModel):
    id: int
    type: str
    name: str
    description: str


# ✅ Authentication Schemas
class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


# ✅ **User Profile Response**
class UserProfileResponse(UserBase):
    id: int
    role: str  

    class Config:
        from_attributes = True


# ✅ **Update Profile Schema**
class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    contact_number: Optional[str] = None


class NGORejectionRequest(BaseModel):
    rejection_reason: str

class NGOEditRequest(BaseModel):
    ngo_name: str
    account_holder_name: str
    account_number: str
    ifsc_code: str
    address: str
    city: str
    state: str
    pincode: str
    license: str  # NGO registration/license number
    logo: str  # URL or file path to the NGO logo
    first_name: str
    last_name: str
    contact_number: str
    email: str




class PayoutRequest(BaseModel):
    universal_user_id: int
    amount: float

class PayoutResponse(BaseModel):
    id: int
    universal_user_id: int
    ngo_name: Optional[str] = None  # ✅ Added NGO name as optional
    amount: float
    status: str
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InventoryUpdate(BaseModel):
    stock: int




# ✅ Review Schema for Creating a Review
class ReviewCreate(BaseModel):
    order_item_id: int
    rating: int
    comment: Optional[str] = None

# ✅ Review Response Schema
class ReviewResponse(BaseModel):
    id: int
    universal_user_id: int
    product_id: int
    order_item_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
