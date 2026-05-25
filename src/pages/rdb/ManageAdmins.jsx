// pages/rdb/ManageAdmins.jsx
import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiTrash2, FiEdit2, FiShield, FiUser, FiRefreshCw } from 'react-icons/fi';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    phone: '',
    password: '', 
    role: 'rdb' 
  });
  
  // ✅ CORRECTED: Single source of truth for API URL
  const API_BASE_URL = 'https://rhms-backend.onrender.com/api';
  
  // Fix: Use consistent token key
  const token = localStorage.getItem("token") || localStorage.getItem("rdbToken");

  useEffect(() => {
    if (token) {
      loadAdmins();
    } else {
      setError("Please login to manage admins");
      setLoading(false);
    }
  }, [token]);

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: Removed the double http://
      const response = await fetch(`${API_BASE_URL}/rdb/admins`, {
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
      console.log('Admins loaded:', data);
      setAdmins(data);
    } catch (error) {
      console.error("Error loading admins:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || (!editingAdmin && !formData.password)) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      // ✅ FIXED: Removed the double http://
      const url = editingAdmin 
        ? `${API_BASE_URL}/rdb/admins/${editingAdmin.admin_id}`
        : `${API_BASE_URL}/rdb/admins`;
      
      const method = editingAdmin ? "PUT" : "POST";
      
      // For update, don't send password if empty
      const submitData = { ...formData };
      if (editingAdmin && !submitData.password) {
        delete submitData.password;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(editingAdmin ? `Admin updated successfully!` : `Admin ${formData.full_name} created!`);
        setShowModal(false);
        setEditingAdmin(null);
        setFormData({ full_name: '', email: '', phone: '', password: '', role: 'rdb' });
        loadAdmins();
      } else {
        alert(data.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process request");
    }
  };

  const handleDelete = async (adminId, adminName) => {
    if (window.confirm(`Are you sure you want to delete ${adminName}?`)) {
      try {
        // ✅ FIXED: Removed the double http://
        const response = await fetch(`${API_BASE_URL}/rdb/admins/${adminId}`, {
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert(`Admin deleted successfully`);
          loadAdmins();
        } else {
          alert(data.error || "Failed to delete admin");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to delete admin");
      }
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      full_name: admin.full_name,
      email: admin.email,
      phone: admin.phone || '',
      password: '',
      role: admin.role
    });
    setShowModal(true);
  };

  const getRoleBadge = (role) => {
    if (role === 'super_admin') {
      return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#fee2e2', color: '#dc2626', borderRadius: '20px', fontSize: '12px' }}><FiShield size={12} /> Super Admin</span>;
    }
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#dbeafe', color: '#3b82f6', borderRadius: '20px', fontSize: '12px' }}><FiUser size={12} /> RDB Admin</span>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{ marginTop: '20px' }}>Loading admins...</p>
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
        <button onClick={loadAdmins} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>👥 Manage RDB Admins</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Add or remove system administrators</p>
        </div>
        <button 
          onClick={() => {
            setEditingAdmin(null);
            setFormData({ full_name: '', email: '', phone: '', password: '', role: 'rdb' });
            setShowModal(true);
          }} 
          style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiUserPlus /> Add New Admin
        </button>
      </div>

      {/* Admins Table */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {admins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            No admins found. Click "Add New Admin" to create one.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1f2937', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Full Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.admin_id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px' }}>{admin.admin_id}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{admin.full_name}</td>
                  <td style={{ padding: '12px' }}>{admin.email}</td>
                  <td style={{ padding: '12px' }}>{admin.phone || 'N/A'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{getRoleBadge(admin.role)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ background: admin.status === true ? '#d1fae5' : '#fef3c7', color: admin.status === true ? '#065f46' : '#92400e', padding: '4px 8px', borderRadius: '20px', fontSize: '12px' }}>
                      {admin.status === true ? 'Active' : 'Inactive'}
                    </span>
                   </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleEdit(admin)} 
                        style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Edit Admin"
                      >
                        <FiEdit2 size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(admin.admin_id, admin.full_name)} 
                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Delete Admin"
                      >
                        <FiTrash2 size={14} /> Delete
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
          <strong>Total Admins:</strong> {admins.length} | 
          <strong style={{ marginLeft: '16px' }}>Super Admins:</strong> {admins.filter(a => a.role === 'super_admin').length} |
          <strong style={{ marginLeft: '16px' }}>RDB Admins:</strong> {admins.filter(a => a.role === 'rdb').length}
        </div>
        <button onClick={loadAdmins} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Modal for Add/Edit Admin */}
      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000 
        }} onClick={() => {
          setShowModal(false);
          setEditingAdmin(null);
        }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '90%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0 }}>{editingAdmin ? 'Edit Admin' : 'Add New RDB Admin'}</h5>
              <button onClick={() => {
                setShowModal(false);
                setEditingAdmin(null);
              }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Full Name *" 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <input 
                    type="email" 
                    placeholder="Email *" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <input 
                    type="tel" 
                    placeholder="Phone (optional)" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <input 
                    type="password" 
                    placeholder={editingAdmin ? "New Password (leave blank to keep current)" : "Password *"} 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required={!editingAdmin}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                    style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  >
                    <option value="rdb">RDB Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setEditingAdmin(null);
                }} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;