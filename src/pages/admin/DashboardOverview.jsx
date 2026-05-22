// frontend/src/pages/admin/DashboardOverview.jsx
import React, { useState, useEffect } from "react";
import { 
  FiHome, FiCheckCircle, FiCalendar, FiTool, FiUsers, 
  FiBookOpen, FiDollarSign, FiTrendingUp, FiPieChart,
  FiArrowUp, FiArrowDown, FiRefreshCw, FiBell, FiStar
} from "react-icons/fi";
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
import { Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, Filler);

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    total_rooms: 0,
    available_rooms: 0,
    booked_rooms: 0,
    maintenance_rooms: 0,
    total_staff: 0,
    total_bookings: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    total_revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [recentActivities, setRecentActivities] = useState([]);

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchRecentActivities();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/hotel/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch stats");
      
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/hotel/recent-activities", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      // Fallback activities
      setRecentActivities([
        { id: 1, type: "booking", message: "New booking from John Doe", time: "5 minutes ago", icon: "📅" },
        { id: 2, type: "guest", message: "Guest checked in - Room 204", time: "1 hour ago", icon: "👤" },
        { id: 3, type: "staff", message: "New staff member added", time: "3 hours ago", icon: "👥" }
      ]);
    }
  };

  const occupancyRate = stats.total_rooms > 0 
    ? ((stats.booked_rooms / stats.total_rooms) * 100).toFixed(1) 
    : 0;

  const revenueChange = "+12.5%";
  const bookingChange = "+8.2%";
  const occupancyChange = "+5.1%";

  // Chart data for room distribution
  const roomStatusData = {
    labels: ['Available', 'Booked', 'Maintenance'],
    datasets: [{
      data: [stats.available_rooms, stats.booked_rooms, stats.maintenance_rooms],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  // Chart data for booking trends (last 6 months)
  const bookingTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Bookings',
      data: [45, 52, 48, 61, 55, stats.total_bookings],
      backgroundColor: '#667eea',
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 } }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, onClick }) => (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-card-inner">
        <div className="stat-icon" style={{ background: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
        <div className="stat-info">
          <h6 className="stat-title">{title}</h6>
          <h3 className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          {change && (
            <span className={`stat-change ${change.includes('+') ? 'positive' : 'negative'}`}>
              {change.includes('+') ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
              {change}
            </span>
          )}
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
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #e5e7eb;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchStats} className="retry-btn">
          <FiRefreshCw size={16} /> Try Again
        </button>
        <style>{`
          .error-container {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 16px;
          }
          .error-icon { font-size: 48px; margin-bottom: 16px; }
          .retry-btn {
            margin-top: 20px;
            padding: 10px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Welcome back! </h2>
          <p className="dashboard-subtitle">Here's what's happening with your hotel today</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchStats} className="refresh-btn" title="Refresh data">
            <FiRefreshCw size={18} />
          </button>
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Total Rooms" value={stats.total_rooms} icon={FiHome} color="#3b82f6" />
        <StatCard title="Available" value={stats.available_rooms} icon={FiCheckCircle} color="#10b981" />
        <StatCard title="Booked" value={stats.booked_rooms} icon={FiCalendar} color="#f59e0b" />
        <StatCard title="Maintenance" value={stats.maintenance_rooms} icon={FiTool} color="#ef4444" />
        <StatCard title="Total Staff" value={stats.total_staff} icon={FiUsers} color="#8b5cf6" />
        <StatCard title="Total Bookings" value={stats.total_bookings} icon={FiBookOpen} color="#06b6d4" />
        <StatCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={FiTrendingUp} color="#ec4899" change={occupancyChange} />
        <StatCard title="Total Revenue" value={`${(stats.total_revenue / 1000000).toFixed(1)}M`} icon={FiDollarSign} color="#f97316" change={revenueChange} />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h4><FiPieChart size={18} /> Room Distribution</h4>
            <span className="chart-badge">{stats.total_rooms} Total Rooms</span>
          </div>
          <div className="chart-wrapper">
            <Pie data={roomStatusData} options={chartOptions} />
          </div>
          <div className="chart-stats">
            <div className="chart-stat-item">
              <span className="dot available"></span>
              <span>Available: {stats.available_rooms}</span>
            </div>
            <div className="chart-stat-item">
              <span className="dot booked"></span>
              <span>Booked: {stats.booked_rooms}</span>
            </div>
            <div className="chart-stat-item">
              <span className="dot maintenance"></span>
              <span>Maintenance: {stats.maintenance_rooms}</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h4><FiTrendingUp size={18} /> Booking Trends</h4>
            <span className="chart-badge">Last 6 months</span>
          </div>
          <div className="chart-wrapper bar-chart">
            <Bar data={bookingTrendsData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="bottom-section">
        <div className="activity-card">
          <div className="card-header">
            <h4><FiBell size={18} /> Recent Activity</h4>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-details">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-stats-card">
          <div className="card-header">
            <h4><FiStar size={18} /> Quick Stats</h4>
          </div>
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <div className="quick-stat-value">{stats.confirmed_bookings || 0}</div>
              <div className="quick-stat-label">Confirmed Bookings</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">{stats.pending_bookings || 0}</div>
              <div className="quick-stat-label">Pending Approvals</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">{stats.total_staff}</div>
              <div className="quick-stat-label">Active Staff</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">{Math.round(stats.total_revenue / (stats.total_bookings || 1))?.toLocaleString()}</div>
              <div className="quick-stat-label">Avg. Booking Value</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-overview {
          padding: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dashboard-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1f2937;
        }

        .dashboard-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .refresh-btn {
          padding: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #f3f4f6;
          transform: rotate(90deg);
        }

        .last-updated {
          font-size: 12px;
          color: #9ca3af;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .stat-card-inner {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-title {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 8px 0;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1f2937;
        }

        .stat-change {
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          margin-top: 4px;
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-change.negative {
          color: #ef4444;
        }

        .charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
          margin-bottom: 28px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .chart-header h4 {
          margin: 0;
          font-size: 16px;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-badge {
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          color: #6b7280;
        }

        .chart-wrapper {
          height: 260px;
        }

        .bar-chart {
          height: 280px;
        }

        .chart-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .chart-stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot.available { background: #10b981; }
        .dot.booked { background: #f59e0b; }
        .dot.maintenance { background: #ef4444; }

        .bottom-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .activity-card, .quick-stats-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h4 {
          margin: 0;
          font-size: 16px;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .view-all-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 13px;
          cursor: pointer;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .activity-icon {
          font-size: 24px;
        }

        .activity-details {
          flex: 1;
        }

        .activity-message {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #1f2937;
        }

        .activity-time {
          font-size: 11px;
          color: #9ca3af;
        }

        .quick-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .quick-stat {
          text-align: center;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .quick-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 8px;
        }

        .quick-stat-label {
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
          .bottom-section {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;