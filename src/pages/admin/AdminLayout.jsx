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
  { id: "rdb", label: "RDB Notifications" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.split("/")[2];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0f172a", color: "#fff", padding: 20 }}>
        <h2>Hotel Admin</h2>

        {NAV.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/admin/${item.id}`)}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: active === item.id ? "#1e40af" : "transparent",
              borderRadius: 6,
              marginTop: 6
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Topbar */}
        <div style={{
          padding: 15,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <h3>{active}</h3>
          <div>👤 Admin</div>
        </div>

        {/* Content */}
        <div style={{ padding: 20, background: "#f3f4f6", flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}