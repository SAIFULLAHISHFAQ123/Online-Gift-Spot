import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTruck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const VendorOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const vendorId = user?.vendorId || '60d5ecb8b392d72f8430e4a2';

  const fetchOrders = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/orders/vendor/${vendorId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to fetch orders.');
      }
    } catch (err) {
      setError('Failed to connect to backend server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [vendorId]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Order status updated to ${newStatus}`);
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        const data = await response.json();
        alert(data.msg || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Packed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Order Management</h2>
      
      {error && <div className="gs-alert gs-alert-error">{error}</div>}

      <div className="bg-[var(--color-background)] rounded-xl shadow-sm border border-[var(--color-border)] p-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)' }}>
              <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />
              <span>Loading order list...</span>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No orders received yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-[var(--color-text-secondary)]">
              <thead className="bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  // Compare as strings because MongoDB ObjectId !== JS string
                  const vendorItems = order.items.filter(item => String(item.vendorId) === String(vendorId));
                  const productNames = vendorItems.map(item => `${item.name} (${item.quantity})`).join(', ');
                  const vendorSubtotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                  return (
                    <tr key={order._id} className="border-t border-[var(--color-border)]">
                      <td className="px-4 py-4 font-medium text-[var(--color-text-primary)]">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </td>
                      <td className="px-4 py-4">{productNames || 'Other vendor products'}</td>
                      <td className="px-4 py-4">{order.recipientName || order.userId?.name || 'Customer'}</td>
                      <td className="px-4 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 font-medium text-[var(--color-primary)]">
                        PKR {vendorSubtotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        {order.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(order._id, 'Packed')} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors" title="Mark as Packed" style={{ display: 'inline-flex', padding: '6px' }}>
                              <FaCheckCircle />
                            </button>
                            <button onClick={() => updateStatus(order._id, 'Cancelled')} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors" title="Reject Order" style={{ display: 'inline-flex', padding: '6px' }}>
                              <FaTimesCircle />
                            </button>
                          </>
                        )}
                        {order.status === 'Packed' && (
                          <button onClick={() => updateStatus(order._id, 'Shipped')} className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded transition-colors" title="Mark as Shipped" style={{ display: 'inline-flex', padding: '6px' }}>
                            <FaTruck />
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <button onClick={() => updateStatus(order._id, 'Delivered')} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded transition-colors" title="Mark as Delivered" style={{ display: 'inline-flex', padding: '6px' }}>
                            <FaCheckCircle />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOrders;
