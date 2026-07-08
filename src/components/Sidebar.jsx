import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaCalendarAlt, FaGift, FaUsers, FaWallet, 
  FaBell, FaUser, FaBoxOpen, FaClipboardList, FaUsersCog 
} from 'react-icons/fa';

const Sidebar = ({ isMobile }) => {
  const { role, logout } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    switch (role) {
      case 'Vendor':
        return [
          { name: 'Dashboard', path: '/dashboard/vendor', icon: <FaHome /> },
          { name: 'Products', path: '/dashboard/vendor/products', icon: <FaBoxOpen /> },
          { name: 'Orders', path: '/dashboard/vendor/orders', icon: <FaClipboardList /> },
          { name: 'Profile', path: '/dashboard/vendor/profile', icon: <FaUser /> },
        ];
      case 'Admin':
        return [
          { name: 'Dashboard', path: '/dashboard/admin', icon: <FaHome /> },
          { name: 'Users', path: '/dashboard/admin/users', icon: <FaUsersCog /> },
          { name: 'Vendors', path: '/dashboard/admin/vendors', icon: <FaBoxOpen /> },
          { name: 'Orders', path: '/dashboard/admin/orders', icon: <FaClipboardList /> },
        ];
      case 'User':
      default:
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
          { name: 'Events', path: '/dashboard/events', icon: <FaCalendarAlt /> },
          { name: 'Wishlist', path: '/dashboard/wishlist', icon: <FaGift /> },
          { name: 'Friends', path: '/dashboard/friends', icon: <FaUsers /> },
          { name: 'Products', path: '/dashboard/products', icon: <FaBoxOpen /> },
          { name: 'Wallet', path: '/dashboard/wallet', icon: <FaWallet /> },
        ];
    }
  };

  const links = getLinks();

  return (
    <div style={{
      width: '260px',
      background: 'var(--white)',
      borderRight: isMobile ? 'none' : '1px solid var(--border)',
      height: '100vh',
      display: isMobile ? 'flex' : 'none',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-sm)'
    }} className={isMobile ? '' : 'md:flex'}>
      
      <div style={{
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--border)',
        background: 'var(--white)'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 800, 
          background: 'var(--primary-gradient)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>
          Gift Spot
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
            
            return (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'var(--transition)',
                  background: isActive ? 'var(--primary-soft)' : 'transparent',
                  color: isActive ? 'var(--primary-dark)' : 'var(--text-secondary)',
                  textDecoration: 'none'
                }}
                className="gs-sidebar-link"
              >
                <span style={{ 
                  marginRight: '12px', 
                  fontSize: '1.25rem',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)'
                }}>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={logout}
          className="gs-btn gs-btn-danger gs-btn-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
