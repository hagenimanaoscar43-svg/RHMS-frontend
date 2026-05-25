import { Outlet, useNavigate, useLocation } from "react-router-dom";

const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "bookings", label: "Bookings" },
  { id: "rooms", label: "Rooms" },
  { id: "guests", label: "Guests" },
  { id: "reports", label: "Reports" },
  { id: "salary", label: "Salary" },
  { id: "staff", label: "Staff" },
  { id: "chat", label: "Chat" },
  { id: "attendance", label: "Attendance" },
  { id: "notifications", label: "Notifications" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.split("/")[2] || "dashboard";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: 260, 
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", 
        color: "#fff", 
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(0,0,0,0.1)"
      }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>🏨 RHMS</h2>
          <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.7 }}>Hotel Admin Portal</p>
        </div>

        {NAV.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/admin/${item.id}`)}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              background: active === item.id ? "#3b82f6" : "transparent",
              borderRadius: 10,
              marginBottom: 6,
              transition: "all 0.2s",
              fontWeight: active === item.id ? 600 : 400,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
            onMouseEnter={(e) => {
              if (active !== item.id) {
                e.currentTarget.style.background = "#334155";
              }
            }}
            onMouseLeave={(e) => {
              if (active !== item.id) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {getIcon(item.id)}
            {item.label}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Topbar */}
        <div style={{
          padding: "16px 24px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
              {NAV.find(item => item.id === active)?.label || "Dashboard"}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
              Rwanda Hotel Management System
            </p>
          </div>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}>
            A
          </div>
        </div>

        {/* Content */}
        <div style={{ 
          padding: "24px", 
          background: "#f3f4f6", 
          flex: 1, 
          overflowY: "auto",
          overflowX: "hidden"
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// Helper function to get icons
const getIcon = (id) => {
  const icons = {
    dashboard: "📊",
    bookings: "📅",
    rooms: "🛏️",
    guests: "👥",
    reports: "📈",
    salary: "💰",
    staff: "👔",
    chat: "💬",
    attendance: "📋",
    notifications: ""
  };
  return <span style={{ fontSize: 18 }}>{icons[id] || "📌"}</span>;
};