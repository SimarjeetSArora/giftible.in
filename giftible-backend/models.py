from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Float, ForeignKey,
    Enum, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timedelta
import enum





# ✅ UsageLimit Enum for coupons
class UsageLimit(enum.Enum):
    one_time = "one_time"       # Coupon can be used once per user
    one_per_day = "one_per_day" # Coupon can be used once per day per user


# ✅ NGO Model
class NGO(Base):
    __tablename__ = "ngos"

    id = Column(Integer, primary_key=True, index=True)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)
    
    ngo_name = Column(String(100), unique=True, nullable=False)
    account_holder_name = Column(String(100), nullable=False)  # ✅ Bank Account Holder Name
    account_number = Column(String(20), nullable=False)
    ifsc_code = Column(String(11), nullable=False)  # ✅ IFSC Code (11 characters)
    
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(6), nullable=False)  # ✅ 6-digit PIN Code
    
    license = Column(String(255), nullable=False)  # ✅ License File Path
    logo = Column(String(255), nullable=True)  # ✅ NGO Logo
    is_approved = Column(Boolean, default=False)  # ✅ Approval status

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ✅ Relationships
    universal_user = relationship("UniversalUser", back_populates="ngo")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)




class UniversalUser(Base):
    __tablename__ = "universal_users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)  # ✅ First Name
    last_name = Column(String(50), nullable=False)   # ✅ Last Name
    contact_number = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum('user', 'ngo', 'admin'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    email_verified = Column(Boolean, default=False)  # Track email verification
    contact_verified = Column(Boolean, default=False)  # Track contact verification

    # ✅ Relationships
    ngo = relationship("NGO", back_populates="universal_user", uselist=False)
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")  # ✅ Added Relationship
    carts = relationship("Cart", back_populates="user")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="creator", foreign_keys="[Category.universal_user_id]")
    products = relationship("Product", back_populates="universal_user", cascade="all, delete-orphan")  # 🔄 Updated
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")  # ✅ Ensure Orders Relationship Exists
    wishlist = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    payouts = relationship("Payout", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship to UniversalUser
    user = relationship("UniversalUser", back_populates="refresh_tokens")


# ✅ Product Model
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"))  # ✅ Fixed
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    is_approved = Column(Boolean, default=False)  # Admin approval required
    is_live = Column(Boolean, default=False)  # NGOs can publish/unpublish products
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    universal_user = relationship("UniversalUser", back_populates="products")  # 🔄 Updated
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    wishlist = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan")

# ✅ Product Image Model
class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(255), nullable=False)  # Path to image

    # Relationships
    product = relationship("Product", back_populates="images")

class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UniversalUser", back_populates="wishlist")
    product = relationship("Product", back_populates="wishlist")

# ✅ Cart Model (Updated to reference UniversalUser)
class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id"), nullable=False)

    # Relationships
    user = relationship("UniversalUser", back_populates="carts")  # ✅ Updated Relationship
    cart_items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


# ✅ Cart Item Model (No major changes)
class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # Relationships
    cart = relationship("Cart", back_populates="cart_items")
    product = relationship("Product")

# ✅ Address Model
class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)  # ✅ Fix here
    full_name = Column(String(100), nullable=False)  # ✅ Full Name
    contact_number = Column(String(15), nullable=False)  # ✅ Contact Number
    address_line = Column(String(255), nullable=False)
    landmark = Column(String(100), nullable=True)  # ✅ Landmark
    city = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    pincode = Column(String(10), nullable=False)  # ✅ Pincode
    is_default = Column(Boolean, default=False)

    # Relationships
    user = relationship("UniversalUser", back_populates="addresses")

# ✅ Coupon Model
class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    discount_percentage = Column(Float, nullable=False)
    max_discount = Column(Float, nullable=False, default=100.0)  # ✅ Max Discount
    usage_limit = Column(Enum(UsageLimit), nullable=False, default=UsageLimit.one_time)
    minimum_order_amount = Column(Float, nullable=False, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    usages = relationship("CouponUsage", back_populates="coupon", cascade="all, delete-orphan")

# ✅ Coupon Usage Model
class CouponUsage(Base):
    __tablename__ = "coupon_usages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("universal_users.id"), nullable=False)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    used_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("UniversalUser")
    coupon = relationship("Coupon")

    # ✅ Ensure unique coupon usage constraints
    __table_args__ = (
        UniqueConstraint("user_id", "coupon_id", name="_user_coupon_uc"),
    )


class OrderStatus(enum.Enum):
    pending = "Pending"
    processing = "Processing"
    shipped = "Shipped"
    delivered = "Delivered"
    cancelled = "Cancelled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)  # ✅ Ensure this exists
    total_amount = Column(Float, nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)
    razorpay_order_id = Column(String(100), nullable=True)  # ✅ Razorpay Order ID
    payment_id = Column(String(255), nullable=True)  # ✅ Payment ID
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("UniversalUser", back_populates="orders")  # ✅ Ensure relationship is defined
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")



class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(Enum("Pending", "Processing", "Shipped", "Delivered", "Cancelled", name="order_status"), default="Pending")
    cancellation_reason = Column(String(255), nullable=True)
    
    # ✅ Add timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product")





class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)       # Added length
    description = Column(String(255), nullable=True)              # Added length
    is_approved = Column(Boolean, default=False)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)

    # ✅ Relationship to UniversalUser
    creator = relationship("UniversalUser", back_populates="categories", foreign_keys=[universal_user_id])
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")  # 🔄 Added

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)  # ✅ Updated ForeignKey
    token = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(minutes=30))

    # Relationship
    user = relationship("UniversalUser", back_populates="password_reset_tokens")  # ✅ Added Relationship


class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)  # ✅ Correct Column
    amount = Column(Float, nullable=False)  # ✅ How much was requested
    status = Column(String(20), nullable=False, default="Pending")  # ✅ Status: Pending, Completed, Rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # ✅ When the payout was requested
    processed_at = Column(DateTime, nullable=True)  # ✅ When the payout was processed (Only for Completed)

    # ✅ Relationship
    user = relationship("UniversalUser", back_populates="payouts")