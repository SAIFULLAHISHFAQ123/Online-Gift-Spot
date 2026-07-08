import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaTag } from 'react-icons/fa';

const Cart = () => {
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState(() => {
    try {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      // Only filter out items that don't have a valid MongoDB product ObjectId
      // (vendorId validation happens at checkout — not here)
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));
      return items.filter(item => {
        const itemId = item._id || item.id;
        return isValidObjectId(itemId);
      });
    } catch {
      return [];
    }
  });

  const [voucher, setVoucher] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('storage'));
  }, [cartItems]);

  const updateQuantity = (id, change) => {
    setCartItems(prev => prev.map(item => {
      const itemId = item.id || item._id;
      if (itemId === id) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => (item.id || item._id) !== id));
  };

  const applyVoucher = () => {
    if (voucher.toUpperCase() === 'GIFT10') {
      setDiscount(0.1);
      alert('10% Discount Applied!');
    } else {
      alert('Invalid Voucher Code');
      setDiscount(0);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&fit=crop';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">
            <FaShoppingBag /> Your Shopping Cart
          </h2>
          <p className="gs-page-subtitle">Review your gift items and proceed to checkout</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cartItems.length > 0 ? '1fr 340px' : '1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.length === 0 ? (
            <div className="gs-card gs-fade-in" style={{ padding: '4rem 2rem' }}>
              <div className="gs-empty">
                <div className="gs-empty-icon">🛒</div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>Your cart is empty</p>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Browse our marketplace and add some gifts!</p>
                <button onClick={() => navigate('/dashboard/products')} className="gs-btn gs-btn-primary gs-btn-sm" style={{ marginTop: '1.25rem' }}>
                  Browse Marketplace
                </button>
              </div>
            </div>
          ) : (
            cartItems.map(item => {
              const itemId = item.id || item._id;
              // Use the product's actual image from DB (stored in cart), fallback to generic
              const imageUrl = item.image || FALLBACK_IMAGE;

              return (
                <div key={itemId} className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                  {/* Product Image from DB */}
                  <img
                    src={imageUrl}
                    alt={item.name}
                    style={{
                      width: '90px',
                      height: '90px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface)',
                      flexShrink: 0
                    }}
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  />

                  {/* Item info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: '2px 0' }}>
                      {item.vendor || 'Local Vendor'}
                    </p>
                    <p style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: 'var(--text-base)', margin: '4px 0 0 0' }}>
                      PKR {(item.price || 0).toLocaleString()}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Line total: PKR {((item.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '4px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                    <button
                      onClick={() => updateQuantity(itemId, -1)}
                      style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <FaMinus size={10} />
                    </button>
                    <span style={{ fontWeight: 700, width: '24px', textAlign: 'center', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(itemId, 1)}
                      style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(itemId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '8px', borderRadius: 'var(--radius-md)', transition: 'var(--transition)' }}
                    title="Remove item"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Order Summary sidebar */}
        {cartItems.length > 0 && (
          <div className="gs-card gs-fade-in" style={{ position: 'sticky', top: '2rem' }}>
            <div className="gs-card-header">
              <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 'var(--text-base)' }}>Order Summary</h3>
            </div>
            <div className="gs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Voucher */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <FaTag style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }} />
                  <input
                    type="text"
                    placeholder="Voucher Code (Try GIFT10)"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                    className="gs-input"
                    style={{ paddingLeft: '30px', padding: '8px 12px 8px 28px', fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <button onClick={applyVoucher} className="gs-btn gs-btn-outline gs-btn-sm">Apply</button>
              </div>

              {/* Pricing Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                    <span>Discount (10%)</span>
                    <span>- PKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Fee</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
                </div>
              </div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary-dark)' }}>PKR {total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => navigate('/dashboard/checkout')}
                className="gs-btn gs-btn-primary gs-btn-full gs-btn-lg"
              >
                Proceed to Checkout →
              </button>

              <button
                onClick={() => navigate('/dashboard/products')}
                className="gs-btn gs-btn-outline gs-btn-full gs-btn-sm"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
