import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../responsive.css";
import logo from "../assets/logo.png";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { t } = useTranslation();

  // Standard Phone Number + Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_no: phoneNo,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Token සහ User details Browser එකේ save කිරීම
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (onLoginSuccess) onLoginSuccess(data.user);

        //alert(t("login.loginSuccess"));

        navigate("/");
      } else {
        setErrorMsg(data.message || t("login.loginFailed"));
      }
    } catch (err) {
      console.error("Login Fetch Error:", err);
      setErrorMsg(t("login.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={styles.container}>
      <div className="login-wrapper" style={styles.wrapper}>

        {/* Left Side: Welcome Text + Rent Hub Logo */}
        <div className="login-logo-container" style={styles.logoContainer}>
          <div className="login-welcome-box" style={styles.welcomeBox}>
            <h2 style={styles.title}>{t("login.title")}</h2>
            <p style={styles.subtitle}>{t("login.subtitle")}</p>
          </div>
          <img src={logo} alt="Rent Hub" className="login-logo-img" style={styles.logoImg} />
        </div>

        {/* Right Side: Login Form Card */}
        <div className="login-card" style={styles.card}>
          {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t("login.phoneNumber")}</label>
              <input
                type="tel"
                placeholder={t("login.phonePlaceholder")}
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>{t("login.password")}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.loginBtn}>
              {loading ? t("login.loggingIn") : t("login.button")}
            </button>

            <div style={styles.forgotWrapper}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>
          </form>

          <div style={styles.footerText}>
            {t("login.noAccount")}{" "}
            <Link to="/register" style={styles.link}>
              {t("login.registerNow")}
            </Link>
          </div>
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
    backgroundColor: "#f4f6f9",
  },

  wrapper: {
    display: "flex",
    width: "100%",
  },

  logoContainer: {
    display: "flex",
    flexDirection: "column",
  },

  welcomeBox: {
    marginLeft:"20",
    marginBottom: "10px",
    width: "500px",
  },

  logoImg: {
    width: "500px",
    maxWidth: "100%",
    objectFit: "contain",
    mixBlendMode: "multiply",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "44px 36px 36px 36px",
    borderRadius: "28px",
    boxShadow: "0 14px 38px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 0.7)",
    boxSizing: "border-box",
  },

  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "6px",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "24px",
    lineHeight: "1.5",
  },

  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
    fontSize: "13.5px",
    border: "1px solid #fecaca",
    fontWeight: "500",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    textAlign: "left",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "13px 18px",
    borderRadius: "14px",
    border: "1px solid #d4e4fc",
    backgroundColor: "#edf5fe",
    boxSizing: "border-box",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    color: "#1e293b",
    fontWeight: "500",
    transition: "all 0.2s ease-in-out",
  },

  loginBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
    boxShadow: "0 8px 22px rgba(37, 99, 235, 0.35)",
    transition: "all 0.2s ease-in-out",
  },

  forgotWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "2px",
  },

  forgotLink: {
    color: "#1d4ed8",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },

  footerText: {
    marginTop: "52px",
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
  },

  link: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
    marginLeft: "4px",
  },
};
