// pages/rdb/Profile.jsx
import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState({ full_name: '', username: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("rdbToken");

  useEffect(() => {
    if (!token) {
      navigate('/rdb/login');
      return;
    }
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        const savedUser = JSON.parse(localStorage.getItem('rdbUser') || '{}');
        setUser(savedUser);
      }
    } catch (error) {
      const savedUser = JSON.parse(localStorage.getItem('rdbUser') || '{}');
      setUser(savedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: user.full_name, email: user.email })
      });
      if (response.ok) {
        alert('Profile updated successfully!');
        localStorage.setItem('rdbUser', JSON.stringify(user));
      }
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) return alert('New passwords do not match');
    try {
      const response = await fetch("http://https://rhms-backend.onrender.com/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ current_password: passwordData.current, new_password: passwordData.new })
      });
      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
      }
    } catch (error) {
      alert('Failed to change password');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
  }

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div className="row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="col-md-4" style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><FiUser size={50} color="white" /></div>
            <h4>{user.full_name || 'RDB Admin'}</h4>
            <p style={{ color: '#6b7280' }}>@{user.username || 'admin'}</p>
            <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><FiLogOut /> Logout</button>
          </div>
        </div>

        <div className="col-md-8" style={{ flex: 2, minWidth: '300px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <h5 className="mb-3"><FiUser /> Profile Information</h5>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Full Name</label><input type="text" value={user.full_name || ''} onChange={(e) => setUser({...user, full_name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Username</label><input type="text" value={user.username || ''} disabled style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f3f4f6' }} /></div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email</label><input type="email" value={user.email || ''} onChange={(e) => setUser({...user, email: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <button type="submit" style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FiSave /> Update Profile</button>
            </form>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
            <h5 className="mb-3"><FiLock /> Change Password</h5>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '16px' }}><input type="password" placeholder="Current Password" value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div style={{ marginBottom: '16px' }}><input type="password" placeholder="New Password" value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div style={{ marginBottom: '16px' }}><input type="password" placeholder="Confirm New Password" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <button type="submit" style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Change Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;