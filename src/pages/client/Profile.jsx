import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiSave, FiCamera, FiEdit2, FiPhone, FiMapPin, FiCalendar } from "react-icons/fi";

export default function Profile() {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    joinDate: "",
    profilePicture: ""
  });
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token - FIXED: Use consistent token key
  const getToken = () => {
    // Try multiple possible token keys
    return localStorage.getItem('token') || 
           localStorage.getItem('clientToken') || 
           localStorage.getItem('userToken');
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          setError('Please login to view your profile');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        // Fetch real data from backend
        const response = await fetch('https://rhms-backend.onrender.com/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('clientToken');
            localStorage.removeItem('userToken');
            navigate('/login');
            return;
          }
          throw new Error('Failed to load profile');
        }
        
        const data = await response.json();
        const userData = data.user || data;
        
        setProfile({
          fullName: userData.full_name || userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "Kigali, Rwanda",
          joinDate: userData.created_at ? new Date(userData.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          profilePicture: userData.profile_picture || ""
        });
        setError(null);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!profile.fullName || !profile.email) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      const token = getToken();
      if (!token) {
        alert('Please login again');
        navigate('/login');
        return;
      }
      
      // Only send fields that exist in the backend
      const updateData = {};
      
      // Only include fields that have changed (optional but good practice)
      if (profile.fullName) updateData.full_name = profile.fullName;
      if (profile.phone) updateData.phone = profile.phone;
      if (profile.profilePicture) updateData.profile_picture = profile.profilePicture;
      
      console.log('Sending update:', updateData);
      
      const response = await fetch('https://rhms-backend.onrender.com/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      alert("Profile updated successfully!");
      setIsEditing(false);
      
      // Refresh profile data
      loadUserData();
      
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }
    if (!currentPassword) {
      alert("Please enter your current password");
      return;
    }
    
    try {
      const token = getToken();
      if (!token) {
        alert('Please login again');
        navigate('/login');
        return;
      }
      
      const response = await fetch('https://rhms-backend.onrender.com/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      alert("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      console.error('Error changing password:', err);
      alert(err.message || 'Failed to change password');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Profile picture must be less than 2MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setProfile({ ...profile, profilePicture: base64Image });
        
        // Auto-save profile picture if in editing mode
        if (isEditing) {
          try {
            const token = getToken();
            if (token) {
              const response = await fetch('https://rhms-backend.onrender.com/api/user/profile', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  profile_picture: base64Image
                })
              });
              
              if (response.ok) {
                alert("Profile picture updated!");
              }
            }
          } catch (err) {
            console.error('Error updating profile picture:', err);
            alert('Failed to update profile picture');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to reload user data
  const loadUserData = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch('http://localhost:5001/https://rhms-backend.onrender.com/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        
        setProfile({
          fullName: userData.full_name || userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "Kigali, Rwanda",
          joinDate: userData.created_at ? new Date(userData.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          profilePicture: userData.profile_picture || ""
        });
      }
    } catch (err) {
      console.error('Error reloading user data:', err);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>👤 My Profile</h1>
          <p style={styles.subtitle}>Manage your personal information and account settings</p>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>👤 My Profile</h1>
          <p style={styles.subtitle}>Manage your personal information and account settings</p>
        </div>
        <div style={styles.errorContainer}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3>{error}</h3>
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 My Profile</h1>
        <p style={styles.subtitle}>Manage your personal information and account settings</p>
      </div>

      <div style={styles.twoColumn}>
        <div>
          <div style={styles.card}>
            <div style={styles.profileImageContainer}>
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" style={styles.profileImage} />
              ) : (
                <div style={styles.profileImagePlaceholder}>
                  <FiUser size={48} color="#9ca3af" />
                </div>
              )}
              <label style={styles.uploadBtn}>
                <FiCamera size={16} />
                <input type="file" accept="image/*" onChange={handleProfilePictureUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <h3 style={styles.profileName}>{profile.fullName}</h3>
            <p style={styles.profileEmail}>{profile.email}</p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>🔐 Security</h3>
              {!showPasswordForm && (
                <button style={styles.editBtn} onClick={() => setShowPasswordForm(true)}>
                  Change Password →
                </button>
              )}
            </div>
            
            {showPasswordForm ? (
              <div>
                <div style={styles.inputGroup}>
                  <FiLock style={styles.inputIcon} />
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <FiLock style={styles.inputIcon} />
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <FiLock style={styles.inputIcon} />
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div style={styles.buttonGroup}>
                  <button style={styles.cancelBtn} onClick={() => setShowPasswordForm(false)}>Cancel</button>
                  <button style={styles.saveBtn} onClick={handleChangePassword}>Update Password</button>
                </div>
              </div>
            ) : (
              <div style={styles.securityMessage}>
                <p>Keep your account secure with a strong password</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  For security, we recommend changing your password every 90 days.
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>📋 Personal Information</h3>
            {!isEditing ? (
              <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                <FiEdit2 size={14} /> Edit Profile
              </button>
            ) : (
              <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
            )}
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputGroup}>
              <FiUser style={styles.inputIcon} />
              <input
                style={styles.input}
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Full Name"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputGroup}>
              <FiMail style={styles.inputIcon} />
              <input
                style={styles.input}
                type="email"
                value={profile.email}
                disabled={true}
                placeholder="Email"
                style={{ ...styles.input, background: '#f9fafb', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Phone Number</label>
            <div style={styles.inputGroup}>
              <FiPhone style={styles.inputIcon} />
              <input
                style={styles.input}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Phone Number"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Address</label>
            <div style={styles.inputGroup}>
              <FiMapPin style={styles.inputIcon} />
              <input
                style={styles.input}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Address"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Member Since</label>
            <div style={styles.inputGroup}>
              <FiCalendar style={styles.inputIcon} />
              <input
                style={styles.input}
                value={profile.joinDate}
                disabled
                style={{ ...styles.input, background: '#f9fafb', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          {isEditing && (
            <button style={styles.saveBtn} onClick={handleUpdateProfile}>
              <FiSave size={16} /> Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', background: '#f3f4f6', minHeight: '100vh' },
  header: { marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', color: '#111827' },
  subtitle: { fontSize: '14px', color: '#6b7280' },
  twoColumn: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' },
  card: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  cardTitle: { fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' },
  profileImageContainer: { position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: '16px' },
  profileImage: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #667eea' },
  profileImagePlaceholder: { width: '120px', height: '120px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #e5e7eb' },
  uploadBtn: { position: 'absolute', bottom: '0', right: 'calc(50% - 60px)', background: '#667eea', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid white' },
  profileName: { textAlign: 'center', fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' },
  profileEmail: { textAlign: 'center', fontSize: '13px', color: '#6b7280', marginBottom: '16px' },
  infoGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' },
  inputGroup: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  input: { width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  editBtn: { padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' },
  saveBtn: { width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' },
  cancelBtn: { padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  buttonGroup: { display: 'flex', gap: '12px', marginTop: '16px' },
  securityMessage: { padding: '16px', background: '#fefce8', borderRadius: '8px', fontSize: '13px', color: '#854d0e' },
  loadingContainer: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' },
  spinner: { width: '50px', height: '50px', border: '3px solid #f3f4f6', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' },
  errorContainer: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', color: '#dc2626' },
  retryBtn: { marginTop: '16px', padding: '10px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};