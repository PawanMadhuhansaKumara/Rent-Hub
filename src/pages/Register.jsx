import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../responsive.css";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_no: "",
    email: "",
    nic_no: "",
    address: "",
    nearest_city: "",
    user_role: "both",
    password: "",
    confirm_password: "",
  });

  const [files, setFiles] = useState({
    profile_pic: null,
    nic_photo_front: null,
    nic_photo_back: null,
  });

  const [previews, setPreviews] = useState({
    profile_pic: null,
    nic_photo_front: null,
    nic_photo_back: null,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;

    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];

      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));

      setPreviews((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirm_password) {
      setErrorMsg(t("register.passwordMismatch"));
      return;
    }

    if (!files.profile_pic || !files.nic_photo_front || !files.nic_photo_back) {
      setErrorMsg(t("register.photosRequired"));
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      submitData.append("profile_pic", files.profile_pic);
      submitData.append("nic_photo_front", files.nic_photo_front);
      submitData.append("nic_photo_back", files.nic_photo_back);

      const response = await fetch("http://localhost:5001/api/register", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(t("register.registrationSuccess"));
        navigate("/login");
      } else {
        setErrorMsg(data.message || t("register.registrationFailed"));
      }
    } catch (err) {
      console.error("Fetch error:", err);

      setErrorMsg(t("register.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" style={styles.container}>
      <div className="register-card" style={styles.card}>
        <h2 style={styles.title}>{t("register.title")}</h2>

        <p style={styles.subtitle}>{t("register.subtitle")}</p>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* ------------------- TOP CENTER PROFILE PIC UPLOAD ------------------- */}

          <div style={styles.profileSection}>
            <label htmlFor="profile_pic_input" style={styles.avatarLabel}>
              <div style={styles.avatarContainer}>
                {previews.profile_pic ? (
                  <img
                    src={previews.profile_pic}
                    alt="Profile Preview"
                    style={styles.avatarImage}
                  />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    <span style={{ fontSize: "28px" }}>📷</span>

                    <span
                      style={{
                        fontSize: "11px",
                        marginTop: "4px",
                      }}
                    >
                      {t("register.addPhoto")}
                    </span>
                  </div>
                )}

                <div style={styles.badgeOverlay}>✏️</div>
              </div>
            </label>

            <input
              id="profile_pic_input"
              type="file"
              name="profile_pic"
              accept="image/*"
              onChange={handleFileChange}
              required
              style={{ display: "none" }}
            />

            <span style={styles.profileHelpText}>
              {t("register.profilePicture")}
            </span>
          </div>

          {/* Full Name */}

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("register.fullName")}</label>

            <input
              type="text"
              name="full_name"
              placeholder={t("register.fullNamePlaceholder")}
              value={formData.full_name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Phone Number & NIC */}

          <div className="register-row" style={styles.row}>
            <div
              style={{
                ...styles.inputGroup,
                flex: 1,
              }}
            >
              <label style={styles.label}>{t("register.phoneNumber")}</label>

              <input
                type="tel"
                name="phone_no"
                placeholder={t("register.phonePlaceholder")}
                value={formData.phone_no}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div
              style={{
                ...styles.inputGroup,
                flex: 1,
              }}
            >
              <label style={styles.label}>{t("register.nicNumber")}</label>

              <input
                type="text"
                name="nic_no"
                placeholder={t("register.nicPlaceholder")}
                value={formData.nic_no}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Email */}

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("register.email")}</label>

            <input
              type="email"
              name="email"
              placeholder={t("register.emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Address */}

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("register.address")}</label>

            <textarea
              name="address"
              placeholder={t("register.addressPlaceholder")}
              value={formData.address}
              onChange={handleChange}
              required
              rows="2"
              style={{
                ...styles.input,
                resize: "vertical",
              }}
            />
          </div>

          {/* Nearest City & Role */}

          <div className="register-row" style={styles.row}>
            <div
              style={{
                ...styles.inputGroup,
                flex: 1,
              }}
            >
              <label style={styles.label}>{t("register.nearestCity")}</label>

              <input
                type="text"
                name="nearest_city"
                placeholder={t("register.cityPlaceholder")}
                value={formData.nearest_city}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div
              style={{
                ...styles.inputGroup,
                flex: 1,
              }}
            >
              <label style={styles.label}>{t("register.accountType")}</label>

              <select
                name="user_role"
                value={formData.user_role}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="both">{t("register.both")}</option>

                <option value="renter">{t("register.renter")}</option>

                <option value="owner">{t("register.owner")}</option>
              </select>
            </div>
          </div>

          {/* ------------------- NIC DOCUMENTS SECTION ------------------- */}

          <div style={styles.sectionHeader}>
            {t("register.verificationDocuments")}
          </div>

          <div className="register-row" style={styles.row}>
            <div
              style={{
                ...styles.inputGroup,
                flex: 1,
              }}
            >
              <label style={styles.label}>{t("register.nicFront")}</label>

              <input
                type="file"
                name="nic_photo_front"
                accept="image/*"
                onChange={handleFileChange}
                required
                style={styles.fileInput}
              />

              {previews.nic_photo_front && (
                <img
                  src={previews.nic_photo_front}
                  alt="NIC Front Preview"
                  style={styles.imagePreviewCard}
                />
              )}
            </div>

            <div
              style={{
                ...styles.inputGroup,
                flex: 1,
              }}
            >
              <label style={styles.label}>{t("register.nicBack")}</label>

              <input
                type="file"
                name="nic_photo_back"
                accept="image/*"
                onChange={handleFileChange}
                required
                style={styles.fileInput}
              />

              {previews.nic_photo_back && (
                <img
                  src={previews.nic_photo_back}
                  alt="NIC Back Preview"
                  style={styles.imagePreviewCard}
                />
              )}
            </div>
          </div>

          {/* Passwords */}

          <div className="register-row" style={styles.row}>
            <div
              style={{
                ...styles.inputGroup,
                flex: 1,
              }}
            >
              <label style={styles.label}>{t("register.password")}</label>

              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div
              style={{
                ...styles.inputGroup,
                flex: 1,
              }}
            >
              <label style={styles.label}>
                {t("register.confirmPassword")}
              </label>

              <input
                type="password"
                name="confirm_password"
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? t("register.uploading") : t("register.registerButton")}
          </button>
        </form>

        <div style={styles.footerText}>
          {t("register.alreadyAccount")}{" "}
          <Link to="/login" style={styles.link}>
            {t("register.login")}
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "40px 20px",
    backgroundColor: "#f0f4f8",
    background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
  },

  card: {
    width: "100%",
    maxWidth: "620px",
    padding: "40px 36px",
    borderRadius: "20px",
    boxShadow: "0 12px 36px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 0.8)",
  },

  title: {
    marginBottom: "6px",
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    marginBottom: "24px",
    color: "#64748b",
    fontSize: "14px",
    textAlign: "center",
    lineHeight: "1.5",
  },

  profileSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },

  avatarLabel: {
    cursor: "pointer",
  },

  avatarContainer: {
    position: "relative",
    width: "104px",
    height: "104px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid #3b82f6",
    backgroundColor: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.2)",
    transition: "all 0.25s ease",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  avatarPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#94a3b8",
  },

  badgeOverlay: {
    position: "absolute",
    bottom: "0",
    width: "100%",
    backgroundColor: "rgba(30, 41, 59, 0.75)",
    backdropFilter: "blur(2px)",
    color: "#fff",
    textAlign: "center",
    fontSize: "11px",
    padding: "3px 0",
  },

  profileHelpText: {
    marginTop: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
    letterSpacing: "0.2px",
  },

  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
    fontSize: "13.5px",
    textAlign: "center",
    border: "1px solid #fecaca",
    fontWeight: "500",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  row: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },

  inputGroup: {
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease-in-out",
  },

  fileInput: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "12.5px",
    border: "1.5px dashed #93c5fd",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    color: "#1e40af",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  sectionHeader: {
    fontSize: "12.5px",
    fontWeight: "700",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    borderBottom: "1.5px solid #e2e8f0",
    paddingBottom: "8px",
    marginTop: "8px",
  },

  imagePreviewCard: {
    width: "100%",
    maxHeight: "110px",
    borderRadius: "8px",
    objectFit: "cover",
    marginTop: "10px",
    border: "1px solid #bfdbfe",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  submitBtn: {
    padding: "13px 20px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
    transition: "all 0.2s ease-in-out",
  },

  footerText: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center",
  },

  link: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
    marginLeft: "4px",
  },
};
