import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+92',
    city: 'Lahore',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful!');
        login(data.user, 'User', data.token, true);
        navigate('/dashboard');
      } else {
        alert(`Signup failed: ${data.msg || 'Unknown error'}`);
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
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '2.5rem',
        border: '1px solid var(--border)'
      }} className="gs-fade-in">
        <div className="text-center mb-6">
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
            Register to start finding and sending perfect gifts
          </p>
        </div>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="gs-form-group" style={{ marginBottom: 0 }}>
            <label className="gs-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              placeholder="Ali Khan"
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
              placeholder="ali@example.pk"
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
          <div className="gs-form-group" style={{ marginBottom: 0 }}>
            <label className="gs-label">City</label>
            <select 
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="gs-select" 
              required
            >
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Quetta">Quetta</option>
              <option value="Multan">Multan</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Gujranwala">Gujranwala</option>
              <option value="Sialkot">Sialkot</option>
              <option value="Abbottabad">Abbottabad</option>
            </select>
          </div>
          
          <button type="submit" className="gs-btn gs-btn-primary gs-btn-full gs-btn-lg" style={{ marginTop: '0.5rem' }}>
            Register
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/auth/login" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
