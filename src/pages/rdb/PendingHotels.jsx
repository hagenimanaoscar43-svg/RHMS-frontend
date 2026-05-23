// pages/rdb/PendingHotels.jsx
import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiSearch } from 'react-icons/fi';

const PendingHotels = () => {
  const [pendingHotels, setPendingHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("rdbToken");

  useEffect(() => {
    if (token) {
      loadPendingHotels();
    }
  }, [token]);

  const loadPendingHotels = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/rdb/pending-hotels", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingHotels(data);
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
        const response = await fetch(`http://https://rhms-backend.onrender.com/api/rdb/hotels/${hotelId}/approve`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          alert(`Hotel approved successfully!`);
          loadPendingHotels();
        }
      } catch (error) {
        alert("Failed to approve hotel");
      }
    }
  };

  const handleReject = async (hotelId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        const response = await fetch(`http://https://rhms-backend.onrender.com/api/rdb/hotels/${hotelId}/reject`, {
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
        }
      } catch (error) {
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
    hotel.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading pending hotels...</div>;
  }

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>⏳ Pending Hotel Registrations</h2>
        <p style={{ color: '#6b7280' }}>Review and approve hotel registration requests</p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search hotels..." style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '8px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fef3c7', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px' }}>Hotel Name</th><th>Contact</th><th>Email</th><th>Phone</th><th>City</th><th>Rooms</th><th>Staff</th><th>Registered</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map(hotel => (
              <tr key={hotel.hotel_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>{hotel.hotel_name}</td>
                <td style={{ padding: '12px' }}>{hotel.contact_person}</td>
                <td style={{ padding: '12px' }}>{hotel.email}</td>
                <td style={{ padding: '12px' }}>{hotel.phone}</td>
                <td style={{ padding: '12px' }}>{hotel.city}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{hotel.total_rooms}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{hotel.staff_count}</td>
                <td style={{ padding: '12px' }}>{new Date(hotel.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <button className="btn btn-sm btn-success me-1" onClick={() => handleApprove(hotel.hotel_id)}><FiCheck /> Approve</button>
                  <button className="btn btn-sm btn-danger me-1" onClick={() => handleReject(hotel.hotel_id)}><FiX /> Reject</button>
                  <button className="btn btn-sm btn-info" onClick={() => handleViewDetails(hotel)}><FiEye /> View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing hotel details */}
      {showModal && selectedHotel && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeModal}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Hotel Details</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <h4 style={{ color: '#f59e0b', marginBottom: '15px' }}>{selectedHotel.hotel_name}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div><strong>Contact Person:</strong><p>{selectedHotel.contact_person}</p></div>
                <div><strong>Email:</strong><p>{selectedHotel.email}</p></div>
                <div><strong>Phone:</strong><p>{selectedHotel.phone}</p></div>
                <div><strong>City:</strong><p>{selectedHotel.city}</p></div>
                <div><strong>Address:</strong><p>{selectedHotel.address || 'Not provided'}</p></div>
                <div><strong>Website:</strong><p>{selectedHotel.website ? <a href={`https://${selectedHotel.website}`} target="_blank" rel="noopener noreferrer">{selectedHotel.website}</a> : 'Not provided'}</p></div>
                <div><strong>Total Rooms:</strong><p>{selectedHotel.total_rooms}</p></div>
                <div><strong>Staff Count:</strong><p>{selectedHotel.staff_count}</p></div>
                <div><strong>Registration Date:</strong><p>{selectedHotel.created_at}</p></div>
              </div>
              <div><strong>Description:</strong><p>{selectedHotel.description || 'No description provided'}</p></div>
              <div><strong>Amenities:</strong><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>{selectedHotel.amenities?.map((amenity, idx) => <span key={idx} style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' }}>{amenity}</span>) || <span>No amenities listed</span>}</div></div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Close</button>
              <button onClick={() => { handleApprove(selectedHotel.hotel_id); closeModal(); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer' }}>Approve</button>
              <button onClick={() => { handleReject(selectedHotel.hotel_id); closeModal(); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingHotels;