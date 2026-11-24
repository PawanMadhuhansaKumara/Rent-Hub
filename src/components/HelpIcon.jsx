import React from "react";
import { HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./components.css";
import "../pages/Navbar.css";

export default function HelpIcon() {
  const navigate = useNavigate();
  const { t } = useTranslation(["support", "translation"]);

  const helpTitle = t("title", {
    ns: "support",
    defaultValue: t("helpCenter.title", "Help Center"),
  });

  return (
    <div
      className="help-icon-container"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <button
        type="button"
        className="help-icon-button"
        onClick={() => navigate("/help-center")}
        title={helpTitle}
        aria-label={helpTitle}
        style={{
          position: "relative",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.45)",
          background: "rgba(255, 255, 255, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          color: "#FFFFFF",
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        <HelpCircle size={21} color="#FFFFFF" stroke="#FFFFFF" />
      </button>
    </div>
  );
}
