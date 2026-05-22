import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome, FiUser, FiSettings } from 'react-icons/fi';

const Sidebar = ({ menuItems, role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <h2>RHMS</h2>
        <p style={styles.roleBadge}>{role}</p>
      </div>
      
      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} style={styles.navLink}>
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <button onClick={handleLogout} style={styles.logoutBtn}>
        <FiLogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

const styles = {
  sidebar: { width: '250px', height: '100vh', background: '#1f2937', color: 'white', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column' },
  logo: { padding: '24px', borderBottom: '1px solid #374151', textAlign: 'center' },
  roleBadge: { fontSize: '12px', background: '#3b82f6', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', marginTop: '8px' },
  nav: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  navLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#9ca3af', textDecoration: 'none', borderRadius: '8px', transition: 'all 0.3s' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', margin: '20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default Sidebar;