// frontend/src/pages/admin/Bookings.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiFilter, FiCheckCircle, FiXCircle, 
  FiClock, FiEye, FiHome, FiChevronLeft, FiChevronRight,
  FiUsers, FiDollarSign, FiRefreshCw
} from "react-icons/fi";

const styles = {
  page: { padding: "24px", background: "#f3f4f6", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 15 },
  headerLeft: { flex: 1 },
  title: { fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 },
  sub: { fontSize: 13, color: "#6b7280" },
  
  btnSm: { fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "0.5px solid #d1d5db", background: "#f9fafb", color: "#374151", cursor: "pointer" },
  btnApprove: { 
    fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "none", background: "#10b981", color: "white", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s"
  },
  btnReject: { 
    fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "none", background: "#ef4444", color: "white", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s"
  },
  btnView: {
    fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "0.5px solid #d1d5db", background: "#f3f4f6", color: "#374151", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 4
  },
  refreshBtn: {
    fontSize: 13, padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", color: "#374151", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
  },

  tableWrap: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  th: { 
    textAlign: "left", padding: "14px 16px", fontSize: 12, color: "#6b7280", fontWeight: 600, 
    borderBottom: "1px solid #e5e7eb", background: "#f9fafb" 
  },
  td: { padding: "14px 16px", borderBottom: "1px solid #f3f4f6", color: "#111827", fontSize: 13, verticalAlign: "middle" },

  filterBtn: (active) => ({
    fontSize: 13, padding: "8px 18px", borderRadius: 25, border: "1px solid #e5e7eb",
    background: active ? "#667eea" : "white", color: active ? "white" : "#374151", cursor: "pointer",
    fontWeight: active ? 600 : 500, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6
  }),
  
  statsCard: {
    background: "white", padding: "16px 20px", borderRadius: 12, border: "1px solid #e5e7eb",
    flex: 1, minWidth: "180px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
  },
  
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
  },
  modal: { background: "white", borderRadius: 16, width: "90%", maxWidth: "500px", maxHeight: "90vh", overflow: "auto" },
  modalHeader: { padding: "20px", borderBottom: "1px solid #e5e7eb", fontSize: 18, fontWeight: 600 },
  modalBody: { padding: "20px" },
  modalFooter: { padding: "20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 10, justifyContent: "flex-end" },
  infoRow: { display: "flex", padding: "10px 0", borderBottom: "1px solid #f3f4f6" },
  infoLabel: { width: "120px", fontWeight: 600, color: "#6b7280", fontSize: 13 },
  infoValue: { flex: 1, color: "#111827", fontSize: 13 },
  loadingContainer: { textAlign: "center", padding: "60px", background: "white", borderRadius: 12 },
  spinner: { width: "40px", height: "40px", border: "3px solid #f3f4f6", borderTop: "3px solid #667eea", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" },
  errorContainer: { textAlign: "center", padding: "60px", background: "white", borderRadius: 12, color: "#dc2626" },
  retryBtn: { marginTop: "16px", padding: "8px 20px", background: "#667eea", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }
};

const Badge = ({ status }) => {
  const map = {
    confirmed: { bg: "#d1fae5", color: "#065f46", icon: <FiCheckCircle size={12} />, text: "Confirmed" },
    pending: { bg: "#fef3c7", color: "#92400e", icon: <FiClock size={12} />, text: "Pending" },
    cancelled: { bg: "#fee2e2", color: "#991b1b", icon: <FiXCircle size={12} />, text: "Cancelled" },
  };

  const s = map[status?.toLowerCase()] || map.pending;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, background: s.bg, color: s.color
    }}>
      {s.icon}
      {s.text}
    </span>
  );
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [updating, setUpdating] = useState(false);
  const itemsPerPage = 5;

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchBookings();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5001/api/hotel/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      
      const data = await response.json();
      // Handle both response formats
      const bookingsArray = data.bookings || data;
      setBookings(bookingsArray);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    if (updating) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:5001/api/hotel/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Booking ${status === "confirmed" ? "approved" : "rejected"} successfully!`);
        fetchBookings();
        setShowModal(false);
        // Trigger event to update sidebar badge
        window.dispatchEvent(new Event('bookingStatusChanged'));
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const viewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === "pending").length;
    const confirmed = bookings.filter(b => b.status === "confirmed").length;
    const cancelled = bookings.filter(b => b.status === "cancelled").length;
    const totalRevenue = bookings
      .filter(b => b.status === "confirmed")
      .reduce((sum, b) => sum + (b.final_amount || 0), 0);
    
    return { total, pending, confirmed, cancelled, totalRevenue };
  };

  const stats = getStats();

  const filtered = bookings.filter(b => {
    const matchFilter = filter === "All" || b.status?.toLowerCase() === filter.toLowerCase();
    const matchSearch =
      b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const paginatedBookings = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorContainer}>
          <p>❌ {error}</p>
          <button onClick={fetchBookings} style={styles.retryBtn}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.title}>📋 Booking Requests</div>
          <div style={styles.sub}>Review and manage guest booking requests</div>
        </div>
        <button onClick={fetchBookings} style={styles.refreshBtn}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={styles.statsCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FiUsers size={18} color="#667eea" />
            <div style={{ fontSize: 12, color: "#6b7280" }}>Total Bookings</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{stats.total}</div>
        </div>
        <div style={styles.statsCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FiClock size={18} color="#f59e0b" />
            <div style={{ fontSize: 12, color: "#6b7280" }}>Pending Review</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{stats.pending}</div>
        </div>
        <div style={styles.statsCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FiCheckCircle size={18} color="#10b981" />
            <div style={{ fontSize: 12, color: "#6b7280" }}>Confirmed</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>{stats.confirmed}</div>
        </div>
        <div style={styles.statsCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FiDollarSign size={18} color="#667eea" />
            <div style={{ fontSize: 12, color: "#6b7280" }}>Total Revenue</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#667eea" }}>
            RWF {stats.totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Pending", "Confirmed", "Cancelled"].map(f => (
            <button
              key={f}
              style={styles.filterBtn(filter === f)}
              onClick={() => setFilter(f)}
            >
              {f === "All" && <FiFilter size={12} />}
              {f === "Pending" && <FiClock size={12} />}
              {f === "Confirmed" && <FiCheckCircle size={12} />}
              {f === "Cancelled" && <FiXCircle size={12} />}
              {f}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", marginLeft: "auto" }}>
          <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            placeholder="Search by guest, room or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 260,
              padding: "10px 12px 10px 35px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13,
              background: "white"
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["ID", "Guest", "Room", "Check-in", "Check-out", "Amount", "Status", "Actions"].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map(b => (
              <tr key={b.booking_id}>
                <td style={{ ...styles.td, fontFamily: "monospace", color: "#6b7280" }}>{b.booking_number}</td>
                <td style={{ ...styles.td, fontWeight: 600 }}>
                  <div>
                    {b.guest_name}
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{b.guest_email}</div>
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiHome size={12} /> {b.room_number || "N/A"}
                  </div>
                </td>
                <td style={styles.td}>{b.check_in_date?.split('T')[0]}</td>
                <td style={styles.td}>{b.check_out_date?.split('T')[0]}</td>
                <td style={{ ...styles.td, fontWeight: 600, color: "#667eea" }}>
                  RWF {b.final_amount?.toLocaleString() || 0}
                </td>
                <td style={styles.td}><Badge status={b.status} /></td>
                <td style={styles.td}>
                  {b.status === "pending" ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        style={styles.btnApprove}
                        onClick={() => updateBookingStatus(b.booking_id, "confirmed")}
                        disabled={updating}
                      >
                        <FiCheckCircle size={12} /> Approve
                      </button>
                      <button
                        style={styles.btnReject}
                        onClick={() => updateBookingStatus(b.booking_id, "cancelled")}
                        disabled={updating}
                      >
                        <FiXCircle size={12} /> Reject
                      </button>
                      <button
                        style={styles.btnView}
                        onClick={() => viewDetails(b)}
                      >
                        <FiEye size={12} /> View
                      </button>
                    </div>
                  ) : (
                    <button
                      style={styles.btnView}
                      onClick={() => viewDetails(b)}
                    >
                      <FiEye size={12} /> View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>
            <FiSearch size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
            <div>No bookings found</div>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  borderRadius: 6,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                <FiChevronLeft size={14} />
              </button>
              <span style={{ padding: "6px 12px", fontSize: 13 }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  borderRadius: 6,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showModal && selectedBooking && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              Booking Details - {selectedBooking.booking_number}
            </div>
            <div style={styles.modalBody}>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Guest Name:</div>
                <div style={styles.infoValue}>{selectedBooking.guest_name}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Email:</div>
                <div style={styles.infoValue}>{selectedBooking.guest_email}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Phone:</div>
                <div style={styles.infoValue}>{selectedBooking.guest_phone || "N/A"}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Room:</div>
                <div style={styles.infoValue}>{selectedBooking.room_number || "N/A"}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Room Type:</div>
                <div style={styles.infoValue}>{selectedBooking.room_type || "N/A"}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Check-in:</div>
                <div style={styles.infoValue}>{selectedBooking.check_in_date?.split('T')[0]}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Check-out:</div>
                <div style={styles.infoValue}>{selectedBooking.check_out_date?.split('T')[0]}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Nights:</div>
                <div style={styles.infoValue}>{selectedBooking.number_of_nights}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Guests:</div>
                <div style={styles.infoValue}>{selectedBooking.number_of_guests}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Amount:</div>
                <div style={styles.infoValue}>RWF {selectedBooking.final_amount?.toLocaleString()}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Status:</div>
                <div style={styles.infoValue}><Badge status={selectedBooking.status} /></div>
              </div>
              {selectedBooking.special_requests && (
                <div style={styles.infoRow}>
                  <div style={styles.infoLabel}>Special Requests:</div>
                  <div style={styles.infoValue}>{selectedBooking.special_requests}</div>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowModal(false)} style={styles.btnSm}>Close</button>
              {selectedBooking.status === "pending" && (
                <>
                  <button 
                    onClick={() => updateBookingStatus(selectedBooking.booking_id, "confirmed")} 
                    style={styles.btnApprove}
                    disabled={updating}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => updateBookingStatus(selectedBooking.booking_id, "cancelled")} 
                    style={styles.btnReject}
                    disabled={updating}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}