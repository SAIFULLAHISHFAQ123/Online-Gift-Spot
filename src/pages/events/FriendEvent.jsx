import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaGift, FaCartPlus, FaArrowLeft, FaBoxOpen, FaSpinner, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaSearch } from 'react-icons/fa';

const API = 'http://localhost:5000/api';

const FriendEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [cityProducts, setCityProducts] = useState([]);
  const [loadingCityProducts, setLoadingCityProducts] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API}/events/${eventId}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError(err.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (event?.userId?.city) {
      const fetchCityProducts = async () => {
        setLoadingCityProducts(true);
        try {
          const res = await fetch(`${API}/products/city/${encodeURIComponent(event.userId.city)}`);
          if (res.ok) {
            const data = await res.json();
            setCityProducts(data);
          }
        } catch (err) {
          console.error("Failed to fetch city products", err);
        } finally {
          setLoadingCityProducts(false);
        }
      };
      fetchCityProducts();
    }
  }, [event]);

  const handleAddToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Resolve product ID, name, price, vendor name, vendor ID, image URL
    let pId = '';
    let pName = '';
    let pPrice = 0;
    let pVendorName = 'Local Vendor';
    let pVendorId = '';
    let pImage = '';

    // If item.productId exists, it might be populated (an object) or just an ID (a string)
    if (item.productId && typeof item.productId === 'object') {
      pId = item.productId._id || item.productId.id;
      pName = item.productId.name || item.name || item.productId.productName;
      pPrice = item.productId.price || item.price;
      
      const vObj = item.productId.vendorId;
      if (vObj && typeof vObj === 'object') {
        pVendorId = vObj._id || vObj.id;
        pVendorName = vObj.businessName || 'Local Vendor';
      } else {
        pVendorId = vObj || '';
      }
      pImage = item.productId.images?.[0] || item.productId.image;
    } else if (item.productId) {
      // productId is a string ID
      pId = item.productId;
      pName = item.name || item.productName;
      pPrice = item.price;
      pVendorName = item.vendor || 'Local Vendor';
      pVendorId = item.vendorId || '';
    } else {
      // The item itself is the product
      pId = item._id || item.id;
      pName = item.name || item.productName;
      pPrice = item.price;
      
      const vObj = item.vendorId;
      if (vObj && typeof vObj === 'object') {
        pVendorId = vObj._id || vObj.id;
        pVendorName = vObj.businessName || 'Local Vendor';
      } else {
        pVendorId = vObj || '';
      }
      pImage = item.images?.[0] || item.image;
    }

    // Ensure IDs are strings
    pId = String(pId || '');
    pVendorId = String(pVendorId || '');
    
    if (!pImage) {
      pImage = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&fit=crop';
    }

    const existingIndex = cart.findIndex(c => String(c._id || c.id) === pId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: pId,
        _id: pId,
        name: pName,
        price: Number(pPrice) || 0,
        vendor: pVendorName,
        vendorId: pVendorId,
        quantity: 1,
        image: pImage
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    alert(`${pName} added to cart!`);
  };

  const handleOrderPlace = (item) => {
    handleAddToCart(item);
    navigate('/dashboard/cart');
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Match city products to friend's wishlist items by name or category keywords
  const getWishlistMatchedProducts = () => {
    const wishlist = event?.wishlistItems || event?.recommendedItems || [];
    if (!wishlist.length || !cityProducts.length) return [];

    // Extract keywords from wishlist item names
    const wishlistKeywords = wishlist.flatMap(item => {
      const name = (item.name || item.productName || '').toLowerCase();
      return name.split(/\s+/).filter(word => word.length > 3);
    });

    if (!wishlistKeywords.length) return cityProducts.slice(0, 8);

    // Score each city product by keyword matches
    const scored = cityProducts.map(product => {
      const productText = `${product.name} ${product.category || ''} ${product.description || ''}`.toLowerCase();
      const matchCount = wishlistKeywords.filter(kw => productText.includes(kw)).length;
      return { ...product, matchCount };
    });

    // Products that match wishlist items first, then the rest
    const matched = scored.filter(p => p.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);
    const others = scored.filter(p => p.matchCount === 0);

    return [...matched, ...others];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '6rem', color: 'var(--text-muted)' }}>
        <FaSpinner style={{ animation: 'spin 0.8s linear infinite', fontSize: '1.5rem' }} />
        <span>Loading event details...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="gs-card gs-p-6 text-center">
        <p style={{ color: 'var(--error)', fontWeight: 600 }}>{error || 'Event not found'}</p>
        <button onClick={() => navigate('/dashboard/events')} className="gs-btn gs-btn-outline gs-mt-4">
          <FaArrowLeft /> Back to Events
        </button>
      </div>
    );
  }

  const friendCity = event.userId?.city;
  const friendName = event.friendName || event.userId?.name || 'Friend';

  // Filter wishlist & recommended items by the friend's city (e.g. Lahore)
  const wishlist = (event.wishlistItems || []).filter(item => {
    if (!friendCity) return true;
    const vendorCity = item.productId?.vendorId?.city;
    if (!vendorCity) return true; // Show it if city is missing in database populate
    return vendorCity.toLowerCase() === friendCity.toLowerCase();
  });

  const recommended = (event.recommendedItems || []).filter(item => {
    if (!friendCity) return true;
    const vendorCity = item.productId?.vendorId?.city;
    if (!vendorCity) return true; // Show it if city is missing in database populate
    return vendorCity.toLowerCase() === friendCity.toLowerCase();
  });

  const wishlistMatchedProducts = getWishlistMatchedProducts();
  const matchedProducts = wishlistMatchedProducts.filter(p => p.matchCount > 0);
  const otherProducts = wishlistMatchedProducts.filter(p => !p.matchCount || p.matchCount === 0);

  const FALLBACK = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&fit=crop';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => navigate('/dashboard/events')}
          className="gs-btn gs-btn-ghost"
          style={{ padding: '8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', flexShrink: 0 }}
        >
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="gs-page-title">{event.title}</h2>
          <p className="gs-page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <FaCalendarAlt style={{ color: 'var(--primary)' }} />
            <span>{formatDate(event.date)}</span>
            <span>•</span>
            <span>Celebrating with <strong>{friendName}</strong></span>
            {friendCity && (
              <>
                <span>•</span>
                <span className="gs-badge gs-badge-pink" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <FaMapMarkerAlt /> {friendCity}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Wishlist Section */}
        <div className="gs-card">
          <div className="gs-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaGift style={{ color: 'var(--primary-dark)' }} />
              <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 'var(--text-base)', margin: 0 }}>
                {friendName}'s Wishlist
              </h3>
            </div>
            {friendCity && (
              <span className="gs-badge gs-badge-pink" style={{ fontSize: '11px', fontWeight: 600 }}>
                📍 Only {friendCity} Vendors
              </span>
            )}
          </div>
          <div className="gs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {wishlist.length === 0 ? (
              <div className="gs-empty" style={{ padding: '2rem 1rem' }}>
                <p>No {friendCity ? `${friendCity} vendor` : ''} wishlist items for this event.</p>
              </div>
            ) : (
              wishlist.map((item, idx) => (
                <div 
                  key={item._id || idx} 
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    background: 'var(--white)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {(item.image || item.images?.[0]) && (
                      <img
                        src={item.image || item.images?.[0]}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', margin: 0 }}>{item.name || item.productName}</h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>from {item.vendor || item.vendorId?.businessName || 'Vendor'}</p>
                      <p style={{ fontWeight: 700, color: 'var(--primary-dark)', marginTop: '2px', fontSize: 'var(--text-sm)' }}>
                        PKR {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleOrderPlace(item)}
                    className="gs-btn gs-btn-primary gs-btn-sm"
                  >
                    <FaCartPlus /> Order
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended Section */}
        {recommended.length > 0 && (
          <div className="gs-card">
            <div className="gs-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaBoxOpen style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 'var(--text-base)', margin: 0 }}>
                  Recommended Gifts
                </h3>
              </div>
              {friendCity && (
                <span className="gs-badge" style={{ fontSize: '11px', fontWeight: 600, background: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success)' }}>
                  📍 Only {friendCity} Vendors
                </span>
              )}
            </div>
            <div className="gs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommended.map((item, idx) => (
                <div 
                  key={item._id || idx} 
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    background: 'var(--white)'
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{item.name}</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>from {item.vendor}</p>
                    <p style={{ fontWeight: 700, color: 'var(--accent)', marginTop: '2px', fontSize: 'var(--text-sm)' }}>
                      PKR {Number(item.price).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleOrderPlace(item)}
                    className="gs-btn gs-btn-outline gs-btn-sm"
                    style={{ color: 'var(--accent)', borderColor: '#E9D5FF' }}
                  >
                    <FaCartPlus /> Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* City Vendor Products — Wishlist Matched + Other */}
      {friendCity && (
        <div className="gs-card gs-fade-in">
          <div className="gs-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaMapMarkerAlt style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)', margin: 0 }}>
                Gift Ideas from <span style={{ color: 'var(--primary-dark)' }}>{friendCity}</span> Vendors
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {matchedProducts.length > 0 && (
                <span className="gs-badge" style={{ background: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaStar size={10} /> {matchedProducts.length} Wishlist Matches
                </span>
              )}
              <span className="gs-badge gs-badge-pink">
                📍 {friendCity} — Local Only
              </span>
            </div>
          </div>

          <div className="gs-card-body">
            {loadingCityProducts ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '3rem', color: 'var(--text-muted)' }}>
                <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />
                <span>Finding products from {friendCity} vendors...</span>
              </div>
            ) : cityProducts.length === 0 ? (
              <div className="gs-empty" style={{ padding: '2.5rem 1rem' }}>
                <div className="gs-empty-icon"><FaSearch /></div>
                <p style={{ fontWeight: 600 }}>No products found from vendors in {friendCity}.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Check back later as more vendors join from this city.</p>
              </div>
            ) : (
              <>
                {/* Wishlist-matched products — shown first with a highlight banner */}
                {matchedProducts.length > 0 && (
                  <>
                    <div style={{
                      padding: '0.5rem 0.875rem',
                      background: 'linear-gradient(90deg, var(--primary-soft), transparent)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      <FaStar style={{ color: 'var(--primary)', fontSize: '12px' }} />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--primary-dark)' }}>
                        Products matching {friendName}'s wishlist from {friendCity} vendors
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      {matchedProducts.map((product) => (
                        <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} onOrder={handleOrderPlace} isMatch={true} fallback={FALLBACK} />
                      ))}
                    </div>
                  </>
                )}

                {/* Other city products */}
                {otherProducts.length > 0 && (
                  <>
                    {matchedProducts.length > 0 && (
                      <div style={{
                        padding: '0.5rem 0.875rem',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                      }}>
                        <FaBoxOpen style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          More products available from {friendCity} vendors
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                      {otherProducts.map((product) => (
                        <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} onOrder={handleOrderPlace} isMatch={false} fallback={FALLBACK} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for product card
const ProductCard = ({ product, onAddToCart, onOrder, isMatch, fallback }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    border: isMatch ? '2px solid var(--primary-light)' : '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--white)',
    overflow: 'hidden',
    transition: 'var(--transition)',
    boxShadow: isMatch ? '0 4px 15px rgba(236, 72, 153, 0.12)' : 'none'
  }}>
    <div style={{ position: 'relative' }}>
      <img
        src={product.images?.[0] || fallback}
        alt={product.name}
        style={{ height: '145px', width: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.src = fallback; }}
      />
      {isMatch && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'var(--primary)',
          color: 'white',
          fontSize: '10px',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 'var(--radius-full)',
          display: 'flex', alignItems: 'center', gap: '3px'
        }}>
          <FaStar size={8} /> Match
        </div>
      )}
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.875rem', gap: '0.25rem' }}>
      <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', margin: 0, lineHeight: 1.3 }}>{product.name}</h4>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0' }}>{product.vendorId?.businessName || 'Local Vendor'}</p>
      <p style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: 'var(--text-sm)', marginTop: 'auto', paddingTop: '0.5rem' }}>
        PKR {Number(product.price).toLocaleString()}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button 
          onClick={() => onAddToCart(product)}
          className="gs-btn gs-btn-outline gs-btn-sm"
          style={{ flex: 1, fontSize: '11px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
        >
          <FaCartPlus size={10} /> Cart
        </button>
        <button 
          onClick={() => onOrder(product)}
          className="gs-btn gs-btn-primary gs-btn-sm"
          style={{ flex: 1, fontSize: '11px', padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
        >
          Order
        </button>
      </div>
    </div>
  </div>
);

export default FriendEvent;
