from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Product(BaseModel):
    name: str
    price: float
    stock: int

products_db = [
    {"id": 1, "name": "Wireless Mechanical Keyboard", "price": 89.99, "stock": 15},
    {"id": 2, "name": "Ergonomic Mouse", "price": 49.99, "stock": 25},
    {"id": 3, "name": "Ultra-Wide Monitor", "price": 399.99, "stock": 5},
]

@app.get("/api/products")
def get_products():
    return {"products": products_db}

@app.post("/api/products")
def add_product(product: Product):
    new_id = len(products_db) + 1 if products_db else 1
    new_item = {
        "id": new_id,
        "name": product.name,
        "price": product.price,
        "stock": product.stock
    }
    products_db.append(new_item)
    return {"message": "Product added successfully!", "product": new_item}

# 5. DELETE endpoint: Remove a product by ID
@app.delete("/api/products/{product_id}")
def delete_product(product_id: int):
    global products_db
    initial_length = len(products_db)
    products_db = [p for p in products_db if p["id"] != product_id]
    
    if len(products_db) == initial_length:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return {"message": f"Product {product_id} deleted successfully"}