// frontend/src/pages/employee/Salary.jsx

import React, { useState, useEffect } from "react";

const Salary = () => {
  const [salary, setSalary] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("employeeToken") ||
    localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    try {
      const response = await fetch(
        "https://rhms-backend.onrender.com/api/employee/salary",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch salary data");
      }

      const data = await response.json();

      setSalary(data.current_salary || 0);
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading salary data...</div>;
  }

  if (error) {
    return <div style={styles.error}>❌ {error}</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>💰 Salary Overview</h2>
        <p style={styles.subtitle}>
          Your current compensation and payment history
        </p>
      </div>

      {/* Current Salary Card */}
      <div style={styles.currentCard}>
        <div style={styles.currentAmount}>
          <span style={styles.currency}>RWF</span>
          <span>{salary.toLocaleString()}</span>
        </div>

        <div style={styles.currentLabel}>Monthly Salary</div>

        <div style={styles.currentNote}>
          Paid on the last working day of each month
        </div>
      </div>

      {/* Salary History */}
      <div style={styles.historyCard}>
        <h3 style={styles.sectionTitle}>📜 Payment History</h3>

        {history.length === 0 ? (
          <p style={styles.noHistory}>No payment history available.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Month</th>
                  <th style={styles.th}>Year</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((record, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{record.month}</td>
                    <td style={styles.td}>{record.year}</td>
                    <td style={styles.td}>
                      {record.amount?.toLocaleString()} RWF
                    </td>

                    <td style={styles.td}>
                      <span style={styles.paidBadge}>✓ Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },

  loading: {
    textAlign: "center",
    padding: "50px",
    color: "#6b7280",
    fontSize: "18px",
  },

  error: {
    textAlign: "center",
    padding: "50px",
    color: "#dc2626",
    fontSize: "18px",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    fontSize: "28px",
    margin: "0 0 8px 0",
    color: "#1f2937",
  },

  subtitle: {
    color: "#6b7280",
    margin: 0,
  },

  currentCard: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    borderRadius: "18px",
    padding: "36px",
    textAlign: "center",
    color: "white",
    marginBottom: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },

  currentAmount: {
    fontSize: "50px",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  currency: {
    fontSize: "22px",
    marginRight: "8px",
  },

  currentLabel: {
    fontSize: "16px",
    opacity: 0.9,
    marginBottom: "8px",
  },

  currentNote: {
    fontSize: "13px",
    opacity: 0.75,
  },

  historyCard: {
    background: "white",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    marginBottom: "20px",
    fontSize: "20px",
    color: "#1f2937",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f3f4f6",
    padding: "14px",
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
    color: "#374151",
    fontWeight: "600",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
  },

  paidBadge: {
    background: "#d1fae5",
    color: "#065f46",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  noHistory: {
    color: "#6b7280",
    textAlign: "center",
    padding: "20px",
  },
};

export default Salary;