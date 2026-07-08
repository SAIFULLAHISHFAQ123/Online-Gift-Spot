import { FaUsers, FaStore, FaChartPie, FaCheckCircle, FaBan } from 'react-icons/fa';

const AdminDashboard = () => {
  const users = [
    { id: 1, name: 'Ali Raza', email: 'ali.raza@example.pk', role: 'User', status: 'Active' },
    { id: 2, name: 'Tariq Road Gifts', email: 'tariq.gifts@example.pk', role: 'Vendor', status: 'Pending' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">
            <FaUsers />
            Admin Dashboard
          </h2>
          <p className="gs-page-subtitle">Manage users, approve vendors, and track platform activity</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        <div className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>
            <FaUsers size={24} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Users</p>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>1,248</h3>
          </div>
        </div>
        
        <div className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>
            <FaStore size={24} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Vendors</p>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>84</h3>
          </div>
        </div>

        <div className="gs-card gs-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div className="gs-avatar gs-avatar-lg" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
            <FaChartPie size={24} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Platform Revenue</p>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>PKR 4,520,000</h3>
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="gs-card gs-fade-in">
        <div className="gs-card-header">
          <h3 style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 'var(--text-base)' }}>User & Vendor Approvals</h3>
        </div>
        <div className="gs-card-body" style={{ padding: 0 }}>
          <div className="gs-table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table className="gs-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`gs-badge ${u.role === 'Vendor' ? 'gs-badge-purple' : 'gs-badge-blue'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`gs-badge ${u.status === 'Active' ? 'gs-badge-green' : 'gs-badge-yellow'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {u.status === 'Pending' && (
                          <button className="gs-btn gs-btn-primary gs-btn-sm" title="Approve" style={{ padding: '6px' }}>
                            <FaCheckCircle size={16} />
                          </button>
                        )}
                        <button className="gs-btn gs-btn-danger gs-btn-sm" title="Block/Reject" style={{ padding: '6px' }}>
                          <FaBan size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
