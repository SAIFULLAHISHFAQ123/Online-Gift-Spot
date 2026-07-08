import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/auth/Login';
import UserSignup from '../pages/auth/UserSignup';
import VendorSignup from '../pages/auth/VendorSignup';
import DashboardLayout from '../layouts/DashboardLayout';
import UserDashboard from '../pages/dashboard/UserDashboard';
import EventsList from '../pages/events/EventsList';
import FriendsList from '../pages/friends/FriendsList';
import Wishlist from '../pages/wishlist/Wishlist';
import FriendEvent from '../pages/events/FriendEvent';
import CreateEvent from '../pages/events/CreateEvent';
import Marketplace from '../pages/products/Marketplace';
import Cart from '../pages/cart/Cart';
import Checkout from '../pages/cart/Checkout';
import Wallet from '../pages/wallet/Wallet';
import VendorDashboard from '../pages/vendor/VendorDashboard';
import VendorOrders from '../pages/vendor/VendorOrders';
import VendorProfile from '../pages/vendor/VendorProfile';
import AdminDashboard from '../pages/admin/AdminDashboard';

import { FaSpinner } from 'react-icons/fa';

const AppRoutes = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface)',
        color: 'var(--primary)'
      }}>
        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '2.5rem' }} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/auth/signup" element={!user ? <UserSignup /> : <Navigate to="/dashboard" />} />
      <Route path="/auth/vendor-signup" element={!user ? <VendorSignup /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={<Navigate to="/auth/login" />} />
      
      {/* Shared Dashboard Layout for all roles */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        
        {/* Dashboard index — route each role to their home */}
        <Route index element={
          role === 'User' ? <UserDashboard /> :
          role === 'Vendor' ? <Navigate to="/dashboard/vendor" replace /> :
          role === 'Admin' ? <Navigate to="/dashboard/admin" replace /> :
          <Navigate to="/auth/login" replace />
        } />

        {/* Regular User Routes */}
        <Route path="events" element={<EventsList />} />
        <Route path="events/create" element={<CreateEvent />} />
        <Route path="events/:eventId" element={<FriendEvent />} />
        <Route path="friends" element={<FriendsList />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="products" element={<Marketplace />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="wallet" element={<Wallet />} />

        {/* Vendor Portal Routes — guard with loading-aware check */}
        <Route path="vendor" element={role === 'Vendor' ? <VendorDashboard /> : <Navigate to="/dashboard" replace />} />
        <Route path="vendor/products" element={role === 'Vendor' ? <Marketplace /> : <Navigate to="/dashboard" replace />} />
        <Route path="vendor/orders" element={role === 'Vendor' ? <VendorOrders /> : <Navigate to="/dashboard" replace />} />
        <Route path="vendor/profile" element={role === 'Vendor' ? <VendorProfile /> : <Navigate to="/dashboard" replace />} />

        {/* Admin Portal Routes */}
        <Route path="admin" element={role === 'Admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth/login"} />} />
    </Routes>
  );
};

export default AppRoutes;

