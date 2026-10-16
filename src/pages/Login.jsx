import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    <div style={styles.container}>
      <div style={styles.wrapper}>

        {/* Rent Hub Logo — card box ඉහළින්, පිටතින් */}
        <div style={styles.logoContainer}>
          <img src="/logo.png" alt="Rent Hub" style={styles.logoImg} />
        </div>

        {/* Login Card */}
        <div style={styles.card}>
          <h2 style={styles.title}>{t("login.title")}</h2>

          <p style={styles.subtitle}>{t("login.subtitle")}</p>

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
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "400px",
  },

  logoContainer: {
    marginBottom: "16px",
  },

  logoImg: {
    width: "660px",
    objectFit: "contain",
    mixBlendMode: "multiply",
  },

  card: {
    width: "100%",
    padding: "35px 30px",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    backgroundColor: "#ffffff",
    textAlign: "center",
  },

  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },

  errorAlert: {
    backgroundColor: "#ffe6e6",
    color: "#d9534f",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "13px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    textAlign: "left",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "5px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
  },

  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
  },

  loginBtn: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "5px",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
    color: "#888",
    fontSize: "12px",
  },

  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  footerText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#555",
  },

  link: {
    color: "#007bff",
    fontWeight: "bold",
    textDecoration: "none",
  },
};
