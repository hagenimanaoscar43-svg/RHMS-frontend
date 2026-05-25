// pages/rdb/Profile.jsx
import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState({ full_name: '', username: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // ✅ CORRECTED: Single source of truth for API URL
  const API_BASE_URL = 'https://rhms-backend.onrender.com/api';
  
  // Fix: Use consistent token key
  const token = localStorage.getItem("token") || localStorage.getItem("rdbToken");

  useEffect(() => {
    if (!token) {
      navigate('/rdb/login');
      return;
    }
    loadProfile();
  }, [token, navigate]);

  const loadProfile = async () => {
    try {
      // ✅ FIXED: Removed the double http:// and use correct endpoint
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser({
          full_name: data.user?.full_name || data.full_name || '',
          username: data.user?.email?.split('@')[0] || data.email?.split('@')[0] || '',
          email: data.user?.email || data.email || ''
        });
        // Save to localStorage as backup
        localStorage.setItem('rdbUser', JSON.stringify(user));
      } else {
        const savedUser = JSON.parse(localStorage.getItem('rdbUser') || '{}');
        setUser(savedUser);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      const savedUser = JSON.parse(localStorage.getItem('rdbUser') || '{}');
      setUser(savedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // ✅ FIXED: Removed the double http://
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          full_name: user.full_name, 
          email: user.email 
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully!');
        localStorage.setItem('rdbUser', JSON.stringify(user));
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error:", error);
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      // ✅ FIXED: Removed the double http://
      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          current_password: passwordData.current, 
          new_password: passwordData.new 
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error("Error:", error);
      alert('Failed to change password');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{ marginTop: '20px' }}>Loading profile...</p>
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
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>👤 My Profile</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Manage your account information and security settings</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Profile Card */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ 
              width: '100px', height: '100px', 
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px',
              boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
            }}>
              <FiUser size={50} color="white" />
            </div>
            <h4 style={{ margin: '0 0 5px 0' }}>{user.full_name || 'RDB Admin'}</h4>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>@{user.username || user.email?.split('@')[0] || 'admin'}</p>
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
              <small style={{ color: '#6b7280' }}>Role: RDB Administrator</small>
            </div>
            <button 
              onClick={handleLogout} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: '#dc2626', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: '500',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div style={{ flex: 2, minWidth: '300px' }}>
          {/* Update Profile Section */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h5 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser /> Profile Information
            </h5>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Full Name</label>
                <input 
                  type="text" 
                  value={user.full_name || ''} 
                  onChange={(e) => setUser({...user, full_name: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} 
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Username</label>
                <input 
                  type="text" 
                  value={user.username || user.email?.split('@')[0] || ''} 
                  disabled 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f3f4f6', fontSize: '14px' }} 
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>Username cannot be changed</small>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
                <input 
                  type="email" 
                  value={user.email || ''} 
                  onChange={(e) => setUser({...user, email: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} 
                  required
                />
              </div>
              <button 
                type="submit" 
                style={{ 
                  padding: '10px 24px', 
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                <FiSave /> Update Profile
              </button>
            </form>
          </div>

          {/* Change Password Section */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h5 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLock /> Change Password
            </h5>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  value={passwordData.current} 
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} 
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="password" 
                  placeholder="New Password (min 6 characters)" 
                  value={passwordData.new} 
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} 
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={passwordData.confirm} 
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} 
                />
              </div>
              <button 
                type="submit" 
                style={{ 
                  padding: '10px 24px', 
                  background: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#d97706'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f59e0b'}
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;