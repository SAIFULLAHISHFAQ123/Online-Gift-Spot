import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaHeart, FaCartPlus, FaMapMarkerAlt, FaSpinner, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const CITIES = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];

const Marketplace = () => {
  const { user, role } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wishlistAdded, setWishlistAdded] = useState({});
  const [addingToWishlist, setAddingToWishlist] = useState(null);

  const fetchProducts = async (city = '') => {
    setLoading(true);
    try {
      let url;
      if (role === 'Vendor') {
        url = `${API}/products/vendor/${user?.vendorId}`;
      } else {
        url = city && city !== 'All Cities'
          ? `${API}/products/city/${encodeURIComponent(city)}`
          : `${API}/products`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCity);
  }, [selectedCity, role, user?.vendorId]);

  const handleAddToWishlist = async (product) => {
    if (!user?._id) {
      alert('Please login to add to wishlist.');
      return;
    }
    setAddingToWishlist(product._id);
    try {
      const res = await fetch(`${API}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, productId: product._id, eventType: 'Birthday' })
      });
      if (res.ok) {
        setWishlistAdded(prev => ({ ...prev, [product._id]: true }));
      } else {
        const data = await res.json();
        if (data.msg === 'Product already in wishlist') {
          setWishlistAdded(prev => ({ ...prev, [product._id]: true }));
        }
      }
    } catch {
      alert('Failed to add to wishlist.');
    } finally {
      setAddingToWishlist(null);
    }
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const productId = product._id || product.id;
    // Always normalize vendorId to a plain string ID
    const rawVendorId = product.vendorId?._id || product.vendorId;
    const vendorIdStr = rawVendorId ? String(rawVendorId) : '';
    const existingIndex = cart.findIndex(item => (item._id || item.id) === productId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: productId,
        _id: productId,
        name: product.name,
        price: product.price,
        vendor: product.vendorId?.businessName || product.vendor || 'Local Vendor',
        vendorId: vendorIdStr,
        quantity: 1,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&fit=crop'
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    alert(`${product.name} added to cart!`);
  };

  const categories = ['All', 'bakery', 'mart', 'gift-shop', 'florist', 'jewelry', 'electronics', 'clothing', 'accessories', 'toys', 'home', 'other'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendorId?.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">
            🛍️ Marketplace
          </h2>
          <p className="gs-page-subtitle">
            {selectedCity !== 'All Cities'
              ? `Showing ${filteredProducts.length} products from ${selectedCity} vendors`
              : `${filteredProducts.length} products available`}
          </p>
        </div>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search products or vendors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="gs-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* City Filter */}
        <div style={{ position: 'relative' }}>
          <FaMapMarkerAlt style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="gs-select"
            style={{ paddingLeft: '34px', minWidth: '170px' }}
          >
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="gs-select"
          style={{ minWidth: '140px' }}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        {/* Active City Tag */}
        {selectedCity !== 'All Cities' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '6px 12px',
            background: 'var(--primary-light)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-sm)',
            color: 'var(--primary-dark)',
            fontWeight: 600
          }}>
            <FaMapMarkerAlt /> {selectedCity}
            <button
              onClick={() => setSelectedCity('All Cities')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center' }}
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '5rem', color: 'var(--text-muted)' }}>
          <FaSpinner style={{ animation: 'spin 0.8s linear infinite', fontSize: '1.5rem' }} />
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="gs-card">
          <div className="gs-empty">
            <div className="gs-empty-icon">🛒</div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>
              {selectedCity !== 'All Cities'
                ? `No products found in ${selectedCity}`
                : 'No products available'}
            </p>
            <p>
              {selectedCity !== 'All Cities'
                ? 'Try a different city or check back later.'
                : 'Vendors need to add products first.'}
            </p>
            {selectedCity !== 'All Cities' && (
              <button onClick={() => setSelectedCity('All Cities')} className="gs-btn gs-btn-outline gs-btn-sm" style={{ marginTop: '0.5rem' }}>
                Show All Cities
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {filteredProducts.map(product => (
            <div key={product._id} className="gs-product-card gs-fade-in">
              {/* Image */}
              <div style={{ position: 'relative' }}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="gs-product-img" />
                ) : (
                  <div className="gs-product-img-placeholder">🎁</div>
                )}

                {/* Wishlist heart button */}
                {role !== 'Vendor' && (
                  <button
                    onClick={() => handleAddToWishlist(product)}
                    disabled={addingToWishlist === product._id}
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      width: '34px', height: '34px',
                      background: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      cursor: 'pointer',
                      color: wishlistAdded[product._id] ? 'var(--primary)' : 'var(--text-muted)',
                      transition: 'var(--transition)'
                    }}
                    title="Add to wishlist"
                  >
                    {addingToWishlist === product._id
                      ? <FaSpinner style={{ animation: 'spin 0.8s linear infinite', fontSize: '12px' }} />
                      : <FaHeart />
                    }
                  </button>
                )}

                {/* Out of stock */}
                {product.isOutOfStock && (
                  <div style={{
                    position: 'absolute', bottom: '10px', left: '10px',
                    background: 'rgba(239,68,68,0.9)',
                    color: 'white', fontSize: '11px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: 'var(--radius-full)'
                  }}>
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="gs-product-body">
                {product.category && (
                  <span className="gs-badge gs-badge-pink" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
                    {product.category}
                  </span>
                )}
                <h3 className="gs-product-title">{product.name}</h3>
                <p className="gs-product-vendor">{product.vendorId?.businessName || 'Unknown Vendor'}</p>
                {product.vendorId?.city && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <FaMapMarkerAlt /> {product.vendorId.city}
                  </p>
                )}
                {product.description && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.description}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem' }}>
                  <p className="gs-product-price">PKR {Number(product.price || 0).toLocaleString()}</p>
                  {role !== 'Vendor' ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.isOutOfStock}
                      className="gs-btn gs-btn-primary gs-btn-sm"
                      style={{ opacity: product.isOutOfStock ? 0.5 : 1 }}
                    >
                      <FaCartPlus /> Add
                    </button>
                  ) : (
                    <span className="gs-badge gs-badge-purple" style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                      Your Listing
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
