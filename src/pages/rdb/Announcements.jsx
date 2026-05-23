// pages/rdb/Announcements.jsx
import React, { useState, useEffect } from 'react';
import { FiSend, FiBell, FiAlertCircle, FiInfo, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const Announcements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('info');
  const [sending, setSending] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalHotels: 0, sentCount: 0 });
  
  // Fix: Use consistent token key
  const token = localStorage.getItem("token") || localStorage.getItem("rdbToken");

  useEffect(() => {
    if (token) {
      loadAnnouncements();
      loadStats();
    } else {
      setError("Please login to manage announcements");
      setLoading(false);
    }
  }, [token]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/rdb/announcements", {
        method: 'GET',
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/rdb/login';
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setAnnouncements(data);
      setError(null);
    } catch (error) {
      console.error("Error loading announcements:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated loadStats function
  const loadStats = async () => {
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/rdb/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalHotels: data.approved_hotels || 0,  // Use approved_hotels instead of total_hotels
          sentCount: data.approved_hotels || 0
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Please fill in both title and message');
      return;
    }
    
    if (window.confirm(`Send "${title}" to ${stats.totalHotels} approved hotels?`)) {
      setSending(true);
      try {
        const response = await fetch("http://https://rhms-backend.onrender.com/api/rdb/announcements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ title, message, priority })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert(`✅ ${data.message || 'Announcement sent successfully!'}`);
          setTitle('');
          setMessage('');
          loadAnnouncements();
          loadStats();
        } else {
          alert(data.error || "Failed to send announcement");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to send announcement. Please try again.");
      } finally {
        setSending(false);
      }
    }
  };

  const getPriorityIcon = (p) => {
    switch(p) {
      case 'urgent': return <FiAlertCircle style={{ color: '#dc3545' }} />;
      case 'warning': return <FiAlertCircle style={{ color: '#ffc107' }} />;
      default: return <FiInfo style={{ color: '#0dcaf0' }} />;
    }
  };

  const getPriorityStyle = (p) => {
    switch(p) {
      case 'urgent': return { borderLeft: '4px solid #dc3545', background: '#fef2f2' };
      case 'warning': return { borderLeft: '4px solid #ffc107', background: '#fefce8' };
      default: return { borderLeft: '4px solid #0dcaf0', background: '#f0f9ff' };
    }
  };

  const getPriorityBadge = (p) => {
    const badges = {
      urgent: { bg: '#fee2e2', color: '#dc2626', text: 'URGENT' },
      warning: { bg: '#fef3c7', color: '#d97706', text: 'WARNING' },
      info: { bg: '#dbeafe', color: '#2563eb', text: 'INFO' }
    };
    const badge = badges[p] || badges.info;
    return (
      <span style={{ 
        padding: '2px 8px', 
        borderRadius: '12px', 
        fontSize: '10px', 
        fontWeight: '600',
        background: badge.bg,
        color: badge.color
      }}>
        {badge.text}
      </span>
    );
  };

  if (loading && announcements.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{ marginTop: '20px' }}>Loading announcements...</p>
        <style>{`
          .spinner-border {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && announcements.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '18px', marginBottom: '20px' }}>❌ {error}</div>
        <button onClick={loadAnnouncements} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>📢 Announcements</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Broadcast messages to all registered hotels</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ padding: '8px 16px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>{stats.totalHotels}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Approved Hotels</div>
          </div>
          <button onClick={loadAnnouncements} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Send Announcement Form */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h5 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSend /> New Announcement
            </h5>
            <form onSubmit={handleSend}>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Announcement Title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} 
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <textarea 
                  className="form-control" 
                  rows="5" 
                  placeholder="Announcement Message" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} 
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <select 
                  className="form-select" 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)} 
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
                >
                  <option value="info">📘 Information</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={sending} 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '500'
                }}
              >
                {sending ? (
                  <>⏳ Sending to {stats.totalHotels} hotels...</>
                ) : (
                  <>📢 Send to All Approved Hotels ({stats.totalHotels})</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Announcements List */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h5 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBell /> Recent Announcements
              {announcements.length > 0 && <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#6b7280' }}>{announcements.length} total</span>}
            </h5>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {announcements.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 20px' }}>
                  <FiBell size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No announcements yet</p>
                  <p style={{ fontSize: '12px' }}>Send your first announcement above</p>
                </div>
              ) : (
                announcements.map((ann, index) => (
                  <div 
                    key={ann.announcement_id || index} 
                    style={{ 
                      ...getPriorityStyle(ann.priority), 
                      padding: '16px', 
                      marginBottom: '12px', 
                      borderRadius: '8px',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {getPriorityIcon(ann.priority)}
                      <strong style={{ fontSize: '15px' }}>{ann.title}</strong>
                      {getPriorityBadge(ann.priority)}
                      <small style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '11px' }}>
                        {new Date(ann.created_at).toLocaleDateString()} {new Date(ann.created_at).toLocaleTimeString()}
                      </small>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                      {ann.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ marginTop: '24px', padding: '16px', background: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <FiInfo size={20} style={{ color: '#2563eb' }} />
        <div style={{ flex: 1 }}>
          <strong style={{ color: '#1e40af' }}>About Announcements</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#1e3a8a' }}>
            Announcements will be sent via email to all approved hotels. Urgent announcements are highlighted in red.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ padding: '4px 8px', background: '#fef2f2', borderRadius: '6px', fontSize: '11px', color: '#dc2626' }}>🔴 Urgent</span>
          <span style={{ padding: '4px 8px', background: '#fefce8', borderRadius: '6px', fontSize: '11px', color: '#d97706' }}>⚠️ Warning</span>
          <span style={{ padding: '4px 8px', background: '#eff6ff', borderRadius: '6px', fontSize: '11px', color: '#2563eb' }}>ℹ️ Info</span>
        </div>
      </div>
    </div>
  );
};

export default Announcements;