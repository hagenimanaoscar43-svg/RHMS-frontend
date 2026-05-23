// frontend/src/pages/admin/Notifications.jsx
import React, { useState, useEffect } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      loadNotifications();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }
      
      const data = await response.json();
      setNotifications(data.map(n => ({
        id: n.notification_id || n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        time: n.created_at ? new Date(n.created_at).toLocaleString() : "",
        timestamp: n.created_at,
        read: n.is_read || n.read || false,
        priority: n.priority || "normal"
      })));
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://https://rhms-backend.onrender.com/api/notifications/${id}/read`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("http://https://rhms-backend.onrender.com/api/notifications/read-all", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`http://https://rhms-backend.onrender.com/api/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getFilteredNotifications = () => {
    if (filter === "unread") return notifications.filter(n => !n.read);
    if (filter === "read") return notifications.filter(n => n.read);
    return notifications;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" };
      case "normal": return { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6" };
      default: return { bg: "#f3f4f6", color: "#374151", border: "#6b7280" };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = getFilteredNotifications();

  if (loading && notifications.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p>❌ {error}</p>
          <button onClick={loadNotifications} style={styles.retryBtn}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2>🔔 Notifications</h2>
          <p style={styles.subtitle}>Stay updated with latest activities</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} style={styles.markAllBtn}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      <div style={styles.filterTabs}>
        <button onClick={() => setFilter("all")} style={{...styles.filterBtn, ...(filter === "all" ? styles.activeFilter : {})}}>
          All ({notifications.length})
        </button>
        <button onClick={() => setFilter("unread")} style={{...styles.filterBtn, ...(filter === "unread" ? styles.activeFilter : {})}}>
          Unread ({unreadCount})
        </button>
        <button onClick={() => setFilter("read")} style={{...styles.filterBtn, ...(filter === "read" ? styles.activeFilter : {})}}>
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>🔔</div>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div style={styles.notificationsList}>
          {filteredNotifications.map((notification) => {
            const priorityStyle = getPriorityColor(notification.priority);
            return (
              <div 
                key={notification.id}
                style={{
                  ...styles.notificationCard,
                  background: notification.read ? "#ffffff" : "#f0f9ff",
                  borderLeft: `4px solid ${priorityStyle.border}`,
                  opacity: notification.read ? 0.8 : 1
                }}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div style={styles.notificationContent}>
                  <div style={styles.notificationHeader}>
                    <h4 style={styles.notificationTitle}>
                      {!notification.read && <span style={styles.unreadDot}>●</span>}
                      {notification.title}
                    </h4>
                    <span style={styles.notificationTime}>{notification.time}</span>
                  </div>
                  <p style={styles.notificationMessage}>{notification.message}</p>
                  <div style={styles.notificationFooter}>
                    <span style={{...styles.priorityBadge, background: priorityStyle.bg, color: priorityStyle.color}}>
                      {notification.priority}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "24px", background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  subtitle: { color: "#6b7280", fontSize: "14px", marginTop: "4px" },
  markAllBtn: { padding: "8px 16px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },
  filterTabs: { display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" },
  filterBtn: { padding: "6px 16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "20px", cursor: "pointer", fontSize: "13px" },
  activeFilter: { background: "#667eea", color: "white", borderColor: "#667eea" },
  notificationsList: { display: "flex", flexDirection: "column", gap: "12px" },
  notificationCard: { display: "flex", gap: "16px", background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", cursor: "pointer" },
  notificationContent: { flex: 1 },
  notificationHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" },
  notificationTitle: { margin: 0, fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" },
  unreadDot: { color: "#3b82f6", fontSize: "12px" },
  notificationTime: { fontSize: "11px", color: "#6b7280" },
  notificationMessage: { margin: "0 0 12px 0", fontSize: "14px", color: "#374151" },
  notificationFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  priorityBadge: { padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "500" },
  deleteBtn: { padding: "4px 12px", background: "#f3f4f6", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", color: "#6b7280" },
  loadingContainer: { textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" },
  errorContainer: { textAlign: "center", padding: "60px", background: "white", borderRadius: "12px", color: "#dc2626" },
  emptyContainer: { textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  retryBtn: { marginTop: "16px", padding: "8px 20px", background: "#667eea", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }
};

export default Notifications;