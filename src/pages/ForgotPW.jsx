import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ArrowLeft, MessageSquare } from "lucide-react";
import "../responsive.css";
import logo from "../assets/logoLight.png";

export default function ForgotPW({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/login");
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

  // Step 1: 'phone' -> Step 2: 'otp_password' -> Step 3: 'success'
  const [step, setStep] = useState(1);

  const [phoneNo, setPhoneNo] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Step 1: Send OTP to Phone (SMS)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!phoneNo.trim()) {
      setErrorMsg("Please enter your registered phone number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://https://rent-hub-ashen.vercel.app/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_no: phoneNo.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || "Verification code sent to your phone!");
        setStep(2);
      } else {
        setErrorMsg(data.message || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
      setErrorMsg("Server error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otpCode.trim()) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://https://rent-hub-ashen.vercel.app/api/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_no: phoneNo.trim(),
          otp_code: otpCode.trim(),
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(3);
      } else {
        setErrorMsg(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      setErrorMsg("Server error. Please try again.");
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
            <h2 style={styles.leftTitle}>Forgot Password?</h2>
            <p style={styles.leftSubtitle}>
              Don't worry! Enter your registered phone number, and we'll send a verification SMS code to reset your password.
            </p>
          </div>
          <img src={logo} alt="Rent Hub" className="login-logo-img" style={styles.logoImg} />
        </div>

        {/* Right Side: ForgotPW Card */}
        <div className="login-card" style={styles.card}>
          
          {/* STEP 1: ENTER PHONE NUMBER */}
          {step === 1 && (
            <>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={styles.backBtn}
                  title="Back to Login"
                  aria-label="Back to Login"
                >
                  <ArrowLeft size={16} style={{ marginRight: "4px" }} />
                  <span>{t("common.back", "Back to Login")}</span>
                </button>
              </div>

              <h3 style={styles.cardTitle}>Reset Password</h3>
              <p style={styles.cardSubtitle}>
                Enter the phone number associated with your account.
              </p>

              {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

              <form onSubmit={handleSendOtp} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="07XXXXXXXX"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    required
                    style={styles.input}
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading} style={styles.actionBtn}>
                  {loading ? "Sending Code..." : "Send SMS Code"}
                </button>
              </form>

              <div style={styles.footerText}>
                Remember your password?{" "}
                <Link to="/login" style={styles.link}>
                  Login Now
                </Link>
              </div>
            </>
          )}

          {/* STEP 2: ENTER OTP & NEW PASSWORD */}
          {step === 2 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <MessageSquare size={20} color="var(--badge-blue-text)" />
                <h3 style={{ ...styles.cardTitle, margin: 0 }}>Verify SMS Code</h3>
              </div>
              <p style={styles.cardSubtitle}>
                We sent a 6-digit verification code to <strong>{phoneNo}</strong>.
              </p>

              {successMsg && <div style={styles.successAlert}>{successMsg}</div>}
              {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

              <form onSubmit={handleResetPassword} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                    style={{ ...styles.input, textAlign: "center", fontSize: "18px", letterSpacing: "4px", fontWeight: "bold" }}
                    autoFocus
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <button type="submit" disabled={loading} style={styles.actionBtn}>
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrorMsg(""); setSuccessMsg(""); }}
                  style={styles.backBtn}
                >
                  <ArrowLeft size={15} style={{ marginRight: "4px" }} /> Change Number
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={styles.resendBtn}
                >
                  Resend Code
                </button>
              </div>
            </>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <CheckCircle2 size={58} color="var(--primary)" style={{ marginBottom: "16px" }} />
              <h3 style={{ ...styles.cardTitle, color: "var(--primary)", marginBottom: "8px" }}>
                Password Reset Successful!
              </h3>
              <p style={{ ...styles.cardSubtitle, marginBottom: "28px" }}>
                Your account password has been updated. You can now log in using your new password.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                style={styles.actionBtn}
              >
                Go to Login
              </button>
            </div>
          )}

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
    marginLeft: "20px",
    marginBottom: "10px",
    width: "500px",
  },

  leftTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--text-main)",
    marginBottom: "8px",
    letterSpacing: "-0.3px",
  },

  leftSubtitle: {
    color: "var(--text-muted)",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  logoImg: {
    width: "500px",
    maxWidth: "100%",
    objectFit: "contain",
    filter: "drop-shadow(0 0 1.5px rgba(0, 0, 0, 0.45)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "44px 36px 36px 36px",
    borderRadius: "28px",
    boxShadow: "0 14px 38px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-light, rgba(226, 232, 240, 0.7))",
    boxSizing: "border-box",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--text-main)",
    marginBottom: "6px",
  },

  cardSubtitle: {
    color: "var(--text-muted)",
    fontSize: "13.5px",
    marginBottom: "20px",
    lineHeight: "1.5",
  },

  errorAlert: {
    backgroundColor: "var(--badge-red-bg)",
    color: "var(--badge-red-text)",
    padding: "11px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
    fontSize: "13px",
    border: "1px solid var(--badge-red-border)",
    fontWeight: "500",
  },

  successAlert: {
    backgroundColor: "var(--badge-green-bg)",
    color: "var(--badge-green-text)",
    padding: "11px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
    fontSize: "13px",
    border: "1px solid var(--border-light)",
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
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-secondary)",
  },

  input: {
    width: "100%",
    padding: "13px 18px",
    borderRadius: "14px",
    border: "1px solid var(--border-light)",
    backgroundColor: "var(--bg-input)",
    boxSizing: "border-box",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    color: "var(--text-main)",
    fontWeight: "500",
    transition: "all 0.2s ease-in-out",
  },

  actionBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "var(--primary)",
    color: "var(--text-main)",
    border: "1px solid var(--border-focus)",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "6px",
    boxShadow: "0 8px 22px rgba(0, 0, 0, 0.2)",
    transition: "all 0.2s ease-in-out",
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontWeight: "500",
  },

  resendBtn: {
    background: "none",
    border: "none",
    color: "var(--primary-text)",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
  },

  footerText: {
    marginTop: "44px",
    fontSize: "14px",
    color: "var(--text-muted)",
    textAlign: "center",
  },

  link: {
    color: "var(--primary-text)",
    fontWeight: "600",
    textDecoration: "none",
    marginLeft: "4px",
  },
};

