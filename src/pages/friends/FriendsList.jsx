import { useState, useEffect, useCallback } from 'react';
import { FaUserPlus, FaCheck, FaTimes, FaSearch, FaUsers, FaClock, FaMapMarkerAlt, FaUserFriends, FaSpinner, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const FriendsList = () => {
  const { user } = useAuth();

  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);

  // Tabs
  const [activeTab, setActiveTab] = useState('friends'); // friends | requests | search

  const fetchAll = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const [friendsRes, incomingRes, sentRes] = await Promise.all([
        fetch(`${API}/friends/${user._id}`),
        fetch(`${API}/friends/requests/${user._id}`),
        fetch(`${API}/friends/sent/${user._id}`)
      ]);

      const friendsData = await friendsRes.json();
      const incomingData = await incomingRes.json();
      const sentData = await sentRes.json();

      if (friendsRes.ok) setFriends(Array.isArray(friendsData) ? friendsData : []);
      if (incomingRes.ok) setIncomingRequests(Array.isArray(incomingData) ? incomingData : []);
      if (sentRes.ok) setSentRequests(Array.isArray(sentData) ? sentData : []);
    } catch {
      setError('Failed to load friends. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Search users
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API}/friends/search?q=${encodeURIComponent(searchQuery)}&currentUserId=${user._id}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, user?._id]);

  const sendRequest = async (receiverId) => {
    setSendingTo(receiverId);
    try {
      const res = await fetch(`${API}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user._id, receiverId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Friend request sent! ✓');
        setSearchQuery('');
        setSearchResults([]);
        fetchAll();
      } else {
        alert(data.msg || 'Could not send request.');
      }
    } catch {
      alert('Server error. Please try again.');
    } finally {
      setSendingTo(null);
    }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      const res = await fetch(`${API}/friends/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAll();
      }
    } catch {
      alert('Failed to update request.');
    }
  };

  const removeFriend = async (friendshipId) => {
    if (!window.confirm('Remove this friend?')) return;
    try {
      const res = await fetch(`${API}/friends/${friendshipId}`, { method: 'DELETE' });
      if (res.ok) {
        setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
      }
    } catch {
      alert('Failed to remove friend.');
    }
  };

  const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const tabStyle = (tab) => ({
    padding: '8px 20px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    background: activeTab === tab ? 'var(--primary)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">
            <FaUsers />
            Friends
          </h2>
          <p className="gs-page-subtitle">Connect with friends and see their gift events</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="gs-badge gs-badge-green"><FaUserFriends /> {friends.length} Friends</span>
          {incomingRequests.length > 0 && (
            <span className="gs-badge gs-badge-pink"><FaClock /> {incomingRequests.length} Requests</span>
          )}
        </div>
      </div>

      {error && <div className="gs-alert gs-alert-error">{error}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface)', padding: '4px', borderRadius: 'var(--radius-full)', width: 'fit-content' }}>
        <button style={tabStyle('friends')} onClick={() => setActiveTab('friends')}>
          <FaUsers style={{ marginRight: '6px' }} /> Friends ({friends.length})
        </button>
        <button style={tabStyle('requests')} onClick={() => setActiveTab('requests')}>
          <FaClock style={{ marginRight: '6px' }} /> Requests ({incomingRequests.length})
        </button>
        <button style={tabStyle('search')} onClick={() => setActiveTab('search')}>
          <FaSearch style={{ marginRight: '6px' }} /> Find Friends
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)' }}>
          <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />
          Loading...
        </div>
      ) : (
        <>
          {/* ── FRIENDS TAB ── */}
          {activeTab === 'friends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {friends.length === 0 ? (
                <div className="gs-card">
                  <div className="gs-empty">
                    <div className="gs-empty-icon">👫</div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No friends yet</p>
                    <p>Search for friends to connect with them.</p>
                    <button onClick={() => setActiveTab('search')} className="gs-btn gs-btn-primary gs-btn-sm" style={{ marginTop: '0.5rem' }}>
                      Find Friends
                    </button>
                  </div>
                </div>
              ) : (
                friends.map(friend => (
                  <div key={friend._id} className="gs-friend-card gs-fade-in">
                    <div className="gs-avatar gs-avatar-md" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>
                      {getInitials(friend.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>{friend.name}</h4>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{friend.email}</p>
                      {friend.city && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--info)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaMapMarkerAlt /> {friend.city}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="gs-badge gs-badge-green">✓ Friend</span>
                      <button
                        onClick={() => removeFriend(friend.friendshipId)}
                        className="gs-btn gs-btn-danger gs-btn-sm"
                        title="Remove friend"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── REQUESTS TAB ── */}
          {activeTab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Incoming */}
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Incoming Requests <span className="gs-badge gs-badge-pink" style={{ marginLeft: '0.5rem' }}>{incomingRequests.length}</span>
                </h3>
                {incomingRequests.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                    No incoming friend requests
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {incomingRequests.map(req => (
                      <div key={req._id} className="gs-friend-card gs-fade-in">
                        <div className="gs-avatar gs-avatar-md">
                          {getInitials(req.senderId?.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.senderId?.name}</h4>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{req.senderId?.email}</p>
                          {req.senderId?.city && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FaMapMarkerAlt /> {req.senderId.city}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => respondToRequest(req._id, 'accepted')}
                            className="gs-btn gs-btn-primary gs-btn-sm"
                          >
                            <FaCheck /> Accept
                          </button>
                          <button
                            onClick={() => respondToRequest(req._id, 'declined')}
                            className="gs-btn gs-btn-danger gs-btn-sm"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent */}
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Sent Requests <span className="gs-badge gs-badge-yellow" style={{ marginLeft: '0.5rem' }}>{sentRequests.length}</span>
                </h3>
                {sentRequests.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                    No sent requests pending
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sentRequests.map(req => (
                      <div key={req._id} className="gs-friend-card gs-fade-in">
                        <div className="gs-avatar gs-avatar-md">
                          {getInitials(req.receiverId?.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.receiverId?.name}</h4>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{req.receiverId?.email}</p>
                        </div>
                        <span className="gs-badge gs-badge-yellow"><FaClock /> Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SEARCH TAB ── */}
          {activeTab === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none'
                }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="gs-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>

              {searching && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> Searching...
                </div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                  No users found for "{searchQuery}"
                </p>
              )}

              {searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.map(u => {
                    const isAlreadyFriend = friends.some(f => f._id === u._id);
                    const hasSentRequest = sentRequests.some(r => r.receiverId?._id === u._id);

                    return (
                      <div key={u._id} className="gs-friend-card gs-fade-in">
                        <div className="gs-avatar gs-avatar-md">
                          {getInitials(u.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</h4>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{u.email}</p>
                          {u.city && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FaMapMarkerAlt /> {u.city}
                            </p>
                          )}
                        </div>
                        {isAlreadyFriend ? (
                          <span className="gs-badge gs-badge-green">✓ Friends</span>
                        ) : hasSentRequest ? (
                          <span className="gs-badge gs-badge-yellow">Request Sent</span>
                        ) : (
                          <button
                            onClick={() => sendRequest(u._id)}
                            disabled={sendingTo === u._id}
                            className="gs-btn gs-btn-primary gs-btn-sm"
                          >
                            {sendingTo === u._id ? <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> : <FaUserPlus />}
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {searchQuery.length < 2 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
                  Type at least 2 characters to search for users
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FriendsList;
