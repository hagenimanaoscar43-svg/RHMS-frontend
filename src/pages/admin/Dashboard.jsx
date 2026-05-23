// frontend/src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { 
  FiHome, FiCalendar, FiGrid, FiUsers, FiUserPlus, 
  FiDollarSign, FiBarChart2, FiBell, FiMessageSquare,
  FiLogOut, FiMenu, FiX, FiSettings, FiHelpCircle,
  FiCheckSquare
} from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [hotelName, setHotelName] = useState("Hotel Admin");

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch pending booking count
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!token) return;
      
      try {
        const response = await fetch("https://rhms-backend.onrender.com/api/hotel/bookings/counts", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.pending || 0);
        }
      } catch (error) {
        console.error("Error fetching pending count:", error);
      }
    };
    
    fetchPendingCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Load hotel info
  useEffect(() => {
    const hotel = JSON.parse(localStorage.getItem("hotelInfo") || "{}");
    if (hotel.hotel_name) {
      setHotelName(hotel.hotel_name);
    }
  }, []);

  const menu = [
    { label: "Dashboard", path: "/admin", icon: <FiHome size={20} /> },
    { label: "Bookings", path: "/admin/bookings", icon: <FiCalendar size={20} />, badge: pendingCount },
    { label: "Rooms", path: "/admin/rooms", icon: <FiGrid size={20} /> },
    { label: "Guests", path: "/admin/guests", icon: <FiUsers size={20} /> },
    { label: "Staff", path: "/admin/staff", icon: <FiUserPlus size={20} /> },
    { label: "Salary", path: "/admin/salary", icon: <FiDollarSign size={20} /> },
    { label: "Attendance", path: "/admin/attendance", icon: <FiCheckSquare size={20} /> },
    { label: "Reports", path: "/admin/reports", icon: <FiBarChart2 size={20} /> },
    { label: "Notifications", path: "/admin/notifications", icon: <FiBell size={20} /> },
    { label: "Chat", path: "/admin/chat", icon: <FiMessageSquare size={20} /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("hotelToken");
      localStorage.removeItem("hotelUser");
      localStorage.removeItem("hotelInfo");
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f0f2f5", position: "relative" }}>
      
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            zIndex: 1000,
            background: "#667eea",
            border: "none",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* SIDEBAR */}
      <div style={{
        width: sidebarOpen ? 280 : 80,
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        color: "white",
        padding: "20px 0",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (mobileMenuOpen ? 0 : -280) : 0,
        top: 0,
        height: "100vh",
        zIndex: 999,
        overflowY: "auto"
      }}>
        
        {/* Logo Section */}
        <div style={{
          display: "flex",
          justifyContent: sidebarOpen ? "space-between" : "center",
          alignItems: "center",
          padding: sidebarOpen ? "0 20px" : "0",
          marginBottom: "30px"
        }}>
          {sidebarOpen ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "32px" }}>🏨</span>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "700",
                    background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent"
                  }}>
                    {hotelName.length > 20 ? hotelName.substring(0, 20) + "..." : hotelName}
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: "10px", opacity: 0.7 }}>Hotel Admin Panel</p>
                </div>
              </div>
              <button 
                onClick={toggleSidebar}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FiX size={20} />
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", fontSize: "32px", width: "100%" }}>
              🏨
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: sidebarOpen ? "0 12px" : "0" }}>
          {menu.map((item) => (
            <div
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileMenuOpen(false);
              }}
              style={{
                position: "relative",
                padding: sidebarOpen ? "12px 16px" : "12px",
                margin: "4px 0",
                cursor: "pointer",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                transition: "all 0.2s ease",
                color: location.pathname === item.path || (item.path === "/admin" && location.pathname === "/admin") ? "white" : "#a0a0c0",
                background: location.pathname === item.path || (item.path === "/admin" && location.pathname === "/admin") 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ marginRight: sidebarOpen ? "12px" : "0" }}>
                {item.icon}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
              
              {/* Badge for pending bookings */}
              {item.badge > 0 && (
                <span style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                  padding: "2px 6px",
                  borderRadius: "20px",
                  minWidth: "18px",
                  textAlign: "center"
                }}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer Menu */}
        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <div
            onClick={() => navigate("/admin/settings")}
            style={{
              padding: sidebarOpen ? "12px 16px" : "12px",
              margin: "4px 12px",
              cursor: "pointer",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              transition: "all 0.2s ease",
              color: "#a0a0c0"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <FiSettings size={20} style={{ marginRight: sidebarOpen ? "12px" : "0" }} />
            {sidebarOpen && <span>Settings</span>}
          </div>
          <div
            onClick={() => navigate("/admin/help")}
            style={{
              padding: sidebarOpen ? "12px 16px" : "12px",
              margin: "4px 12px",
              cursor: "pointer",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              transition: "all 0.2s ease",
              color: "#a0a0c0"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <FiHelpCircle size={20} style={{ marginRight: sidebarOpen ? "12px" : "0" }} />
            {sidebarOpen && <span>Help</span>}
          </div>
          <div
            onClick={handleLogout}
            style={{
              padding: sidebarOpen ? "12px 16px" : "12px",
              margin: "4px 12px",
              cursor: "pointer",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              transition: "all 0.2s ease",
              color: "#fca5a5",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              marginTop: "10px"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <FiLogOut size={20} style={{ marginRight: sidebarOpen ? "12px" : "0" }} />
            {sidebarOpen && <span>Logout</span>}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: isMobile ? 0 : 0,
        transition: "all 0.3s ease"
      }}>
        {/* Top Bar */}
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
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
              {menu.find(m => m.path === location.pathname || (m.path === "/admin" && location.pathname === "/admin"))?.label || "Dashboard"}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
              Rwanda Hotel Management System
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Notification Bell with Badge */}
            <div style={{ position: "relative" }}>
              <FiBell size={20} style={{ cursor: "pointer", color: "#6b7280" }} />
              {pendingCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  fontWeight: "bold"
                }}>
                  {pendingCount}
                </span>
              )}
            </div>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px"
            }}>
              {hotelName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div style={{ 
          padding: "24px",
          overflowY: "auto",
          height: "calc(100vh - 80px)"
        }}>
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 998
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .sidebar-nav-item {
          transition: all 0.2s ease;
        }
        
        .sidebar-nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;