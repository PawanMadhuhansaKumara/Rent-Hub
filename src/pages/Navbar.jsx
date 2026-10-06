import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      {/* Brand Logo - Left side */}
      <div style={styles.logo}>
        <Link to="/" style={styles.brandLink}>
          Rent Hub 🏠
        </Link>
      </div>

      {/* Nav Links - Right side edge */}
      <div style={styles.menu}>
        <Link
          to="/"
          style={{
            ...styles.navLink,
            ...(isActive('/') ? styles.activeNavLink : {})
          }}
        >
          Home
        </Link>

        {user ? (
          <div style={styles.profileWrapper}>
            <img
              src={`http://localhost:5000${user.profile_pic_url}`}
              alt="Profile"
              style={styles.profilePic}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
            />
            <span style={styles.userName}>{user.full_name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              ...styles.navLink,
              ...(isActive('/login') ? styles.activeNavLink : {})
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 40px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    width: '100%',
    boxSizing: 'border-box'
  },
  logo: {
    display: 'flex',
    alignItems: 'center'
  },
  brandLink: {
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: '22px',
    letterSpacing: '0.5px'
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    marginLeft: 'auto' // Eedi valla links complete ga right edge ki shift avuthayi
  },
  navLink: {
    textDecoration: 'none',
    color: '#444444',
    fontWeight: '600',
    fontSize: '16px',
    paddingBottom: '4px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease-in-out'
  },
  activeNavLink: {
    color: '#007bff',
    borderBottom: '2.5px solid #007bff'
  },
  profileWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  profilePic: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #007bff'
  },
  userName: {
    fontWeight: '600',
    color: '#333333',
    fontSize: '14px'
  },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    marginLeft: '5px'
  }
};