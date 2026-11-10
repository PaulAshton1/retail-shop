# Smartstock Retail Shop Dashboard

This is an inventory management app for a retail store that combines a FastAPI backend with a SQLite database and a React + Vite frontend to let users manage product inventory, search products, sort pricing, and review basic stock metrics.

## What this app does

This project is designed to help manage a product catalog for an online or physical retail shop. It allows users to:

- View all inventory products in a dashboard layout
- Add new products with a name, price, and stock quantity
- Edit existing product information
- Delete products from the catalog
- Search inventory by product name
- Sort products by price (low-to-high or high-to-low)
- Browse inventory with pagination
- See quick stock summary cards, including low-stock warnings
- Track page-level inventory value and low-stock counts

The app starts with a small seeded dataset of sample products so it is immediately usable when you first run it.

## Tech stack

- Backend: FastAPI
- Database: SQLite
- ORM: SQLAlchemy
- Frontend: React + Vite
- Styling: Tailwind CSS
- HTTP client: Axios

## Project structure

```text
retail-shop/
├── README.md
├── backend/
│   ├── main.py
│   └── retail.db
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        └── assets/
```

## Backend overview

The backend is in [backend/main.py](backend/main.py). It creates a SQLite database named `retail.db` in the backend folder and defines a `products` table with the following fields:

- `id` - unique product ID
- `name` - product name
- `price` - product price
- `stock` - current available quantity

The app uses SQLAlchemy to manage the table and seed sample data if the database is empty.

### API endpoints

The backend exposes these routes:

- `GET /api/products`
  - Returns products with support for pagination and search
  - Query parameters:
    - `skip` (default: `0`)
    - `limit` (default: `5`)
    - `search` (optional search term)

- `POST /api/products`
  - Adds a new product
  - Body:
    ```json
    {
      "name": "Example Product",
      "price": 199.99,
      "stock": 12
    }
    ```

- `PUT /api/products/{product_id}`
  - Updates an existing product

- `DELETE /api/products/{product_id}`
  - Removes a product from inventory

The backend also enables CORS so the React frontend can communicate with it at `http://localhost:5173`.

## Frontend overview

The frontend is built in React and is located in the `frontend` folder. It communicates with the API using Axios and renders a dashboard with:

- Add product form
- Search field
- Sort selector
- Product cards
- Edit and delete controls
- Pagination buttons
- Summary cards for total catalog count, inventory value, and low-stock items

The main UI logic is in [frontend/src/App.jsx](frontend/src/App.jsx).

## How the app works

1. The FastAPI backend starts and creates the SQLite database and product table if needed.
2. If the product table is empty, mock product data is inserted automatically.
3. The frontend loads products from the backend and displays them in a paginated dashboard.
4. Users can create, update, delete, and search products from the UI.
5. Changes are pushed to the backend API, which saves them to the SQLite database.
6. The dashboard recalculates summary values and refreshes inventory data after each update.

## Running the app locally

### 1) Start the backend

Open a terminal in the `backend` folder:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy
uvicorn main:app --reload
```

The API should now be available at:

```text
http://localhost:8000
```

### 2) Start the frontend

Open a second terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

The app should open in the browser at:

```text
http://localhost:5173
```

## Default behavior

When the backend starts with an empty database, it seeds the project with product examples such as:

- Wireless Mechanical Keyboard
- Ergonomic Mouse
- Ultra-Wide Monitor
- Gaming Laptop
- Bluetooth Headphones

This makes the app feel complete immediately and helps demonstrate the dashboard features.

## Notes

- The database file is stored at `backend/retail.db`.
- The frontend expects the backend to run on `http://localhost:8000`.
- If you want to inspect or modify the product data directly, you can open the SQLite database in a database viewer or use SQLite CLI tools.

## Example usage workflow

1. Run the backend and frontend.
2. Open the dashboard in the browser.
3. Add a product such as `USB-C Charger` with a price of `29.99` and stock `40`.
4. Search for the product name in the inventory search box.
5. Edit its stock or price if needed.
6. Delete it when it is no longer in inventory.
7. Use the sorting and pagination controls to browse the catalog.

This app is a simple but effective inventory management dashboard that demonstrates how a modern frontend can work with a database-backed API in a practical retail context.
