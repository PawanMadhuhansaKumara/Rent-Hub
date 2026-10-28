
import React from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Navbar.css";
import "../responsive.css";
import logo from "../assets/logoSmall.png";

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

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-brand">
        <img
          src={logo}
          alt="Rent-Hub Logo"
          className="navbar-logo"
        />
      </Link>

      
{/* Navigation Links - Only show when logged in */}
{user && (
  <div className="navbar-menu">
    <Link
      to="/"
      className={`navbar-link ${
        isActive("/") ? "active" : ""
      }`}
    >
      {t("appbar.home") || "Home"}
    </Link>

    <Link
      to="/#rental-items"
      className="navbar-link"
    >
      Browse Items
    </Link>

    <Link
      to="/add-item"
      className={`navbar-add-item ${
        isActive("/add-item") ? "active" : ""
      }`}
    >
      <span>+</span> Add Item
    </Link>
  </div>
)}


      {/* Right Side */}
      <div className="navbar-actions">
        <select
          className="navbar-language"
          value={i18n.language?.split("-")[0] || "en"}
          onChange={(e) => changeLanguage(e.target.value)}
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="si">සිංහල</option>
          <option value="ta">தமிழ்</option>
        </select>

        {user ? (
          <>
            <Link to="/profile" className="navbar-profile">
              <img
                src={
                  user.profile_pic_url
                    ? user.profile_pic_url.startsWith("http")
                      ? user.profile_pic_url
                      : `http://localhost:5001${user.profile_pic_url}`
                    : "https://via.placeholder.com/40"
                }
                alt="Profile"
                className="navbar-profile-pic"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://via.placeholder.com/40";
                }}
              />

              <span className="navbar-username">
                {user.full_name || "My Profile"}
              </span>
            </Link>

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              {t("appbar.logout") || "Logout"}
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className={`navbar-login ${
              isActive("/login") ? "active" : ""
            }`}
          >
            {t("appbar.login") || "Login"}
          </Link>
        )}
      </div>
    </nav>
  );
}
