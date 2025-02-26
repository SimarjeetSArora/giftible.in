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

# ✅ User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    contact_number = Column(String(15), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(10), nullable=False, default="user")  # user, ngo, admin
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)
    

    # Relationships
    universal_user = relationship("UniversalUser", back_populates="user")
    coupon_usages = relationship("CouponUsage", back_populates="user", cascade="all, delete-orphan")
    carts = relationship("Cart", back_populates="user", cascade="all, delete-orphan")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")

# ✅ NGO Model
class NGO(Base):
    __tablename__ = "ngos"

    id = Column(Integer, primary_key=True, index=True)
    ngo_name = Column(String(100), unique=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    contact_number = Column(String(15), unique=True, nullable=False, comment="Contact number with country code")
    password = Column(String(255), nullable=False)
    license = Column(String(255), nullable=False, comment="Path to license file")
    logo = Column(String(255), nullable=True, comment="Path to logo")
    role = Column(String(10), default="ngo", nullable=False)
    is_approved = Column(Boolean, default=False)
    account_holder_name = Column(String(100), nullable=False, comment="Name of the bank account holder")  # ✅ New field
    account_number = Column(String(20), nullable=False)
    ifsc_code = Column(String(11), nullable=False, comment="11-character IFSC code")
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(6), nullable=False, comment="6-digit PIN code")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)
    


    # Relationships
    universal_user = relationship("UniversalUser", back_populates="ngo")
    products = relationship("Product", back_populates="ngo", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="ngo", cascade="all, delete-orphan")

# ✅ Admin Model
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    contact_number = Column(String(15), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(10), default="admin", nullable=False)
    universal_user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)
    
    universal_user = relationship("UniversalUser", back_populates="admin")


class UniversalUser(Base):
    __tablename__ = "universal_users"

    id = Column(Integer, primary_key=True, index=True)
    contact_number = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum('user', 'ngo', 'admin'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="universal_user", uselist=False)
    ngo = relationship("NGO", back_populates="universal_user", uselist=False)
    admin = relationship("Admin", back_populates="universal_user", uselist=False)
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("universal_users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship to UniversalUser
    user = relationship("UniversalUser", back_populates="refresh_tokens")


# ✅ Product Model
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    is_approved = Column(Boolean, default=False)  # Admin approval
    is_live = Column(Boolean, default=False)      # NGO can make product live/unlive
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ngo = relationship("NGO", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

# ✅ Product Image Model
class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(255), nullable=False)  # Path to image

    # Relationships
    product = relationship("Product", back_populates="images")

# ✅ Cart Model
class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="carts")
    cart_items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

# ✅ Cart Item Model
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    full_name = Column(String(100), nullable=False)             # ✅ Added full name
    contact_number = Column(String(15), nullable=False)         # ✅ Added contact number
    address_line = Column(String(255), nullable=False)
    landmark = Column(String(100), nullable=True)               # ✅ Added landmark
    city = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    pincode = Column(String(10), nullable=False)                # ✅ Renamed from postal_code
    is_default = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="addresses")

# ✅ Coupon Model
class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    discount_percentage = Column(Float, nullable=False)
    max_discount = Column(Float, nullable=False, default=100.0)  # ✅ Add this field
    usage_limit = Column(Enum(UsageLimit), nullable=False, default=UsageLimit.one_time)  # Enum field
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    used_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # Usage timestamp

    # Relationships
    user = relationship("User", back_populates="coupon_usages")
    coupon = relationship("Coupon", back_populates="usages")

    # ✅ Ensure a user can’t use the same coupon multiple times (for one-time use)
    __table_args__ = (
        UniqueConstraint("user_id", "coupon_id", name="_user_coupon_uc"),
    )


class OrderStatus(enum.Enum):
    pending = "Pending"
    confirmed = "Confirmed"
    shipped = "Shipped"
    delivered = "Delivered"
    cancelled = "Cancelled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)  # ✅ Add this if missing
    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)
    razorpay_order_id = Column(String(100), nullable=True)  # ✅ Add this line
    payment_id = Column(String(255), nullable=True)  # ✅ Add this line
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    ngo = relationship("NGO")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=False)  # ✅ Track which NGO the product belongs to
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="order_items")
    product = relationship("Product")
    ngo = relationship("NGO")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)       # Added length
    description = Column(String(255), nullable=True)              # Added length
    is_approved = Column(Boolean, default=False)
    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=False)  # Link to NGO

    ngo = relationship("NGO", back_populates="categories")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    token = Column(String, nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(minutes=30))