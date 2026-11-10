from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Float, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# 1. Define SQLite Database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./retail.db"

# 2. Create the SQLAlchemy database engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a session factory for database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class for defining database tables
Base = declarative_base()

# 5. Define the Database Table Model
class ProductModel(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    price = Column(Float)
    stock = Column(Integer)

# 6. Automatically create the database tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI()

# 7. Enable CORS for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 8. Dependency injection to open and close DB sessions safely per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 9. Pydantic validation schemas for incoming request data
class ProductCreate(BaseModel):
    name: str
    price: float
    stock: int

class ProductUpdate(BaseModel):
    name: str
    price: float
    stock: int

# 10. Seed initial mock data into SQLite if the table is currently empty
def seed_initial_data():
    db = SessionLocal()
    count = db.query(ProductModel).count()
    if count == 0:
        initial_products = [
            ProductModel(name="Wireless Mechanical Keyboard", price=8999.00, stock=15),
            ProductModel(name="Ergonomic Mouse", price=4999.00, stock=25),
            ProductModel(name="Ultra-Wide Monitor", price=45000.00, stock=5),
            ProductModel(name="Gaming Laptop", price=129999.00, stock=10),
            ProductModel(name="Bluetooth Headphones", price=7999.00, stock=20),
            ProductModel(name="Smartphone", price=69999.00, stock=10),
        ]
        db.add_all(initial_products)
        db.commit()
    db.close()

seed_initial_data()

# 11. GET Endpoint: Fetch paginated and searched products from SQLite
@app.get("/api/products")
def get_products(
    skip: int = 0,
    limit: int = 6,
    search: str = "",
    db: Session = Depends(get_db),
):
    query = db.query(ProductModel)

    if search:
        query = query.filter(ProductModel.name.ilike(f"%{search}%"))

    total = query.count()
    products = query.offset(skip).limit(limit).all()

    return {"products": products, "total": total, "skip": skip, "limit": limit}

# 11b. Metrics Endpoint: Calculate global inventory value and global low stock count
@app.get("/api/metrics")
def get_metrics(db: Session = Depends(get_db)):
    products = db.query(ProductModel).all()
    total_inventory_value = sum(p.price * p.stock for p in products)
    total_low_stock = sum(1 for p in products if p.stock <= 5)
    return {
        "total_inventory_value": total_inventory_value,
        "total_low_stock": total_low_stock
    }

# 12. POST Endpoint: Add a new product to SQLite
@app.post("/api/products")
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = ProductModel(
        name=product.name, price=product.price, stock=product.stock
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"message": "Product added successfully!", "product": new_product}

# 13. PUT Endpoint: Update an existing product in SQLite
@app.put("/api/products/{product_id}")
def update_product(
    product_id: int, product: ProductUpdate, db: Session = Depends(get_db)
):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_product.name = product.name
    db_product.price = product.price
    db_product.stock = product.stock

    db.commit()
    db.refresh(db_product)
    return {"message": "Product updated successfully!", "product": db_product}

# 14. DELETE Endpoint: Remove a product from SQLite
@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": f"Product {product_id} deleted successfully"}