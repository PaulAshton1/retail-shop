import { useState, useEffect } from 'react';
import axios from 'axios';

// Automatically uses your live Railway backend on Vercel, or localhost when testing locally
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form input states for Creating
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Editing an existing product
  const [editingId, setEditingId] = useState(null);
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Search, Sort, and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Global catalog metrics states
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [totalLowStockCount, setTotalLowStockCount] = useState(0);

  const pageSize = 6; // Items per page

  const fetchProducts = () => {
    setLoading(true);
    const skip = (currentPage - 1) * pageSize;
    
    Promise.all([
      axios.get(`${API_URL}/api/products?skip=${skip}&limit=${pageSize}&search=${searchTerm}`),
      axios.get(`${API_URL}/api/metrics`)
    ])
      .then(([pageRes, metricsRes]) => {
        setProducts(pageRes.data.products);
        setTotalProducts(pageRes.data.total);
        setTotalInventoryValue(metricsRes.data.total_inventory_value);
        setTotalLowStockCount(metricsRes.data.total_low_stock);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setError('Could not load products from backend.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !stock) return;
    setIsSubmitting(true);

    axios.post(`${API_URL}/api/products`, {
      sku: sku.trim(),
      name,
      category: category.trim() || 'General',
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    })
      .then(() => {
        setSku(''); setName(''); setCategory(''); setPrice(''); setStock('');
        setIsSubmitting(false);
        fetchProducts();
      })
      .catch(err => {
        console.error('Error adding product:', err);
        setIsSubmitting(false);
      });
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/api/products/${id}`)
      .then(() => {
        fetchProducts();
      })
      .catch(err => console.error('Error deleting product:', err));
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditSku(product.sku || '');
    setEditName(product.name);
    setEditCategory(product.category || 'General');
    setEditPrice(product.price);
    setEditStock(product.stock);
  };

  const handleUpdate = (id) => {
    axios.put(`${API_URL}/api/products/${id}`, {
      sku: editSku.trim(),
      name: editName,
      category: editCategory.trim() || 'General',
      price: parseFloat(editPrice),
      stock: parseInt(editStock, 10)
    })
      .then(() => {
        setEditingId(null);
        fetchProducts();
      })
      .catch(err => console.error('Error updating product:', err));
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'low-high') return a.price - b.price;
    if (sortOrder === 'high-low') return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
  const pageInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const pageLowStockCount = products.filter(p => p.stock <= 5).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight"> 📦SmartStock | Retail Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-1">Efficiently manage your retail inventory with SmartStock</p>
        </header>

        {/* Summary Metrics Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-center shadow-xs">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Total Products</p>
            <h3 className="text-2xl font-bold text-blue-900">{totalProducts}</h3>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 text-center shadow-xs">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Page Stock Value</p>
            <h3 className="text-xl font-bold text-emerald-900">
              KES {pageInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>

          <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-5 text-center shadow-xs">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Total Stock Value</p>
            <h3 className="text-xl font-bold text-teal-900">
              KES {totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>

          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-5 text-center shadow-xs">
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-rose-900">
              {totalLowStockCount} <span className="text-xs font-normal text-rose-600">({pageLowStockCount} on page)</span>
            </h3>
          </div>
        </section>

        {/* Add Product Form */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <input 
              type="text" 
              placeholder="SKU (Optional)" 
              value={sku} 
              onChange={(e) => setSku(e.target.value)} 
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
            />
            <input 
              type="text" 
              placeholder="Product Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
            />
            <input 
              type="text" 
              placeholder="Category (e.g., Drinks)" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
            />
            <input 
              type="number" 
              step="0.01" 
              placeholder="Price (KES)" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
            />
            <input 
              type="number" 
              placeholder="Stock Quantity" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              required 
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
            />
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </section>

        {/* Search and Sort Controls Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input 
              type="text" 
              placeholder="🔍 Search by name, SKU, or category..." 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-xs" 
            />
          </div>
          <div>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)} 
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-xs cursor-pointer"
            >
              <option value="default">Sort by: Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </section>

        {/* Inventory Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Inventory Items</h2>
          <span className="text-xs font-medium text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full">
            Page {currentPage} of {totalPages} ({totalProducts} total)
          </span>
        </div>

        {loading && <p className="text-center text-slate-500 py-10">Loading inventory...</p>}
        {error && <p className="text-center text-rose-600 py-10">{error}</p>}

        {!loading && sortedProducts.length === 0 && (
          <div className="text-center bg-white border border-slate-200 rounded-2xl p-12 shadow-xs">
            <p className="text-slate-500">No products match your search criteria.</p>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedProducts.map(product => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              
              {editingId === product.id ? (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={editSku} 
                    onChange={(e) => setEditSku(e.target.value)} 
                    placeholder="SKU"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 bg-slate-50" 
                  />
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    placeholder="Product Name"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm" 
                  />
                  <input 
                    type="text" 
                    value={editCategory} 
                    onChange={(e) => setEditCategory(e.target.value)} 
                    placeholder="Category"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm" 
                  />
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editPrice} 
                    onChange={(e) => setEditPrice(e.target.value)} 
                    placeholder="Price"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm" 
                  />
                  <input 
                    type="number" 
                    value={editStock} 
                    onChange={(e) => setEditStock(e.target.value)} 
                    placeholder="Stock"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm" 
                  />
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleUpdate(product.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-semibold cursor-pointer">Save</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-1.5 rounded-lg text-xs font-semibold cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{product.sku}</span>
                    {product.stock <= 5 && (
                      <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase shrink-0">
                        ⚠️ Low Stock
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mb-1">{product.name}</h3>
                  <div className="mb-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                      📁 {product.category || 'General'}
                    </span>
                  </div>

                  <p className="text-xl font-extrabold text-blue-600 my-1">
                    KES {product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mb-6">
                    Stock available: <span className="font-semibold text-slate-700">{product.stock}</span>
                  </p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditing(product)} 
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)} 
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Pagination Controls Bar */}
        <div className="flex justify-center items-center gap-4 pt-4">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}