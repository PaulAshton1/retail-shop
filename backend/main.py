from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Float, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# 1. Define SQLite Database URL (creates a file named retail.db in backend folder)
SQLALCHEMY_DATABASE_URL = "sqlite:///./retail.db"

# 2. Create the SQLAlchemy database engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a session factory for database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class for defining database tables
Base = declarative_base()


# 5. Define the Database Table Model (SQL table structure)
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
        ProductModel(name="Wireless Mechanical Keyboard", price=89.99, stock=15),
        ProductModel(name="Ergonomic Mouse", price=49.99, stock=25),
        ProductModel(name="Ultra-Wide Monitor", price=399.99, stock=5),
        ProductModel(name="Gaming Laptop", price=1299.99, stock=10),
        ProductModel(name="Bluetooth Headphones", price=79.99, stock=20),
        ProductModel(name="Wireless Headphones", price=149.99, stock=15),
        ProductModel(name="Smartphone", price=699.99, stock=10),
        ProductModel(name="Tablet", price=399.99, stock=15),
        ProductModel(name="Laptop", price=999.99, stock=8),
        ProductModel(name="Desktop Computer", price=1299.99, stock=5),
        ProductModel(name="Gaming Console", price=499.99, stock=12),
    ]
    db.add_all(initial_products)
    db.commit()
  db.close()


seed_initial_data()


# 11. GET Endpoint: Fetch all products from SQLite
@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
  products = db.query(ProductModel).all()
  return {"products": products}


# 12. POST Endpoint: Add a new product to SQLite
@app.post("/api/products")
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
  new_product = ProductModel(
      name=product.name, price=product.price, stock=product.stock
  )
  db.add(new_product)
  db.commit()
  db.refresh(new_product)  # Refresh to get the auto-assigned database ID
  return {"message": "Product added successfully!", "product": new_product}


# 13. PUT Endpoint: Update an existing product in SQLite
@app.put("/api/products/{product_id}")
def update_product(
    product_id: int, product: ProductUpdate, db: Session = Depends(get_db)
):
  db_product = (
      db.query(ProductModel).filter(ProductModel.id == product_id).first()
  )
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
  db_product = (
      db.query(ProductModel).filter(ProductModel.id == product_id).first()
  )
  if not db_product:
    raise HTTPException(status_code=404, detail="Product not found")

  db.delete(db_product)
  db.commit()
  return {"message": f"Product {product_id} deleted successfully"}