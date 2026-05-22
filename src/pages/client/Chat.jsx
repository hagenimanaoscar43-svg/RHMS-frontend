// frontend/src/pages/client/Chat.jsx
import React, { useState, useEffect, useRef } from "react";

const GuestChat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [hotelInfo, setHotelInfo] = useState(null);
  
  const endRef = useRef(null);
  const token = localStorage.getItem("clientToken") || localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("clientUser") || "{}");

  useEffect(() => {
    if (token) {
      loadMessages();
      loadHotelInfo();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHotelInfo = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/client/hotel-info", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHotelInfo(data);
      }
    } catch (error) {
      console.error("Error loading hotel info:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/client/chat/messages", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response.status === 404) {
        // No messages yet
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "guest",
      message: text,
      time: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");

    try {
      await fetch("http://localhost:5001/api/client/chat/send", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div style={guestStyles.loadingContainer}>
        <div className="spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div style={guestStyles.wrapper}>
      <div style={guestStyles.header}>
        <div style={guestStyles.avatar}>🏨</div>
        <div>
          <h3 style={{ margin: 0 }}>{hotelInfo?.hotel_name || "Hotel Support"}</h3>
          <small style={{ color: "lightgreen" }}>Online</small>
        </div>
      </div>

      <div style={guestStyles.chatBox}>
        {messages.length === 0 ? (
          <div style={guestStyles.emptyChat}>
            <p>👋 Welcome! How can we help you today?</p>
            <p style={{ fontSize: 12, color: '#888' }}>Our team will respond as soon as possible.</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.sender === "guest";
            return (
              <div key={m.id || i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", margin: "8px 0" }}>
                <div style={{ 
                  maxWidth: "70%", 
                  padding: "10px 14px", 
                  borderRadius: 12, 
                  background: isMine ? "#667eea" : "#f3f4f6", 
                  color: isMine ? "#fff" : "#1f2937" 
                }}>
                  <strong style={{ fontSize: 11 }}>{isMine ? "You" : "Support"}:</strong>
                  <div>{m.message}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                    {new Date(m.time).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div style={guestStyles.inputBox}>
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Type your message..." 
          style={guestStyles.input} 
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
        />
        <button onClick={sendMessage} style={guestStyles.button}>Send</button>
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
};

const guestStyles = {
  wrapper: { height: "100%", display: "flex", flexDirection: "column", background: "#fff", borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  header: { padding: 15, background: "#667eea", color: "white", display: "flex", gap: 10, alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "#fff", color: "#667eea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  chatBox: { flex: 1, padding: 15, overflowY: "auto", background: "#f9fafb" },
  inputBox: { display: "flex", padding: 10, background: "white", borderTop: "1px solid #e5e7eb", gap: 10 },
  input: { flex: 1, padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", outline: "none" },
  button: { padding: "10px 20px", background: "#667eea", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  loadingContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyChat: { textAlign: 'center', padding: 40, color: '#6b7280' }
};

export default GuestChat;