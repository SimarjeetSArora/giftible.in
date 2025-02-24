from fastapi import FastAPI
import models
from database import engine
from routes import auth  # Import the auth routes
from fastapi.middleware.cors import CORSMiddleware
from routes import admin  # Import the new admin routes
from fastapi.staticfiles import StaticFiles
from routes import product, cart, checkout, order, payment, ngo
from routes import category
from routes import search



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checkout.router)
app.include_router(product.router)
app.include_router(cart.router)
app.include_router(order.router)
app.include_router(payment.router)
app.include_router(ngo.router)
app.include_router(category.router)
app.include_router(search.router)

app.include_router(admin.router, prefix="/admin", tags=["Admin"])

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Create tables (optional, since `init_db.py` already handles this)
models.Base.metadata.create_all(bind=engine)

# Include authentication routes
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "Welcome to Giftible API!"}
