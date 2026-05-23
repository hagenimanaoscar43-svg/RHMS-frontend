// pages/rdb/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Filler
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiClock,
  FiUserCheck,
  FiTrendingUp,
  FiDollarSign,
  FiPercent,
  FiStar,
  FiBell,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiEye,
  FiExternalLink
} from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, Filler);

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    total_hotels: 0, total_clients: 0, total_bookings: 0,
    pending_hotels: 0, total_rooms: 0, total_staff: 0,
    approved_hotels: 0, rejected_hotels: 0, occupancy_rate: 0,
    total_revenue: 0, available_rooms: 0, occupied_rooms: 0
  });
  const [pendingHotels, setPendingHotels] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token") || localStorage.getItem("rdbToken");

  useEffect(() => {
    if (!token) {
      navigate('/rdb/login');
      return;
    }
    
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
    
    loadCurrentUser();
    loadDashboardData();
    loadPendingHotels();
    loadRecentActivity();
  }, [token]);

  const loadCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('rdbUser') || localStorage.getItem('user') || 
      '{"full_name":"RDB Administrator","email":"admin@rdb.gov.rw"}');
    setCurrentUser(user);
  };

  const loadDashboardData = async () => {
    try {
      const response = await fetch("http:/https:/rhms-backend.onrender.com/api/rdb/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadPendingHotels = async () => {
    try {
      const response = await fetch("http:/https:/rhms-backend.onrender.com/api/rdb/pending-hotels", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingHotels(data);
      }
    } catch (error) {
      console.error("Error loading pending hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = () => {
    // Mock recent activity - replace with real data from API
    setRecentActivity([
      { id: 1, type: 'hotel', action: 'New hotel registration', name: 'Kigali Serena Hotel', time: '5 minutes ago', icon: '🏨' },
      { id: 2, type: 'booking', action: 'New booking', name: 'John Doe booked 2 rooms', time: '1 hour ago', icon: '📅' },
      { id: 3, type: 'review', action: 'Hotel approved', name: 'Marriott Hotel Kigali', time: '3 hours ago', icon: '✅' },
      { id: 4, type: 'staff', action: 'Staff added', name: 'New employee at Hotel des Mille Collines', time: '5 hours ago', icon: '👥' },
    ]);
  };

  const updateHotelStatus = async (hotelId, status) => {
    if (window.confirm(`Are you sure you want to ${status} this hotel?`)) {
      try {
        const response = await fetch(`http:/https:/rhms-backend.onrender.com/api/rdb/hotels/${hotelId}/${status}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          alert(`Hotel ${status}d successfully!`);
          loadPendingHotels();
          loadDashboardData();
        }
      } catch (error) {
        alert("Failed to update hotel status");
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  // Chart data for room status
  const roomStatusData = {
    labels: ['Available', 'Occupied', 'Maintenance', 'Booked'],
    datasets: [{
      data: [
        stats.available_rooms || 0,
        stats.occupied_rooms || 0,
        stats.maintenance_rooms || 0,
        (stats.total_rooms - (stats.available_rooms + stats.occupied_rooms + stats.maintenance_rooms)) || 0
      ],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'],
      borderWidth: 0,
    }],
  };

  // Chart data for hotel approvals
  const hotelApprovalData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      label: 'Hotels',
      data: [
        stats.approved_hotels || 0,
        stats.pending_hotels || 0,
        stats.rejected_hotels || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 } } },
    },
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, onClick }) => (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-card-inner">
        <div className="stat-icon" style={{ background: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
        <div className="stat-info">
          <h6 className="stat-title">{title}</h6>
          <h3 className="stat-value">{value?.toLocaleString() || 0}</h3>
          {trend && <span className="stat-trend"><FiTrendingUp size={12} /> {trend}</span>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
        <style>{`
          .loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .loading-spinner { width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rdb-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-user-shield"></i>
            {sidebarOpen && <span>RDB Admin</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
        
        <div className="user-info">
          <div className="avatar">
            {currentUser.full_name?.charAt(0) || 'R'}
          </div>
          {sidebarOpen && (
            <div className="user-details">
              <h4>{currentUser.full_name || 'RDB Administrator'}</h4>
              <p>{currentUser.email || 'admin@rdb.gov.rw'}</p>
            </div>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <button onClick={() => navigate('/rdb/dashboard')} className="nav-item active">
            <FiHome /> {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button onClick={() => navigate('/rdb/pending-hotels')} className="nav-item">
            <FiClock /> {sidebarOpen && <span>Pending Hotels</span>}
            {sidebarOpen && stats.pending_hotels > 0 && <span className="badge">{stats.pending_hotels}</span>}
          </button>
          <button onClick={() => navigate('/rdb/hotels')} className="nav-item">
            <FiHome /> {sidebarOpen && <span>All Hotels</span>}
          </button>
          <button onClick={() => navigate('/rdb/announcements')} className="nav-item">
            <FiBell /> {sidebarOpen && <span>Announcements</span>}
          </button>
          <button onClick={() => navigate('/rdb/admins')} className="nav-item">
            <FiUsers /> {sidebarOpen && <span>Manage Admins</span>}
          </button>
          <button onClick={() => navigate('/rdb/reports')} className="nav-item">
            <FiTrendingUp /> {sidebarOpen && <span>Reports</span>}
          </button>
          <button onClick={() => navigate('/rdb/profile')} className="nav-item">
            <FiUserCheck /> {sidebarOpen && <span>Profile</span>}
          </button>
          <button onClick={handleLogout} className="nav-item logout">
            <FiLogOut /> {sidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="welcome-section">
            <h2>Welcome back, {currentUser.full_name?.split(' ')[0] || 'Admin'}!</h2>
            <p>{currentDate}</p>
          </div>
          <div className="action-buttons">
            <button className="icon-btn" onClick={() => setNotifications(0)}>
              <FiBell size={20} />
              {notifications > 0 && <span className="notification-dot">{notifications}</span>}
            </button>
            <button className="icon-btn" onClick={loadDashboardData}>
              <FiRefreshCw size={20} />
            </button>
            <button className="btn-primary" onClick={() => navigate('/')}>
              <FiExternalLink size={16} /> Public Site
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard title="Total Hotels" value={stats.total_hotels} icon={FiHome} color="#3b82f6" onClick={() => navigate('/rdb/hotels')} />
          <StatCard title="Total Clients" value={stats.total_clients} icon={FiUsers} color="#10b981" />
          <StatCard title="Total Bookings" value={stats.total_bookings} icon={FiCalendar} color="#8b5cf6" />
          <StatCard title="Pending Hotels" value={stats.pending_hotels} icon={FiClock} color="#f59e0b" onClick={() => navigate('/rdb/pending-hotels')} />
          <StatCard title="Total Rooms" value={stats.total_rooms} icon={FiHome} color="#ef4444" />
          <StatCard title="Total Staff" value={stats.total_staff} icon={FiUserCheck} color="#06b6d4" />
          <StatCard title="Occupancy Rate" value={`${stats.occupancy_rate || 0}%`} icon={FiPercent} color="#ec4899" />
          <StatCard title="Total Revenue" value={`${((stats.total_revenue || 0) / 1000000).toFixed(1)}M`} icon={FiDollarSign} color="#f97316" />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <div className="chart-card">
            <h4><FiPieChart size={18} /> Room Status Distribution</h4>
            <div className="chart-wrapper">
              <Pie data={roomStatusData} options={chartOptions} />
            </div>
          </div>
          <div className="chart-card">
            <h4><FiBarChart size={18} /> Hotel Approval Status</h4>
            <div className="chart-wrapper">
              <Bar data={hotelApprovalData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Pending Hotels Table */}
        <div className="table-card">
          <div className="card-header">
            <h4><FiClock size={18} /> Recent Pending Hotel Registrations</h4>
            {pendingHotels.length > 0 && (
              <button className="btn-outline" onClick={() => navigate('/rdb/pending-hotels')}>
                View All <FiChevronRight size={14} />
              </button>
            )}
          </div>
          <div className="table-responsive">
            {pendingHotels.length === 0 ? (
              <div className="empty-state">
                <FiCheckCircle size={48} color="#10b981" />
                <h3>No Pending Hotels</h3>
                <p>All hotels have been reviewed</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hotel Name</th>
                    <th>City</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingHotels.slice(0, 5).map(hotel => (
                    <tr key={hotel.hotel_id}>
                      <td><strong>{hotel.hotel_name}</strong></td>
                      <td><span className="city-badge">{hotel.city}</span></td>
                      <td>{hotel.contact_person || 'N/A'}</td>
                      <td>{hotel.email}</td>
                      <td>{hotel.phone}</td>
                      <td>{new Date(hotel.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-approve" onClick={() => updateHotelStatus(hotel.hotel_id, 'approve')}>
                            <FiCheckCircle size={14} /> Approve
                          </button>
                          <button className="btn-reject" onClick={() => updateHotelStatus(hotel.hotel_id, 'reject')}>
                            <FiAlertCircle size={14} /> Reject
                          </button>
                          <button className="btn-view" onClick={() => navigate(`/rdb/hotel/${hotel.hotel_id}`)}>
                            <FiEye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <h4><FiTrendingUp size={18} /> Recent Activity</h4>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-details">
                  <p className="activity-action">{activity.action}</p>
                  <p className="activity-name">{activity.name}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* Modern CSS Variables */
        :root {
          --primary: #3b82f6;
          --primary-dark: #2563eb;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --dark: #1f2937;
          --gray: #6b7280;
          --light: #f3f4f6;
          --white: #ffffff;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --radius: 12px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .rdb-dashboard {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Sidebar Styles */
        .sidebar {
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          position: fixed;
          height: 100vh;
          z-index: 100;
        }

        .sidebar.open { width: 280px; }
        .sidebar.closed { width: 80px; }

        .sidebar-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
          font-size: 20px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .sidebar-toggle:hover { background: rgba(255, 255, 255, 0.2); }

        .user-info {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }

        .user-details h4 { font-size: 14px; margin-bottom: 4px; }
        .user-details p { font-size: 12px; opacity: 0.7; }

        .sidebar-nav { padding: 20px 12px; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .nav-item:hover, .nav-item.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.logout {
          margin-top: 20px;
          color: #f97316;
        }

        .badge {
          margin-left: auto;
          background: #f59e0b;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          transition: margin-left 0.3s;
          padding: 24px;
        }

        .main-content.sidebar-open { margin-left: 280px; }
        .main-content.sidebar-closed { margin-left: 80px; }

        /* Top Bar */
        .top-bar {
          background: white;
          border-radius: var(--radius);
          padding: 20px 24px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow);
        }

        .welcome-section h2 { font-size: 20px; color: var(--dark); margin-bottom: 4px; }
        .welcome-section p { font-size: 13px; color: var(--gray); }

        .action-buttons { display: flex; gap: 12px; align-items: center; }

        .icon-btn {
          background: var(--light);
          border: none;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          transition: all 0.3s;
        }

        .icon-btn:hover { background: #e5e7eb; transform: scale(1.05); }

        .notification-dot {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--danger);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 20px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: var(--radius);
          padding: 20px;
          transition: all 0.3s;
          cursor: pointer;
          box-shadow: var(--shadow);
        }

        .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

        .stat-card-inner { display: flex; align-items: center; gap: 16px; }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-title { font-size: 12px; color: var(--gray); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: bold; color: var(--dark); }
        .stat-trend { font-size: 11px; color: var(--success); display: flex; align-items: center; gap: 4px; margin-top: 4px; }

        /* Charts */
        .charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }

        .chart-card h4 {
          margin-bottom: 20px;
          color: var(--dark);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-wrapper { height: 280px; }

        /* Table Card */
        .table-card, .activity-card {
          background: white;
          border-radius: var(--radius);
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: var(--shadow);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .card-header h4 { display: flex; align-items: center; gap: 8px; color: var(--dark); }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--primary);
          color: var(--primary);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .btn-outline:hover { background: var(--primary); color: white; }

        /* Data Table */
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 12px;
          background: var(--light);
          font-weight: 600;
          font-size: 12px;
          color: var(--gray);
          text-transform: uppercase;
        }

        .data-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }

        .data-table tr:hover { background: var(--light); }

        .city-badge {
          background: #dbeafe;
          color: var(--primary);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
        }

        .action-btns { display: flex; gap: 8px; }

        .btn-approve, .btn-reject, .btn-view {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s;
        }

        .btn-approve { background: #d1fae5; color: #065f46; }
        .btn-approve:hover { background: #10b981; color: white; }
        .btn-reject { background: #fee2e2; color: #991b1b; }
        .btn-reject:hover { background: #ef4444; color: white; }
        .btn-view { background: #e5e7eb; color: var(--gray); }

        /* Activity List */
        .activity-list { display: flex; flex-direction: column; gap: 16px; }

        .activity-item {
          display: flex;
          gap: 16px;
          padding: 12px;
          border-radius: 10px;
          transition: all 0.3s;
        }

        .activity-item:hover { background: var(--light); }

        .activity-icon { font-size: 24px; }
        .activity-details { flex: 1; }
        .activity-action { font-weight: 600; margin-bottom: 4px; }
        .activity-name { font-size: 13px; color: var(--gray); margin-bottom: 4px; }
        .activity-time { font-size: 11px; color: #9ca3af; }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state h3 { margin: 16px 0 8px; color: var(--dark); }
        .empty-state p { color: var(--gray); }

        /* Responsive */
        @media (max-width: 768px) {
          .main-content.sidebar-open { margin-left: 0; }
          .sidebar.open { transform: translateX(0); }
          .sidebar.closed { transform: translateX(-100%); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

// Helper icons
const FiPieChart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M12 3v9h9"/></svg>;
const FiBarChart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16M6 16v-4M12 16v-8M18 16v-2"/></svg>;

export default Dashboard;