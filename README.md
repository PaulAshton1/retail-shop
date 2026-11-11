# SmartStock Retail Inventory App

SmartStock is a full-stack retail inventory management application designed to make product management simple and efficient. It combines a FastAPI backend, SQLite database, and React + Vite frontend to provide a working dashboard for managing stock, prices, and product information in a retail business setting.

## Project overview

This project is built for a small retail operation that needs a lightweight way to manage inventory without a heavy enterprise system. The app allows users to:

- view all products in a clean dashboard layout
- add new items to inventory
- update product details
- remove products when they are no longer stocked
- search the catalog by name
- sort products by price
- browse items with pagination
- review key inventory metrics such as stock value and low-stock alerts

The backend stores all inventory data in SQLite, while the frontend provides an interactive interface for users to manage that inventory through a REST API.

## App features and functionalities

The app includes the following features:

- inventory dashboard with product cards
- create new product records
- edit existing product details in-place
- delete product entries from the catalog
- search by product name using a live search field
- sort by price: default, low-to-high, and high-to-low
- paginated product listing
- low-stock badge for products with stock at or below 5
- summary tiles showing:
  - total number of products
  - inventory value for the current page
  - count of low-stock items
- automatic database seeding for demo inventory on first run

## Tech stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite

### Frontend
- React
- Vite
- JavaScript
- Axios
- Tailwind CSS

### API and validation
- RESTful endpoints
- Pydantic models for request validation
- CORS middleware for frontend connection

## Backend structure

The backend is located in the `backend` directory.

### Main backend file
- `backend/main.py`

### Backend responsibilities
- creates the SQLite database file (`backend/retail.db`)
- defines the `products` table with SQLAlchemy models
- seeds sample product data when the database is empty
- exposes CRUD endpoints for inventory operations
- validates API request payloads using Pydantic
- enables CORS so the frontend can access it from the local dev server

### Product model

The database uses a `ProductModel` table with the following fields:

- `id`: unique product identifier
- `name`: product name
- `price`: product price
- `stock`: current stock count

### Seeded example data

When the app starts and the database has no products, it inserts sample products such as:

- Wireless Mechanical Keyboard
- Ergonomic Mouse
- Ultra-Wide Monitor
- Gaming Laptop
- Bluetooth Headphones
- Smartphone
- Tablet
- Laptop
- Desktop Computer
- Gaming Console

This ensures the UI is populated immediately and demonstrates the app's capabilities.

## Frontend structure

The frontend is located in the `frontend` directory.

### Main frontend files
- `frontend/src/App.jsx` – dashboard logic and product UI
- `frontend/src/main.jsx` – app bootstrap
- `frontend/src/index.css` – global styling
- `frontend/index.html` – app entry page
- `frontend/package.json` – frontend scripts and dependencies

### Frontend responsibilities
- calls backend endpoints using Axios
- displays the product dashboard
- manages product creation and editing states
- handles delete actions
- supports search, sorting, and pagination
- renders summary metrics and product cards
- shows warnings for low-stock inventory

## How the frontend works

The main React component in `frontend/src/App.jsx` tracks several application states, including:

- current product list
- loading and error states
- add-product form values
- edit-product form values
- search term
- sort mode
- current page and total results

The dashboard shows:

- a header section
- quick stat cards
- add-product form
- search and sort controls
- inventory grid with each card representing a product
- edit and delete actions per item
- pagination controls beneath the product list

## API details

The backend exposes four main CRUD routes.

### 1) Get products
`GET /api/products`

Returns a paginated list of products and supports search filtering.

Query parameters:
- `skip` (default: `0`)
- `limit` (default: `5`)
- `search` (optional search string)

Example request:
```http
GET http://localhost:8000/api/products?skip=0&limit=6&search=keyboard
```

Example response:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Wireless Mechanical Keyboard",
      "price": 89.99,
      "stock": 15
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 6
}
```

### 2) Add a product
`POST /api/products`

Creates a product record in the database.

Request body:
```json
{
  "name": "USB-C Charger",
  "price": 29.99,
  "stock": 40
}
```

Example response:
```json
{
  "message": "Product added successfully!",
  "product": {
    "id": 12,
    "name": "USB-C Charger",
    "price": 29.99,
    "stock": 40
  }
}
```

### 3) Update a product
`PUT /api/products/{product_id}`

Updates an existing product record by ID.

Request body:
```json
{
  "name": "Updated Product",
  "price": 69.99,
  "stock": 20
}
```

If a product is not found, the API returns:
```json
{
  "detail": "Product not found"
}
```

### 4) Delete a product
`DELETE /api/products/{product_id}`

Deletes the product matching the given ID.

Example response:
```json
{
  "message": "Product 3 deleted successfully"
}
```

## How the app works

1. The FastAPI backend starts and creates the SQLite database if it does not already exist.
2. If the `products` table is empty, the app seeds it with demo product data.
3. The React frontend fetches these products from the backend using Axios.
4. Users interact with the app through the dashboard.
5. Add, update, and delete actions are sent to the backend API.
6. The database is updated and the frontend refreshes the data automatically.
7. Summary metrics such as low-stock counts and inventory value are recalculated for the current page.

## Setup and run instructions

### Prerequisites

Before running the app, make sure you have:

- Python installed
- Node.js and npm installed
- a terminal environment available

### 1) Install backend dependencies

From the project root, run:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy
```

### 2) Start the backend

Run:

```bash
cd backend
uvicorn main:app --reload
```

The backend will be available at:
```text
http://localhost:8000
```

### 3) Install frontend dependencies

Open a second terminal and run:

```bash
cd frontend
npm install
```

### 4) Start the frontend

Run:

```bash
cd frontend
npm run dev
```

The app should open in the browser at:
```text
http://localhost:5173
```

## Example usage flow

A typical user flow with the app is as follows:

1. Start the backend and frontend.
2. Open the application at `http://localhost:5173`.
3. Review the inventory cards and summary metrics.
4. Add a new product such as:
   - name: `USB-C Charger`
   - price: `29.99`
   - stock: `40`
5. Search for the product name in the search box.
6. Use the price sort dropdown to sort the list.
7. Edit a product to update its stock or price.
8. Delete a product if it has been discontinued.
9. Move across pages using the pagination controls.

## Notes

- the database file is stored in `backend/retail.db`
- the frontend expects the backend to run on `http://localhost:8000`
- CORS is configured to allow requests from `http://localhost:5173`
- this project is a lightweight starter app and can be extended with authentication, categories, sales tracking, user roles, or order management

## Summary

SmartStock is a practical retail inventory management solution that demonstrates how a FastAPI backend, SQLite database, and React frontend can work together in a real-world product management workflow. It is easy to understand, easy to run locally, and provides a strong foundation for future expansion.
