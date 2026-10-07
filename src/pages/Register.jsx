import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    <div style={styles.container}>
      <div style={styles.card}>
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

          <div style={styles.row}>
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

          <div style={styles.row}>
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

          <div style={styles.row}>
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

          <div style={styles.row}>
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
    padding: "30px 15px",
    backgroundColor: "#f4f6f9",
  },

  card: {
    width: "100%",
    maxWidth: "600px",
    padding: "35px 30px",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    backgroundColor: "#ffffff",
  },

  title: {
    marginBottom: "4px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
  },

  subtitle: {
    marginBottom: "15px",
    color: "#666",
    fontSize: "14px",
    textAlign: "center",
  },

  profileSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "15px",
  },

  avatarLabel: {
    cursor: "pointer",
  },

  avatarContainer: {
    position: "relative",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid #007bff",
    backgroundColor: "#e9ecef",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "transform 0.2s ease-in-out",
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
    color: "#6c757d",
  },

  badgeOverlay: {
    position: "absolute",
    bottom: "0",
    width: "100%",
    backgroundColor: "rgba(0, 123, 255, 0.75)",
    color: "#fff",
    textAlign: "center",
    fontSize: "10px",
    padding: "2px 0",
  },

  profileHelpText: {
    marginTop: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#007bff",
  },

  errorAlert: {
    backgroundColor: "#ffe6e6",
    color: "#d9534f",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "13px",
    textAlign: "center",
    border: "1px solid #f5c6cb",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  row: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  inputGroup: {
    textAlign: "left",
  },

  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
  },

  fileInput: {
    width: "100%",
    padding: "8px",
    fontSize: "12px",
    border: "1px dashed #007bff",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
  },

  sectionHeader: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#007bff",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #eee",
    paddingBottom: "5px",
    marginTop: "5px",
  },

  imagePreviewCard: {
    width: "100%",
    maxHeight: "90px",
    borderRadius: "6px",
    objectFit: "cover",
    marginTop: "8px",
    border: "1px solid #ddd",
  },

  submitBtn: {
    padding: "12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background 0.2s",
  },

  footerText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#555",
    textAlign: "center",
  },

  link: {
    color: "#007bff",
    fontWeight: "bold",
    textDecoration: "none",
  },
};
