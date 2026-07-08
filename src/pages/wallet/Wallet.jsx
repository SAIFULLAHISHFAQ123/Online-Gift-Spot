import { useState, useEffect } from 'react';
import { FaCoins, FaArrowUp, FaArrowDown, FaHistory, FaSpinner, FaPlusCircle, FaGift } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const Wallet = () => {
  const { user, login, role, token, isApproved } = useAuth();
  const [walletCoins, setWalletCoins] = useState(user?.walletCoins || 0);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchLatestBalance = async () => {
    if (!user?._id) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/user/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        const latestCoins = data.user?.walletCoins ?? 10000;
        setWalletCoins(latestCoins);
        login({ ...user, walletCoins: latestCoins }, role, token, isApproved);
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestBalance();
  }, [user?._id]);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (amount < 100) {
      alert('Minimum deposit is PKR 100 coins.');
      return;
    }

    setDepositing(true);
    try {
      const res = await fetch(`${API}/auth/wallet/deposit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, amount })
      });

      const data = await res.json();
      if (res.ok) {
        setWalletCoins(data.walletCoins);
        login({ ...user, walletCoins: data.walletCoins }, role, token, isApproved);

        const newTx = {
          id: Date.now(),
          type: 'Deposit',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          description: `Digital Coins Deposit — PKR ${amount.toLocaleString()}`,
          status: 'Completed'
        };
        setTransactions(prev => [newTx, ...prev]);
        setDepositAmount('');
        setShowModal(false);
        alert(`✅ Successfully deposited PKR ${amount.toLocaleString()} coins!`);
      } else {
        alert(data.msg || 'Deposit failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server. Please ensure the backend is running.');
    } finally {
      setDepositing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">
            <FaCoins /> Digital Wallet
          </h2>
          <p className="gs-page-subtitle">
            Your digital gift coins — use them to purchase gifts for friends and family
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* Balance Card */}
        <div className="gs-card gs-fade-in" style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)',
          color: 'white',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          minHeight: '240px',
          boxShadow: '0 15px 35px -5px rgba(147, 51, 234, 0.35)',
          border: 'none'
        }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', opacity: 0.85, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              🪙 Available Coins Balance
            </p>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <FaSpinner style={{ animation: 'spin 0.8s linear infinite', fontSize: '1.5rem' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>Loading...</span>
              </div>
            ) : (
              <h3 style={{ fontSize: '3rem', fontWeight: 900, margin: '0.5rem 0 0 0', letterSpacing: '-0.02em' }}>
                PKR {walletCoins.toLocaleString()}
              </h3>
            )}
            <p style={{ fontSize: 'var(--text-xs)', opacity: 0.75, marginTop: '0.25rem' }}>
              {user?.name || 'User'} • Digital Gift Coins
            </p>
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[500, 1000, 5000, 10000].map(amt => (
              <button
                key={amt}
                onClick={() => { setDepositAmount(String(amt)); setShowModal(true); }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}
              >
                +{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'white',
              color: '#9333ea',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: 'var(--text-sm)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              transition: 'var(--transition)'
            }}
          >
            <FaPlusCircle /> Add More Coins
          </button>
        </div>

        {/* Transactions */}
        <div className="gs-card gs-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div className="gs-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaHistory style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Coin History
            </h3>
          </div>
          <div className="gs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto' }}>
            {transactions.length === 0 ? (
              <div className="gs-empty" style={{ padding: '2rem' }}>
                <div className="gs-empty-icon"><FaGift /></div>
                <p>No transactions yet.</p>
              </div>
            ) : transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '50%',
                    background: tx.amount > 0 ? 'var(--success-soft)' : 'rgba(239,68,68,0.1)',
                    color: tx.amount > 0 ? 'var(--success)' : '#ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {tx.amount > 0 ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{tx.type}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{tx.date}</p>
                  </div>
                </div>
                <span style={{
                  fontWeight: 800,
                  fontSize: 'var(--text-sm)',
                  color: tx.amount > 0 ? 'var(--success)' : '#ef4444'
                }}>
                  {tx.amount > 0 ? `+ PKR ${tx.amount.toLocaleString()}` : `- PKR ${Math.abs(tx.amount).toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coin Info box */}
      <div className="gs-card gs-fade-in" style={{ padding: '1.25rem 1.5rem', background: 'var(--primary-soft)', border: '1px solid var(--primary-light)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <FaCoins style={{ color: 'var(--primary)', fontSize: '1.5rem', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontWeight: 700, color: 'var(--primary-dark)', margin: '0 0 4px 0', fontSize: 'var(--text-sm)' }}>
            How Digital Gift Coins Work
          </h4>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            1 coin = PKR 1. You received <strong>10,000 welcome coins</strong> to get started! 
            Use coins to purchase gifts from local vendors without needing a credit card. 
            Add more coins anytime to keep gifting.
          </p>
        </div>
      </div>

      {/* Deposit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(6px)'
        }}>
          <div className="gs-card gs-fade-in" style={{ width: '100%', maxWidth: '420px', margin: '1rem', padding: 0 }}>
            <div className="gs-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <FaCoins style={{ color: 'var(--primary)' }} /> Add Coins to Wallet
              </h3>
              <button
                onClick={() => { setShowModal(false); setDepositAmount(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)', lineHeight: 1, padding: 0 }}
              >×</button>
            </div>

            <div className="gs-card-body">
              <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Quick Select */}
                <div>
                  <label className="gs-label">Quick Select Amount</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {[500, 1000, 5000, 10000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(String(amt))}
                        style={{
                          padding: '8px 4px',
                          border: `2px solid ${depositAmount === String(amt) ? 'var(--primary)' : 'var(--border)'}`,
                          background: depositAmount === String(amt) ? 'var(--primary-soft)' : 'var(--white)',
                          color: depositAmount === String(amt) ? 'var(--primary-dark)' : 'var(--text-secondary)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 700,
                          transition: 'var(--transition)'
                        }}
                      >
                        {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gs-form-group" style={{ marginBottom: 0 }}>
                  <label className="gs-label">Or Enter Custom Amount (PKR)</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 2500"
                    min="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="gs-input"
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    1 PKR = 1 Gift Coin • Minimum PKR 100
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => { setShowModal(false); setDepositAmount(''); }} className="gs-btn gs-btn-outline gs-btn-sm" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={depositing || !depositAmount} className="gs-btn gs-btn-primary gs-btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {depositing && <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />}
                    {depositing ? 'Adding...' : `Add PKR ${Number(depositAmount || 0).toLocaleString()} Coins`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
