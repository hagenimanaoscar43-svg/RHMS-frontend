// frontend/src/pages/employee/Attendance.jsx
import React, { useState, useEffect } from 'react';

const EmployeeAttendance = () => {
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    const token = localStorage.getItem('token') || localStorage.getItem('employeeToken');
    
    useEffect(() => {
        if (token) {
            loadAttendance();
        }
    }, [selectedDate, token]);
    
    const loadAttendance = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // ✅ Use EMPLOYEE endpoint, not HOTEL endpoint
            const response = await fetch(
                `https://rhms-backend.onrender.com/api/employee/attendance?date=${selectedDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.clear();
                window.location.href = '/employee/login';
                return;
            }
            
            if (response.status === 403) {
                setError('Access denied. Please make sure you are logged in as an employee.');
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            setAttendance(data);
            
        } catch (err) {
            console.error('Error loading attendance:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClockIn = async () => {
        try {
            const response = await fetch('https://rhms-backend.onrender.com/api/employee/clock-in', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                alert('Clocked in successfully!');
                loadAttendance();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to clock in');
            }
        } catch (err) {
            console.error('Clock in error:', err);
            alert('Failed to clock in');
        }
    };
    
    const handleClockOut = async () => {
        try {
            const response = await fetch('https://rhms-backend.onrender.com/api/employee/clock-out', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                alert('Clocked out successfully!');
                loadAttendance();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to clock out');
            }
        } catch (err) {
            console.error('Clock out error:', err);
            alert('Failed to clock out');
        }
    };
    
    if (loading) {
        return <div style={styles.loading}>Loading attendance...</div>;
    }
    
    return (
        <div style={styles.container}>
            <h1>My Attendance</h1>
            
            {error && (
                <div style={styles.error}>
                    ⚠️ {error}
                </div>
            )}
            
            <div style={styles.datePicker}>
                <label>Select Date:</label>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={styles.dateInput}
                />
                <button onClick={loadAttendance} style={styles.refreshBtn}>
                    Refresh
                </button>
            </div>
            
            {attendance && attendance.status !== 'not_recorded' ? (
                <div style={styles.attendanceCard}>
                    <h3>Attendance for {selectedDate}</h3>
                    <div style={styles.infoRow}>
                        <span>Status:</span>
                        <strong style={{
                            color: attendance.status === 'present' ? 'green' : 
                                   attendance.status === 'late' ? 'orange' : 'red'
                        }}>
                            {attendance.status?.toUpperCase()}
                        </strong>
                    </div>
                    {attendance.check_in_time && (
                        <div style={styles.infoRow}>
                            <span>Check In:</span>
                            <span>{attendance.check_in_time}</span>
                        </div>
                    )}
                    {attendance.check_out_time && (
                        <div style={styles.infoRow}>
                            <span>Check Out:</span>
                            <span>{attendance.check_out_time}</span>
                        </div>
                    )}
                    {attendance.hours_worked && (
                        <div style={styles.infoRow}>
                            <span>Hours Worked:</span>
                            <span>{attendance.hours_worked} hours</span>
                        </div>
                    )}
                </div>
            ) : attendance?.status === 'not_recorded' ? (
                <div style={styles.noRecordCard}>
                    <p>No attendance record for {selectedDate}</p>
                    <div style={styles.buttonGroup}>
                        <button onClick={handleClockIn} style={styles.clockInBtn}>
                            🕐 Clock In
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const styles = {
    container: {
        padding: '24px',
        maxWidth: '600px',
        margin: '0 auto'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#666'
    },
    error: {
        background: '#fee2e2',
        color: '#b91c1c',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    datePicker: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        alignItems: 'center'
    },
    dateInput: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #ddd'
    },
    refreshBtn: {
        padding: '8px 16px',
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    attendanceCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    noRecordCard: {
        background: '#fefce8',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px',
        borderBottom: '1px solid #f0f0f0'
    },
    buttonGroup: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px'
    },
    clockInBtn: {
        padding: '12px 24px',
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px'
    }
};

export default EmployeeAttendance;