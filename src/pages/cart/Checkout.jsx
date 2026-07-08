import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaWallet, FaSpinner, FaShoppingBag, FaGift, FaUser } from 'react-icons/fa';

const API = 'http://localhost:5000/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, login, role, token, isApproved } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [walletCoins, setWalletCoins] = useState(user?.walletCoins || 0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    message: ''
  });

  useEffect(() => {
    // Load real cart items
    try {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));
      const validItems = items.filter(item => {
        const itemId = item._id || item.id;
        return isValidObjectId(itemId);
      });
      // Normalize vendorId if present, otherwise pass it along for backend resolution
      const normalizedItems = validItems.map(item => {
        const vId = typeof item.vendorId === 'object' ? item.vendorId?._id : item.vendorId;
        return {
          ...item,
          vendorId: vId ? String(vId) : ''
        };
      });
      setCartItems(normalizedItems);
      if (normalizedItems.length !== items.length) {
        localStorage.setItem('cart', JSON.stringify(normalizedItems));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      setCartItems([]);
    }

    // Load latest wallet balance
    const fetchWallet = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`${API}/auth/user/${user._id}`);
        if (res.ok) {
          const data = await res.json();
          const latestCoins = data.user?.walletCoins || 0;
          setWalletCoins(latestCoins);
          login({ ...user, walletCoins: latestCoins }, role, token, isApproved);
        }
      } catch (err) {
        console.error('Failed to sync wallet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [user?._id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // Delivery is 0 since we simplified and cut physical delivery address/city fields

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      alert('Please login to place an order.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (walletCoins < total) {
      alert(`Insufficient coins balance. You need PKR ${total} coins, but only have PKR ${walletCoins} coins. Please go to the Wallet screen to deposit coins.`);
      return;
    }

    setSubmitting(true);

    const orderData = {
      userId: user._id,
      message: formData.message,
      items: cartItems.map(item => ({
        productId: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        vendorId: item.vendorId
      })),
      totalAmount: total
    };

    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Order Placed Successfully! Payment deducted from your digital coins wallet.');
        
        // Sync wallet coins
        const updatedCoins = data.remainingCoins !== undefined ? data.remainingCoins : (walletCoins - total);
        login({ ...user, walletCoins: updatedCoins }, role, token, isApproved);
        
        // Clear cart
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('storage'));
        
        // Redirect to user dashboard
        navigate('/dashboard');
      } else {
        alert(data.msg || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '6rem', color: 'var(--text-muted)' }}>
        <FaSpinner style={{ animation: 'spin 0.8s linear infinite', fontSize: '1.5rem' }} />
        <span>Synchronizing your checkout cart...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">Secure Checkout</h2>
          <p className="gs-page-subtitle">Pay using your digital coins currency balance</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="gs-card text-center" style={{ padding: '3rem' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>You don't have any items in your cart to checkout.</p>
          <button onClick={() => navigate('/dashboard/products')} className="gs-btn gs-btn-primary gs-btn-sm" style={{ marginTop: '1rem' }}>
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Gift Details Form */}
          <div className="gs-card gs-fade-in" style={{ flex: '2' }}>
            <div className="gs-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaGift style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Gift Details</h3>
            </div>
            <div className="gs-card-body">
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="gs-form-group" style={{ marginBottom: 0 }}>
                  <label className="gs-label">Gift Message (Optional)</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    rows="3" 
                    placeholder="Wishing you a very Happy Birthday! Enjoy the gift!" 
                    className="gs-textarea" 
                  />
                </div>

                {/* Digital Wallet Warning/Details */}
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                  border: '1px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary-dark)', display: 'flex' }}>
                      <FaWallet size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>Digital Coins Balance</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        PKR {walletCoins.toLocaleString()} Coins
                      </p>
                    </div>
                  </div>
                  {walletCoins < total ? (
                    <span className="gs-badge gs-badge-red" style={{ fontWeight: 600 }}>
                      Insufficient Coins (- PKR {(total - walletCoins).toLocaleString()})
                    </span>
                  ) : (
                    <span className="gs-badge gs-badge-green" style={{ fontWeight: 600 }}>
                      Balance Sufficient
                    </span>
                  )}
                </div>

                <div>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="gs-btn gs-btn-primary gs-btn-full gs-btn-lg"
                    style={{ fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    {submitting ? <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> : <FaWallet />}
                    {submitting ? 'Processing Payment...' : `Pay PKR ${total.toLocaleString()} Coins`}
                  </button>
                  {walletCoins < total && (
                    <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--danger)', marginTop: '0.5rem', fontWeight: 600 }}>
                      * Please add coins to your digital wallet before confirming the order.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Dynamic Order Summary */}
          <div className="gs-card gs-fade-in" style={{ position: 'sticky', top: '2rem' }}>
            <div className="gs-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaShoppingBag style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Order Items</h3>
            </div>
            <div className="gs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Product list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', maxStatusHeight: '220px', overflowY: 'auto' }}>
                {cartItems.map((item, idx) => (
                  <div key={item._id || item.id || idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                        {item.vendor}
                      </p>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-dark)', margin: 0 }}>
                        PKR {item.price.toLocaleString()} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing calculation summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: 'var(--text-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Items Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Delivery Fee</span>
                  <span style={{ textDecoration: 'line-through' }}>PKR 250</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Delivery Discount</span>
                  <span>FREE</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary-dark)' }}>PKR {total.toLocaleString()}</span>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Checkout;
