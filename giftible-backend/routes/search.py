# routes/search.py

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Product, Category, NGO
from schemas import SearchResult

router = APIRouter(
    prefix="/api",
    tags=["Search"],
)

# routes/search.py

@router.get("/search", response_model=list[SearchResult])
def search_items(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.name.ilike(f"%{q}%")).all()
    categories = db.query(Category).filter(Category.name.ilike(f"%{q}%")).all()
    ngos = db.query(NGO).filter(NGO.ngo_name.ilike(f"%{q}%")).all()

    results = [
        {"id": product.id, "type": "Product", "name": product.name, "description": product.description} for product in products
    ] + [
        {"id": category.id, "type": "Category", "name": category.name, "description": category.description} for category in categories
    ] + [
        {"id": ngo.id, "type": "NGO", "name": ngo.ngo_name, "description": ""} for ngo in ngos
    ]

    if not results:
        raise HTTPException(status_code=404, detail="No matching results found.")

    return results
