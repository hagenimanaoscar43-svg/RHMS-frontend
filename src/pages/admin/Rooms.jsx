// Rooms.jsx - Load real room data from database with Block/Unblock feature
import React, { useState, useEffect } from "react";
import { 
  FiEdit2, FiPower, FiCheckCircle, FiXCircle, FiSearch, FiPlus, 
  FiTrash2, FiEye, FiFilter, FiGrid, FiList, FiHome, FiUsers,
  FiDollarSign, FiMapPin, FiRefreshCw, FiSave, FiX,
  FiTool, FiCalendar, FiAlertCircle, FiCheck, FiWifi, FiTv, FiWind,
  FiCoffee, FiSun, FiMinus, FiLock, FiUnlock, FiPlus as FiPlusIcon
} from "react-icons/fi";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [maintenanceDetails, setMaintenanceDetails] = useState({
    issue: '', priority: 'medium', estimatedDays: 1, notes: ''
  });
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [updating, setUpdating] = useState(false);
  const [newRoom, setNewRoom] = useState({ 
    room_number: '', room_type: 'Standard', floor: 1, capacity: 2, 
    price_per_night: 100000, amenities: ['WiFi', 'TV', 'AC'], description: '' 
  });

  const token = localStorage.getItem("hotelToken") || localStorage.getItem("token");
  const availableAmenities = ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Sea View', 'Pool Access', 'Gym Access', 'Room Service', 'Breakfast', 'Parking', 'Spa'];

  useEffect(() => {
    if (token) {
      fetchRooms();
    } else {
      setError("Please login again");
      setLoading(false);
    }
  }, [token]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/hotel/rooms", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/hotel/login";
        return;
      }
      
      const data = await response.json();
      if (response.ok) {
        setRooms(data);
      } else {
        setError(data.error || "Failed to fetch rooms");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async () => {
    if (!newRoom.room_number || !newRoom.room_type || !newRoom.price_per_night) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch("http://localhost:5001/api/hotel/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newRoom)
      });
      if (response.ok) {
        setShowAddModal(false);
        fetchRooms();
        setNewRoom({ 
          room_number: '', room_type: 'Standard', floor: 1, capacity: 2, 
          price_per_night: 100000, amenities: ['WiFi', 'TV', 'AC'], description: '' 
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add room");
      }
    } catch (error) {
      alert("Failed to add room");
    }
  };

  const updateRoomStatus = async (roomId, status, maintenanceReason = "") => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:5001/api/hotel/rooms/${roomId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, maintenance_reason: maintenanceReason })
      });
      if (response.ok) {
        fetchRooms();
        setShowMaintenanceModal(false);
        setSelectedRoom(null);
        alert(`Room status updated to ${status}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update room status");
      }
    } catch (error) {
      alert("Failed to update room status");
    } finally {
      setUpdating(false);
    }
  };

  const toggleRoomBlock = async (roomId, currentStatus, roomNumber) => {
    const newStatus = currentStatus === 'blocked' ? 'available' : 'blocked';
    
    if (newStatus === 'blocked') {
      setSelectedRoom({ room_id: roomId, room_number: roomNumber });
      setBlockReason('');
      setShowBlockModal(true);
      return;
    }
    
    // Unblock directly without reason
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:5001/api/hotel/rooms/${roomId}/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, reason: null })
      });
      
      if (response.ok) {
        alert(`Room ${roomNumber} has been unblocked successfully!`);
        fetchRooms();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update room status");
      }
    } catch (error) {
      console.error("Error updating room status:", error);
      alert("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const confirmBlockRoom = async () => {
    if (!selectedRoom) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:5001/api/hotel/rooms/${selectedRoom.room_id}/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'blocked', reason: blockReason || null })
      });
      
      if (response.ok) {
        alert(`Room ${selectedRoom.room_number} has been blocked successfully!`);
        setShowBlockModal(false);
        setSelectedRoom(null);
        setBlockReason('');
        fetchRooms();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to block room");
      }
    } catch (error) {
      console.error("Error blocking room:", error);
      alert("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      // Add delete endpoint if available
      fetchRooms();
    }
  };

  const editRoom = (room) => {
    setEditingRoom({ ...room });
    setShowEditModal(true);
  };

  const updateRoom = async () => {
    // Add update endpoint if available
    setShowEditModal(false);
    setEditingRoom(null);
    fetchRooms();
  };

  const openMaintenanceModal = (room) => {
    setSelectedRoom(room);
    setMaintenanceDetails({ issue: '', priority: 'medium', estimatedDays: 1, notes: '' });
    setShowMaintenanceModal(true);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return { bg: '#d1fae5', color: '#065f46', icon: <FiCheckCircle size={12} />, text: 'AVAILABLE' };
      case 'booked':
        return { bg: '#fed7aa', color: '#92400e', icon: <FiXCircle size={12} />, text: 'BOOKED' };
      case 'maintenance':
        return { bg: '#fee2e2', color: '#991b1b', icon: <FiTool size={12} />, text: 'MAINTENANCE' };
      case 'blocked':
        return { bg: '#e0e7ff', color: '#1e40af', icon: <FiLock size={12} />, text: 'BLOCKED' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', icon: null, text: status?.toUpperCase() || 'UNKNOWN' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p>Loading rooms...</p>
      </div>
    );
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number?.toString().includes(searchTerm) || 
                         room.room_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesType = filterType === 'all' || room.room_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    booked: rooms.filter(r => r.status === 'booked').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    blocked: rooms.filter(r => r.status === 'blocked').length,
  };

  const getRoomIcon = (type) => {
    switch(type) {
      case 'Standard': return '🛏️';
      case 'Deluxe': return '✨';
      case 'Suite': return '👑';
      case 'Executive': return '💼';
      default: return '🏠';
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiHome size={28} /> Room Management
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0' }}>Manage room inventory, availability, and maintenance</p>
          </div>
          <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
            <FiPlus size={18} /> Add New Room
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={styles.statCard}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Rooms</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.total}</div>
        </div>
        <div style={{ ...styles.statCard, background: '#d1fae5' }}>
          <div style={{ fontSize: '12px', color: '#065f46' }}>Available</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#065f46' }}>{stats.available}</div>
        </div>
        <div style={{ ...styles.statCard, background: '#fed7aa' }}>
          <div style={{ fontSize: '12px', color: '#92400e' }}>Booked</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>{stats.booked}</div>
        </div>
        <div style={{ ...styles.statCard, background: '#fee2e2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiTool size={16} color="#991b1b" />
            <div style={{ fontSize: '12px', color: '#991b1b' }}>Maintenance</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#991b1b' }}>{stats.maintenance}</div>
        </div>
        <div style={{ ...styles.statCard, background: '#e0e7ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiLock size={16} color="#1e40af" />
            <div style={{ fontSize: '12px', color: '#1e40af' }}>Blocked</div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>{stats.blocked}</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#fee2e2', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      
      {/* Filters */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search by room number, type..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', minWidth: '140px' }}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
            <option value="blocked">Blocked</option>
          </select>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', minWidth: '140px' }}
          >
            <option value="all">All Types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Executive">Executive</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <FiHome size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
          <h3>No rooms found</h3>
          <p style={{ color: '#6b7280' }}>Try adjusting your search or add a new room</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {filteredRooms.map(room => {
            const statusBadge = getStatusBadge(room.status);
            return (
              <div key={room.room_id} style={styles.roomCard}>
                <div style={{ 
                  ...styles.roomHeader, 
                  background: room.status === 'maintenance' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 
                             room.status === 'booked' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                             room.status === 'blocked' ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : 
                             'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                }}>
                  <div>
                    <div style={{ fontSize: '32px' }}>{getRoomIcon(room.room_type)}</div>
                    <h3 style={{ margin: '8px 0 4px', fontSize: '18px' }}>Room {room.room_number}</h3>
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>{room.room_type}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {room.status === 'available' && (
                      <button 
                        onClick={() => openMaintenanceModal(room)} 
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '10px', color: 'white' }}
                        title="Set Maintenance"
                      >
                        <FiTool size={18} />
                      </button>
                    )}
                    {(room.status === 'available' || room.status === 'blocked') && (
                      <button 
                        onClick={() => toggleRoomBlock(room.room_id, room.status, room.room_number)} 
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '10px', color: 'white' }}
                        title={room.status === 'blocked' ? "Unblock Room" : "Block Room"}
                      >
                        {room.status === 'blocked' ? <FiUnlock size={18} /> : <FiLock size={18} />}
                      </button>
                    )}
                    <button 
                      onClick={() => editRoom(room)} 
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '10px', color: 'white' }}
                      title="Edit Room"
                    >
                      <FiEdit2 size={18} />
                    </button>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', color: '#6b7280' }}>
                    <span><FiMapPin size={14} /> Floor {room.floor}</span>
                    <span><FiUsers size={14} /> Max {room.capacity}</span>
                    <span><FiDollarSign size={14} /> {room.price_per_night?.toLocaleString()} RWF</span>
                  </div>
                  {room.description && (
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>{room.description.substring(0, 100)}...</p>
                  )}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {room.amenities?.slice(0, 4).map((a, i) => (
                      <span key={i} style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: '6px', fontSize: '11px' }}>{a}</span>
                    ))}
                    {room.amenities?.length > 4 && (
                      <span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: '6px', fontSize: '11px' }}>+{room.amenities.length - 4}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      background: statusBadge.bg,
                      color: statusBadge.color
                    }}>
                      {statusBadge.icon} {statusBadge.text}
                    </span>
                    <button 
                      onClick={() => editRoom(room)} 
                      style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                      <FiEdit2 size={14} /> Edit
                    </button>
                  </div>
                  {room.maintenance_reason && room.status === 'maintenance' && (
                    <div style={{ marginTop: '12px', padding: '8px', background: '#fef2e2', borderRadius: '6px', fontSize: '11px', color: '#92400e' }}>
                      <strong>Issue:</strong> {room.maintenance_reason}
                    </div>
                  )}
                  {room.maintenance_reason && room.status === 'blocked' && (
                    <div style={{ marginTop: '12px', padding: '8px', background: '#e0e7ff', borderRadius: '6px', fontSize: '11px', color: '#1e40af' }}>
                      <strong>Block Reason:</strong> {room.maintenance_reason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Add New Room</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label>Room Number *</label><input type="text" placeholder="101" value={newRoom.room_number} onChange={(e) => setNewRoom({...newRoom, room_number: e.target.value})} style={styles.input} /></div>
                <div><label>Room Type *</label><select value={newRoom.room_type} onChange={(e) => setNewRoom({...newRoom, room_type: e.target.value})} style={styles.input}><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Executive</option></select></div>
                <div><label>Floor</label><input type="number" value={newRoom.floor} onChange={(e) => setNewRoom({...newRoom, floor: parseInt(e.target.value)})} style={styles.input} /></div>
                <div><label>Capacity</label><input type="number" value={newRoom.capacity} onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} style={styles.input} /></div>
                <div><label>Price per Night (RWF)</label><input type="number" value={newRoom.price_per_night} onChange={(e) => setNewRoom({...newRoom, price_per_night: parseInt(e.target.value)})} style={styles.input} /></div>
                <div><label>Description</label><textarea value={newRoom.description} onChange={(e) => setNewRoom({...newRoom, description: e.target.value})} style={styles.input} rows="2" /></div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={addRoom} style={styles.saveBtn}>Add Room</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && editingRoom && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Edit Room {editingRoom.room_number}</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label>Room Number</label><input type="text" value={editingRoom.room_number} onChange={(e) => setEditingRoom({...editingRoom, room_number: e.target.value})} style={styles.input} /></div>
                <div><label>Room Type</label><select value={editingRoom.room_type} onChange={(e) => setEditingRoom({...editingRoom, room_type: e.target.value})} style={styles.input}><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Executive</option></select></div>
                <div><label>Floor</label><input type="number" value={editingRoom.floor} onChange={(e) => setEditingRoom({...editingRoom, floor: parseInt(e.target.value)})} style={styles.input} /></div>
                <div><label>Capacity</label><input type="number" value={editingRoom.capacity} onChange={(e) => setEditingRoom({...editingRoom, capacity: parseInt(e.target.value)})} style={styles.input} /></div>
                <div><label>Price per Night</label><input type="number" value={editingRoom.price_per_night} onChange={(e) => setEditingRoom({...editingRoom, price_per_night: parseInt(e.target.value)})} style={styles.input} /></div>
                <div><label>Description</label><textarea value={editingRoom.description} onChange={(e) => setEditingRoom({...editingRoom, description: e.target.value})} style={styles.input} rows="2" /></div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={updateRoom} style={styles.saveBtn}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedRoom && (
        <div style={styles.modalOverlay} onClick={() => setShowMaintenanceModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Maintenance for Room {selectedRoom.room_number}</h3>
              <button onClick={() => setShowMaintenanceModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div><label>Issue Description *</label><textarea value={maintenanceDetails.issue} onChange={(e) => setMaintenanceDetails({...maintenanceDetails, issue: e.target.value})} style={styles.input} rows="3" placeholder="Describe the maintenance issue..." /></div>
              <div><label>Priority</label><select value={maintenanceDetails.priority} onChange={(e) => setMaintenanceDetails({...maintenanceDetails, priority: e.target.value})} style={styles.input}><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></div>
              <div><label>Estimated Days</label><input type="number" value={maintenanceDetails.estimatedDays} onChange={(e) => setMaintenanceDetails({...maintenanceDetails, estimatedDays: parseInt(e.target.value)})} style={styles.input} /></div>
              <div><label>Additional Notes</label><textarea value={maintenanceDetails.notes} onChange={(e) => setMaintenanceDetails({...maintenanceDetails, notes: e.target.value})} style={styles.input} rows="2" /></div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowMaintenanceModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={() => updateRoomStatus(selectedRoom.room_id, 'maintenance', maintenanceDetails.issue)} style={styles.warningBtn}>Set Maintenance</button>
            </div>
          </div>
        </div>
      )}

      {/* Block Room Modal */}
      {showBlockModal && selectedRoom && (
        <div style={styles.modalOverlay} onClick={() => setShowBlockModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Block Room {selectedRoom.room_number}</h3>
              <button onClick={() => setShowBlockModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div>
                <label>Reason for blocking (optional)</label>
                <textarea 
                  value={blockReason} 
                  onChange={(e) => setBlockReason(e.target.value)} 
                  style={styles.input} 
                  rows="3" 
                  placeholder="Enter reason for blocking this room (e.g., under renovation, technical issues, etc.)"
                />
              </div>
              <div style={{ marginTop: '12px', padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                <strong>Note:</strong> Blocked rooms will not be available for booking until unblocked.
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowBlockModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmBlockRoom} style={styles.blockBtn}>Block Room</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  addButton: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 24px', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '600' 
  },
  statCard: { 
    background: 'white', 
    padding: '20px', 
    borderRadius: '12px', 
    flex: 1, 
    minWidth: '150px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
  },
  roomCard: { 
    background: 'white', 
    borderRadius: '16px', 
    overflow: 'hidden', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  roomHeader: { 
    padding: '20px', 
    color: 'white', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'start' 
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalBody: {
    padding: '20px'
  },
  modalFooter: {
    padding: '20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginTop: '4px',
    marginBottom: '12px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  saveBtn: {
    padding: '10px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  warningBtn: {
    padding: '10px 20px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  blockBtn: {
    padding: '10px 20px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default Rooms;