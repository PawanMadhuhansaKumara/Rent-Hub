import React from "react";
import { X, Camera, User, AtSign, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import GoogleMapIcon from "../GoogleMapIcon";

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  setProfile,
  profileInputRef,
  coverInputRef,
  handleProfileImageChange,
  handleCoverImageChange,
  handleSaveProfile,
  setShowMapPicker,
  t = (key, fallback) => (typeof fallback === "string" ? fallback : key),
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-modal, var(--bg-card, #ffffff))",
          borderRadius: "22px",
          width: "100%",
          maxWidth: "490px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(22, 163, 74, 0.15)",
          overflow: "hidden",
          animation: "fadeIn 0.25s ease-out",
          border: "1px solid var(--border-light, #e2e8f0)",
          color: "var(--text-main, #0f172a)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Avatar Only (Cover input kept hidden for compatibility) */}
        <input
          type="file"
          ref={profileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleProfileImageChange}
        />
        {coverInputRef && (
          <input
            type="file"
            ref={coverInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleCoverImageChange}
          />
        )}

        {/* ============================================================== */}
        {/* MODAL HEADER: GREEN GRADIENT WITH USER BADGE & CLOSE BUTTON    */}
        {/* ============================================================== */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--primary, #00aa5b) 0%, var(--primary-hover, #008748) 100%)",
            padding: "18px 20px",
            color: "var(--text-inverse, #ffffff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={20} color="var(--text-inverse, #ffffff)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>
                {t("profile.editProfile", "Edit Profile")}
              </h3>
              <span style={{ fontSize: "12px", opacity: 0.9, color: "rgba(255, 255, 255, 0.9)" }}>
                {profile.full_name || profile.username || t("profile.updateDetails", "Update personal & shop details")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-inverse, #ffffff)",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")}
            title={t("common.close", "Close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* ============================================================== */}
        {/* MODAL BODY (SCROLLABLE CONTENT)                                */}
        {/* ============================================================== */}
        <form
          onSubmit={handleSaveProfile}
          style={{
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* AVATAR UPLOAD (Centered Circle, Cover photo removed completely) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={profile.profile_pic_url}
                alt="Profile Avatar"
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--primary, #00aa5b)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "var(--border-light, #f1f5f9)",
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300";
                }}
              />
              <button
                type="button"
                onClick={() => profileInputRef.current && profileInputRef.current.click()}
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  backgroundColor: "var(--primary, #00aa5b)",
                  color: "#ffffff",
                  border: "2px solid var(--bg-modal, #ffffff)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                title={t("profile.changeAvatar", "Change Profile Picture")}
              >
                <Camera size={15} color="#ffffff" />
              </button>
            </div>
            <span
              style={{
                fontSize: "11.5px",
                color: "var(--text-muted, #64748b)",
                marginTop: "6px",
                fontWeight: "500",
              }}
            >
              {t("profile.changePhotoHint", "Click the camera icon to update photo")}
            </span>
          </div>

          {/* ROW 1: Full Name & Username */}
          <div style={styles.twoColumnRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.fullName", "Full Name")}
              </label>
              <div style={styles.inputWithIconWrapper}>
                <User size={17} color="var(--text-muted, #64748b)" style={styles.inputIcon} />
                <input
                  style={styles.prettyInput}
                  type="text"
                  placeholder="e.g. John Doe"
                  value={profile.full_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.username", "Username")}
              </label>
              <div style={styles.inputWithIconWrapper}>
                <AtSign size={17} color="var(--text-muted, #64748b)" style={styles.inputIcon} />
                <input
                  style={styles.prettyInput}
                  type="text"
                  placeholder="username"
                  value={profile.username || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* ROW 2: Phone Number & Email */}
          <div style={styles.twoColumnRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.phoneNumber", "Phone Number")}
              </label>
              <div style={styles.inputWithIconWrapper}>
                <Phone size={17} color="var(--text-muted, #64748b)" style={styles.inputIcon} />
                <input
                  style={styles.prettyInput}
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={profile.phone_no || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone_no: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.email", "Email")}
              </label>
              <div style={styles.inputWithIconWrapper}>
                <Mail size={17} color="var(--text-muted, #64748b)" style={styles.inputIcon} />
                <input
                  style={styles.prettyInput}
                  type="email"
                  placeholder="name@example.com"
                  value={profile.email || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* ROW 3: Address & Nearest City */}
          <div style={styles.twoColumnRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.address", "Address")}
              </label>
              <input
                style={styles.prettyInputNoIcon}
                type="text"
                placeholder="Shop or home address"
                value={profile.address || ""}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.nearestCity", "Nearest City")}
              </label>
              <input
                style={styles.prettyInputNoIcon}
                type="text"
                placeholder="e.g. Colombo, Kandy"
                value={profile.nearest_city || ""}
                onChange={(e) =>
                  setProfile({ ...profile, nearest_city: e.target.value })
                }
              />
            </div>
          </div>

          {/* SHOP MAP LOCATION PICKER SECTION */}
          <div
            style={{
              backgroundColor: "var(--badge-green-bg, #f0fdf4)",
              border: "1px solid var(--badge-green-bg, #bbf7d0)",
              borderRadius: "12px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <GoogleMapIcon size={24} />
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--primary-hover, #15803d)",
                  }}
                >
                  {t("map.shopMapLocation", "Shop Map Location")}
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary, #475569)" }}>
                  {profile.map_location_name ||
                    (profile.map_latitude
                      ? `${Number(profile.map_latitude).toFixed(4)}, ${Number(profile.map_longitude).toFixed(4)}`
                      : t("map.noMapLocationSet", "No location pin set"))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--primary, #00aa5b)",
                color: "var(--text-inverse, #ffffff)",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 4px rgba(0, 170, 91, 0.2)",
              }}
            >
              <MapPin size={14} />
              {profile.map_latitude
                ? t("map.updateMapPin", "Update Pin")
                : t("map.setMapLocation", "Set Location")}
            </button>
          </div>

          {/* ABOUT / BIO SECTION */}
          <div>
            <label style={styles.fieldLabel}>
              {t("profile.aboutMe", "About / Description")}
            </label>
            <textarea
              style={styles.prettyTextarea}
              placeholder="Tell customers about your rental shop and services..."
              value={profile.about || ""}
              onChange={(e) =>
                setProfile({ ...profile, about: e.target.value })
              }
            />
          </div>

          {/* ============================================================== */}
          {/* BIG PROMINENT GREEN SUBMIT BUTTON (Matches PayHere Style)      */}
          {/* ============================================================== */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: "12px",
              backgroundColor: "var(--primary, #00aa5b)",
              color: "var(--text-inverse, #ffffff)",
              border: "none",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(0, 170, 91, 0.28)",
              transition: "all 0.2s ease",
              marginTop: "6px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            <CheckCircle2 size={18} />
            <span>{t("profile.saveChanges", "Save Changes")}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  twoColumnRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-secondary, #475569)",
    marginBottom: "5px",
  },
  inputWithIconWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    pointerEvents: "none",
  },
  prettyInput: {
    width: "100%",
    padding: "9px 12px 9px 38px",
    borderRadius: "10px",
    border: "1px solid var(--border-light, #e2e8f0)",
    fontSize: "13.5px",
    backgroundColor: "var(--bg-card, #ffffff)",
    color: "var(--text-main, #0f172a)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  prettyInputNoIcon: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid var(--border-light, #e2e8f0)",
    fontSize: "13.5px",
    backgroundColor: "var(--bg-card, #ffffff)",
    color: "var(--text-main, #0f172a)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  prettyTextarea: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid var(--border-light, #e2e8f0)",
    fontSize: "13.5px",
    backgroundColor: "var(--bg-card, #ffffff)",
    color: "var(--text-main, #0f172a)",
    outline: "none",
    minHeight: "75px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "border-color 0.2s",
  },
};
