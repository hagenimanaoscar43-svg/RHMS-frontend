// frontend/src/pages/employee/Notification.jsx
import React, { useState, useEffect } from "react";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/employee/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to load notifications");
      
      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/employee/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(notifications.map(notif => 
        notif.notification_id === id ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div style={styles.container}>
        <h2>🔔 Notifications</h2>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2>🔔 Notifications</h2>
        <div style={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={loadNotifications} style={styles.retryBtn}>Try Again</button>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🔔 Notifications</h2>
        {unreadCount > 0 && <span style={styles.unreadBadge}>{unreadCount} unread</span>}
      </div>

      {notifications.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
          <p>No notifications yet</p>
        </div>
      ) : (
        notifications.map((item) => (
          <div
            key={item.notification_id}
            style={{
              ...styles.notificationCard,
              background: item.is_read ? "#ffffff" : "#f0f9ff",
              borderLeft: item.is_read ? "4px solid #d1d5db" : "4px solid #2563eb"
            }}
            onClick={() => !item.is_read && markAsRead(item.notification_id)}
          >
            <div style={styles.notificationHeader}>
              <h4 style={styles.notificationTitle}>
                {!item.is_read && <span style={styles.newDot}>●</span>}
                {item.title}
              </h4>
            </div>
            <p style={styles.notificationMessage}>{item.message}</p>
            <div style={styles.notificationFooter}>
              <small style={styles.notificationDate}>
                {new Date(item.created_at).toLocaleString()}
              </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: { padding: '20px', background: '#f9fafb', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  unreadBadge: { background: '#2563eb', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' },
  notificationCard: { background: "white", padding: "16px", marginBottom: "12px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", cursor: "pointer" },
  notificationHeader: { display: 'flex', alignItems: 'center', marginBottom: '8px' },
  notificationTitle: { margin: 0, fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' },
  newDot: { color: '#2563eb', fontSize: '12px' },
  notificationMessage: { margin: '0 0 8px 0', fontSize: '14px', color: '#374151' },
  notificationFooter: { display: 'flex', justifyContent: 'space-between' },
  notificationDate: { fontSize: '11px', color: '#6b7280' },
  loadingContainer: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' },
  spinner: { width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' },
  errorContainer: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#dc2626' },
  retryBtn: { marginTop: '16px', padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  emptyContainer: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#6b7280' }
};

export default Notification;