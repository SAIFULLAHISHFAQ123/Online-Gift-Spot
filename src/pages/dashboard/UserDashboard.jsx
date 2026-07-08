import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useNotification from '../../hooks/useNotification';
import { FaCalendarAlt, FaGift, FaUsers, FaArrowRight, FaSpinner, FaWallet } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const API = 'http://localhost:5000/api';

const UserDashboard = () => {
  const { user, login, role, token, isApproved } = useAuth();
  useNotification(user?.email); // Start listening for notifications

  const [stats, setStats] = useState({
    eventsCount: 0,
    wishlistCount: 0,
    friendsCount: 0,
    walletCoins: 10000
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?._id) return;
      try {
        const [eventsRes, wishlistRes, friendsRes, userRes] = await Promise.all([
          fetch(`${API}/events/my/${user._id}`),
          fetch(`${API}/wishlist/${user._id}`),
          fetch(`${API}/friends/${user._id}`),
          fetch(`${API}/auth/user/${user._id}`)
        ]);

        const events = await eventsRes.json();
        const wishlist = await wishlistRes.json();
        const friends = await friendsRes.json();
        const userData = await userRes.json();

        const latestCoins = userData.user?.walletCoins ?? 10000;

        setStats({
          eventsCount: Array.isArray(events) ? events.length : 0,
          wishlistCount: Array.isArray(wishlist) ? wishlist.length : 0,
          friendsCount: Array.isArray(friends) ? friends.length : 0,
          walletCoins: latestCoins
        });

        // Sync auth context if coins changed
        if (userData.user && userData.user.walletCoins !== user.walletCoins) {
          login({ ...user, walletCoins: latestCoins }, role, token, isApproved);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?._id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--primary-gradient)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        color: 'white',
        boxShadow: 'var(--shadow-pink)',
        position: 'relative',
        overflow: 'hidden'
      }} className="gs-fade-in">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, margin: 0 }}>Welcome, {user?.name || 'Gifter'}! 👋</h2>
          <p style={{ marginTop: '0.5rem', opacity: 0.9, fontSize: 'var(--text-base)', maxWidth: '500px' }}>
            Ready to make someone's day special? Manage events, update your wishlist, or find Lahore-vendors' gifts.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-20px', bottom: '-20px',
          fontSize: '9rem', opacity: 0.1, pointerEvents: 'none'
        }}>
          🎁
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <FaSpinner style={{ animation: 'spin 0.8s linear infinite', marginRight: '8px' }} />
          Loading dashboard summary...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          
          <Link to="/dashboard/events" className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', textDecoration: 'none' }}>
            <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>
              <FaCalendarAlt size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Upcoming Events</p>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>{stats.eventsCount}</h3>
            </div>
            <FaArrowRight style={{ color: 'var(--primary-light)' }} />
          </Link>

          <Link to="/dashboard/wishlist" className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', textDecoration: 'none' }}>
            <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
              <FaGift size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Wishlist Items</p>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>{stats.wishlistCount}</h3>
            </div>
            <FaArrowRight style={{ color: 'var(--primary-light)' }} />
          </Link>

          <Link to="/dashboard/friends" className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', textDecoration: 'none' }}>
            <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>
              <FaUsers size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Friends List</p>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>{stats.friendsCount}</h3>
            </div>
            <FaArrowRight style={{ color: 'var(--primary-light)' }} />
          </Link>

          <Link to="/dashboard/wallet" className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', textDecoration: 'none' }}>
            <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--primary-soft)', color: '#ec4899' }}>
              <FaWallet size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Wallet Balance</p>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>PKR {stats.walletCoins.toLocaleString()}</h3>
            </div>
            <FaArrowRight style={{ color: 'var(--primary-light)' }} />
          </Link>

        </div>
      )}

      {/* Quick Action Guide */}
      <div className="gs-card gs-fade-in">
        <div className="gs-card-header">
          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 'var(--text-base)' }}>Quick Actions</h3>
        </div>
        <div className="gs-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🎉 Create Event</h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1rem' }}>
              Add a birthday or anniversary, pick gifts, and filter vendors by your friend's city dynamically.
            </p>
            <Link to="/dashboard/events/create" className="gs-btn gs-btn-primary gs-btn-sm">
              Get Started
            </Link>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🛍️ Browse Products</h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1rem' }}>
              Explore products from local vendors, filter by city (e.g. Lahore), or add items to your wishlist.
            </p>
            <Link to="/dashboard/products" className="gs-btn gs-btn-outline gs-btn-sm">
              Open Marketplace
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserDashboard;
