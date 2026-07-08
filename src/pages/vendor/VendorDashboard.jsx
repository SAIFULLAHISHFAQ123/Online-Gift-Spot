import { useState, useEffect } from 'react';
import { FaBoxOpen, FaDollarSign, FaShoppingCart, FaChartLine, FaPlus, FaSpinner, FaFileImage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'gift-shop', description: '' });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Use real vendorId from logged-in user or fallback to mock one
  const vendorId = user?.vendorId || '60d5ecb8b392d72f8430e4a2';

  const fetchProducts = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/products/vendor/${vendorId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to fetch vendor products');
      }
    } catch (err) {
      setError('Error connecting to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!vendorId) return;
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API}/orders/vendor/${vendorId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [vendorId]);

  // Compute stats dynamically — use String() because MongoDB ObjectId !== JS string
  const revenue = orders.reduce((sum, order) => {
    if (order.status === 'Cancelled') return sum;
    const vendorSubtotal = order.items
      .filter(item => String(item.vendorId) === String(vendorId))
      .reduce((s, item) => s + (item.price * item.quantity), 0);
    return sum + vendorSubtotal;
  }, 0);

  const totalSales = orders.filter(o => o.status !== 'Cancelled').reduce((sum, order) => {
    const qty = order.items
      .filter(item => String(item.vendorId) === String(vendorId))
      .reduce((s, item) => s + item.quantity, 0);
    return sum + qty;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill out the product name and price.');
      return;
    }
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('description', newProduct.description || '');
    formData.append('stockQuantity', 15); // Default stock
    if (newProduct.image) {
      formData.append('images', newProduct.image);
    }

    try {
      const response = await fetch(`${API}/products/${vendorId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Product added successfully!');
        setNewProduct({ name: '', price: '', category: 'gift-shop', description: '', image: null });
        setShowAddForm(false);
        fetchProducts(); // Refresh product list
      } else {
        alert(data.msg || 'Failed to add product');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">
            <FaBoxOpen />
            Vendor Dashboard
          </h2>
          <p className="gs-page-subtitle">Manage your shop, list products and fulfill orders</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={logout} 
            className="gs-btn gs-btn-danger"
          >
            Logout
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="gs-btn gs-btn-primary"
          >
            <FaPlus />
            {showAddForm ? 'Close Form' : 'Add New Product'}
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        <div className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>
            <FaBoxOpen size={24} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>My Products</p>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{products.length}</h3>
          </div>
        </div>

        <div className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
            <FaDollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Revenue</p>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>PKR {revenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>
            <FaShoppingCart size={24} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Sales</p>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{totalSales}</h3>
          </div>
        </div>

        <div className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
            <FaChartLine size={24} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Pending Orders</p>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingOrders}</h3>
          </div>
        </div>

      </div>

      {error && <div className="gs-alert gs-alert-error">{error}</div>}

      {/* Add Product Form */}
      {showAddForm && (
        <div className="gs-card gs-fade-in">
          <div className="gs-card-header">
            <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 'var(--text-base)' }}>Add New Product</h3>
          </div>
          <div className="gs-card-body">
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="gs-form-group" style={{ marginBottom: 0 }}>
                  <label className="gs-label">Product Name *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Premium Chocolate Cake"
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                    className="gs-input" 
                  />
                </div>
                <div className="gs-form-group" style={{ marginBottom: 0 }}>
                  <label className="gs-label">Price (PKR) *</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="2500"
                    value={newProduct.price} 
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                    className="gs-input" 
                  />
                </div>
                <div className="gs-form-group" style={{ marginBottom: 0 }}>
                  <label className="gs-label">Category</label>
                  <select 
                    value={newProduct.category} 
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
                    className="gs-select"
                  >
                    <option value="bakery">Bakery</option>
                    <option value="mart">Mart</option>
                    <option value="gift-shop">Gift Shop</option>
                    <option value="florist">Florist</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                    <option value="toys">Toys</option>
                    <option value="home">Home & Living</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="gs-form-group" style={{ marginBottom: 0 }}>
                  <label className="gs-label">Product Image</label>
                  <input 
                    type="file" 
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})} 
                    className="gs-input" 
                    accept="image/*" 
                  />
                </div>
              </div>

              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Product Description</label>
                <textarea 
                  placeholder="Describe your product details..."
                  rows="3"
                  value={newProduct.description} 
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                  className="gs-textarea" 
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="gs-btn gs-btn-primary"
                style={{ alignSelf: 'flex-start', minWidth: '180px' }}
              >
                {submitting ? <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> : <FaPlus />}
                {submitting ? 'Saving Product...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product List Table */}
      <div className="gs-card gs-fade-in">
        <div className="gs-card-header">
          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 'var(--text-base)' }}>My Catalog</h3>
        </div>
        <div className="gs-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem', color: 'var(--text-muted)' }}>
              <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />
              Loading catalog...
            </div>
          ) : products.length === 0 ? (
            <div className="gs-empty">
              <div className="gs-empty-icon">📦</div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Your catalog is empty</p>
              <p>Add some products to start selling!</p>
            </div>
          ) : (
            <div className="gs-table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
              <table className="gs-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.25rem' }}>🎁</div>
                        )}
                        <span>{product.name}</span>
                      </td>
                      <td>
                        <span className="gs-badge gs-badge-purple" style={{ textTransform: 'capitalize' }}>
                          {product.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>PKR {Number(product.price || 0).toLocaleString()}</td>
                      <td>
                        <span className={`gs-badge ${product.isOutOfStock ? 'gs-badge-red' : 'gs-badge-green'}`}>
                          {product.isOutOfStock ? 'Out of stock' : `${product.stockQuantity} in stock`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="gs-card gs-fade-in">
        <div className="gs-card-header">
          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 'var(--text-base)' }}>Recent Orders</h3>
        </div>
        <div className="gs-card-body" style={{ padding: 0 }}>
          <div className="gs-table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="gs-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingOrders ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      <FaSpinner style={{ animation: 'spin 0.8s linear infinite', marginRight: '8px' }} /> Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No orders found yet.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => {
                    const vendorItemsStr = order.items
                      .filter(item => item.vendorId === vendorId)
                      .map(item => `${item.name} (${item.quantity})`)
                      .join(', ');

                    return (
                      <tr key={order._id}>
                        <td style={{ fontWeight: 600 }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                        <td>{vendorItemsStr || 'Other Vendor Items'}</td>
                        <td>{order.recipientName || order.userId?.name || 'Customer'}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`gs-badge ${order.status === 'Pending' ? 'gs-badge-yellow' : order.status === 'Cancelled' ? 'gs-badge-red' : 'gs-badge-green'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VendorDashboard;
