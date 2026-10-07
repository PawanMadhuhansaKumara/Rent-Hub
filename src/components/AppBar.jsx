import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AppBar() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);

    localStorage.setItem("language", language);
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        backgroundColor: "#1976d2",
      }}
    >
      <h2 style={{ color: "white", margin: 0 }}>Rent Hub</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          {t("appbar.home")}
        </Link>

        <Link
          to="/login"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          {t("appbar.login")}
        </Link>

        <Link
          to="/register"
          style={{
            color: "white",
            textDecoration: "none",
          }}
        >
          {t("appbar.register")}
        </Link>

        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          style={{
            padding: "7px",
            borderRadius: "5px",
          }}
        >
          <option value="en">English</option>

          <option value="si">සිංහල</option>
        </select>
      </div>
    </nav>
  );
}
