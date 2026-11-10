import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form input states for Creating
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Editing an existing product
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Search and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  const fetchProducts = () => {
    axios.get('http://localhost:8000/api/products')
      .then(response => {
        setProducts(response.data.products);
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
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !stock) return;
    setIsSubmitting(true);

    axios.post('http://localhost:8000/api/products', {
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    })
      .then(response => {
        setProducts(prev => [...prev, response.data.product]);
        setName(''); setPrice(''); setStock('');
        setIsSubmitting(false);
      })
      .catch(err => {
        console.error('Error adding product:', err);
        setIsSubmitting(false);
      });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8000/api/products/${id}`)
      .then(() => {
        setProducts(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => console.error('Error deleting product:', err));
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditStock(product.stock);
  };

  const handleUpdate = (id) => {
    axios.put(`http://localhost:8000/api/products/${id}`, {
      name: editName,
      price: parseFloat(editPrice),
      stock: parseInt(editStock, 10)
    })
      .then(response => {
        setProducts(prev => prev.map(p => p.id === id ? response.data.product : p));
        setEditingId(null);
      })
      .catch(err => console.error('Error updating product:', err));
  };

  // 1. Calculate Real-Time Dashboard Metrics
  const totalProductsCount = products.length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  // 2. Filter products by search term, then apply price sorting
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'low-high') return a.price - b.price;
    if (sortOrder === 'high-low') return b.price - a.price;
    return 0;
  });

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '3rem', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Retail Shop Dashboard</h1>
        <p style={{ color: '#666' }}>Powered by FastAPI, SQLite & React (Full Suite)</p>
      </header>

      {/* 3. Summary Metrics / KPI Bar */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.4rem 0', color: '#2b6cb0', fontSize: '0.9rem', fontWeight: 'bold' }}>Total Products</p>
          <h3 style={{ margin: 0, color: '#2c5282', fontSize: '1.75rem' }}>{totalProductsCount}</h3>
        </div>
        <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.4rem 0', color: '#276749', fontSize: '0.9rem', fontWeight: 'bold' }}>Inventory Value</p>
          <h3 style={{ margin: 0, color: '#22543d', fontSize: '1.75rem' }}>${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>
        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.4rem 0', color: '#9b2c2c', fontSize: '0.9rem', fontWeight: 'bold' }}>Low Stock Items</p>
          <h3 style={{ margin: 0, color: '#742a2a', fontSize: '1.75rem' }}>{lowStockCount}</h3>
        </div>
      </section>

      {/* Add Product Form */}
      <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.25rem', color: '#2d3748' }}>Add New Product</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 1fr 1fr auto' }}>
          <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
          <input type="number" step="0.01" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
          <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
          <button type="submit" disabled={isSubmitting} style={{ padding: '0.6rem 1.2rem', borderRadius: '4px', border: 'none', background: '#3182ce', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Add</button>
        </form>
      </section>

      {/* Search and Sort Controls Section */}
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="🔍 Search inventory by product name..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1rem', boxSizing: 'border-box' }} 
        />
        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)} 
          style={{ padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1rem', background: '#fff', cursor: 'pointer' }}
        >
          <option value="default">Sort by: Default</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
        </select>
      </section>

      {/* Inventory Header */}
      <h2 style={{ fontSize: '1.25rem', color: '#2d3748' }}>
        Inventory Items ({sortedAndFilteredProducts.length} {sortedAndFilteredProducts.length === 1 ? 'item' : 'items'} found)
      </h2>
      
      {loading && <p style={{ textAlign: 'center' }}>Loading inventory...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      {!loading && sortedAndFilteredProducts.length === 0 && (
        <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>No products match your criteria.</p>
      )}

      {/* Inventory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {sortedAndFilteredProducts.map(product => (
          <div key={product.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {editingId === product.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '0.4rem' }} />
                <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ padding: '0.4rem' }} />
                <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} style={{ padding: '0.4rem' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => handleUpdate(product.id)} style={{ background: '#38a169', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ background: '#718096', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: '#2d3748' }}>{product.name}</h3>
                  {product.stock <= 5 && (
                    <span style={{ background: '#fed7d7', color: '#c53030', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      ⚠️ Low Stock
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3182ce', margin: '0.5rem 0' }}>
                  ${product.price.toFixed(2)}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0 0 1rem 0' }}>
                  Stock available: {product.stock}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => startEditing(product)} style={{ padding: '0.4rem 0.8rem', border: 'none', background: '#d69e2e', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                  <button onClick={() => handleDelete(product.id)} style={{ padding: '0.4rem 0.8rem', border: 'none', background: '#e53e3e', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}