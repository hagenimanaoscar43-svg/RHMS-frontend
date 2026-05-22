// frontend/src/pages/client/MyBookings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiCalendar, FiMapPin, FiDollarSign, FiClock, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiEye, FiDownload, FiPhone, FiMail
} from "react-icons/fi";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const token = localStorage.getItem("clientToken") || localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchBookings();
    } else {
      setError("Please login to view your bookings");
      setLoading(false);
    }
  }, [token]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/client/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        navigate("/client/login");
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      confirmed: { bg: "#d1fae5", color: "#065f46", icon: <FiCheckCircle size={14} />, text: "Confirmed" },
      pending: { bg: "#fef3c7", color: "#92400e", icon: <FiClock size={14} />, text: "Pending" },
      cancelled: { bg: "#fee2e2", color: "#991b1b", icon: <FiXCircle size={14} />, text: "Cancelled" },
      completed: { bg: "#dbeafe", color: "#1e40af", icon: <FiCheckCircle size={14} />, text: "Completed" }
    };
    const s = statuses[status?.toLowerCase()] || statuses.pending;
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "500",
        background: s.bg,
        color: s.color
      }}>
        {s.icon} {s.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "0";
    return amount.toLocaleString();
  };

  const viewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const downloadInvoice = (booking) => {
    const invoiceContent = `
      RHMS Booking Invoice
      --------------------
      Booking ID: ${booking.booking_number}
      Hotel: ${booking.hotel_name}
      Guest: ${booking.guest_name}
      Check-in: ${formatDate(booking.check_in_date)}
      Check-out: ${formatDate(booking.check_out_date)}
      Nights: ${booking.number_of_nights || 1}
      Room Type: ${booking.room_type}
      Total Amount: RWF ${formatAmount(booking.final_amount || booking.total_amount)}
      Status: ${booking.status}
      Booking Date: ${formatDate(booking.created_at)}
    `;
    
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${booking.booking_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
        <style>{`
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f4f6;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
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
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h3>{error}</h3>
        <button onClick={fetchBookings} style={styles.retryBtn}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 My Bookings</h2>
        <p style={styles.subtitle}>Track and manage your hotel reservations</p>
      </div>

      {bookings.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏨</div>
          <h3>No bookings yet</h3>
          <p>You haven't made any bookings. Start exploring hotels!</p>
          <button onClick={() => navigate("/client/hotels")} style={styles.browseBtn}>
            Browse Hotels →
          </button>
        </div>
      ) : (
        <div style={styles.bookingsGrid}>
          {bookings.map((booking) => (
            <div key={booking.booking_id || booking.id} style={styles.bookingCard}>
              <div style={styles.bookingHeader}>
                <div>
                  <div style={styles.bookingId}>{booking.booking_number}</div>
                  <div style={styles.bookingDate}>
                    Booked on {formatDate(booking.created_at)}
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div style={styles.hotelInfo}>
                <div style={styles.hotelName}>{booking.hotel_name}</div>
                <div style={styles.hotelLocation}>
                  <FiMapPin size={12} /> {booking.city || "Location not specified"}
                </div>
              </div>

              <div style={styles.bookingDetails}>
                <div style={styles.detailItem}>
                  <FiCalendar size={14} />
                  <span>{formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}</span>
                </div>
                <div style={styles.detailItem}>
                  <FiClock size={14} />
                  <span>{booking.number_of_nights || 1} night(s)</span>
                </div>
                <div style={styles.detailItem}>
                  <FiDollarSign size={14} />
                  <span>RWF {formatAmount(booking.final_amount || booking.total_amount)}</span>
                </div>
              </div>

              <div style={styles.bookingFooter}>
                <button onClick={() => viewDetails(booking)} style={styles.viewBtn}>
                  <FiEye size={14} /> View Details
                </button>
                <button onClick={() => downloadInvoice(booking)} style={styles.downloadBtn}>
                  <FiDownload size={14} /> Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Booking Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <label>Booking ID:</label>
                <span>{selectedBooking.booking_number}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Status:</label>
                <span>{getStatusBadge(selectedBooking.status)}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Hotel:</label>
                <span>{selectedBooking.hotel_name}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Location:</label>
                <span>{selectedBooking.city || "N/A"}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Room Type:</label>
                <span>{selectedBooking.room_type}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Room Number:</label>
                <span>{selectedBooking.room_number || "To be assigned"}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Check-in:</label>
                <span>{formatDate(selectedBooking.check_in_date)}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Check-out:</label>
                <span>{formatDate(selectedBooking.check_out_date)}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Nights:</label>
                <span>{selectedBooking.number_of_nights || 1}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Guests:</label>
                <span>{selectedBooking.number_of_guests || 1}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Total Amount:</label>
                <span>RWF {formatAmount(selectedBooking.final_amount || selectedBooking.total_amount)}</span>
              </div>
              {selectedBooking.special_requests && (
                <div style={styles.detailRow}>
                  <label>Special Requests:</label>
                  <span>{selectedBooking.special_requests}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <label>Guest Name:</label>
                <span>{selectedBooking.guest_name}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Guest Email:</label>
                <span>{selectedBooking.guest_email}</span>
              </div>
              <div style={styles.detailRow}>
                <label>Guest Phone:</label>
                <span>{selectedBooking.guest_phone || "N/A"}</span>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeModalBtn}>Close</button>
              <button onClick={() => downloadInvoice(selectedBooking)} style={styles.downloadModalBtn}>Download Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    background: "#f3f4f6",
    minHeight: "100vh"
  },
  header: {
    marginBottom: "24px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#111827"
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
    background: "white",
    borderRadius: "16px",
    margin: "24px"
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px",
    background: "white",
    borderRadius: "16px",
    margin: "24px",
    color: "#dc2626"
  },
  retryBtn: {
    marginTop: "16px",
    padding: "10px 24px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px",
    background: "white",
    borderRadius: "16px"
  },
  browseBtn: {
    marginTop: "16px",
    padding: "10px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  bookingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "20px"
  },
  bookingCard: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.3s, box-shadow 0.3s"
  },
  bookingHeader: {
    padding: "16px 20px",
    background: "#f8f9fa",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bookingId: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#1f2937",
    fontFamily: "monospace"
  },
  bookingDate: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "4px"
  },
  hotelInfo: {
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6"
  },
  hotelName: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#1f2937"
  },
  hotelLocation: {
    fontSize: "13px",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  bookingDetails: {
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderBottom: "1px solid #f3f4f6"
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#4b5563"
  },
  bookingFooter: {
    padding: "16px 20px",
    display: "flex",
    gap: "12px"
  },
  viewBtn: {
    flex: 1,
    padding: "8px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#374151"
  },
  downloadBtn: {
    flex: 1,
    padding: "8px",
    background: "#667eea",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "13px",
    color: "white"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    background: "white",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "550px",
    maxHeight: "80vh",
    overflow: "auto"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e5e7eb"
  },
  modalBody: {
    padding: "20px"
  },
  modalFooter: {
    padding: "20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px"
  },
  detailRow: {
    display: "flex",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f3f4f6"
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280"
  },
  closeModalBtn: {
    padding: "8px 16px",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  downloadModalBtn: {
    padding: "8px 16px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default MyBookings;