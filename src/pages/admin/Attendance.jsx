// frontend/src/pages/admin/Attendance.jsx
import React, { useState, useEffect } from "react";
import { FiEdit2, FiSave, FiX, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

// ✅ CORRECTED: Single source of truth for API URL
const API_BASE_URL = 'https://rhms-backend.onrender.com/api';

const Attendance = () => {
  const [staffAttendance, setStaffAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    totalStaff: 0
  });

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      loadAttendanceData();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token, selectedDate]);

  const loadAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: Removed double http://
      const response = await fetch(`${API_BASE_URL}/hotel/attendance?date=${selectedDate}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }
      
      const data = await response.json();
      setStaffAttendance(data);
      
      const present = data.filter(s => s.status === 'present').length;
      const late = data.filter(s => s.status === 'late').length;
      const absent = data.filter(s => s.status === 'absent' || !s.check_in_time).length;
      
      setStats({
        present,
        late,
        absent,
        totalStaff: data.length
      });
    } catch (error) {
      console.error("Error loading attendance:", error);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (member) => {
    setEditingStaff(member.staff_id);
    setEditStatus(member.status || 'absent');
    setEditCheckIn(member.check_in_time || '');
    setEditCheckOut(member.check_out_time || '');
  };

  const cancelEdit = () => {
    setEditingStaff(null);
    setEditStatus("");
    setEditCheckIn("");
    setEditCheckOut("");
  };

  const saveAttendance = async (staffId) => {
    setUpdating(true);
    try {
      let hoursWorked = null;
      if (editCheckIn && editCheckOut) {
        const checkIn = new Date(`2000-01-01T${editCheckIn}`);
        const checkOut = new Date(`2000-01-01T${editCheckOut}`);
        const diffHours = (checkOut - checkIn) / (1000 * 60 * 60);
        hoursWorked = Math.round(diffHours * 10) / 10;
      }

      // ✅ FIXED: Removed double http://
      const response = await fetch(`${API_BASE_URL}/hotel/attendance/${staffId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          status: editStatus,
          check_in_time: editCheckIn,
          check_out_time: editCheckOut,
          hours_worked: hoursWorked
        })
      });

      if (response.ok) {
        loadAttendanceData();
        cancelEdit();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update attendance");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Failed to update attendance");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': 
        return { bg: '#d1fae5', color: '#065f46', text: 'Present', icon: <FiCheckCircle size={12} /> };
      case 'late': 
        return { bg: '#fed7aa', color: '#92400e', text: 'Late', icon: <FiClock size={12} /> };
      case 'absent': 
        return { bg: '#fee2e2', color: '#991b1b', text: 'Absent', icon: <FiAlertCircle size={12} /> };
      default: 
        return { bg: '#f3f4f6', color: '#6b7280', text: '—', icon: null };
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Present', color: '#10b981' },
    { value: 'late', label: 'Late', color: '#f59e0b' },
    { value: 'absent', label: 'Absent', color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>📅 Attendance Tracker</h2>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2>📅 Attendance Tracker</h2>
        <div style={styles.errorContainer}>
          <p>❌ {error}</p>
          <button onClick={loadAttendanceData} style={styles.retryBtn}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>📅 Attendance Tracker</h2>
      <p style={styles.subtitle}>Track and manage staff attendance</p>

      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, background: '#d1fae5'}}>
          <div style={styles.statValue}>{stats.present}</div>
          <div style={styles.statLabel}>Present</div>
        </div>
        <div style={{...styles.statCard, background: '#fed7aa'}}>
          <div style={styles.statValue}>{stats.late}</div>
          <div style={styles.statLabel}>Late</div>
        </div>
        <div style={{...styles.statCard, background: '#fee2e2'}}>
          <div style={styles.statValue}>{stats.absent}</div>
          <div style={styles.statLabel}>Absent</div>
        </div>
        <div style={{...styles.statCard, background: '#dbeafe'}}>
          <div style={styles.statValue}>{stats.totalStaff}</div>
          <div style={styles.statLabel}>Total Staff</div>
        </div>
      </div>

      <div style={styles.datePickerContainer}>
        <label style={styles.dateLabel}>Select Date:</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.dateInput}
        />
        <button onClick={loadAttendanceData} style={styles.refreshBtn}>Refresh</button>
      </div>

      <div style={styles.tableContainer}>
        <h3>Staff Attendance - {new Date(selectedDate).toLocaleDateString()}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead><td>
              <tr style={styles.tableHeader}>
                <th>Staff Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Actions</th></tr>
              </td>
            </thead>
            <tbody>
              {staffAttendance.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                    No staff records found
                  </td>
                </tr>
              ) : (
                staffAttendance.map((member) => {
                  const badge = getStatusBadge(member.status);
                  const isEditing = editingStaff === member.staff_id;
                  
                  return (
                    <tr key={member.staff_id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <strong>{member.full_name}</strong>
                      </td>
                      <td style={styles.tableCell}>{member.department || 'N/A'}</td>
                      <td style={styles.tableCell}>{member.role || 'Staff'}</td>
                      <td style={styles.tableCell}>
                        {member.shift || 'Day'}<br/>
                        <small>{member.shift_start || '08:00'} - {member.shift_end || '17:00'}</small>
                      </td>
                      <td style={styles.tableCell}>
                        {isEditing ? (
                          <input 
                            type="time" 
                            value={editCheckIn} 
                            onChange={(e) => setEditCheckIn(e.target.value)}
                            style={styles.editInput}
                          />
                        ) : (
                          member.check_in_time || '—'
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {isEditing ? (
                          <input 
                            type="time" 
                            value={editCheckOut} 
                            onChange={(e) => setEditCheckOut(e.target.value)}
                            style={styles.editInput}
                          />
                        ) : (
                          member.check_out_time || '—'
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {member.hours_worked || '—'}
                      </td>
                      <td style={styles.tableCell}>
                        {isEditing ? (
                          <select 
                            value={editStatus} 
                            onChange={(e) => setEditStatus(e.target.value)}
                            style={styles.selectInput}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{...styles.statusBadge, background: badge.bg, color: badge.color}}>
                            {badge.icon} {badge.text}
                          </span>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {isEditing ? (
                          <div style={styles.actionButtons}>
                            <button 
                              onClick={() => saveAttendance(member.staff_id)} 
                              disabled={updating}
                              style={styles.saveBtn}
                              title="Save"
                            >
                              <FiSave size={14} />
                            </button>
                            <button 
                              onClick={cancelEdit} 
                              style={styles.cancelBtn}
                              title="Cancel"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startEdit(member)} 
                            style={styles.editBtn}
                            title="Edit Attendance"
                          >
                            <FiEdit2 size={14} /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    background: "#f9fafb",
    minHeight: "100vh"
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "24px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  statCard: {
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center"
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700"
  },
  statLabel: {
    fontSize: "13px",
    marginTop: "4px"
  },
  datePickerContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  dateLabel: {
    fontWeight: "500"
  },
  dateInput: {
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px"
  },
  refreshBtn: {
    padding: "8px 16px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    overflowX: "auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px"
  },
  tableHeader: {
    background: "#f9fafb",
    borderBottom: "2px solid #e5e7eb"
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6"
  },
  tableCell: {
    padding: "12px",
    verticalAlign: "middle"
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  },
  editInput: {
    padding: "6px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    width: "80px",
    fontSize: "12px"
  },
  selectInput: {
    padding: "6px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "12px",
    background: "white",
    cursor: "pointer"
  },
  actionButtons: {
    display: "flex",
    gap: "6px"
  },
  editBtn: {
    padding: "6px 12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  },
  saveBtn: {
    padding: "6px 10px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center"
  },
  cancelBtn: {
    padding: "6px 10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
    background: "white",
    borderRadius: "12px"
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px",
    background: "white",
    borderRadius: "12px",
    color: "#dc2626"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f4f6",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px"
  },
  retryBtn: {
    marginTop: "16px",
    padding: "8px 20px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default Attendance;