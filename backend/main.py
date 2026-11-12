from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Float, Integer, String, or_, create_engine
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
    sku = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True, default="General")
    price = Column(Float)
    stock = Column(Integer)

# 6. Automatically create the database tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI()

# 7. Enable CORS for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    sku: str = ""
    name: str
    category: str = "General"
    price: float
    stock: int

class ProductUpdate(BaseModel):
    sku: str
    name: str
    category: str
    price: float
    stock: int

# 10. Seed initial mock data into SQLite if the table is currently empty
def seed_initial_data():
    db = SessionLocal()
    count = db.query(ProductModel).count()
    if count == 0:
        initial_products = [
            ProductModel(sku="PRD-001", name="Wireless Mechanical Keyboard", category="Electronics", price=8999.00, stock=15),
            ProductModel(sku="PRD-002", name="Ergonomic Mouse", category="Electronics", price=4999.00, stock=25),
            ProductModel(sku="PRD-003", name="Ultra-Wide Monitor", category="Electronics", price=45000.00, stock=5),
            ProductModel(sku="PRD-004", name="Gaming Laptop", category="Electronics", price=129999.00, stock=10),
            ProductModel(sku="PRD-005", name="Bluetooth Headphones", category="Audio", price=7999.00, stock=20),
            ProductModel(sku="PRD-006", name="Fresh Milk 1L", category="Dairy & Drinks", price=180.00, stock=4),
        ]
        db.add_all(initial_products)
        db.commit()
    db.close()

seed_initial_data()

# Root Health-Check Endpoint (Resolves 404 on bare domain)
@app.get("/")
def read_root():
    return {"message": "SmartStock API is running successfully!"}

# 11. GET Endpoint: Fetch paginated and multi-field searched products from SQLite
@app.get("/api/products")
def get_products(
    skip: int = 0,
    limit: int = 6,
    search: str = "",
    db: Session = Depends(get_db),
):
    query = db.query(ProductModel)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                ProductModel.name.ilike(search_pattern),
                ProductModel.sku.ilike(search_pattern),
                ProductModel.category.ilike(search_pattern)
            )
        )

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
    if product.sku and product.sku.strip():
        new_sku = product.sku.strip()
    else:
        total_count = db.query(ProductModel).count()
        new_sku = f"PRD-{str(total_count + 1).zfill(3)}"

    new_product = ProductModel(
        sku=new_sku,
        name=product.name,
        category=product.category.strip() if product.category else "General",
        price=product.price, 
        stock=product.stock
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

    db_product.sku = product.sku
    db_product.name = product.name
    db_product.category = product.category.strip() if product.category else "General"
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