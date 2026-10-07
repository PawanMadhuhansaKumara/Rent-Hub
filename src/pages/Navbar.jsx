import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <nav style={styles.nav}>
      {/* User logged in */}
      {user ? (
        <div style={styles.profileWrapper}>
          <img
            src={`http://localhost:5001${user.profile_pic_url}`}
            alt="Profile"
            style={styles.profilePic}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/40";
            }}
          />

          <span style={styles.userName}>{user.full_name}</span>
        </div>
      ) : (
        <div style={styles.logo}>
          <Link to="/" style={styles.brandLink}>
            <img src="/logo.png" alt="Rent Hub Logo" style={styles.brandLogo} />
          </Link>
        </div>
      )}

      {/* Nav Links - Right side */}
      <div style={styles.menu}>
        {/* Home */}
        <Link
          to="/"
          style={{
            ...styles.navLink,
            ...(isActive("/") ? styles.activeNavLink : {}),
          }}
        >
          {t("appbar.home")}
        </Link>
        {/* Language Selector */}
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          style={styles.languageSelect}
        >
          <option value="en">English</option>

          <option value="si">සිංහල</option>

          <option value="ta">தமிழ்</option>
        </select>

        {user ? (
          <button onClick={handleLogout} style={styles.logoutBtn}>
            {t("appbar.logout")}
          </button>
        ) : (
          <div>
            <Link
              to="/login"
              style={{
                ...styles.navLink,
                ...(isActive("/login") ? styles.activeNavLink : {}),
              }}
            >
              {t("appbar.login")}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 40px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    width: "100%",
    boxSizing: "border-box",
  },

  logo: {
    display: "flex",
    alignItems: "center",
  },

  brandLink: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
  },

  brandLogo: {
    height: "45px",
    transform: "scale(2.1)",
    transformOrigin: "left center",
    mixBlendMode: "multiply",
    objectFit: "contain",
  },

  menu: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginLeft: "auto",
  },

  navLink: {
    textDecoration: "none",
    color: "#444444",
    fontWeight: "600",
    fontSize: "16px",
    paddingBottom: "4px",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s ease-in-out",
  },

  activeNavLink: {
    color: "#007bff",
    borderBottom: "2.5px solid #007bff",
  },

  profileWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  profilePic: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #007bff",
  },

  userName: {
    fontWeight: "600",
    color: "#333333",
    fontSize: "14px",
  },

  logoutBtn: {
    padding: "6px 14px",
    backgroundColor: "#dc3545",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginLeft: "5px",
  },

  languageSelect: {
    padding: "7px 10px",
    borderRadius: "6px",
    border: "1px solid #cccccc",
    backgroundColor: "#ffffff",
    color: "#333333",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
  },
};
