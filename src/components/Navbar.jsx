import { useState, useEffect } from 'react';
import { FaBell, FaUserCircle, FaBars, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleMobileMenu }) => {
  const { user, role, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  return (
    <header style={{
      height: '4rem',
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            marginRight: '0.5rem',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <FaBars size={20} />
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }} className="hidden sm:block">
          {role} Dashboard
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/dashboard/cart" style={{ color: 'var(--text-secondary)', position: 'relative', textDecoration: 'none' }} className="gs-hover-primary">
          <FaShoppingCart size={20} />
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-8px',
            background: 'var(--primary)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 800,
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>{cartCount}</span>
        </Link>

        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          position: 'relative',
          cursor: 'pointer'
        }} className="gs-hover-primary">
          <FaBell size={20} />
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '8px',
            height: '8px',
            background: 'var(--error)',
            borderRadius: '50%',
            border: '2px solid var(--white)'
          }}></span>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaUserCircle size={24} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }} className="hidden sm:block">
            {user?.name || 'Guest'}
          </span>
          <button 
            onClick={logout} 
            className="gs-btn gs-btn-danger gs-btn-sm" 
            style={{ fontSize: '11px', padding: '4px 8px', marginLeft: '0.5rem' }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
