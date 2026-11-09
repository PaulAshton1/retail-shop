import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const newProductData = {
      name: name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    };

    axios.post('http://localhost:8000/api/products', newProductData)
      .then(response => {
        setProducts(prevProducts => [...prevProducts, response.data.product]);
        setName('');
        setPrice('');
        setStock('');
        setIsSubmitting(false);
      })
      .catch(err => {
        console.error('Error adding product:', err);
        alert('Failed to add product.');
        setIsSubmitting(false);
      });
  };

  // Handle product deletion
  const handleDelete = (id) => {
    axios.delete(`http://localhost:8000/api/products/${id}`)
      .then(() => {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error('Error deleting product:', err);
        alert('Failed to delete product.');
      });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Retail Shop Dashboard</h1>
        <p style={{ color: '#666' }}>Powered by FastAPI & React</p>
      </header>

      <section style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        padding: '1.5rem', 
        marginBottom: '2.5rem' 
      }}>
        <h2 style={{ marginTop: 0, fontSize: '1.25rem', color: '#2d3748' }}>Add New Product</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 1fr 1fr auto' }}>
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price ($)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
          />
          <input
            type="number"
            placeholder="Stock Quantity"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '4px', 
              border: 'none', 
              background: '#3182ce', 
              color: '#fff', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </section>

      <h2 style={{ fontSize: '1.25rem', color: '#2d3748' }}>Inventory Items</h2>
      {loading && <p style={{ textAlign: 'center' }}>Loading inventory...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>{product.name}</h3>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3182ce', margin: '0.5rem 0' }}>
                ${product.price.toFixed(2)}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0 0 1rem 0' }}>
                Stock available: {product.stock}
              </p>
            </div>
            <button
              onClick={() => handleDelete(product.id)}
              style={{
                padding: '0.4rem 0.8rem',
                border: 'none',
                background: '#e53e3e',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                alignSelf: 'flex-start'
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}