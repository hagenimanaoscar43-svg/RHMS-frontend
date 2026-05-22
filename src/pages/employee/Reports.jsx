import React, { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("employeeToken");

  useEffect(() => {
    loadReports();
  }, []);

  // Load reports from database
  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:5001/api/employee/reports",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load reports");
      }

      const data = await response.json();

      setReports(data || []);
    } catch (err) {
      console.error("Error loading reports:", err);

      setError("Failed to load reports");

      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Download report
  const downloadReport = async (reportId) => {
    try {
      setDownloadingId(reportId);

      const report = reports.find((r) => r.id === reportId);

      const response = await fetch(
        `http://localhost:5001/api/employee/reports/${reportId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${report?.name || "report"}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);

      alert("Failed to download report");
    } finally {
      setDownloadingId(null);
    }
  };

  // Chart data
  const performanceData = reports.map((report) => ({
    month: report.period,
    performance: report.score || 0,
  }));

  const attendanceData = reports.map((report) => ({
    month: report.period,
    attendance: report.attendance || 0,
  }));

  const pieData = [
    {
      name: "Attendance",
      value: reports.filter(
        (report) => report.type === "attendance"
      ).length,
    },
    {
      name: "Performance",
      value: reports.filter(
        (report) => report.type === "performance"
      ).length,
    },
    {
      name: "Summary",
      value: reports.filter(
        (report) => report.type === "summary"
      ).length,
    },
  ];

  const averagePerformance =
    reports.length > 0
      ? Math.round(
          reports.reduce(
            (total, report) =>
              total + (report.score || 0),
            0
          ) / reports.length
        )
      : 0;

  const averageAttendance =
    reports.length > 0
      ? Math.round(
          reports.reduce(
            (total, report) =>
              total + (report.attendance || 0),
            0
          ) / reports.length
        )
      : 0;

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b"];

  // Loading screen
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>

        <h3>Loading Reports...</h3>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            📊 Employee Reports Dashboard
          </h1>

          <p style={styles.subtitle}>
            Performance analytics, attendance insights,
            and downloadable reports
          </p>
        </div>

        <button
          onClick={loadReports}
          style={styles.refreshBtn}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {reports.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>📂</div>

          <h2>No Reports Available</h2>

          <p>
            Reports will appear here once they are
            generated from the database.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h4>Total Reports</h4>

              <h1>{reports.length}</h1>
            </div>

            <div style={styles.statCard}>
              <h4>Average Performance</h4>

              <h1>{averagePerformance}%</h1>
            </div>

            <div style={styles.statCard}>
              <h4>Attendance Rate</h4>

              <h1>{averageAttendance}%</h1>
            </div>

            <div style={styles.statCard}>
              <h4>Available Downloads</h4>

              <h1>{reports.length}</h1>
            </div>
          </div>

          {/* Charts */}
          <div style={styles.chartsGrid}>
            {/* Performance */}
            <div style={styles.chartCard}>
              <h3>📈 Performance Trend</h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="performance"
                    stroke="#4f46e5"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Attendance */}
            <div style={styles.chartCard}>
              <h3>📊 Attendance Analysis</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="attendance"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution */}
            <div style={styles.chartCard}>
              <h3>🥧 Report Distribution</h3>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reports Table */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3>📄 Reports List</h3>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Report Name</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Period</th>
                    <th style={styles.th}>Performance</th>
                    <th style={styles.th}>Attendance</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td style={styles.td}>
                        {report.name}
                      </td>

                      <td style={styles.td}>
                        {report.type}
                      </td>

                      <td style={styles.td}>
                        {report.period}
                      </td>

                      <td style={styles.td}>
                        {report.score || 0}%
                      </td>

                      <td style={styles.td}>
                        {report.attendance || 0}%
                      </td>

                      <td style={styles.td}>
                        {new Date(
                          report.date
                        ).toLocaleDateString()}
                      </td>

                      <td style={styles.td}>
                        <button
                          style={styles.downloadBtn}
                          onClick={() =>
                            downloadReport(report.id)
                          }
                          disabled={
                            downloadingId === report.id
                          }
                        >
                          {downloadingId === report.id
                            ? "Downloading..."
                            : "Download"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    background: "#f3f4f6",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  refreshBtn: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  errorBox: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  emptyCard: {
    background: "white",
    borderRadius: "16px",
    padding: "80px 20px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  emptyIcon: {
    fontSize: "60px",
    marginBottom: "16px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(400px,1fr))",
    gap: "24px",
    marginBottom: "24px",
  },

  chartCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  tableCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  tableHeader: {
    marginBottom: "20px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f9fafb",
    padding: "14px",
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
    color: "#374151",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #f3f4f6",
    color: "#4b5563",
  },

  downloadBtn: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loadingContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
  },

  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #e5e7eb",
    borderTop: "5px solid #4f46e5",
    borderRadius: "50%",
    marginBottom: "20px",
    animation: "spin 1s linear infinite",
  },
};

export default Reports;