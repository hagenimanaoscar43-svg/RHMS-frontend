// frontend/src/pages/admin/Reports.jsx
import React, { useState, useEffect } from "react";

// ✅ CORRECTED: Single source of truth for API URL
const API_BASE_URL = 'https://rhms-backend.onrender.com/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0, avgOccupancy: 0, totalGuests: 0, satisfaction: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [period, setPeriod] = useState("month");

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchReportData();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token, period]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: Removed double http://
      const statsResponse = await fetch(`${API_BASE_URL}/hotel/stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (statsResponse.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      const statsData = await statsResponse.json();
      
      // ✅ FIXED: Removed double http://
      const bookingsResponse = await fetch(`${API_BASE_URL}/hotel/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!bookingsResponse.ok) {
        throw new Error("Failed to fetch bookings");
      }
      
      const bookingsData = await bookingsResponse.json();
      
      const confirmedBookings = bookingsData.filter(b => b.status === "confirmed");
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.final_amount || 0), 0);
      const totalGuests = confirmedBookings.length;
      
      // ✅ FIXED: Removed double http://
      const roomsResponse = await fetch(`${API_BASE_URL}/hotel/rooms`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const roomsData = await roomsResponse.json();
      const occupiedRooms = roomsData.filter(r => r.status === "booked").length;
      const avgOccupancy = roomsData.length > 0 ? Math.round((occupiedRooms / roomsData.length) * 100) : 0;
      
      setStats({ 
        totalRevenue, 
        avgOccupancy, 
        totalGuests, 
        satisfaction: 0 // Will be calculated from reviews if available
      });
      
      // Generate monthly data from bookings
      const monthly = {};
      const currentYear = new Date().getFullYear();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Initialize all months with 0
      months.forEach(month => {
        monthly[month] = { revenue: 0, occupancy: 0, guests: 0 };
      });
      
      bookingsData.forEach(b => {
        const date = new Date(b.created_at);
        if (date.getFullYear() === currentYear) {
          const month = months[date.getMonth()];
          if (monthly[month]) {
            monthly[month].revenue += b.final_amount || 0;
            monthly[month].guests++;
          }
        }
      });
      
      // Add occupancy data to each month
      const monthlyArray = months.map(m => ({
        month: m,
        revenue: monthly[m]?.revenue || 0,
        occupancy: avgOccupancy,
        guests: monthly[m]?.guests || 0
      }));
      
      setMonthlyData(monthlyArray);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const PERIODS = ["This Month", "Last Month", "Last 3 Months", "This Year"];
  const maxRev = Math.max(...monthlyData.map(m => m.revenue), 1);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div className="spinner"></div>
        <p>Loading reports...</p>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
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
      <div style={{ textAlign: "center", padding: "50px", color: "#dc2626" }}>
        <p>❌ {error}</p>
        <button onClick={fetchReportData} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Reports & Analytics</div>
          <div style={styles.sub}>Financial and operational overview</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={styles.select}>
            {PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
          <button style={styles.btnPrimary}>Export PDF</button>
        </div>
      </div>

      <div style={styles.statGrid}>
        <div style={styles.card}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb" }}>
            {(stats.totalRevenue / 1000000).toFixed(1)}M RWF
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Total Revenue</div>
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {stats.avgOccupancy}%
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Avg Occupancy</div>
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {stats.totalGuests}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Total Guests</div>
        </div>
      </div>

      <div style={styles.twoCol}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Monthly Revenue (RWF)</div>
          {monthlyData.map(m => (
            <BarRow key={m.month} label={m.month} value={m.revenue} display={`${(m.revenue / 1000000).toFixed(1)}M`} color="#2563eb" max={maxRev} />
          ))}
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Monthly Occupancy Rate</div>
          {monthlyData.map(m => (
            <BarRow key={m.month} label={m.month} value={stats.avgOccupancy} display={`${stats.avgOccupancy}%`} color="#60a5fa" />
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Monthly Guest Count</div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
          {monthlyData.map(m => {
            const maxGuests = Math.max(...monthlyData.map(x => x.guests), 1);
            const h = Math.round((m.guests / maxGuests) * 80);
            return (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{m.guests}</span>
                <div style={{ width: "100%", height: h, background: "#2563eb", borderRadius: "4px 4px 0 0" }} />
                <span style={{ fontSize: 11, color: "#6b7280" }}>{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BarRow = ({ label, value, display, color, max = 100 }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: "#111827" }}>{display}</span>
    </div>
    <div style={{ height: 7, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  </div>
);

const styles = {
  page: { padding: "24px", background: "#f3f4f6", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 },
  title: { fontSize: 22, fontWeight: 700, color: "#111827" },
  sub: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  select: { border: "0.5px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontSize: 13, background: "white" },
  btnPrimary: { background: "#2563eb", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 },
  card: { background: "white", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 14 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  retryBtn: { padding: "8px 16px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "10px" }
};

export default Reports;