import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus, Camera, CheckCircle2, ArrowLeft } from "lucide-react";
import "../responsive.css";

export default function Register({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const isAlreadyLoggedIn = Boolean(
    user ||
    (() => {
      try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })()
  );

  React.useEffect(() => {
    if (isAlreadyLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isAlreadyLoggedIn, navigate]);

  if (isAlreadyLoggedIn) {
    return null;
  }

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
      setErrorMsg(t("register.passwordMismatch") || "Passwords do not match.");
      return;
    }

    if (!files.profile_pic || !files.nic_photo_front || !files.nic_photo_back) {
      setErrorMsg(t("register.photosRequired") || "Profile picture and both NIC photos are required.");
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
        alert(t("register.registrationSuccess") || "Registration Successful!");
        navigate("/login");
      } else {
        setErrorMsg(data.message || t("register.registrationFailed") || "Registration failed.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg(t("register.serverError") || "Server connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" style={styles.container}>
      <div className="register-card" style={styles.card}>
        {/* Top Header & Back Button */}
        <div style={styles.headerBox}>
          <button type="button" onClick={handleBack} style={styles.backBtn} title="Go Back" aria-label="Go Back">
            <ArrowLeft size={18} color="#00aa5b" />
          </button>
          <div style={styles.brandBadge}>
            <CheckCircle2 size={16} color="#00aa5b" />
            <span style={{ color: "#00aa5b", fontWeight: "bold", fontSize: "12px" }}>RentHub Community</span>
          </div>
        </div>

        <h2 style={styles.title}>{t("register.title") || "Create New Account"}</h2>
        <p style={styles.subtitle}>{t("register.subtitle") || "Join RentHub to rent or list your items easily"}</p>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* ------------------- PROFILE PIC UPLOAD (WITH USERPLUS & CAMERA ICON) ------------------- */}
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
                    <UserPlus size={36} color="#00aa5b" />
                    <span style={{ fontSize: "11px", marginTop: "4px", fontWeight: "600", color: "#00aa5b" }}>
                      Add Photo
                    </span>
                  </div>
                )}

                <div style={styles.badgeOverlay}>
                  <Camera size={13} color="#fff" />
                </div>
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
              {t("register.profilePicture") || "Upload profile picture"}
            </span>
          </div>

          {/* Full Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("register.fullName") || "Full Name"}</label>
            <input
              type="text"
              name="full_name"
              placeholder={t("register.fullNamePlaceholder") || "e.g. Pawan Madhuhansa"}
              value={formData.full_name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Phone Number & NIC */}
          <div className="register-row" style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>{t("register.phoneNumber") || "Phone Number"}</label>
              <input
                type="tel"
                name="phone_no"
                placeholder={t("register.phonePlaceholder") || "07X XXXXXXX"}
                value={formData.phone_no}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>{t("register.nicNumber") || "NIC Number"}</label>
              <input
                type="text"
                name="nic_no"
                placeholder={t("register.nicPlaceholder") || "e.g. 200012345678"}
                value={formData.nic_no}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("register.email") || "Email Address"}</label>
            <input
              type="email"
              name="email"
              placeholder={t("register.emailPlaceholder") || "example@mail.com"}
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Address */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t("register.address") || "Residential Address"}</label>
            <textarea
              name="address"
              placeholder={t("register.addressPlaceholder") || "No. 12, Main Street, City"}
              value={formData.address}
              onChange={handleChange}
              required
              rows="2"
              style={{ ...styles.input, resize: "vertical" }}
            />
          </div>

          {/* Nearest City & Role */}
          <div className="register-row" style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>{t("register.nearestCity") || "Nearest City"}</label>
              <input
                type="text"
                name="nearest_city"
                placeholder={t("register.cityPlaceholder") || "e.g. Colombo"}
                value={formData.nearest_city}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>{t("register.accountType") || "Account Type"}</label>
              <select
                name="user_role"
                value={formData.user_role}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="both">{t("register.both") || "Both (Rent & Buy)"}</option>
                <option value="renter">{t("register.renter") || "Renter"}</option>
                <option value="owner">{t("register.owner") || "Item Owner"}</option>
              </select>
            </div>
          </div>

          {/* ------------------- NIC DOCUMENTS SECTION ------------------- */}
          <div style={styles.sectionHeader}>
            {t("register.verificationDocuments") || "Verification Documents (NIC Photos)"}
          </div>

          <div className="register-row" style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>{t("register.nicFront") || "NIC Front Photo"}</label>
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

            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>{t("register.nicBack") || "NIC Back Photo"}</label>
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
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>{t("register.password") || "Password"}</label>
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

            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>{t("register.confirmPassword") || "Confirm Password"}</label>
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
            {loading ? (t("register.uploading") || "Creating Account...") : (t("register.registerButton") || "Create Account")}
          </button>
        </form>

        <div style={styles.footerText}>
          {t("register.alreadyAccount") || "Already have an account?"}{" "}
          <Link to="/login" style={styles.link}>
            {t("register.login") || "Log In"}
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
    backgroundColor: "#f4f6f8",
  },

  card: {
    width: "100%",
    maxWidth: "620px",
    padding: "40px 36px",
    borderRadius: "24px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.06)",
    backgroundColor: "#ffffff",
    border: "1px solid #eaeaea",
    boxSizing: "border-box",
  },

  headerBox: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  backBtn: {
    backgroundColor: "#e8f8f0",
    border: "1px solid #c7e9d7",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  brandBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#e8f8f0",
    border: "1px solid #c7e9d7",
    padding: "5px 14px",
    borderRadius: "20px",
  },

  title: {
    margin: "0 0 6px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  subtitle: {
    marginBottom: "24px",
    color: "#666",
    fontSize: "13px",
    textAlign: "center",
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
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    overflow: "visible",
    border: "3px solid #00aa5b",
    backgroundColor: "#e8f8f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 14px rgba(0, 170, 91, 0.2)",
    transition: "all 0.25s ease",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },

  avatarPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#00aa5b",
  },

  badgeOverlay: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    backgroundColor: "#00aa5b",
    color: "#fff",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  },

  profileHelpText: {
    marginTop: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#555",
  },

  errorAlert: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
    fontSize: "13px",
    textAlign: "center",
    border: "1px solid #fecaca",
    fontWeight: "600",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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
    marginBottom: "5px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555",
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    color: "#222",
    backgroundColor: "#fcfdfe",
    transition: "all 0.2s ease-in-out",
  },

  fileInput: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "12px",
    border: "1px dashed #00aa5b",
    borderRadius: "10px",
    backgroundColor: "#e8f8f0",
    color: "#00aa5b",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  sectionHeader: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#00aa5b",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    borderBottom: "1px solid #eaeaea",
    paddingBottom: "6px",
    marginTop: "6px",
  },

  imagePreviewCard: {
    width: "100%",
    maxHeight: "100px",
    borderRadius: "8px",
    objectFit: "cover",
    marginTop: "8px",
    border: "1px solid #c7e9d7",
  },

  submitBtn: {
    padding: "12px 20px",
    backgroundColor: "#00aa5b",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 12px rgba(0, 170, 91, 0.25)",
    transition: "all 0.2s ease-in-out",
  },

  footerText: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#666",
    textAlign: "center",
  },

  link: {
    color: "#00aa5b",
    fontWeight: "bold",
    textDecoration: "none",
    marginLeft: "4px",
  },
};