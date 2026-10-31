import {
  Bell,
  Heart,
  Home,
  LayoutDashboard,
  List,
  Search,
  Store,
} from "lucide-react";
import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../responsive.css";

export default function BottomNav({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Show only when user is logged in
  const currentUser =
    user ||
    (() => {
      try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();

  if (!currentUser) {
    return null;
  }

  const handleSearchClick = (e) => {
    e.preventDefault();
    // Navigate to Home with focusSearch state
    navigate("/", { state: { focusSearch: true, timestamp: Date.now() } });

    // Focus immediately if already on home or as soon as rendered
    setTimeout(() => {
      const input = document.querySelector(".home-search input");
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <div className="bottom-nav" style={styles.bottomNav}>
      <NavLink
        to="/"
        style={({ isActive }) => ({
          ...styles.navItem,
          ...(isActive ? styles.activeItem : {}),
        })}
      >
        <span style={styles.icon}>
          <Home />
        </span>
        <span>{t("navigation.home")}</span>
      </NavLink>
      <NavLink
        to="/MyItems"
        style={({ isActive }) => ({
          ...styles.navItem,
          ...(isActive ? styles.activeItem : {}),
        })}
      >
        <span style={styles.icon}>
          <List />
        </span>
        <span>{t("navigation.rents")}</span>
      </NavLink>

      <button
        type="button"
        onClick={handleSearchClick}
        style={styles.addItem}
        aria-label="Search"
      >
        <span style={styles.plus}>
          <Search />
        </span>
      </button>

      <NavLink
        to="/business-hub"
        style={({ isActive }) => ({
          ...styles.navItem,
          ...(isActive ? styles.activeItem : {}),
        })}
      >
        <span style={styles.icon}>
          <LayoutDashboard />
        </span>
        <span>{t("navigation.businessHub")}</span>
      </NavLink>

      <NavLink
        to="/notifications"
        style={({ isActive }) => ({
          ...styles.navItem,
          ...(isActive ? styles.activeItem : {}),
        })}
      >
        <span style={styles.icon}>
          <Bell />
        </span>
        <span>{t("navigation.notifications")}</span>
      </NavLink>
    </div>
  );
}

const styles = {
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "70px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e5e5e5",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 1000,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
  },

  navItem: {
    textDecoration: "none",
    color: "#777",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "600",
    minWidth: "60px",
  },

  activeItem: {
    color: "#11843b",
  },

  icon: {
    fontSize: "23px",
    lineHeight: "23px",
  },

  addItem: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: "#11843b",
    color: "#ffffff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-25px",
    boxShadow: "0 4px 10px rgba(17,132,59,0.35)",
    border: "none",
    cursor: "pointer",
    outline: "none",
  },

  activeAddItem: {
    backgroundColor: "#11843b",
  },

  plus: {
    fontSize: "30px",
    fontWeight: "300",
    lineHeight: "1",
  },
};
