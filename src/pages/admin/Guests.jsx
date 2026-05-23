// Guests.jsx - Load real guest data from database
import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiMail, 
  FiPhone, FiMapPin, FiCalendar, FiStar, FiUserCheck,
  FiUserX, FiUserPlus, FiUsers, FiCheckCircle, FiXCircle,
  FiClock, FiDownload, FiFilter, FiArrowUp, FiArrowDown
} from "react-icons/fi";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [sortField, setSortField] = useState("guest_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [newGuest, setNewGuest] = useState({
    guest_name: "", email: "", phone: "", id_number: "", nationality: "Rwandan", status: "upcoming", room_number: "", notes: ""
  });

  const token = localStorage.getItem("hotelToken");

  useEffect(() => {
    if (token) {
      fetchGuests();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      // Fetch bookings to get guest information
      const response = await fetch("https://rhms-backend.onrender.com/api/hotel/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Extract unique guests from bookings
        const uniqueGuests = [];
        const guestMap = new Map();
        
        data.forEach(booking => {
          if (!guestMap.has(booking.guest_email)) {
            guestMap.set(booking.guest_email, {
              id: booking.booking_id,
              guest_name: booking.guest_name,
              email: booking.guest_email,
              phone: booking.guest_phone || "N/A",
              id_number: booking.guest_nid || "N/A",
              nationality: booking.guest_nationality || "Rwandan",
              status: booking.status === "confirmed" ? "In-house" : booking.status === "pending" ? "Upcoming" : "Checked out",
              room_number: booking.room_number || "N/A",
              visits: 1,
              since: booking.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              notes: booking.special_requests || ""
            });
          } else {
            const existing = guestMap.get(booking.guest_email);
            existing.visits++;
            guestMap.set(booking.guest_email, existing);
          }
        });
        
        setGuests(Array.from(guestMap.values()));
      } else {
        setError(data.error || "Failed to fetch guests");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addGuest = async () => {
    if (!newGuest.guest_name || !newGuest.email || !newGuest.phone) {
      alert("Please fill in required fields");
      return;
    }
    // Note: Guest creation would typically be through booking
    alert("Guests are created through bookings");
    setShowAddModal(false);
  };

  const updateGuest = () => {
    // Guest update would typically be through booking update
    setShowEditModal(false);
    setSelectedGuest(null);
    fetchGuests();
  };

  const deleteGuest = (id) => {
    if (window.confirm("Are you sure you want to delete this guest?")) {
      // Guest deletion would typically be through booking cancellation
      alert("Guest records are managed through bookings");
    }
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "G";
  };

  const getCountryFlag = (nationality) => {
    const flags = { "Rwandan": "🇷🇼", "American": "🇺🇸", "British": "🇬🇧", "French": "🇫🇷", "South African": "🇿🇦", "Kenyan": "🇰🇪", "Nigerian": "🇳🇬" };
    return flags[nationality] || "🌍";
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />;
  };

  const filtered = guests
    .filter(g =>
      g.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase()) ||
      g.nationality?.toLowerCase().includes(search.toLowerCase()) ||
      g.phone?.includes(search) ||
      g.room_number?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const inHouse = guests.filter(g => g.status === "In-house").length;
  const upcoming = guests.filter(g => g.status === "Upcoming").length;
  const checkedOut = guests.filter(g => g.status === "Checked out").length;

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading guests...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>👥 Guest Management</div>
          <div style={styles.sub}>{guests.length} registered guests • {inHouse} currently in-house</div>
        </div>
        <button onClick={() => setShowAddModal(true)} style={styles.btnPrimary}>
          <FiPlus size={16} /> Add New Guest
        </button>
      </div>

      {error && <div style={{ color: 'red', padding: '10px', background: '#fee2e2', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

      {/* Statistics Cards */}
      <div style={styles.statGrid}>
        <div style={{ ...styles.statCard, background: '#dbeafe' }}><div><div style={{ fontSize: 28, fontWeight: 700, color: '#1e40af' }}>{inHouse}</div><div style={{ fontSize: 13, color: '#1e40af', fontWeight: 500 }}>In-house</div></div><FiUserCheck size={20} color="#1e40af" /></div>
        <div style={{ ...styles.statCard, background: '#ede9fe' }}><div><div style={{ fontSize: 28, fontWeight: 700, color: '#5b21b6' }}>{upcoming}</div><div style={{ fontSize: 13, color: '#5b21b6', fontWeight: 500 }}>Upcoming</div></div><FiCalendar size={20} color="#5b21b6" /></div>
        <div style={{ ...styles.statCard, background: '#f3f4f6' }}><div><div style={{ fontSize: 28, fontWeight: 700, color: '#6b7280' }}>{checkedOut}</div><div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Checked out</div></div><FiUserX size={20} color="#6b7280" /></div>
        <div style={{ ...styles.statCard, background: '#f9fafb' }}><div><div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{guests.length}</div><div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>Total Guests</div></div><FiUsers size={20} color="#111827" /></div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
          <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input placeholder="Search by name, email, nationality, phone, room..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 12px 10px 38px", fontSize: 13, background: "white" }} />
        </div>
      </div>

      {/* Guest Table */}
      <div style={styles.tableWrap}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["guest_name", "nationality", "id_number", "phone", "email", "room_number", "visits", "status", "actions"].map(h => (
                <th key={h} style={{ ...styles.th, cursor: h !== "actions" ? "pointer" : "default" }} onClick={() => h !== "actions" && handleSort(h)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {h === "guest_name" ? "Name" : h === "nationality" ? "Nationality" : h === "id_number" ? "ID/Passport" : h === "phone" ? "Phone" : h === "email" ? "Email" : h === "room_number" ? "Room" : h === "visits" ? "Visits" : h === "status" ? "Status" : "Actions"}
                    {getSortIcon(h)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(g => (
              <tr key={g.id}>
                <td style={{ ...styles.td, fontWeight: 600 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: '#dbeafe', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: '#1e40af' }}>{getInitials(g.guest_name)}</div>{g.guest_name}</div></td>
                <td style={styles.td}><span style={{ fontSize: 16, marginRight: 6 }}>{getCountryFlag(g.nationality)}</span> {g.nationality}</td>
                <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 11 }}>{g.id_number}</td>
                <td style={styles.td}><div style={{ display: "flex", alignItems: "center", gap: 4 }}><FiPhone size={11} color="#9ca3af" /> {g.phone}</div></td>
                <td style={{ ...styles.td, color: "#667eea" }}><div style={{ display: "flex", alignItems: "center", gap: 4 }}><FiMail size={11} /> {g.email}</div></td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 600 }}>{g.room_number}</td>
                <td style={{ ...styles.td, textAlign: "center" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f3f4f6", padding: "2px 8px", borderRadius: 12, fontSize: 11 }}><FiStar size={10} /> {g.visits}</span></td>
                <td style={styles.td}><Badge status={g.status} /></td>
                <td style={styles.td}><div style={{ display: "flex", gap: 6 }}><button style={styles.btnSm} onClick={() => { setSelectedGuest(g); setShowViewModal(true); }}><FiEye size={12} /> View</button><button style={styles.btnSm} onClick={() => { setSelectedGuest({ ...g }); setShowEditModal(true); }}><FiEdit2 size={12} /> Edit</button><button style={styles.btnDanger} onClick={() => deleteGuest(g.id)}><FiTrash2 size={12} /> Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: "24px", background: "#f3f4f6", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 15 },
  title: { fontSize: 24, fontWeight: 700, color: "#111827" },
  sub: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  btnPrimary: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 },
  btnSm: { fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "0.5px solid #d1d5db", background: "#f9fafb", color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  btnDanger: { fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "none", background: "#ef4444", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  tableWrap: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  th: { textAlign: "left", padding: "14px 16px", fontSize: 12, color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  td: { padding: "14px 16px", borderBottom: "1px solid #f3f4f6", color: "#111827", fontSize: 13, verticalAlign: "middle" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }
};

const Badge = ({ status }) => {
  const map = { "In-house": { bg: "#dbeafe", color: "#1e40af", icon: <FiUserCheck size={12} /> }, "Checked out": { bg: "#f3f4f6", color: "#6b7280", icon: <FiUserX size={12} /> }, "Upcoming": { bg: "#ede9fe", color: "#5b21b6", icon: <FiClock size={12} /> } };
  const s = map[status] || { bg: "#f3f4f6", color: "#6b7280", icon: null };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.icon} {status}</span>;
};

export default Guests;