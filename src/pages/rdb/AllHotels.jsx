// pages/rdb/AllHotels.jsx
import React, { useState, useEffect } from 'react';
import { FiEye, FiSearch, FiDownload, FiMapPin, FiCheck, FiX, FiClock } from 'react-icons/fi';

const AllHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // ✅ CORRECTED: Single source of truth for API URL
  const API_BASE_URL = 'https://rhms-backend.onrender.com/api';
  
  // Fix: Use consistent token key
  const token = localStorage.getItem("token") || localStorage.getItem("rdbToken");

  useEffect(() => {
    if (token) {
      loadHotels();
    } else {
      setError("Please login to view hotels");
      setLoading(false);
    }
  }, [token]);

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: Removed the double http://
      const response = await fetch(`${API_BASE_URL}/rdb/all-hotels`, {
        method: 'GET',
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/rdb/login';
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Hotels loaded:', data.length);
      setHotels(data);
    } catch (error) {
      console.error("Error loading hotels:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateHotelStatus = async (hotelId, status) => {
    if (window.confirm(`Are you sure you want to ${status} this hotel?`)) {
      try {
        // ✅ FIXED: Removed the double http://
        const response = await fetch(`${API_BASE_URL}/rdb/hotels/${hotelId}/${status}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          alert(`Hotel ${status}d successfully!`);
          loadHotels(); // Refresh the list
          setShowModal(false);
        } else {
          const error = await response.json();
          alert(error.error || "Failed to update hotel status");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to update hotel status");
      }
    }
  };

  const viewHotelDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = { 
      approved: { bg: '#d1fae5', color: '#065f46', text: 'Approved', icon: <FiCheck size={12} /> },
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending', icon: <FiClock size={12} /> },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Rejected', icon: <FiX size={12} /> }
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {s.icon} {s.text}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Hotel Name', 'City', 'Email', 'Contact Person', 'Phone', 'Rooms', 'Staff', 'Status', 'Registered Date'];
    const csvData = filteredHotels.map(hotel => [
      hotel.hotel_name,
      hotel.city || 'N/A',
      hotel.email,
      hotel.contact_person || 'N/A',
      hotel.phone,
      hotel.total_rooms || 0,
      hotel.staff_count || 0,
      hotel.status,
      new Date(hotel.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotels-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredHotels = hotels.filter(hotel =>
    (hotel.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     hotel.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || hotel.status === statusFilter)
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{ marginTop: '20px' }}>Loading hotels...</p>
        <style>{`
          .spinner-border {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
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
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '18px', marginBottom: '20px' }}>❌ {error}</div>
        <button onClick={loadHotels} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Modal for Hotel Details */}
      {showModal && selectedHotel && (
        <div style={{
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
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>{selectedHotel.hotel_name}</h3>
            <div style={{ marginBottom: '16px' }}>
              <p><strong>📍 Location:</strong> {selectedHotel.city}, {selectedHotel.country || 'Rwanda'}</p>
              <p><strong>📧 Email:</strong> {selectedHotel.email}</p>
              <p><strong>📞 Phone:</strong> {selectedHotel.phone}</p>
              <p><strong>👤 Contact Person:</strong> {selectedHotel.contact_person || 'N/A'}</p>
              <p><strong>🛏️ Total Rooms:</strong> {selectedHotel.total_rooms || 0}</p>
              <p><strong>👥 Staff Count:</strong> {selectedHotel.staff_count || 0}</p>
              <p><strong>📅 Registered:</strong> {new Date(selectedHotel.created_at).toLocaleDateString()}</p>
              <p><strong>📋 Status:</strong> {getStatusBadge(selectedHotel.status)}</p>
              {selectedHotel.description && <p><strong>📝 Description:</strong> {selectedHotel.description}</p>}
              {selectedHotel.website && <p><strong>🌐 Website:</strong> <a href={selectedHotel.website} target="_blank" rel="noopener noreferrer">{selectedHotel.website}</a></p>}
            </div>
            {selectedHotel.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button onClick={() => updateHotelStatus(selectedHotel.hotel_id, 'approve')} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✓ Approve</button>
                <button onClick={() => updateHotelStatus(selectedHotel.hotel_id, 'reject')} style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✗ Reject</button>
              </div>
            )}
            <button onClick={() => setShowModal(false)} style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>🏨 All Registered Hotels</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>View and manage all hotels in the system</p>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search by hotel name, city, or email..." 
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button 
            onClick={exportToCSV}
            style={{ padding: '8px 16px', border: '1px solid #10b981', background: 'white', borderRadius: '8px', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Hotels Table */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {filteredHotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            No hotels found matching your criteria
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Hotel Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>City</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Contact Person</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Rooms</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Staff</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Registered</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map(hotel => (
                <tr key={hotel.hotel_id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{hotel.hotel_name}</td>
                  <td style={{ padding: '12px' }}><FiMapPin size={12} style={{ marginRight: '4px', color: '#6b7280' }} /> {hotel.city || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>{hotel.email}</td>
                  <td style={{ padding: '12px' }}>{hotel.contact_person || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{hotel.phone}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{hotel.total_rooms || 0}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{hotel.staff_count || 0}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{getStatusBadge(hotel.status)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{new Date(hotel.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => viewHotelDetails(hotel)} 
                      style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    >
                      <FiEye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'white', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <strong>Total Hotels:</strong> {hotels.length} | 
          <strong style={{ marginLeft: '16px' }}>Approved:</strong> {hotels.filter(h => h.status === 'approved').length} |
          <strong style={{ marginLeft: '16px' }}>Pending:</strong> {hotels.filter(h => h.status === 'pending').length} |
          <strong style={{ marginLeft: '16px' }}>Rejected:</strong> {hotels.filter(h => h.status === 'rejected').length}
        </div>
        <div>
          <strong>Showing:</strong> {filteredHotels.length} of {hotels.length} hotels
        </div>
      </div>
    </div>
  );
};

export default AllHotels;