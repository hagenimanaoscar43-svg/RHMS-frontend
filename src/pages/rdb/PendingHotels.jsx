// pages/rdb/PendingHotels.jsx
import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiSearch } from 'react-icons/fi';

const PendingHotels = () => {
  const [pendingHotels, setPendingHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // ✅ CORRECTED: Single source of truth for API URL
  const API_BASE_URL = 'https://rhms-backend.onrender.com/api';
  
  // Fix: Use consistent token key
  const token = localStorage.getItem("token") || localStorage.getItem("rdbToken");

  useEffect(() => {
    if (token) {
      loadPendingHotels();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadPendingHotels = async () => {
    setLoading(true);
    try {
      // ✅ FIXED: Removed the double http://
      const response = await fetch(`${API_BASE_URL}/rdb/pending-hotels`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingHotels(data);
      } else if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/rdb/login';
      }
    } catch (error) {
      console.error("Error loading pending hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hotelId) => {
    if (window.confirm('Approve this hotel?')) {
      try {
        // ✅ FIXED: Removed the double http://
        const response = await fetch(`${API_BASE_URL}/rdb/hotels/${hotelId}/approve`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          alert(`Hotel approved successfully!`);
          loadPendingHotels();
          setShowModal(false);
        } else {
          const error = await response.json();
          alert(error.error || "Failed to approve hotel");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to approve hotel");
      }
    }
  };

  const handleReject = async (hotelId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        // ✅ FIXED: Removed the double http://
        const response = await fetch(`${API_BASE_URL}/rdb/hotels/${hotelId}/reject`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        });
        if (response.ok) {
          alert(`Hotel rejected. Reason: ${reason}`);
          loadPendingHotels();
          setShowModal(false);
        } else {
          const error = await response.json();
          alert(error.error || "Failed to reject hotel");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to reject hotel");
      }
    }
  };

  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHotel(null);
  };

  const filteredHotels = pendingHotels.filter(hotel =>
    hotel.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{ marginTop: '20px' }}>Loading pending hotels...</p>
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

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>⏳ Pending Hotel Registrations</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Review and approve hotel registration requests</p>
      </div>

      {/* Search Bar */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search by hotel name, city, or contact person..." 
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div>
            <span style={{ padding: '8px 16px', background: '#fef3c7', borderRadius: '8px', color: '#92400e', fontSize: '14px' }}>
              {pendingHotels.length} Pending {pendingHotels.length === 1 ? 'Hotel' : 'Hotels'}
            </span>
          </div>
        </div>
      </div>

      {/* Hotels Table */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {filteredHotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            {searchTerm ? 'No pending hotels match your search' : 'No pending hotels found'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#fef3c7', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Hotel Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Contact Person</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>City</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Rooms</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Staff</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Registered</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map(hotel => (
                <tr key={hotel.hotel_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{hotel.hotel_name}</td>
                  <td style={{ padding: '12px' }}>{hotel.contact_person || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>{hotel.email}</td>
                  <td style={{ padding: '12px' }}>{hotel.phone || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{hotel.city || 'N/A'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{hotel.total_rooms || 0}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{hotel.staff_count || 0}</td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(hotel.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleApprove(hotel.hotel_id)} 
                        style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <FiCheck size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(hotel.hotel_id)} 
                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <FiX size={14} /> Reject
                      </button>
                      <button 
                        onClick={() => handleViewDetails(hotel)} 
                        style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <FiEye size={14} /> View
                      </button>
                    </div>
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
          <strong>Total Pending:</strong> {pendingHotels.length} hotels awaiting review
        </div>
        <button onClick={loadPendingHotels} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Modal for viewing hotel details */}
      {showModal && selectedHotel && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000 
        }} onClick={closeModal}>
          <div style={{ 
            backgroundColor: 'white', borderRadius: '12px', width: '90%', 
            maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' 
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#f59e0b' }}>Hotel Details</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '15px' }}>{selectedHotel.hotel_name}</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <strong>Contact Person:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.email}</p>
                </div>
                <div>
                  <strong>Phone:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.phone || 'N/A'}</p>
                </div>
                <div>
                  <strong>City:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.city || 'N/A'}</p>
                </div>
                <div>
                  <strong>Address:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.address || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Website:</strong>
                  <p style={{ margin: '5px 0' }}>
                    {selectedHotel.website ? (
                      <a href={`https://${selectedHotel.website}`} target="_blank" rel="noopener noreferrer">
                        {selectedHotel.website}
                      </a>
                    ) : 'Not provided'}
                  </p>
                </div>
                <div>
                  <strong>Total Rooms:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.total_rooms || 0}</p>
                </div>
                <div>
                  <strong>Staff Count:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.staff_count || 0}</p>
                </div>
                <div>
                  <strong>Registration Date:</strong>
                  <p style={{ margin: '5px 0' }}>{new Date(selectedHotel.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <strong>Registration Number:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.registration_number || 'N/A'}</p>
                </div>
                <div>
                  <strong>Tax ID:</strong>
                  <p style={{ margin: '5px 0' }}>{selectedHotel.tax_id || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <strong>Description:</strong>
                <p style={{ margin: '5px 0' }}>{selectedHotel.description || 'No description provided'}</p>
              </div>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Close</button>
              <button onClick={() => { handleApprove(selectedHotel.hotel_id); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer' }}>✓ Approve</button>
              <button onClick={() => { handleReject(selectedHotel.hotel_id); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}>✗ Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingHotels;