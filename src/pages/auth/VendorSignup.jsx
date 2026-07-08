import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VendorSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+92',
    city: 'Karachi',
    businessName: '',
    businessAddress: '',
    category: 'electronics',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ownerName: formData.name,
        email: formData.email,
        password: formData.password,
        businessPhone: formData.phone,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        description: formData.description,
        category: formData.category,
        city: formData.city,
        zone: '' // Optional zone
      };

      const response = await fetch('http://localhost:5000/api/auth/signup-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.msg);
        login(formData, 'Vendor', 'mock-jwt-token', false);
        navigate('/dashboard/vendor');
      } else {
        alert(`Vendor Signup failed: ${data.msg || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF0F7 0%, #FDF2F8 50%, #FFF 100%)',
      padding: '2rem 1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '2.5rem',
        border: '1px solid var(--border)'
      }} className="gs-fade-in">
        <div className="text-center mb-8">
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Become a Vendor
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
            Register your business to sell premium gifts on Gift Spot
          </p>
        </div>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Personal Info */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--primary-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Ahmed Raza"
                  value={formData.name}
                  onChange={handleChange}
                  className="gs-input" 
                  required 
                />
              </div>
              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="vendor@example.pk"
                  value={formData.email}
                  onChange={handleChange}
                  className="gs-input" 
                  required 
                />
              </div>
              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Password</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="gs-input" 
                  required 
                />
              </div>
              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="gs-input" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--primary-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Business Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Business Name</label>
                <input 
                  type="text" 
                  name="businessName"
                  placeholder="Raza Electronics or Tariq Road Gifts"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="gs-input" 
                  required 
                />
              </div>
              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="gs-select" 
                  required
                >
                  <option value="bakery">Bakery</option>
                  <option value="mart">Mart</option>
                  <option value="gift-shop">Gift Shop</option>
                  <option value="florist">Florist</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="electronics">Electronics</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">City</label>
                <select 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="gs-select" 
                  required
                >
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Multan">Multan</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Abbottabad">Abbottabad</option>
                </select>
              </div>
            </div>
            
            <div className="gs-form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="gs-label">Business Address</label>
              <input 
                type="text" 
                name="businessAddress"
                placeholder="Shop #12, Gulberg Galleria, Lahore"
                value={formData.businessAddress}
                onChange={handleChange}
                className="gs-input" 
                required 
              />
            </div>

            <div className="gs-form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="gs-label">Shop Description</label>
              <textarea 
                name="description"
                rows="3"
                placeholder="Describe your shop offerings..."
                value={formData.description}
                onChange={handleChange}
                className="gs-textarea" 
                required 
              ></textarea>
            </div>
          </div>
          
          <button type="submit" className="gs-btn gs-btn-primary gs-btn-full gs-btn-lg" style={{ marginTop: '0.5rem' }}>
            Register Vendor
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Already a vendor? <Link to="/auth/login" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;
