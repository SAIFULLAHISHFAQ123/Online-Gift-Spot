import { useState, useEffect } from 'react';
import { FaGift, FaCartPlus, FaBirthdayCake, FaRing, FaHeart, FaBaby, FaCoins, FaTrash, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const Wishlist = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('All');
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contributeItemId, setContributeItemId] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const fetchWishlist = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/wishlist/${user._id}`);
      const data = await res.json();
      if (res.ok) setWishlistItems(Array.isArray(data) ? data : []);
      else setError(data.msg || 'Failed to load wishlist');
    } catch {
      setError('Failed to load wishlist. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?._id]);

  const handleRemove = async (itemId) => {
    if (!window.confirm('Remove from wishlist?')) return;
    try {
      const res = await fetch(`${API}/wishlist/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setWishlistItems(prev => prev.filter(i => i._id !== itemId));
      }
    } catch {
      alert('Failed to remove item.');
    }
  };

  const handleContribute = async (e, item) => {
    e.preventDefault();
    const amount = parseInt(contributionAmount);
    if (!amount || amount <= 0) return;

    try {
      const res = await fetch(`${API}/wishlist/${item._id}/contribute`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(prev => prev.map(i =>
          i._id === item._id ? { ...i, progress: data.item.progress } : i
        ));
      }
    } catch {
      alert('Failed to contribute.');
    }
    setContributeItemId(null);
    setContributionAmount('');
  };

  const types = [
    { name: 'All', icon: '🎁' },
    { name: 'Birthday', icon: '🎂' },
    { name: 'Anniversary', icon: '💕' },
    { name: 'Wedding', icon: '💍' },
    { name: 'Baby Shower', icon: '👶' },
    { name: 'Other', icon: '🌟' }
  ];

  const filteredItems = selectedType === 'All'
    ? wishlistItems
    : wishlistItems.filter(item => item.eventType === selectedType);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">
            <FaGift />
            My Wishlist
          </h2>
          <p className="gs-page-subtitle">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>
        <Link to="/dashboard/products" className="gs-btn gs-btn-primary">
          <FaCartPlus />
          Browse Products
        </Link>
      </div>

      {/* Error */}
      {error && <div className="gs-alert gs-alert-error">{error}</div>}

      {/* Type Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {types.map(type => (
          <button
            key={type.name}
            onClick={() => setSelectedType(type.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '7px 16px',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${selectedType === type.name ? 'var(--primary)' : 'var(--border)'}`,
              background: selectedType === type.name ? 'var(--primary)' : 'var(--white)',
              color: selectedType === type.name ? 'white' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{type.icon}</span>
            {type.name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)' }}>
          <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />
          Loading your wishlist...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="gs-card">
          <div className="gs-empty">
            <div className="gs-empty-icon">🎁</div>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedType === 'All' ? 'Your wishlist is empty!' : `No ${selectedType} gifts yet`}
            </p>
            <p>Browse products and add them to your wishlist.</p>
            <Link to="/dashboard/products" className="gs-btn gs-btn-primary gs-btn-sm" style={{ marginTop: '0.5rem' }}>
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredItems.map(item => {
            const product = item.productId;
            const price = product?.price || 0;
            const progress = item.progress || 0;
            const progressPercent = price > 0 ? Math.min(100, (progress / price) * 100) : 0;

            return (
              <div key={item._id} className="gs-product-card gs-fade-in">
                {/* Product Image */}
                {product?.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product?.name}
                    className="gs-product-img"
                  />
                ) : (
                  <div className="gs-product-img-placeholder">
                    <FaGift />
                  </div>
                )}

                <div className="gs-product-body">
                  {/* Event Type Badge */}
                  <span className={`gs-badge ${
                    item.eventType === 'Birthday' ? 'gs-badge-pink' :
                    item.eventType === 'Anniversary' ? 'gs-badge-purple' :
                    item.eventType === 'Wedding' ? 'gs-badge-blue' :
                    item.eventType === 'Baby Shower' ? 'gs-badge-green' :
                    'gs-badge-yellow'
                  }`} style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
                    {item.eventType}
                  </span>

                  <h3 className="gs-product-title">{product?.name || 'Product Unavailable'}</h3>
                  <p className="gs-product-vendor">
                    From {product?.vendorId?.businessName || 'Unknown Vendor'}
                    {product?.vendorId?.city && ` • ${product.vendorId.city}`}
                  </p>
                  <p className="gs-product-price">PKR {Number(price).toLocaleString()}</p>

                  {/* Contribution Section */}
                  {item.contributionEnabled && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>Progress</span>
                        <span>PKR {progress.toLocaleString()} / PKR {price.toLocaleString()}</span>
                      </div>
                      <div className="gs-progress-bar">
                        <div className="gs-progress-fill" style={{ width: `${progressPercent}%` }} />
                      </div>

                      {contributeItemId === item._id ? (
                        <form onSubmit={(e) => handleContribute(e, item)} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <input
                            type="number"
                            required
                            placeholder="Amount (PKR)"
                            value={contributionAmount}
                            onChange={e => setContributionAmount(e.target.value)}
                            className="gs-input"
                            style={{ flex: 1, padding: '6px 10px', fontSize: 'var(--text-sm)' }}
                          />
                          <button type="submit" className="gs-btn gs-btn-primary gs-btn-sm">Pay</button>
                          <button type="button" onClick={() => setContributeItemId(null)} className="gs-btn gs-btn-ghost gs-btn-sm">✕</button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setContributeItemId(item._id)}
                          disabled={progressPercent >= 100}
                          style={{
                            width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '0.375rem',
                            padding: '7px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--success-soft)', color: 'var(--success)',
                            fontSize: 'var(--text-sm)', fontWeight: 600,
                            border: 'none', cursor: progressPercent >= 100 ? 'not-allowed' : 'pointer',
                            opacity: progressPercent >= 100 ? 0.5 : 1
                          }}
                        >
                          <FaCoins />
                          {progressPercent >= 100 ? 'Fully Funded ✓' : 'Contribute to Gift'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                    <Link
                      to="/dashboard/products"
                      className="gs-btn gs-btn-outline gs-btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="gs-btn gs-btn-danger gs-btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
