import { Bell, Heart, Home, List, Search } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../responsive.css";

export default function BottomNav() {
  const { t } = useTranslation();
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
        to="/search"
        style={({ isActive }) => ({
          ...styles.navItem,
          ...(isActive ? styles.activeItem : {}),
        })}
      >
        <span style={styles.icon}>
          <Heart />
        </span>
        <span>{t("navigation.saved")}</span>
      </NavLink>

      <NavLink
        to="/add-post"
        style={({ isActive }) => ({
          ...styles.addItem,
          ...(isActive ? styles.activeAddItem : {}),
        })}
      >
        <span style={styles.plus}>
          <Search />
        </span>
      </NavLink>

      <NavLink
        to="/messages"
        style={({ isActive }) => ({
          ...styles.navItem,
          ...(isActive ? styles.activeItem : {}),
        })}
      >
        <span style={styles.icon}>
          <List />
        </span>
        <span>{t("navigation.myItems")}</span>
      </NavLink>

      <NavLink
        to="/profile"
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
    color: "#007bff",
  },

  icon: {
    fontSize: "23px",
    lineHeight: "23px",
  },

  addItem: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "#ffffff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-25px",
    boxShadow: "0 4px 10px rgba(0,123,255,0.35)",
  },

  activeAddItem: {
    backgroundColor: "#0056b3",
  },

  plus: {
    fontSize: "30px",
    fontWeight: "300",
    lineHeight: "1",
  },
};
