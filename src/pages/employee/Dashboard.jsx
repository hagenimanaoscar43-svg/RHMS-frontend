import React, { useState } from "react";
import Overview from "./Overview";
import Salary from "./Salary";
import Tasks from "./Tasks";
import Reports from "./Reports";
import Notification from "./Notification";
import Attendance from "./Attendance";
import HotelContact from "./HotelContact"; // Add this import

const Dashboard = () => {
  const [activePage, setActivePage] = useState("overview");

  const menu = [
    { label: "Dashboard", key: "overview", icon: "📊" },
    { label: "Salary", key: "salary", icon: "💰" },
    { label: "Tasks", key: "tasks", icon: "✅" },
    { label: "Reports", key: "reports", icon: "📈" },
    { label: "Attendance", key: "attendance", icon: "📅" },
    { label: "Notification", key: "notification", icon: "🔔" },
    { label: "Hotel Contact", key: "contact", icon: "🏨" }, // Added Hotel Contact
    { label: "Logout", key: "logout", icon: "🚪" },
  ];

  const handleClick = (item) => {
    if (item.key === "logout") {
      localStorage.clear();
      window.location.href = "/";
      return;
    }
    setActivePage(item.key);
  };

  const renderPage = () => {
    switch (activePage) {
      case "overview":
        return <Overview />;
      case "salary":
        return <Salary />;
      case "tasks":
        return <Tasks />;
      case "reports":
        return <Reports />;
      case "attendance":
        return <Attendance />;
      case "notification":
        return <Notification />;
      case "contact":
        return <HotelContact />; // Render Hotel Contact component
      default:
        return <Overview />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f3f4f6" }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: 260, 
        background: "#111827", 
        color: "white", 
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #374151" }}>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            👨‍💼 Employee Panel
          </h2>
        </div>

        <div style={{ flex: 1, padding: "20px" }}>
          {menu.map((item) => (
            <div
              key={item.label}
              onClick={() => handleClick(item)}
              style={{
                padding: "12px 16px",
                marginBottom: "8px",
                cursor: "pointer",
                borderRadius: "8px",
                background: item.key === "logout"
                  ? "#dc2626"
                  : activePage === item.key
                  ? "#2563eb"
                  : "transparent",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px",
                fontWeight: activePage === item.key ? "500" : "400"
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        
        <div style={{ padding: "20px", borderTop: "1px solid #374151", fontSize: "11px", color: "#6b7280", textAlign: "center" }}>
          © 2024 RHMS
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Top Bar */}
        <div style={{
          background: "white",
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px" }}>
              {menu.find(m => m.key === activePage)?.label || "Dashboard"}
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "20px", cursor: "pointer" }}>🔔</span>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#667eea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold"
            }}>
              E
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div style={{ 
          flex: 1, 
          overflow: "auto",
          padding: "20px"
        }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;