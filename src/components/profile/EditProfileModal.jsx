import React from "react";
import { X, Camera, User, AtSign, Phone, Mail, MapPin } from "lucide-react";
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
  t = (key) => key,
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.prettyModalBox}>
        <input
          type="file"
          ref={profileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleProfileImageChange}
        />
        <input
          type="file"
          ref={coverInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleCoverImageChange}
        />

        <div style={styles.prettyModalHeader}>
          <button onClick={onClose} style={styles.circleBackBtn}>
            <X size={18} color="#333" />
          </button>
          <h3 style={styles.prettyModalTitle}>
            {t("profile.editProfile") || "Edit Profile"}
          </h3>
          <button onClick={handleSaveProfile} style={styles.topSaveBtn}>
            {t("profile.save") || "Save"}
          </button>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={styles.fieldLabel}>Cover Photo</label>
          <div
            style={{
              position: "relative",
              height: "100px",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#ddd",
            }}
          >
            <img
              src={profile.coverphoto}
              alt="Cover Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current && coverInputRef.current.click()}
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Camera size={12} color="#00aa5b" /> Change Cover
            </button>
          </div>
        </div>

        <div style={styles.centerAvatarContainer}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={profile.profile_pic_url}
              alt="Avatar"
              style={styles.modalAvatarImg}
            />
            <button
              type="button"
              onClick={() => profileInputRef.current && profileInputRef.current.click()}
              style={styles.modalCameraBtn}
            >
              <Camera size={15} color="#00aa5b" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={styles.formFieldsStack}>
          <div style={styles.twoColumnRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.fullName") || "Full Name"}
              </label>
              <div style={styles.inputWithIconWrapper}>
                <User size={18} color="#777" style={styles.inputIcon} />
                <input
                  style={styles.prettyInput}
                  type="text"
                  value={profile.full_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.username") || "Username"}
              </label>
              <div style={styles.inputWithIconWrapper}>
                <AtSign size={18} color="#777" style={styles.inputIcon} />
                <input
                  style={styles.prettyInput}
                  type="text"
                  value={profile.username || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div style={styles.twoColumnRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.phoneNumber") || "Phone Number"}
              </label>
              <div style={styles.inputWithIconWrapper}>
                <Phone size={18} color="#777" style={styles.inputIcon} />
                <input
                  style={styles.prettyInput}
                  type="text"
                  value={profile.phone_no || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone_no: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>
                {t("profile.email") || "Email"}
              </label>
              <div style={styles.inputWithIconWrapper}>
                <Mail size={18} color="#777" style={styles.inputIcon} />
                <input
                  style={styles.prettyInput}
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div style={styles.twoColumnRow}>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>Address</label>
              <input
                style={styles.prettyInputNoIcon}
                type="text"
                value={profile.address || ""}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.fieldLabel}>Nearest City</label>
              <input
                style={styles.prettyInputNoIcon}
                type="text"
                value={profile.nearest_city || ""}
                onChange={(e) =>
                  setProfile({ ...profile, nearest_city: e.target.value })
                }
              />
            </div>
          </div>

          {/* Shop Map Location Picker Section */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <GoogleMapIcon size={22} />
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#166534",
                  }}
                >
                  {t("map.shopMapLocation") || "Shop Map Location"}
                </div>
                <div style={{ fontSize: "11px", color: "#4b5563" }}>
                  {profile.map_location_name ||
                    (profile.map_latitude
                      ? `${Number(profile.map_latitude).toFixed(4)}, ${Number(profile.map_longitude).toFixed(4)}`
                      : t("map.noMapLocationSet") || "No location set")}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "#00aa5b",
                color: "#ffffff",
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
                ? t("map.updateMapPin") || "Update Pin"
                : t("map.setMapLocation") || "Set Location"}
            </button>
          </div>

          <div>
            <label style={styles.fieldLabel}>
              {t("profile.aboutMe") || "About"}
            </label>
            <textarea
              style={styles.prettyTextarea}
              value={profile.about || ""}
              onChange={(e) =>
                setProfile({ ...profile, about: e.target.value })
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  prettyModalBox: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "480px",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  prettyModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  prettyModalTitle: { margin: 0, fontSize: "18px", fontWeight: "bold" },
  circleBackBtn: {
    backgroundColor: "#f0f2f5",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  topSaveBtn: {
    backgroundColor: "#00aa5b",
    color: "#fff",
    border: "none",
    padding: "6px 16px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
  },
  centerAvatarContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  modalAvatarImg: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00aa5b",
  },
  modalCameraBtn: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "50%",
    padding: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  formFieldsStack: { display: "flex", flexDirection: "column", gap: "14px" },
  twoColumnRow: { display: "flex", gap: "12px" },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "5px",
  },
  inputWithIconWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: { position: "absolute", left: "12px" },
  prettyInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  prettyInputNoIcon: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  prettyTextarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    minHeight: "80px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
};
