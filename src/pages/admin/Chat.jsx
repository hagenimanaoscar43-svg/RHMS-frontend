// frontend/src/pages/admin/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  FiMessageSquare, FiBell, FiPlus, FiSearch, FiUsers, FiUser, 
  FiSend, FiCheck, FiClock, FiAlertCircle, FiTool, FiCalendar, 
  FiHome, FiStar, FiMoreVertical, FiSmile, FiPaperclip
} from "react-icons/fi";

// Chat Categories for announcements
const CATEGORIES = [
  { key: "urgent", label: "Urgent", color: "#dc2626", bg: "#fee2e2" },
  { key: "maintenance", label: "Maintenance", color: "#d97706", bg: "#fef3c7" },
  { key: "general", label: "General", color: "#2563eb", bg: "#dbeafe" },
  { key: "event", label: "Event", color: "#10b981", bg: "#d1fae5" },
  { key: "housekeeping", label: "Housekeeping", color: "#8b5cf6", bg: "#ede9fe" },
];

const Chat = () => {
  const [activeTab, setActiveTab] = useState("guests");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [allMessages, setAllMessages] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      loadConversations();
      loadNotifications();
      
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        if (selectedChat) {
          loadMessages(selectedChat.id);
        }
        loadConversations();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [token, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, selectedChat]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/admin/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await fetch(`http://https://rhms-backend.onrender.com/api/admin/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setAllMessages(prev => ({
        ...prev,
        [userId]: data.map(m => ({
          id: m.id,
          text: m.message,
          sender: m.sender === "admin" ? "admin" : "user",
          time: new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: m.is_read ? "read" : "delivered"
        }))
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setNotifications(data.slice(0, 10));
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || sending) return;
    
    const msg = {
      id: Date.now(),
      text: messageInput.trim(),
      sender: "admin",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending"
    };
    
    setAllMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), msg],
    }));
    setMessageInput("");
    setSending(true);
    
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/admin/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: selectedChat.id,
          message: msg.text
        })
      });
      
      if (response.ok) {
        // Update message status
        setAllMessages(prev => ({
          ...prev,
          [selectedChat.id]: prev[selectedChat.id].map(m => 
            m.id === msg.id ? { ...m, status: "delivered" } : m
          )
        }));
        await loadMessages(selectedChat.id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const sendAnnouncement = async (category, message) => {
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/rdb/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: category.label,
          message: message,
          priority: category.key
        })
      });
      
      if (response.ok) {
        // Add to local notifications
        setNotifications(prev => [{
          notification_id: Date.now(),
          type: category.key,
          title: category.label,
          message: message,
          created_at: new Date().toISOString()
        }, ...prev].slice(0, 20));
        return true;
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
    }
    return false;
  };

  const getRoleBadge = (role) => {
    if (role === "client") {
      return { bg: "#dbeafe", color: "#1e40af", icon: <FiUser size={12} />, label: "Guest" };
    }
    return { bg: "#dcfce7", color: "#166534", icon: <FiUsers size={12} />, label: "Employee" };
  };

  const formatLastMessage = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  const getUnreadCount = (userId) => {
    const messages = allMessages[userId] || [];
    return messages.filter(m => m.sender === "user" && m.status !== "read").length;
  };

  const guests = conversations.filter(c => c.other_user_role === "client");
  const employees = conversations.filter(c => c.other_user_role === "employee");
  const currentList = activeTab === "guests" ? guests : employees;
  const filteredList = currentList.filter(p =>
    p.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <FiMessageSquare size={18} />
          <span>Chat Center</span>
        </div>
        <div ref={panelRef} style={{ position: "relative" }}>
          <button style={styles.bellButton} onClick={() => setPanelOpen(!panelOpen)}>
            <FiBell size={18} />
            {notifications.length > 0 && <span style={styles.badge}>{notifications.length}</span>}
          </button>
          {panelOpen && (
            <NotificationPanel 
              notifications={notifications} 
              onSend={sendAnnouncement}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Tabs */}
          <div style={styles.tabBar}>
            <button 
              onClick={() => setActiveTab("guests")} 
              style={{...styles.tab, ...(activeTab === "guests" ? styles.activeTab : {})}}
            >
              <FiUser size={14} /> Guests ({guests.length})
            </button>
            <button 
              onClick={() => setActiveTab("employees")} 
              style={{...styles.tab, ...(activeTab === "employees" ? styles.activeTab : {})}}
            >
              <FiUsers size={14} /> Staff ({employees.length})
            </button>
          </div>

          {/* Search */}
          <div style={styles.searchContainer}>
            <FiSearch size={14} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Contact List */}
          <div style={styles.contactList}>
            {filteredList.length === 0 ? (
              <div style={styles.emptyState}>No conversations found</div>
            ) : (
              filteredList.map(conv => {
                const roleBadge = getRoleBadge(conv.other_user_role);
                const unreadCount = getUnreadCount(conv.other_user_id);
                return (
                  <div
                    key={conv.other_user_id}
                    onClick={() => {
                      setSelectedChat({
                        id: conv.other_user_id,
                        name: conv.other_user_name,
                        role: conv.other_user_role,
                        room: conv.room || "N/A"
                      });
                      loadMessages(conv.other_user_id);
                    }}
                    style={{
                      ...styles.contactItem,
                      ...(selectedChat?.id === conv.other_user_id ? styles.activeContact : {})
                    }}
                  >
                    <div style={styles.avatar}>
                      {conv.other_user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.contactInfo}>
                      <div style={styles.contactName}>{conv.other_user_name}</div>
                      <div style={styles.contactPreview}>
                        {conv.last_message?.substring(0, 40)}
                        {conv.last_message?.length > 40 && "..."}
                      </div>
                    </div>
                    <div style={styles.contactMeta}>
                      <span style={styles.contactTime}>{formatLastMessage(conv.last_message_time)}</span>
                      {unreadCount > 0 && (
                        <span style={styles.unreadBadge}>{unreadCount}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div style={styles.chatArea}>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatAvatar}>
                {selectedChat.name?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.chatInfo}>
                <div style={styles.chatName}>{selectedChat.name}</div>
                <div style={styles.chatRole}>
                  {selectedChat.role === "client" ? "Guest" : "Employee"}
                  {selectedChat.room && ` • Room ${selectedChat.room}`}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesArea}>
              {(allMessages[selectedChat.id] || []).length === 0 ? (
                <div style={styles.emptyMessages}>
                  <FiMessageSquare size={48} style={{ opacity: 0.3 }} />
                  <p>No messages yet</p>
                  <small>Start a conversation with {selectedChat.name}</small>
                </div>
              ) : (
                (allMessages[selectedChat.id] || []).map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    style={{
                      ...styles.messageRow,
                      justifyContent: msg.sender === "admin" ? "flex-end" : "flex-start"
                    }}
                  >
                    <div style={{
                      ...styles.messageBubble,
                      background: msg.sender === "admin" ? "#2563eb" : "#f3f4f6",
                      color: msg.sender === "admin" ? "white" : "#1f2937"
                    }}>
                      <div style={styles.messageText}>{msg.text}</div>
                      <div style={styles.messageTime}>
                        {msg.time}
                        {msg.sender === "admin" && (
                          <span style={styles.messageStatus}>
                            {msg.status === "sending" ? "⌛" : msg.status === "read" ? <FiCheck size={10} /> : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={styles.inputArea}>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={styles.messageInput}
              />
              <button 
                onClick={sendMessage} 
                disabled={sending || !messageInput.trim()}
                style={{...styles.sendButton, opacity: (!messageInput.trim() || sending) ? 0.5 : 1}}
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.noChatSelected}>
            <FiMessageSquare size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>Select a conversation</h3>
            <p>Choose a guest or staff member to start chatting</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Notification Panel Component
const NotificationPanel = ({ notifications, onSend, onClose }) => {
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!selectedCategory || !message.trim() || sending) return;
    
    setSending(true);
    const success = await onSend(selectedCategory, message.trim());
    if (success) {
      setSelectedCategory(null);
      setMessage("");
      setComposerOpen(false);
    }
    setSending(false);
  };

  return (
    <div style={styles.notificationPanel}>
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>Notifications</span>
        <button 
          onClick={() => setComposerOpen(!composerOpen)} 
          style={styles.composeButton}
        >
          <FiPlus size={12} /> {composerOpen ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {composerOpen && (
        <div style={styles.composerArea}>
          <div style={styles.categorySection}>
            <div style={styles.categoryLabel}>Category</div>
            <div style={styles.categoryList}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(selectedCategory?.key === cat.key ? null : cat)}
                  style={{
                    ...styles.categoryChip,
                    background: selectedCategory?.key === cat.key ? cat.bg : "#f3f4f6",
                    borderColor: selectedCategory?.key === cat.key ? cat.color : "#e5e7eb",
                    color: selectedCategory?.key === cat.key ? cat.color : "#6b7280"
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            placeholder="Write your announcement..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            style={styles.messageTextarea}
            rows={3}
          />
          <div style={styles.composerFooter}>
            <span style={styles.charCount}>{message.length}/500</span>
            <button 
              onClick={handleSend} 
              disabled={!selectedCategory || !message.trim() || sending}
              style={{...styles.sendAnnouncementBtn, opacity: (!selectedCategory || !message.trim() || sending) ? 0.5 : 1}}
            >
              {sending ? "Sending..." : "Send to All"}
            </button>
          </div>
        </div>
      )}

      <div style={styles.notificationList}>
        {notifications.length === 0 ? (
          <div style={styles.emptyNotifications}>No notifications</div>
        ) : (
          notifications.map((n, idx) => {
            const category = CATEGORIES.find(c => c.key === n.type) || CATEGORIES[2];
            return (
              <div key={n.notification_id || idx} style={styles.notificationItem}>
                <div style={{...styles.notificationDot, background: category.color}} />
                <div style={styles.notificationContent}>
                  <div style={styles.notificationCategory}>{category.label}</div>
                  <div style={styles.notificationMessage}>{n.message || n.title}</div>
                  <div style={styles.notificationTime}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 120px)",
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    background: "white"
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937"
  },
  bellButton: {
    position: "relative",
    padding: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  badge: {
    position: "absolute",
    top: "0",
    right: "0",
    background: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "600",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  mainContent: {
    display: "flex",
    flex: 1,
    overflow: "hidden"
  },
  sidebar: {
    width: "320px",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    background: "#f9fafb"
  },
  tabBar: {
    display: "flex",
    padding: "12px",
    gap: "8px",
    borderBottom: "1px solid #e5e7eb"
  },
  tab: {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    color: "#6b7280"
  },
  activeTab: {
    background: "#e0e7ff",
    color: "#2563eb"
  },
  searchContainer: {
    position: "relative",
    padding: "12px"
  },
  searchIcon: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af"
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px 8px 32px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none"
  },
  contactList: {
    flex: 1,
    overflowY: "auto"
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    gap: "12px",
    cursor: "pointer",
    transition: "background 0.2s",
    borderBottom: "1px solid #f3f4f6"
  },
  activeContact: {
    background: "#eff6ff"
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e0e7ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    color: "#2563eb",
    flexShrink: 0
  },
  contactInfo: {
    flex: 1,
    minWidth: 0
  },
  contactName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px"
  },
  contactPreview: {
    fontSize: "12px",
    color: "#6b7280",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  contactMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px"
  },
  contactTime: {
    fontSize: "10px",
    color: "#9ca3af"
  },
  unreadBadge: {
    background: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 6px",
    borderRadius: "12px"
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "white"
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    gap: "12px",
    borderBottom: "1px solid #e5e7eb"
  },
  chatAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e0e7ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "18px",
    color: "#2563eb"
  },
  chatInfo: {
    flex: 1
  },
  chatName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937"
  },
  chatRole: {
    fontSize: "12px",
    color: "#6b7280"
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  messageRow: {
    display: "flex"
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: "12px",
    wordBreak: "break-word"
  },
  messageText: {
    fontSize: "14px",
    lineHeight: "1.4"
  },
  messageTime: {
    fontSize: "10px",
    opacity: 0.7,
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "4px"
  },
  messageStatus: {
    display: "inline-flex",
    alignItems: "center"
  },
  inputArea: {
    display: "flex",
    padding: "16px",
    gap: "12px",
    borderTop: "1px solid #e5e7eb",
    background: "white"
  },
  messageInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    fontSize: "14px",
    outline: "none"
  },
  sendButton: {
    padding: "10px 16px",
    background: "#2563eb",
    border: "none",
    borderRadius: "24px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  noChatSelected: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "16px"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#9ca3af",
    fontSize: "13px"
  },
  emptyMessages: {
    textAlign: "center",
    padding: "60px",
    color: "#9ca3af"
  },
  notificationPanel: {
    position: "absolute",
    top: "48px",
    right: "0",
    width: "360px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    zIndex: 1000,
    overflow: "hidden"
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb"
  },
  panelTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937"
  },
  composeButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    background: "white",
    fontSize: "11px",
    cursor: "pointer"
  },
  composerArea: {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb"
  },
  categorySection: {
    marginBottom: "12px"
  },
  categoryLabel: {
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "6px"
  },
  categoryList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },
  categoryChip: {
    padding: "4px 10px",
    borderRadius: "20px",
    border: "1px solid",
    fontSize: "11px",
    cursor: "pointer"
  },
  messageTextarea: {
    width: "100%",
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "12px",
    resize: "vertical",
    fontFamily: "inherit",
    marginBottom: "8px"
  },
  composerFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  charCount: {
    fontSize: "10px",
    color: "#9ca3af"
  },
  sendAnnouncementBtn: {
    padding: "6px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer"
  },
  notificationList: {
    maxHeight: "400px",
    overflowY: "auto"
  },
  emptyNotifications: {
    padding: "40px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px"
  },
  notificationItem: {
    display: "flex",
    padding: "12px 16px",
    gap: "10px",
    borderBottom: "1px solid #f3f4f6"
  },
  notificationDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginTop: "6px",
    flexShrink: 0
  },
  notificationContent: {
    flex: 1
  },
  notificationCategory: {
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: "4px"
  },
  notificationMessage: {
    fontSize: "13px",
    color: "#1f2937",
    marginBottom: "4px"
  },
  notificationTime: {
    fontSize: "10px",
    color: "#9ca3af"
  }
};

export default Chat;