import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaGift, FaBoxOpen, FaCheckCircle, FaSpinner, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [eventDetails, setEventDetails] = useState({
    title: '',
    type: 'Birthday',
    date: '',
    friendName: '',
    friendCity: ''
  });

  // Products from DB
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Friend search
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Selected items
  const [wishlistItems, setWishlistItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch friends for dropdown
  useEffect(() => {
    if (!user?._id) return;
    fetch(`${API}/friends/${user._id}`)
      .then(r => r.json())
      .then(data => setFriends(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user?._id]);

  // Fetch products — if friend has a city, fetch city-specific, else all
  const fetchProducts = async (city = '') => {
    setProductsLoading(true);
    try {
      const url = city
        ? `${API}/products/city/${encodeURIComponent(city)}`
        : `${API}/products`;
      const res = await fetch(url);
      const data = await res.json();
      setAvailableProducts(Array.isArray(data) ? data : []);
    } catch {
      setAvailableProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch products when friend city changes
  useEffect(() => {
    fetchProducts(eventDetails.friendCity);
  }, [eventDetails.friendCity]);

  const handleSelectFriend = (e) => {
    const fId = e.target.value;
    if (!fId) {
      setSelectedFriend(null);
      setEventDetails(d => ({ ...d, friendName: '', friendCity: '' }));
      return;
    }
    const friend = friends.find(f => f._id === fId);
    if (friend) {
      setSelectedFriend(friend);
      setEventDetails(d => ({
        ...d,
        friendName: friend.name,
        friendCity: friend.city || ''
      }));
    }
  };

  const handleToggleItem = (product, listType) => {
    const productData = {
      productId: product._id,
      name: product.name,
      price: product.price,
      vendor: product.vendorId?.businessName || 'Unknown Vendor'
    };

    if (listType === 'wishlist') {
      const inList = wishlistItems.find(i => i.productId === product._id);
      if (inList) {
        setWishlistItems(wishlistItems.filter(i => i.productId !== product._id));
      } else {
        setWishlistItems([...wishlistItems, productData]);
        setRecommendedItems(recommendedItems.filter(i => i.productId !== product._id));
      }
    } else {
      const inList = recommendedItems.find(i => i.productId === product._id);
      if (inList) {
        setRecommendedItems(recommendedItems.filter(i => i.productId !== product._id));
      } else {
        setRecommendedItems([...recommendedItems, productData]);
        setWishlistItems(wishlistItems.filter(i => i.productId !== product._id));
      }
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventDetails.title || !eventDetails.date) {
      setError('Please fill out the event title and date.');
      return;
    }
    if (!user?._id) {
      setError('You must be logged in to create an event.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        userId: user._id,
        title: eventDetails.title,
        type: eventDetails.type,
        date: eventDetails.date,
        friendId: selectedFriend?._id || null,
        friendName: eventDetails.friendName,
        wishlistItems,
        recommendedItems
      };

      const res = await fetch(`${API}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || 'Failed to create event.');
        return;
      }

      // Also add wishlist items to user wishlist
      for (const item of wishlistItems) {
        await fetch(`${API}/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user._id,
            productId: item.productId,
            eventType: eventDetails.type
          })
        }).catch(() => {});
      }

      navigate('/dashboard/events');
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/dashboard/events')}
          className="gs-btn gs-btn-ghost"
          style={{ padding: '8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}
        >
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="gs-page-title">Create New Event</h2>
          <p className="gs-page-subtitle">Set up your event and pick gifts for your friend</p>
        </div>
      </div>

      {error && <div className="gs-alert gs-alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

        {/* Left: Event Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="gs-card">
            <div className="gs-card-header">
              <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Event Details</h3>
            </div>
            <div className="gs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div className="gs-form-group">
                <label className="gs-label">Event Title *</label>
                <input
                  type="text"
                  className="gs-input"
                  value={eventDetails.title}
                  onChange={e => setEventDetails({ ...eventDetails, title: e.target.value })}
                  placeholder="e.g. Ali's Birthday Party"
                />
              </div>

              <div className="gs-form-group">
                <label className="gs-label">Event Type</label>
                <select
                  className="gs-select"
                  value={eventDetails.type}
                  onChange={e => setEventDetails({ ...eventDetails, type: e.target.value })}
                >
                  <option value="Birthday">🎂 Birthday</option>
                  <option value="Anniversary">💕 Anniversary</option>
                  <option value="Baby Shower">👶 Baby Shower</option>
                  <option value="Wedding">💍 Wedding</option>
                  <option value="Other">🎁 Other</option>
                </select>
              </div>

              <div className="gs-form-group">
                <label className="gs-label">Date *</label>
                <input
                  type="date"
                  className="gs-input"
                  value={eventDetails.date}
                  onChange={e => setEventDetails({ ...eventDetails, date: e.target.value })}
                />
              </div>

              {/* Friend Selector */}
              <div className="gs-form-group">
                <label className="gs-label">Select Friend (Optional)</label>
                <select className="gs-select" onChange={handleSelectFriend} defaultValue="">
                  <option value="">— No specific friend —</option>
                  {friends.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name} {f.city ? `(${f.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Friend city info */}
              {selectedFriend?.city && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--info-soft)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--info)'
                }}>
                  <FaMapMarkerAlt />
                  Showing vendors in <strong style={{ marginLeft: '4px' }}>{selectedFriend.city}</strong>
                </div>
              )}

            </div>
          </div>

          <button
            onClick={handleCreateEvent}
            disabled={submitting}
            className="gs-btn gs-btn-primary gs-btn-full gs-btn-lg"
          >
            {submitting ? <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> : <FaCheckCircle />}
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>

        {/* Right: Product Selection */}
        <div className="gs-card">
          <div className="gs-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Select Gifts</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '2px' }}>
                {eventDetails.friendCity
                  ? `Showing gifts from ${eventDetails.friendCity} vendors`
                  : 'Showing all available gifts'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="gs-badge gs-badge-pink">
                <FaGift /> {wishlistItems.length} Wishlist
              </span>
              <span className="gs-badge gs-badge-purple">
                <FaBoxOpen /> {recommendedItems.length} Recommended
              </span>
            </div>
          </div>
          <div className="gs-card-body">
            {productsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem', color: 'var(--text-muted)' }}>
                <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />
                Loading products...
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="gs-empty">
                <div className="gs-empty-icon">🛒</div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {eventDetails.friendCity
                    ? `No vendors found in ${eventDetails.friendCity} yet`
                    : 'No products available'}
                </p>
                <p>Vendors need to add products first.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {availableProducts.map((product) => {
                  const isWishlist = wishlistItems.some(i => i.productId === product._id);
                  const isRecommended = recommendedItems.some(i => i.productId === product._id);

                  return (
                    <div
                      key={product._id}
                      style={{
                        border: `2px solid ${isWishlist ? 'var(--primary)' : isRecommended ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        background: 'var(--white)',
                        transition: 'var(--transition)'
                      }}
                    >
                      {/* Product image */}
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '120px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)', fontSize: '2rem' }}>
                          🎁
                        </div>
                      )}

                      <div style={{ padding: '0.75rem' }}>
                        <h4 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{product.name}</h4>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {product.vendorId?.businessName || 'Unknown Vendor'}
                        </p>
                        {product.vendorId?.city && (
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--info)', marginTop: '2px' }}>
                            📍 {product.vendorId.city}
                          </p>
                        )}
                        <p style={{ fontWeight: 700, color: 'var(--primary-dark)', marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>
                          PKR {Number(product.price || 0).toLocaleString()}
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button
                            onClick={() => handleToggleItem(product, 'wishlist')}
                            className={`gs-btn gs-btn-sm`}
                            style={{
                              flex: 1,
                              background: isWishlist ? 'var(--primary)' : 'var(--surface)',
                              color: isWishlist ? 'white' : 'var(--primary)',
                              border: `1px solid ${isWishlist ? 'var(--primary)' : 'var(--border-hover)'}`,
                              fontSize: '11px',
                              padding: '5px 6px'
                            }}
                          >
                            <FaGift /> Wish
                          </button>
                          <button
                            onClick={() => handleToggleItem(product, 'recommended')}
                            className={`gs-btn gs-btn-sm`}
                            style={{
                              flex: 1,
                              background: isRecommended ? 'var(--accent)' : 'var(--surface)',
                              color: isRecommended ? 'white' : 'var(--accent)',
                              border: `1px solid ${isRecommended ? 'var(--accent)' : '#E9D5FF'}`,
                              fontSize: '11px',
                              padding: '5px 6px'
                            }}
                          >
                            <FaBoxOpen /> Rec
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
