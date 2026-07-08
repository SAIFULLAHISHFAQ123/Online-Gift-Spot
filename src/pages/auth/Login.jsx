import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaGift, FaEnvelope, FaLock } from 'react-icons/fa';

const API = 'http://localhost:5000/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || 'Login failed. Check your credentials.');
        return;
      }

      const { token, user } = data;
      login(user, user.role, token, user.isApproved);

      if (user.role === 'Vendor') navigate('/dashboard/vendor');
      else if (user.role === 'Admin') navigate('/dashboard/admin');
      else navigate('/dashboard');

    } catch (err) {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
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
        maxWidth: '440px',
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '2.5rem',
        border: '1px solid var(--border)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'var(--primary-gradient)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--shadow-pink)'
          }}>
            <FaGift style={{ color: 'white', fontSize: '1.75rem' }} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Gift Spot
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
            Welcome back! Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="gs-alert gs-alert-error" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="gs-form-group" style={{ marginBottom: 0 }}>
            <label className="gs-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="gs-input"
                style={{ paddingLeft: '40px' }}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="gs-form-group" style={{ marginBottom: 0 }}>
            <label className="gs-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="gs-input"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gs-btn gs-btn-primary gs-btn-full gs-btn-lg"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/auth/signup" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Sign up</Link>
        </div>
        <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Want to sell?{' '}
          <Link to="/auth/vendor-signup" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Become a Vendor</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
