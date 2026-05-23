// frontend/src/pages/employee/Overview.jsx
import React, { useState, useEffect } from "react";

const Overview = () => {
  const [employee, setEmployee] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token") || localStorage.getItem("employeeToken");

  useEffect(() => {
    if (token) {
      fetchEmployeeData();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token]);

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch("https://rhms-backend.onrender.com/api/employee/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/employee/login";
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      
      const data = await response.json();
      setEmployee(data.employee);
      setAttendanceStats(data.attendance_stats);
      setPendingTasks(data.pending_tasks);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
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
      <div style={styles.errorContainer}>
        <p>❌ {error}</p>
        <button onClick={fetchEmployeeData} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.welcomeCard}>
        <div>
          <h2>Welcome back, {employee?.full_name?.split(' ')[0] || 'Employee'}! 👋</h2>
          <p>Here's what's happening with your work today.</p>
        </div>
        <div style={styles.dateBadge}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <div style={styles.statLabel}>Monthly Salary</div>
            <div style={styles.statValue}>
              {employee?.salary?.toLocaleString()} RWF
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div>
            <div style={styles.statLabel}>Present Days</div>
            <div style={styles.statValue}>
              {attendanceStats?.present_days || 0} / {attendanceStats?.total_days || 0}
            </div>
            <div style={styles.statSubtext}>
              Late: {attendanceStats?.late_days || 0} | Absent: {attendanceStats?.absent_days || 0}
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <div style={styles.statLabel}>Pending Tasks</div>
            <div style={styles.statValue}>{pendingTasks}</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏨</div>
          <div>
            <div style={styles.statLabel}>Hotel</div>
            <div style={styles.statValue}>{employee?.hotel_name || 'N/A'}</div>
            <div style={styles.statSubtext}>{employee?.city || ''}</div>
          </div>
        </div>
      </div>

      <div style={styles.detailsCard}>
        <h3>📋 Personal Information</h3>
        <div style={styles.detailsGrid}>
          <div><label>Full Name</label><p>{employee?.full_name}</p></div>
          <div><label>Email</label><p>{employee?.email}</p></div>
          <div><label>Phone</label><p>{employee?.phone || 'Not provided'}</p></div>
          <div><label>Role</label><p>{employee?.role || 'Staff'}</p></div>
          <div><label>Department</label><p>{employee?.department || 'N/A'}</p></div>
          <div><label>Joined Date</label><p>{employee?.joined_date ? new Date(employee.joined_date).toLocaleDateString() : 'N/A'}</p></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loadingContainer: { textAlign: 'center', padding: '50px' },
  errorContainer: { textAlign: 'center', padding: '50px', color: '#dc2626' },
  retryBtn: { padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' },
  welcomeCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  dateBadge: { background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' },
  statCard: { background: 'white', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  statIcon: { fontSize: '32px' },
  statLabel: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
  statValue: { fontSize: '24px', fontWeight: 'bold', color: '#1f2937' },
  statSubtext: { fontSize: '11px', color: '#9ca3af', marginTop: '4px' },
  detailsCard: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }
};

export default Overview;