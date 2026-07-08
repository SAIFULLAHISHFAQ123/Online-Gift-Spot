import { useState, useEffect } from 'react';
import { FaUserFriends, FaEye, FaPlus, FaCalendarAlt, FaTrash, FaSpinner } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const EventsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [friendEvents, setFriendEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const [myRes, friendRes] = await Promise.all([
        fetch(`${API}/events/my/${user._id}`),
        fetch(`${API}/events/friends/${user._id}`)
      ]);
      const myData = await myRes.json();
      const friendData = await friendRes.json();

      if (myRes.ok) setMyEvents(Array.isArray(myData) ? myData : []);
      if (friendRes.ok) setFriendEvents(Array.isArray(friendData) ? friendData : []);
    } catch (err) {
      setError('Failed to load events. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user?._id]);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await fetch(`${API}/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyEvents(prev => prev.filter(e => e._id !== eventId));
      }
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getEventTypeColor = (type) => {
    const map = {
      Birthday: 'gs-badge-pink',
      Anniversary: 'gs-badge-purple',
      Wedding: 'gs-badge-blue',
      'Baby Shower': 'gs-badge-green',
      Other: 'gs-badge-yellow'
    };
    return map[type] || 'gs-badge-pink';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div className="gs-page-header">
        <div>
          <h2 className="gs-page-title">
            <FaCalendarAlt />
            My Events
          </h2>
          <p className="gs-page-subtitle">Track birthdays, anniversaries, and special occasions</p>
        </div>
        <Link
          to="/dashboard/events/create"
          className="gs-btn gs-btn-primary"
        >
          <FaPlus />
          Create Event
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="gs-alert gs-alert-error">{error}</div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem', color: 'var(--text-muted)' }}>
          <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />
          Loading events...
        </div>
      ) : (
        <>
          {/* My Events Section */}
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCalendarAlt style={{ color: 'var(--primary)' }} />
              My Events
              <span className="gs-badge gs-badge-pink" style={{ marginLeft: '0.5rem' }}>{myEvents.length}</span>
            </h3>

            {myEvents.length === 0 ? (
              <div className="gs-card">
                <div className="gs-empty">
                  <div className="gs-empty-icon">🎉</div>
                  <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>No events yet!</p>
                  <p>Create your first event to get started.</p>
                  <Link to="/dashboard/events/create" className="gs-btn gs-btn-primary gs-btn-sm" style={{ marginTop: '0.5rem' }}>
                    <FaPlus /> Create Event
                  </Link>
                </div>
              </div>
            ) : (
              <div className="gs-table-wrapper">
                <table className="gs-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>For Friend</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myEvents.map((event) => (
                      <tr key={event._id}>
                        <td style={{ fontWeight: 600 }}>{event.title}</td>
                        <td>
                          <span className={`gs-badge ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                        </td>
                        <td>{formatDate(event.date)}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {event.friendName || '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Link
                              to={`/dashboard/events/${event._id}`}
                              className="gs-btn gs-btn-outline gs-btn-sm"
                            >
                              <FaEye /> View
                            </Link>
                            <button
                              onClick={() => handleDelete(event._id)}
                              className="gs-btn gs-btn-danger gs-btn-sm"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Friend Events Section */}
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaUserFriends style={{ color: 'var(--accent)' }} />
              Friends' Events
              <span className="gs-badge gs-badge-purple" style={{ marginLeft: '0.5rem' }}>{friendEvents.length}</span>
            </h3>

            {friendEvents.length === 0 ? (
              <div className="gs-card">
                <div className="gs-empty">
                  <div className="gs-empty-icon">👫</div>
                  <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>No friend events yet</p>
                  <p>Add friends to see their upcoming events.</p>
                  <Link to="/dashboard/friends" className="gs-btn gs-btn-outline gs-btn-sm" style={{ marginTop: '0.5rem' }}>
                    Add Friends
                  </Link>
                </div>
              </div>
            ) : (
              <div className="gs-table-wrapper">
                <table className="gs-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Friend</th>
                      <th>City</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {friendEvents.map((event) => (
                      <tr
                        key={event._id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/dashboard/events/${event._id}`)}
                      >
                        <td style={{ fontWeight: 600 }}>{event.title}</td>
                        <td style={{ color: 'var(--accent)', fontWeight: 600 }}>
                          {event.userId?.name || 'Friend'}
                        </td>
                        <td>
                          {event.userId?.city ? (
                            <span className="gs-badge gs-badge-blue">{event.userId.city}</span>
                          ) : '—'}
                        </td>
                        <td>
                          <span className={`gs-badge ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                        </td>
                        <td>{formatDate(event.date)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            to={`/dashboard/events/${event._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="gs-btn gs-btn-outline gs-btn-sm"
                          >
                            <FaEye /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EventsList;
