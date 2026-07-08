import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ allowedRoles }) => {
  const { user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role?.toLowerCase()}/dashboard`} replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface)' }} className="transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar isMobile={false} />

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          display: 'flex'
        }}>
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(2px)'
            }}
          />
          {/* Sidebar Drawer container */}
          <div style={{
            position: 'relative',
            width: '260px',
            height: '100%',
            background: 'var(--white)',
            boxShadow: '0 0 15px rgba(0,0,0,0.15)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="gs-btn gs-btn-ghost gs-btn-sm"
                style={{ fontSize: '1.25rem', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }} onClick={() => setMobileMenuOpen(false)}>
              <Sidebar isMobile={true} />
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
