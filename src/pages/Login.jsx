import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../responsive.css";

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
          <img src="/logo.png" alt="Rent Hub" className="login-logo-img" style={styles.logoImg} />
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
          </form>

          <div style={styles.divider}>
            <span>{t("login.or")}</span>
          </div>

          {/* Google Connect Button */}
          <button
            type="button"
            style={styles.googleBtn}
            onClick={() => alert(t("login.googleMessage"))}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              style={{ width: "20px", marginRight: "10px" }}
            />
            {t("login.googleButton")}
          </button>

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
    marginBottom: "12px",
    width: "100%",
  },

  logoImg: {
    width: "660px",
    maxWidth: "100%",
    objectFit: "contain",
    mixBlendMode: "multiply",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "44px 38px",
    borderRadius: "20px",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.1), 0 2px 8px rgba(15, 23, 42, 0.05)",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    textAlign: "center",
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
    borderRadius: "10px",
    marginBottom: "18px",
    fontSize: "13.5px",
    border: "1px solid #fecaca",
    fontWeight: "500",
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
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
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

  loginBtn: {
    padding: "13px 20px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "6px",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
    transition: "all 0.2s ease-in-out",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    margin: "22px 0",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "500",
  },

  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  },

  footerText: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#64748b",
  },

  link: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
    marginLeft: "4px",
  },
};
