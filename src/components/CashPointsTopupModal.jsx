import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Coins,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import "./components.css";

export default function CashPointsTopupModal({
  isOpen,
  onClose,
  currentUser,
  currentBalance = 0,
  onSuccess,
  API_URL = "http://localhost:5001",
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [cardHolder, setCardHolder] = useState(
    currentUser?.name || currentUser?.full_name || "RentHub User"
  );
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [updatedBalance, setUpdatedBalance] = useState(currentBalance);
  const [errorMsg, setErrorMsg] = useState("");
  const [txnRef, setTxnRef] = useState("");

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2500, 5000];
  const finalAmount = customAmount ? Number(customAmount) : Number(amount);

  const handleTopup = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!finalAmount || finalAmount <= 0) {
      setErrorMsg("Please select or enter a valid top-up amount.");
      return;
    }

    const userId = currentUser?.id || currentUser?.user_id;
    if (!userId) {
      setErrorMsg("User session not found. Please log in.");
      return;
    }

    const generatedTxn = `PAYHERE-${Date.now().toString().slice(-6)}`;
    setTxnRef(generatedTxn);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users/${userId}/topup-cashpoints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          transactionRef: generatedTxn,
          paymentMethod: "card_gateway",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUpdatedBalance(data.cashPoints);
        setIsSuccess(true);

        // Update local storage user profile
        try {
          const storedUser = JSON.parse(localStorage.getItem("rent_hub_user") || "{}");
          storedUser.cash_points = data.cashPoints;
          localStorage.setItem("rent_hub_user", JSON.stringify(storedUser));
        } catch {}

        window.dispatchEvent(new Event("user_updated"));

        if (onSuccess) {
          onSuccess(data.cashPoints, finalAmount);
        }
      } else {
        setErrorMsg(data.message || "Top-up failed. Please try again.");
      }
    } catch (err) {
      console.error("Top-up API error:", err);
      setErrorMsg("Unable to connect to payment gateway. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMsg("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={handleClose}
    >
      <div
        className="topup-modal-box"
        style={{
          background: "var(--bg-modal)",
          borderRadius: "22px",
          width: "100%",
          maxWidth: "470px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(22, 163, 74, 0.15)",
          overflow: "hidden",
          animation: "fadeIn 0.25s ease-out",
          border: isSuccess ? "2px solid var(--badge-green-bg)" : "1px solid var(--border-light)",
          color: "var(--text-main)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* BIG GREEN PAYMENT SUCCESS SCREEN                               */}
        {/* ============================================================== */}
        {isSuccess ? (
          <div
            style={{
              padding: "36px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "linear-gradient(180deg, var(--badge-green-bg) 0%, var(--bg-modal, var(--bg-card)) 100%)",
            }}
          >
            {/* Glowing Big Green Success Badge */}
            <div
              style={{
                width: "92px",
                height: "92px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--text-accent) 0%, var(--primary) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 35px rgba(34, 197, 94, 0.45)",
                marginBottom: "16px",
              }}
            >
              <CheckCircle2 size={56} color="var(--text-inverse)" strokeWidth={2.5} />
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "var(--badge-green-bg)",
                color: "var(--primary)",
                fontSize: "12px",
                fontWeight: "700",
                padding: "4px 12px",
                borderRadius: "20px",
                marginBottom: "8px",
              }}
            >
              <Sparkles size={14} /> {t("topup.successTitle", "TOP-UP SUCCESSFUL")}
            </span>

            <h2
              style={{
                fontSize: "28px",
                fontWeight: "900",
                color: "var(--primary)",
                margin: "0 0 6px 0",
                letterSpacing: "-0.5px",
              }}
            >
              {t("topup.successTitle", "Payment Successful!")}
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "var(--primary-hover)",
                margin: "0 0 20px 0",
                maxWidth: "360px",
                lineHeight: "1.4",
              }}
            >
              {t("topup.successDesc", { amount: finalAmount.toLocaleString(), defaultValue: `You have successfully added ${finalAmount.toLocaleString()} Cash Points to your wallet.` })}
            </p>

            {/* Receipt Summary Card */}
            <div
              style={{
                width: "100%",
                background: "var(--bg-modal, var(--bg-card))",
                border: "1.5px solid var(--badge-green-bg)",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "24px",
                boxShadow: "0 4px 6px -1px rgba(22, 163, 74, 0.08)",
                boxSizing: "border-box",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--bg-card-hover)",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Amount Charged:</span>
                <strong style={{ fontSize: "16px", color: "var(--primary)" }}>
                  LKR {finalAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--bg-card-hover)",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Points Added:</span>
                <strong style={{ fontSize: "15px", color: "var(--badge-yellow-text)" }}>
                  +{finalAmount.toLocaleString()} Points
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--bg-card-hover)",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{t("topup.newBalance", "Updated Balance:")}</span>
                <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>
                  {Number(updatedBalance).toLocaleString()} Points
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Ref Number:</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace", fontWeight: "600" }}>
                  {txnRef}
                </span>
              </div>
            </div>

            {/* Done Action Button */}
            <button
              type="button"
              onClick={handleClose}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "12px",
                backgroundColor: "var(--primary)",
                color: "var(--text-inverse)",
                border: "none",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 10px rgba(22, 163, 74, 0.35)",
              }}
            >
              <span>Done ✓</span>
            </button>
          </div>
        ) : (
          /* ============================================================== */
          /* TOPUP INPUT SCREEN                                             */
          /* ============================================================== */
          <>
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
                padding: "18px 20px",
                color: "var(--text-inverse)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Coins size={20} color="var(--text-inverse)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                    {t("topup.title", "Top Up Cash Points")}
                  </h3>
                  <span style={{ fontSize: "12px", opacity: 0.9 }}>
                    {t("topup.currentBalance", "Current Balance")}: {Number(currentBalance).toLocaleString()} Points (LKR {Number(currentBalance).toLocaleString()})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-inverse)",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleTopup} style={{ padding: "20px" }}>
              {errorMsg && (
                <div
                  style={{
                    background: "var(--badge-red-bg)",
                    border: "1px solid var(--badge-red-border)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--badge-red-text)",
                    fontSize: "12.5px",
                    fontWeight: "600",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Amount Selection */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                  }}
                >
                  {t("topup.selectAmount", "Select Top-Up Amount")}:
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  {quickAmounts.map((q) => {
                    const isSelected = !customAmount && amount === q;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          setAmount(q);
                          setCustomAmount("");
                        }}
                        style={{
                          padding: "8px 0",
                          borderRadius: "8px",
                          border: isSelected
                            ? "2px solid var(--primary)"
                            : "1px solid var(--border-light)",
                          backgroundColor: isSelected ? "var(--badge-green-bg)" : "var(--bg-app-alt)",
                          color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                          fontWeight: isSelected ? "700" : "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        +{q.toLocaleString()}
                      </button>
                    );
                  })}
                </div>

                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--text-muted)",
                    }}
                  >
                    LKR
                  </span>
                  <input
                    type="number"
                    placeholder={t("topup.customAmount", "Or enter custom amount...")}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="100"
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 46px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                      fontSize: "13px",
                      fontWeight: "600",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Gateway Card Payment Section */}
              <div
                style={{
                  background: "var(--bg-app-alt)",
                  border: "1.5px solid var(--border-light)",
                  borderRadius: "12px",
                  padding: "14px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CreditCard size={16} color="var(--badge-blue-text)" />
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: "700",
                        color: "var(--text-main)",
                      }}
                    >
                      PayHere Gateway (Test Sandbox)
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: "700",
                      backgroundColor: "var(--badge-blue-bg)",
                      color: "var(--badge-blue-text)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Zero Fees
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        marginBottom: "3px",
                      }}
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-light)",
                        fontSize: "12.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "var(--text-muted)",
                          marginBottom: "3px",
                        }}
                      >
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-light)",
                          fontSize: "12.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "var(--text-muted)",
                          marginBottom: "3px",
                        }}
                      >
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-light)",
                          fontSize: "12.5px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "var(--primary)",
                  color: "var(--text-inverse)",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 6px -1px rgba(22, 163, 74, 0.25)",
                  opacity: loading ? 0.75 : 1,
                }}
              >
                <ShieldCheck size={18} />
                <span>
                  {loading
                    ? t("topup.processing", "Processing Gateway Payment...")
                    : t("topup.payNow", { amount: finalAmount.toLocaleString(), defaultValue: `Pay LKR ${finalAmount.toLocaleString()} & Add ${finalAmount.toLocaleString()} Points` })}
                </span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
