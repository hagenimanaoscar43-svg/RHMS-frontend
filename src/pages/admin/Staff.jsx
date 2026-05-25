// frontend/src/pages/admin/Staff.jsx - Complete working version with correct API URL
import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiMail, 
  FiPhone, FiCalendar, FiUserCheck, FiUserX,
  FiFilter, FiDollarSign, FiPercent,
  FiCheckCircle, FiXCircle, FiUserPlus, FiClock
} from "react-icons/fi";

// ✅ CORRECTED: Single source of truth for API URL
const API_BASE_URL = 'https://rhms-backend.onrender.com/api';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [newStaff, setNewStaff] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "Receptionist",
    department: "Front Desk",
    salary: 250000,
    shift: "Day",
    shift_start: "08:00",
    shift_end: "17:00",
    joined_date: new Date().toISOString().split('T')[0],
    nid: "",
    address: ""
  });

  const [editStaff, setEditStaff] = useState(null);

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");
  
  const departments = ["All", "Front Desk", "Housekeeping", "Security", "F&B", "Maintenance", "IT", "Management", "Accounting", "Sales"];

  useEffect(() => {
    if (token) {
      fetchStaff();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token]);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: Removed double http://
      const response = await fetch(`${API_BASE_URL}/hotel/staff`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      const data = await response.json();
      if (response.ok) {
        setStaff(data);
      } else {
        setError(data.error || "Failed to fetch staff");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addStaff = async () => {
    if (!newStaff.full_name || !newStaff.phone || !newStaff.email) {
      alert("Please fill in required fields (Name, Phone, Email)");
      return;
    }
    
    try {
      // ✅ FIXED: Removed double http://
      const response = await fetch(`${API_BASE_URL}/hotel/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: newStaff.full_name,
          email: newStaff.email,
          phone: newStaff.phone,
          role: newStaff.role,
          department: newStaff.department,
          salary: parseInt(newStaff.salary),
          shift: newStaff.shift,
          shift_start: newStaff.shift_start,
          shift_end: newStaff.shift_end,
          joined_date: newStaff.joined_date,
          nid: newStaff.nid,
          address: newStaff.address
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert("✅ Staff member added successfully!");
        setShowAddModal(false);
        fetchStaff();
        setNewStaff({
          full_name: "",
          email: "",
          phone: "",
          role: "Receptionist",
          department: "Front Desk",
          salary: 250000,
          shift: "Day",
          shift_start: "08:00",
          shift_end: "17:00",
          joined_date: new Date().toISOString().split('T')[0],
          nid: "",
          address: ""
        });
      } else {
        alert(data.error || "Failed to add staff");
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Failed to add staff. Please try again.");
    }
  };

  const updateStaff = async () => {
    if (!editStaff) return;
    
    try {
      // ✅ FIXED: Removed double http://
      const response = await fetch(`${API_BASE_URL}/hotel/staff/${editStaff.staff_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: editStaff.full_name,
          email: editStaff.email,
          phone: editStaff.phone,
          role: editStaff.role,
          department: editStaff.department,
          salary: parseInt(editStaff.salary),
          shift: editStaff.shift,
          shift_start: editStaff.shift_start,
          shift_end: editStaff.shift_end,
          status: editStaff.status
        })
      });
      
      if (response.ok) {
        alert("✅ Staff member updated successfully!");
        setShowEditModal(false);
        setEditStaff(null);
        fetchStaff();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update staff");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("Failed to update staff");
    }
  };

  const deleteStaff = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        // ✅ FIXED: Removed double http://
        const response = await fetch(`${API_BASE_URL}/hotel/staff/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          alert("✅ Staff member deleted successfully!");
          fetchStaff();
        } else {
          const data = await response.json();
          alert(data.error || "Failed to delete staff");
        }
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Failed to delete staff");
      }
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                         s.email?.toLowerCase().includes(search.toLowerCase()) ||
                         s.role?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === "All" || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const onDuty = staff.filter(s => s.status === "active").length;
  const totalSalary = staff.reduce((sum, s) => sum + (s.salary || 0), 0);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div className="spinner"></div>
        <p>Loading staff...</p>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
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
      <div style={{ textAlign: "center", padding: "50px", color: "#dc2626" }}>
        <p>❌ {error}</p>
        <button onClick={fetchStaff} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>👥 Staff Management</div>
          <div style={styles.sub}>{staff.length} employees • {onDuty} currently on duty</div>
        </div>
        <button onClick={() => setShowAddModal(true)} style={styles.btnPrimary}>
          <FiPlus size={16} /> Add Employee
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statGrid}>
        <div style={{ ...styles.statCard, background: '#dbeafe' }}>
          <div><div style={{ fontSize: 28, fontWeight: 700, color: '#1e40af' }}>{staff.length}</div><div style={{ fontSize: 13, color: '#1e40af' }}>Total Staff</div></div>
          <FiUserPlus size={20} color="#1e40af" />
        </div>
        <div style={{ ...styles.statCard, background: '#dcfce7' }}>
          <div><div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>{onDuty}</div><div style={{ fontSize: 13, color: '#166534' }}>On Duty</div></div>
          <FiUserCheck size={20} color="#166534" />
        </div>
        <div style={{ ...styles.statCard, background: '#d1fae5' }}>
          <div><div style={{ fontSize: 28, fontWeight: 700, color: '#059669' }}>RWF {(totalSalary / 1000000).toFixed(1)}M</div><div style={{ fontSize: 13, color: '#059669' }}>Monthly Salary</div></div>
          <FiDollarSign size={20} color="#059669" />
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersCard}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {departments.map(d => (
              <button key={d} onClick={() => setFilterDept(d)} style={{ ...styles.filterBtn, background: filterDept === d ? "#667eea" : "white", color: filterDept === d ? "white" : "#374151" }}>
                {d}
              </button>
            ))}
          </div>
          <div style={{ position: "relative", minWidth: 260 }}>
            <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input placeholder="Search name, role, email..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div style={styles.tableWrap}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Department", "Role", "Phone", "Email", "Shift", "Status", "Actions"].map(h => <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                  No staff members found
                </td>
              </tr>
            ) : (
              filteredStaff.map(s => (
                <tr key={s.staff_id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={styles.avatar}>{s.full_name?.charAt(0)}</div>
                      <strong>{s.full_name}</strong>
                    </div>
                  </td>
                  <td style={styles.td}>{s.department || 'N/A'}</td>
                  <td style={styles.td}>{s.role || 'Staff'}</td>
                  <td style={styles.td}>{s.phone}</td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>
                    {s.shift || 'Day'}<br/>
                    <small style={{ fontSize: '10px', color: '#6b7280' }}>{s.shift_start || '08:00'} - {s.shift_end || '17:00'}</small>
                  </td>
                  <td style={styles.td}>
                    <Badge status={s.status === 'active' ? 'On duty' : s.status === 'inactive' ? 'Off duty' : 'On leave'} />
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setSelectedStaff(s); setShowViewModal(true); }} style={styles.btnSm} title="View"><FiEye size={12} /></button>
                      <button onClick={() => { setEditStaff({ ...s }); setShowEditModal(true); }} style={styles.btnSm} title="Edit"><FiEdit2 size={12} /></button>
                      <button onClick={() => deleteStaff(s.staff_id, s.full_name)} style={styles.btnDanger} title="Delete"><FiTrash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && selectedStaff && (
        <div style={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Staff Details - {selectedStaff.full_name}</h3>
              <button onClick={() => setShowViewModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.infoRow}><label>Full Name:</label><span>{selectedStaff.full_name}</span></div>
              <div style={styles.infoRow}><label>Email:</label><span>{selectedStaff.email}</span></div>
              <div style={styles.infoRow}><label>Phone:</label><span>{selectedStaff.phone}</span></div>
              <div style={styles.infoRow}><label>Department:</label><span>{selectedStaff.department || 'N/A'}</span></div>
              <div style={styles.infoRow}><label>Role:</label><span>{selectedStaff.role || 'Staff'}</span></div>
              <div style={styles.infoRow}><label>Salary:</label><span>RWF {selectedStaff.salary?.toLocaleString()}</span></div>
              <div style={styles.infoRow}><label>Shift:</label><span>{selectedStaff.shift || 'Day'} ({selectedStaff.shift_start || '08:00'} - {selectedStaff.shift_end || '17:00'})</span></div>
              <div style={styles.infoRow}><label>Joined Date:</label><span>{selectedStaff.joined_date ? new Date(selectedStaff.joined_date).toLocaleDateString() : 'N/A'}</span></div>
              <div style={styles.infoRow}><label>Status:</label><span><Badge status={selectedStaff.status === 'active' ? 'On duty' : 'Off duty'} /></span></div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowViewModal(false)} style={styles.cancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editStaff && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Edit Staff - {editStaff.full_name}</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label>Full Name</label><input type="text" value={editStaff.full_name} onChange={(e) => setEditStaff({...editStaff, full_name: e.target.value})} style={styles.input} /></div>
                <div><label>Email</label><input type="email" value={editStaff.email} onChange={(e) => setEditStaff({...editStaff, email: e.target.value})} style={styles.input} /></div>
                <div><label>Phone</label><input type="tel" value={editStaff.phone} onChange={(e) => setEditStaff({...editStaff, phone: e.target.value})} style={styles.input} /></div>
                <div><label>Department</label><select value={editStaff.department} onChange={(e) => setEditStaff({...editStaff, department: e.target.value})} style={styles.input}>
                  {departments.filter(d => d !== "All").map(d => <option key={d}>{d}</option>)}
                </select></div>
                <div><label>Role</label><input type="text" value={editStaff.role} onChange={(e) => setEditStaff({...editStaff, role: e.target.value})} style={styles.input} /></div>
                <div><label>Salary (RWF)</label><input type="number" value={editStaff.salary} onChange={(e) => setEditStaff({...editStaff, salary: parseInt(e.target.value)})} style={styles.input} /></div>
                <div><label>Shift</label><select value={editStaff.shift} onChange={(e) => setEditStaff({...editStaff, shift: e.target.value})} style={styles.input}>
                  <option>Day</option><option>Night</option><option>Rotating</option>
                </select></div>
                <div><label>Status</label><select value={editStaff.status} onChange={(e) => setEditStaff({...editStaff, status: e.target.value})} style={styles.input}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="on_leave">On Leave</option>
                </select></div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={updateStaff} style={styles.saveBtn}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Add New Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label>Full Name *</label><input type="text" placeholder="Full Name" value={newStaff.full_name} onChange={(e) => setNewStaff({...newStaff, full_name: e.target.value})} style={styles.input} /></div>
                <div><label>Email *</label><input type="email" placeholder="Email" value={newStaff.email} onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} style={styles.input} /></div>
                <div><label>Phone *</label><input type="tel" placeholder="Phone" value={newStaff.phone} onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})} style={styles.input} /></div>
                <div><label>Department</label><select value={newStaff.department} onChange={(e) => setNewStaff({...newStaff, department: e.target.value})} style={styles.input}>
                  {departments.filter(d => d !== "All").map(d => <option key={d}>{d}</option>)}
                </select></div>
                <div><label>Role</label><input type="text" placeholder="Role" value={newStaff.role} onChange={(e) => setNewStaff({...newStaff, role: e.target.value})} style={styles.input} /></div>
                <div><label>Salary (RWF)</label><input type="number" placeholder="Salary" value={newStaff.salary} onChange={(e) => setNewStaff({...newStaff, salary: parseInt(e.target.value)})} style={styles.input} /></div>
                <div><label>Shift</label><select value={newStaff.shift} onChange={(e) => setNewStaff({...newStaff, shift: e.target.value})} style={styles.input}>
                  <option>Day</option><option>Night</option><option>Rotating</option>
                </select></div>
                <div><label>Joined Date</label><input type="date" value={newStaff.joined_date} onChange={(e) => setNewStaff({...newStaff, joined_date: e.target.value})} style={styles.input} /></div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={addStaff} style={styles.saveBtn}>Add Staff</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: "24px", background: "#f3f4f6", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 15 },
  title: { fontSize: 24, fontWeight: 700, color: "#111827" },
  sub: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  btnPrimary: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 },
  btnSm: { padding: "6px 10px", borderRadius: 6, border: "0.5px solid #d1d5db", background: "#f9fafb", color: "#374151", cursor: "pointer" },
  btnDanger: { padding: "6px 10px", borderRadius: 6, border: "none", background: "#ef4444", color: "white", cursor: "pointer" },
  tableWrap: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", overflowX: "auto" },
  th: { textAlign: "left", padding: "14px 16px", fontSize: 12, color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  td: { padding: "14px 16px", borderBottom: "1px solid #f3f4f6", color: "#111827", fontSize: 13, verticalAlign: "middle" },
  tableRow: { borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1e40af" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" },
  filtersCard: { background: "white", padding: "20px", borderRadius: 12, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  filterBtn: { fontSize: 12, padding: "6px 14px", borderRadius: 20, border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.2s" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px 9px 35px", fontSize: 13 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "white", borderRadius: 16, width: "90%", maxWidth: "600px", maxHeight: "90vh", overflow: "auto" },
  modalHeader: { padding: "20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalBody: { padding: "20px" },
  modalFooter: { padding: "20px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 12 },
  infoRow: { display: "flex", padding: "8px 0", borderBottom: "1px solid #f3f4f6" },
  input: { width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, marginTop: 4, marginBottom: 12 },
  closeBtn: { background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280" },
  cancelBtn: { padding: "8px 16px", background: "#f3f4f6", border: "none", borderRadius: 6, cursor: "pointer" },
  saveBtn: { padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  retryBtn: { marginTop: 16, padding: "8px 20px", background: "#667eea", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }
};

const Badge = ({ status }) => {
  const map = { 
    "On duty": { bg: "#dcfce7", color: "#166534", icon: <FiCheckCircle size={12} /> }, 
    "Off duty": { bg: "#f3f4f6", color: "#6b7280", icon: <FiUserX size={12} /> }, 
    "On leave": { bg: "#fef9c3", color: "#854d0e", icon: <FiClock size={12} /> } 
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#6b7280", icon: null };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.icon} {status}
    </span>
  );
};

export default Staff;