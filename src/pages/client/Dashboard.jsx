// frontend/src/pages/client/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { 
  FiHome, FiCalendar, FiBookOpen, FiMapPin, 
  FiUser, FiLogOut, FiBell, FiMenu, FiChevronLeft,
  FiChevronRight, FiStar, FiDollarSign,
  FiCheckCircle, FiClock, FiMessageSquare
} from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("clientUser") || "{}");
    setUserName(user.full_name || user.name || "Client");
  }, []);

  const menu = [
    { label: "Dashboard", path: "/client/dashboard", icon: <FiHome size={20} /> },
    { label: "New Booking", path: "/client/new-booking", icon: <FiCalendar size={20} /> },
    { label: "My Bookings", path: "/client/bookings", icon: <FiBookOpen size={20} /> },
    { label: "Browse Hotels", path: "/client/hotels", icon: <FiMapPin size={20} /> },
    { label: "Chat", path: "/client/chat", icon: <FiMessageSquare size={20} /> },
    { label: "Profile", path: "/client/profile", icon: <FiUser size={20} /> },
    { label: "Logout", path: "#", icon: <FiLogOut size={20} />, isLogout: true },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("clientUser");
      localStorage.removeItem("clientToken");
      localStorage.removeItem("userRole");
      navigate("/");
    }
  };

  const handleNavClick = (item) => {
    if (item.isLogout) {
      handleLogout();
    } else {
      navigate(item.path);
      setMobileOpen(false);
    }
  };

  return (
    <div className="client-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">🏨</div>
            {!collapsed && (
              <div className="logo-text">
                <span className="logo-name">RHMS</span>
                <span className="logo-sub">Client Portal</span>
              </div>
            )}
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        </div>

        {!collapsed && (
          <div className="user-profile">
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-role">Premium Client</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {menu.map((item) => (
            <div
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`nav-item ${item.isLogout ? 'logout-item' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            <FiMenu size={24} />
          </button>
          <div className="header-title">
            <h2>Welcome back, {userName.split(' ')[0]}! 👋</h2>
            <p>Manage your hotel bookings seamlessly</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <FiBell size={20} />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </button>
            <div className="header-avatar">{userName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}></div>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .client-dashboard {
          display: flex;
          min-height: 100vh;
          background: #f0f2f5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Sidebar Styles */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 280px;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
        }

        .sidebar.collapsed {
          width: 80px;
        }

        .sidebar.mobile-open {
          transform: translateX(0);
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: 280px;
          }
          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }

        .sidebar-header {
          padding: 24px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 32px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-name {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-sub {
          font-size: 10px;
          opacity: 0.7;
        }

        .sidebar-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .user-profile {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .user-role {
          font-size: 11px;
          opacity: 0.7;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          text-decoration: none;
          color: #a0a0c0;
          transition: all 0.2s;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .logout-item {
          margin-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
          color: #fca5a5;
        }

        .logout-item:hover {
          background: rgba(220, 38, 38, 0.2);
          color: #fecaca;
        }

        .nav-icon {
          font-size: 20px;
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .sidebar.collapsed .nav-label {
          display: none;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 12px;
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          margin-left: 280px;
          transition: margin-left 0.3s;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
        }

        .top-header {
          background: white;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 99;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          margin-right: 16px;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
        }

        .header-title h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: #1f2937;
        }

        .header-title p {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.2s;
        }

        .notification-btn:hover {
          color: #667eea;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .header-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .page-content {
          flex: 1;
          padding: 24px 30px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 20px;
          }
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-overlay {
            display: block;
          }
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .page-content > * {
          animation: fadeIn 0.4s ease-out;
        }

        /* Scrollbar */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

// ================= CLIENT DASHBOARD HOME =================
const ClientDashboardHome = () => {
  const [client, setClient] = useState({ name: "Guest", email: "" });
  const [stats, setStats] = useState({
    totalBookings: 0,
    approvedBookings: 0,
    currentStays: 0,
    pendingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredHotels, setFeaturedHotels] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("clientUser") || "{}");
        const token = localStorage.getItem("clientToken");

        setClient({
          name: user.full_name || user.name || "Guest",
          email: user.email || ""
        });

        if (token) {
          const response = await fetch("http://localhost:5001/api/client/bookings", {
            headers: { Authorization: `Bearer ${token}` }
          });

          const bookings = response.ok ? await response.json() : [];

          setStats({
            totalBookings: bookings.length,
            approvedBookings: bookings.filter(b => b.status === "confirmed" || b.status === "completed").length,
            currentStays: bookings.filter(b => b.status === "confirmed").length,
            pendingBookings: bookings.filter(b => b.status === "pending").length
          });

          setRecentBookings(bookings.slice(-3).reverse());
        }

        // Load featured hotels
        const hotelsResponse = await fetch("http://localhost:5001/api/client/hotels");
        const hotels = hotelsResponse.ok ? await hotelsResponse.json() : [];
        setFeaturedHotels(hotels.slice(0, 3));

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
        <style>{`
          .dashboard-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #e5e7eb;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="client-home">
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Welcome back, {client.name.split(" ")[0]}! 👋</h1>
          <p>Here's what's happening with your hotel bookings</p>
        </div>
        <div className="banner-icon">🏨</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <FiBookOpen size={28} />
            <span className="stat-value">{stats.totalBookings}</span>
          </div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <FiCheckCircle size={28} />
            <span className="stat-value">{stats.approvedBookings}</span>
          </div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <FiHome size={28} />
            <span className="stat-value">{stats.currentStays}</span>
          </div>
          <div className="stat-label">Current Stays</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <FiClock size={28} />
            <span className="stat-value">{stats.pendingBookings}</span>
          </div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="two-columns">
        <div className="recent-bookings">
          <div className="card-header">
            <h3>📋 Recent Bookings</h3>
            <NavLink to="/client/bookings" className="view-all">View All →</NavLink>
          </div>
          <div className="bookings-list">
            {recentBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏨</div>
                <p>No bookings yet</p>
                <NavLink to="/client/hotels" className="browse-btn">Browse Hotels</NavLink>
              </div>
            ) : (
              recentBookings.map((booking, idx) => (
                <div key={idx} className="booking-item">
                  <div>
                    <div className="booking-hotel">{booking.hotel_name}</div>
                    <div className="booking-date">
                      📅 {new Date(booking.check_in_date).toLocaleDateString()} → {new Date(booking.check_out_date).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`booking-status ${booking.status}`}>
                    {booking.status === "confirmed" ? "✓ Approved" : "⏳ Pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="featured-hotels">
          <div className="card-header">
            <h3>🌟 Featured Hotels</h3>
            <NavLink to="/client/hotels" className="view-all">View All →</NavLink>
          </div>
          <div className="hotels-list">
            {featuredHotels.map((hotel, idx) => (
              <div key={idx} className="hotel-item">
                <div className="hotel-icon">🏨</div>
                <div className="hotel-details">
                  <div className="hotel-name">{hotel.hotel_name}</div>
                  <div className="hotel-location">
                    <FiMapPin size={12} /> {hotel.city}
                  </div>
                </div>
                <div className="hotel-price">
                  <span className="price">RWF {hotel.price_per_night?.toLocaleString()}</span>
                  <span className="per-night">/night</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .client-home {
          animation: fadeIn 0.4s ease-out;
        }

        .welcome-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .banner-content h1 {
          font-size: 28px;
          margin: 0 0 8px;
        }

        .banner-content p {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }

        .banner-icon {
          font-size: 64px;
          opacity: 0.3;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
        }

        .stat-label {
          font-size: 13px;
          color: #6b7280;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .two-columns {
            grid-template-columns: 1fr;
          }
        }

        .recent-bookings, .featured-hotels {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .view-all {
          color: #667eea;
          text-decoration: none;
          font-size: 13px;
        }

        .bookings-list, .hotels-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .booking-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .booking-hotel {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .booking-date {
          font-size: 11px;
          color: #6b7280;
        }

        .booking-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .booking-status.confirmed {
          background: #d1fae5;
          color: #065f46;
        }

        .booking-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .hotel-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .hotel-icon {
          font-size: 32px;
        }

        .hotel-details {
          flex: 1;
        }

        .hotel-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .hotel-location {
          font-size: 11px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hotel-price {
          text-align: right;
        }

        .price {
          font-size: 16px;
          font-weight: 700;
          color: #2563eb;
        }

        .per-night {
          font-size: 10px;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .browse-btn {
          display: inline-block;
          margin-top: 12px;
          padding: 8px 20px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

// ================= BROWSE HOTELS =================
const BrowseHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/client/hotels");
        const data = res.ok ? await res.json() : [];
        setHotels(data);
      } catch (err) {
        console.error("Error loading hotels:", err);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  const cities = [...new Set(hotels.map(h => h.city).filter(Boolean))];

  const filteredHotels = hotels.filter(h => {
    const matchesSearch = (h.hotel_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (h.city || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || h.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  if (loading) {
    return (
      <div className="browse-loading">
        <div className="spinner"></div>
        <p>Loading hotels...</p>
        <style>{`
          .browse-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #e5e7eb;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="browse-hotels">
      <div className="page-header">
        <h1>🏨 Browse Hotels</h1>
        <p>Discover the best accommodations across Rwanda</p>
      </div>

      <div className="filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by hotel name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
          <option value="">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="hotels-grid">
        {filteredHotels.map(hotel => (
          <div key={hotel.hotel_id} className="hotel-card">
            <div className="hotel-image">
              <span className="hotel-emoji">🏨</span>
              <div className="hotel-rating">
                <FiStar size={12} color="#f59e0b" /> {hotel.rating || 4.5}
              </div>
            </div>
            <div className="hotel-info">
              <h3>{hotel.hotel_name}</h3>
              <div className="hotel-location">
                <FiMapPin size={12} /> {hotel.city}, Rwanda
              </div>
              <p className="hotel-description">{hotel.description || "Experience luxury and comfort at this premium hotel with excellent amenities."}</p>
              <div className="hotel-footer">
                <div>
                  <span className="price">RWF {(hotel.price_per_night || 100000).toLocaleString()}</span>
                  <span className="per-night">/night</span>
                </div>
                <NavLink to={`/client/new-booking?hotel=${hotel.hotel_id}`} className="book-btn">
                  Book Now →
                </NavLink>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <div className="empty-hotels">
          <div className="empty-icon">🔍</div>
          <h3>No hotels found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}

      <style>{`
        .browse-hotels {
          animation: fadeIn 0.4s ease-out;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-size: 28px;
          margin: 0 0 8px;
          color: #1f2937;
        }

        .page-header p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
        }

        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .search-box input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filters select {
          padding: 12px 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          outline: none;
        }

        .hotels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .hotel-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .hotel-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .hotel-image {
          height: 180px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .hotel-emoji {
          font-size: 64px;
        }

        .hotel-rating {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.6);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: white;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .hotel-info {
          padding: 20px;
        }

        .hotel-info h3 {
          font-size: 18px;
          margin: 0 0 8px;
        }

        .hotel-location {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
        }

        .hotel-description {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .hotel-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f0f2f5;
        }

        .price {
          font-size: 20px;
          font-weight: 700;
          color: #2563eb;
        }

        .per-night {
          font-size: 11px;
          color: #6b7280;
        }

        .book-btn {
          padding: 8px 20px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .book-btn:hover {
          background: #5a67d8;
        }

        .empty-hotels {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-hotels h3 {
          margin: 0 0 8px;
        }

        .empty-hotels p {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export { ClientDashboardHome, BrowseHotels };
export default Dashboard;