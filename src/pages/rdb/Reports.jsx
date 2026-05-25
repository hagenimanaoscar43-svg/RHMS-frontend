// pages/rdb/Reports.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiDownload, 
  FiCalendar, 
  FiTrendingUp, 
  FiUsers, 
  FiHome, 
  FiDollarSign,
  FiPieChart,
  FiBarChart2,
  FiRefreshCw,
  FiFileText
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_hotels: 0,
    approved_hotels: 0,
    pending_hotels: 0,
    rejected_hotels: 0,
    total_rooms: 0,
    total_staff: 0,
    total_bookings: 0,
    total_clients: 0,
    total_revenue: 0,
    occupancy_rate: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // ✅ CORRECTED: Single source of truth for API URL
  const API_BASE_URL = 'https://rhms-backend.onrender.com/api';
  
  const token = localStorage.getItem("token") || localStorage.getItem("rdbToken");

  useEffect(() => {
    if (!token) {
      window.location.href = '/rdb/login';
      return;
    }
    loadDashboardData();
    loadMonthlyData();
    setDefaultDateRange();
  }, [token, selectedYear]);

  const setDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 12);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const loadDashboardData = async () => {
    try {
      // ✅ FIXED: Removed the double http://
      const response = await fetch(`${API_BASE_URL}/rdb/stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadMonthlyData = async () => {
    setLoading(true);
    try {
      // ✅ FIXED: Removed the double http://
      const response = await fetch(`${API_BASE_URL}/rdb/monthly-stats?year=${selectedYear}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.length > 0) {
        setMonthlyData(data);
      } else {
        // Generate mock data for demo if API doesn't have monthly stats
        generateMockMonthlyData();
      }
    } catch (error) {
      console.error("Error loading monthly data:", error);
      generateMockMonthlyData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mockData = months.map((month, index) => ({
      month: month,
      hotels: Math.floor(Math.random() * 20) + 5,
      bookings: Math.floor(Math.random() * 500) + 100,
      revenue: Math.floor(Math.random() * 50000000) + 10000000,
      occupancy: Math.floor(Math.random() * 40) + 50
    }));
    setMonthlyData(mockData);
  };

  const exportToCSV = () => {
    const headers = ['Month', 'New Hotels', 'Bookings', 'Revenue (RWF)', 'Occupancy Rate (%)'];
    const csvData = monthlyData.map(item => [
      item.month,
      item.hotels || 0,
      item.bookings || 0,
      item.revenue || 0,
      item.occupancy || 0
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rdb-report-${selectedYear}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart Data
  const hotelChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'New Hotels',
        data: monthlyData.map(d => d.hotels || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const bookingChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Bookings',
        data: monthlyData.map(d => d.bookings || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: '#10b981',
        borderWidth: 2,
        fill: true,
      }
    ]
  };

  const revenueChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Revenue (RWF)',
        data: monthlyData.map(d => d.revenue || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: '#f59e0b',
        borderWidth: 2,
        fill: true,
      }
    ]
  };

  const occupancyChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Occupancy Rate (%)',
        data: monthlyData.map(d => d.occupancy || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const pieChartData = {
    labels: ['Approved Hotels', 'Pending Hotels', 'Rejected Hotels'],
    datasets: [{
      data: [stats.approved_hotels || 0, stats.pending_hotels || 0, stats.rejected_hotels || 0],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.raw;
            if (label.includes('Revenue')) {
              return `${label}: RWF ${value.toLocaleString()}`;
            }
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' }
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = '', suffix = '' }) => (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>{title}</span>
        <div style={{ padding: '8px', background: `${color}15`, borderRadius: '10px' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
    </div>
  );

  if (loading && monthlyData.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{ marginTop: '20px' }}>Loading reports...</p>
        <style>{`
          .spinner-border {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>📊 Analytics & Reports</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Monitor key metrics and performance indicators</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
          <button 
            onClick={loadDashboardData}
            style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button 
            onClick={exportToCSV}
            style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiDownload size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <StatCard title="Total Hotels" value={stats.total_hotels || 0} icon={FiHome} color="#3b82f6" />
        <StatCard title="Approved Hotels" value={stats.approved_hotels || 0} icon={FiTrendingUp} color="#10b981" />
        <StatCard title="Pending Hotels" value={stats.pending_hotels || 0} icon={FiFileText} color="#f59e0b" />
        <StatCard title="Total Rooms" value={stats.total_rooms || 0} icon={FiHome} color="#8b5cf6" />
        <StatCard title="Total Staff" value={stats.total_staff || 0} icon={FiUsers} color="#06b6d4" />
        <StatCard title="Total Bookings" value={stats.total_bookings || 0} icon={FiCalendar} color="#ec4899" />
        <StatCard title="Total Clients" value={stats.total_clients || 0} icon={FiUsers} color="#6366f1" />
        <StatCard title="Total Revenue" value={stats.total_revenue || 0} icon={FiDollarSign} color="#f97316" prefix="RWF " />
        <StatCard title="Occupancy Rate" value={stats.occupancy_rate || 0} icon={FiPieChart} color="#14b8a6" suffix="%" />
      </div>

      {/* Report Type Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
        {['overview', 'hotels', 'bookings', 'revenue', 'occupancy'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            style={{
              padding: '8px 20px',
              background: reportType === type ? '#3b82f6' : 'white',
              color: reportType === type ? 'white' : '#4b5563',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        {/* Hotels Chart */}
        {(reportType === 'overview' || reportType === 'hotels') && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBarChart2 /> Hotel Registrations by Month
            </h4>
            <div style={{ height: '300px' }}>
              <Bar data={hotelChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Bookings Chart */}
        {(reportType === 'overview' || reportType === 'bookings') && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiTrendingUp /> Booking Trends
            </h4>
            <div style={{ height: '300px' }}>
              <Line data={bookingChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        {(reportType === 'overview' || reportType === 'revenue') && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiDollarSign /> Revenue Overview (RWF)
            </h4>
            <div style={{ height: '300px' }}>
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Occupancy Chart */}
        {(reportType === 'overview' || reportType === 'occupancy') && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiPieChart /> Occupancy Rate Trend
            </h4>
            <div style={{ height: '300px' }}>
              <Line data={occupancyChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Hotel Status Distribution */}
        {(reportType === 'overview' || reportType === 'hotels') && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiPieChart /> Hotel Status Distribution
            </h4>
            <div style={{ height: '300px' }}>
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div style={{ marginTop: '24px', background: 'white', borderRadius: '12px', padding: '20px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFileText /> Monthly Performance Data
        </h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Month</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>New Hotels</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Bookings</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Revenue (RWF)</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Occupancy Rate</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', fontWeight: 500 }}>{item.month} {selectedYear}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.hotels || 0}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.bookings || 0}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>RWF {(item.revenue || 0).toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.occupancy || 0}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
              <td style={{ padding: '12px' }}>Total</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{monthlyData.reduce((sum, d) => sum + (d.hotels || 0), 0)}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{monthlyData.reduce((sum, d) => sum + (d.bookings || 0), 0)}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>RWF {monthlyData.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{(monthlyData.reduce((sum, d) => sum + (d.occupancy || 0), 0) / monthlyData.length).toFixed(1)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Reports;