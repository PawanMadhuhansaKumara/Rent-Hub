import React, { useState } from "react";
import { Settings, X, UserRound, Bell, Globe, ShieldCheck, LogOut, Trash2 } from "lucide-react";
import "./SettingsPopup.css";
import LanguageSelecter from "./LanguageSelecter";
import LogoutButton from "./LogoutButton";
import { useNavigate } from "react-router-dom";
import GoogleMapIcon from "./GoogleMapIcon";
import MapLocationPickerModal from "./MapLocationPickerModal";

export default function SettingsPopup({ handleLogout, onOpenMapLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showLocalMapPicker, setShowLocalMapPicker] = useState(false);
  const navigate = useNavigate();

  const handleMapLocationClick = () => {
    setIsOpen(false);
    if (onOpenMapLocation) {
      onOpenMapLocation();
    } else {
      setShowLocalMapPicker(true);
    }
  };

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  // ගිණුම ඉවත් කිරීමේ (Delete Account) ක්‍රියාවලිය
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to completely remove this account? This action cannot be undone!"
    );
    
    if (!confirmDelete) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.user_id || storedUser?.id;

      if (!userId) {
        alert("User information not found.");
        return;
      }

      const res = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Your account has been successfully deleted.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        if (handleLogout) handleLogout();
        navigate("/login");
      } else {
        alert(data.message || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      alert("An error occurred while deleting the account.");
    }
  };

  return (
    <div className="settings-container">
      <button
        className="settings-icon-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open settings"
      >
        <Settings size={18} />
      </button>

      {isOpen && (
        <div className="settings-overlay" onClick={() => setIsOpen(false)}>
          <div className="settings-popup" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>Settings</h3>

              <button
                className="settings-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </div>

            <button
              className="settings-item"
              onClick={() => setShowLanguage(!showLanguage)}
            >
              <Globe size={18} />
              <span>Language</span>
            </button>

            {showLanguage && <LanguageSelecter />}

            <button className="settings-item">
              <ShieldCheck size={18} />
              <span>Privacy & Security</span>
            </button>

            {/* Map Location Option */}
            <button
              className="settings-item"
              onClick={handleMapLocationClick}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <GoogleMapIcon size={18} />
              <span>Map Location</span>
            </button>

            <div className="settings-item">
              <LogOut size={18} color="red" />
              <LogoutButton handleLogout={handleLogout} />
            </div>

            {/* ගිණුම ඉවත් කිරීමේ බොත්තම (Delete Account Option) */}
            <div 
              className="settings-item" 
              onClick={handleDeleteAccount}
              style={{ cursor: "pointer", borderTop: "1px solid #f0f0f0", marginTop: "8px", paddingTop: "12px" }}
            >
              <Trash2 size={18} color="#dc2626" />
              <span style={{ color: "#dc2626", fontWeight: "bold" }}>Delete Account</span>
            </div>
          </div>
        </div>
      )}

      {showLocalMapPicker && (
        <MapLocationPickerModal
          isOpen={showLocalMapPicker}
          onClose={() => setShowLocalMapPicker(false)}
          initialLat={storedUser.map_latitude}
          initialLng={storedUser.map_longitude}
          initialName={storedUser.map_location_name || storedUser.address}
          userId={storedUser.id || storedUser.user_id}
          onLocationSaved={() => {
            setShowLocalMapPicker(false);
          }}
        />
      )}
    </div>
  );
}