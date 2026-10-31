import { useState } from "react";
import { Settings, X, UserRound, Bell, Globe, ShieldCheck, LogOut } from "lucide-react";
import "./SettingsPopup.css";
import LanguageSelecter from "./LanguageSelecter";
import LogoutButton from "./LogoutButton";

export default function SettingsPopup({ handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

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
            <div className="settings-item">
              <LogOut size={18} color="red" />
              <LogoutButton handleLogout={handleLogout} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
