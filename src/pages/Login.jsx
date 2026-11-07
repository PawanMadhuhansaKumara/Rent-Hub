import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, Lock, CheckCircle2 } from "lucide-react";
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

        navigate("/");
      } else {
        setErrorMsg(data.message || t("login.loginFailed") || "Login failed.");
      }
    } catch (err) {
      console.error("Login Fetch Error:", err);
      setErrorMsg(t("login.serverError") || "Server connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={styles.container}>
      <div className="login-wrapper" style={styles.wrapper}>

        {/* Left Side: Welcome Text + Rent Hub Logo */}
        <div className="login-logo-container" style={styles.logoContainer}>
          <div style={styles.brandBadge}>
            <CheckCircle2 size={18} color="#00aa5b" />
            <span style={{ color: "#00aa5b", fontWeight: "bold", fontSize: "13px" }}>RentHub Community</span>
          </div>
          <div className="login-welcome-box" style={styles.welcomeBox}>
            <h2 style={styles.title}>{t("login.title") || "Welcome Back!"}</h2>
            <p style={styles.subtitle}>{t("login.subtitle") || "Rent smarter, live better. Access your account below."}</p>
          </div>
          <img src={logo} alt="Rent Hub" className="login-logo-img" style={styles.logoImg} />
        </div>

        {/* Right Side: Login Form Card */}
        <div className="login-card" style={styles.card}>
          {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t("login.phoneNumber") || "Phone Number"}</label>
              <div style={styles.inputWrapper}>
                <Phone size={18} color="#00aa5b" style={styles.inputIcon} />
                <input
                  type="tel"
                  placeholder={t("login.phonePlaceholder") || "07X XXXXXXX"}
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>{t("login.password") || "Password"}</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#00aa5b" style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.forgotWrapper}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                {t("login.forgotPassword") || "Forgot Password?"}
              </Link>
            </div>

            <button type="submit" disabled={loading} style={styles.loginBtn}>
              {loading ? (t("login.loggingIn") || "Logging in...") : (t("login.button") || "Log In")}
            </button>
          </form>

          <div style={styles.footerText}>
            {t("login.noAccount") || "Don't have an account?"}{" "}
            <Link to="/register" style={styles.link}>
              {t("login.registerNow") || "Register Now"}
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
    backgroundColor: "#f4f6f8",
    padding: "20px",
  },

  wrapper: {
    display: "flex",
    width: "100%",
    maxWidth: "1000px",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },

  logoContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: "300px",
  },

  brandBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#e8f8f0",
    border: "1px solid #c7e9d7",
    padding: "6px 16px",
    borderRadius: "20px",
    width: "fit-content",
    marginBottom: "16px",
  },

  welcomeBox: {
    marginBottom: "15px",
  },

  logoImg: {
    width: "100%",
    maxWidth: "400px",
    objectFit: "contain",
    mixBlendMode: "multiply",
  },

  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "40px 36px",
    borderRadius: "24px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.06)",
    backgroundColor: "#ffffff",
    border: "1px solid #eaeaea",
    boxSizing: "border-box",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111111",
    marginBottom: "8px",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    color: "#666666",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: 0,
  },

  errorAlert: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
    fontSize: "13.5px",
    border: "1px solid #fecaca",
    fontWeight: "600",
    textAlign: "center",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    textAlign: "left",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555555",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "14px",
  },

  input: {
    width: "100%",
    padding: "11px 14px 11px 40px",
    borderRadius: "12px",
    border: "1px solid #c7e9d7",
    backgroundColor: "#fcfdfe",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    color: "#222222",
    transition: "all 0.2s ease-in-out",
  },

  loginBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#00aa5b",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "6px",
    boxShadow: "0 4px 12px rgba(0, 170, 91, 0.25)",
    transition: "all 0.2s ease-in-out",
  },

  forgotWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-4px",
  },

  forgotLink: {
    color: "#00aa5b",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },

  footerText: {
    marginTop: "24px",
    fontSize: "13px",
    color: "#666666",
    textAlign: "center",
  },

  link: {
    color: "#00aa5b",
    fontWeight: "bold",
    textDecoration: "none",
    marginLeft: "4px",
  },
};