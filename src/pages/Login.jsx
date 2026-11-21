import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import "../responsive.css";
import logo from "../assets/logoLight.png";

export default function Login({ onLoginSuccess, user }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // If already logged in, redirect immediately and NEVER show the login form
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

  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Under NO circumstance render the login form if logged in
  if (isAlreadyLoggedIn) {
    return null;
  }

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

        const userLang = data.user?.preferred_language || data.user?.language;
        if (userLang) {
          localStorage.setItem("language", userLang);
          if (i18n.language !== userLang) {
            i18n.changeLanguage(userLang);
          }
        }

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
            <CheckCircle2 size={18} color="var(--primary)" />
            <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "13px" }}>RentHub Community</span>
          </div>
          <div className="login-welcome-box" style={styles.welcomeBox}>
            <h2 style={styles.title}>{t("login.title") || "Welcome Back!"}</h2>
            <p style={styles.subtitle}>{t("login.subtitle") || "Rent smarter, live better. Access your account below."}</p>
          </div>
          <img src={logo} alt="Rent Hub" className="login-logo-img" style={styles.logoImg} />
        </div>

        {/* Right Side: Login Form Card */}
        <div className="login-card" style={styles.card}>
          <div style={styles.headerBox}>
            <button
              type="button"
              onClick={handleBack}
              style={styles.backBtn}
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft size={18} color="var(--primary)" />
            </button>
            <div style={styles.brandBadge}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "12px" }}>RentHub Access</span>
            </div>
          </div>

          {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t("login.phoneNumber") || "Phone Number"}</label>
              <div style={styles.inputWrapper}>
                <Phone size={18} color="var(--primary)" style={styles.inputIcon} />
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
                <Lock size={18} color="var(--primary)" style={styles.inputIcon} />
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
    backgroundColor: "var(--bg-app)",
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
    backgroundColor: "var(--primary-light)",
    border: "1px solid var(--primary-border)",
    padding: "6px 16px",
    borderRadius: "20px",
    width: "fit-content",
    marginBottom: "16px",
    color: "var(--primary-text)",
  },

  welcomeBox: {
    marginBottom: "15px",
  },

  logoImg: {
    width: "100%",
    maxWidth: "400px",
    objectFit: "contain",
    filter: "drop-shadow(0 0 1.5px rgba(0, 0, 0, 0.45)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))",
  },

  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "40px 36px",
    borderRadius: "24px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.06)",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-light)",
    boxSizing: "border-box",
  },

  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  backBtn: {
    backgroundColor: "var(--bg-card-elevated)",
    border: "1px solid var(--border-light)",
    color: "var(--text-main)",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--text-main)",
    marginBottom: "8px",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    color: "var(--text-muted)",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: 0,
  },

  errorAlert: {
    backgroundColor: "var(--badge-red-bg)",
    color: "var(--badge-red-text)",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
    fontSize: "13.5px",
    border: "1px solid var(--badge-red-border)",
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
    color: "var(--text-secondary)",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "var(--text-muted)",
  },

  input: {
    width: "100%",
    padding: "11px 14px 11px 40px",
    borderRadius: "12px",
    border: "1px solid var(--border-light)",
    backgroundColor: "var(--bg-input)",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    color: "var(--text-main)",
    transition: "all 0.2s ease-in-out",
  },

  loginBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "var(--primary)",
    color: "var(--text-main)",
    border: "1px solid var(--border-focus)",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "6px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    transition: "all 0.2s ease-in-out",
  },

  forgotWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-4px",
  },

  forgotLink: {
    color: "var(--primary)",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },

  footerText: {
    marginTop: "24px",
    fontSize: "13px",
    color: "var(--text-muted)",
    textAlign: "center",
  },

  link: {
    color: "var(--primary)",
    fontWeight: "bold",
    textDecoration: "none",
    marginLeft: "4px",
  },
};