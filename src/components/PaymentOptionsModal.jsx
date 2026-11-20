import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Coins,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import "./components.css";

export default function PaymentOptionsModal({
  isOpen,
  onClose,
  itemTitle,
  totalPrice = 0,
  currentUser,
  currentUserPoints = 0,
  onOpenTopup,
  onConfirmPayment,
  isSubmitting = false,
}) {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState("cashpoints"); // 'cashpoints' | 'card' | 'cash'
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [paymentDone, setPaymentDone] = useState(false);
  const [txnRef, setTxnRef] = useState("");

  if (!isOpen) return null;

  const numTotal = Number(totalPrice) || 0;
  const numPoints = Number(currentUserPoints) || 0;
  const hasEnoughPoints = numPoints >= numTotal;

  const handleConfirm = async () => {
    if (selectedMethod === "cashpoints" && !hasEnoughPoints) {
      alert("You don't have enough Cash Points for this rental. Please top up your points or select Card / Cash on Pickup.");
      return;
    }

    const generatedTxn = `PAY-${Date.now().toString().slice(-6)}`;
    setTxnRef(generatedTxn);

    if (onConfirmPayment) {
      const res = await onConfirmPayment({
        paymentMethod: selectedMethod,
        isPaid: selectedMethod === "cashpoints" || selectedMethod === "card",
        cardDetails: selectedMethod === "card" ? { cardNumber, cardExpiry } : null,
        transactionRef: generatedTxn,
      });

      // If successful, show the big green Payment Success screen
      if (res !== false) {
        setPaymentDone(true);
      }
    }
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
      onClick={paymentDone ? onClose : undefined}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "22px",
          width: "100%",
          maxWidth: "490px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(22, 163, 74, 0.15)",
          overflow: "hidden",
          animation: "fadeIn 0.25s ease-out",
          border: paymentDone ? "2px solid #86efac" : "1px solid #e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* BIG GREEN PAYMENT SUCCESS SCREEN                               */}
        {/* ============================================================== */}
        {paymentDone ? (
          <div
            style={{
              padding: "36px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
            }}
          >
            {/* Glowing Big Green Success Badge */}
            <div
              style={{
                width: "92px",
                height: "92px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 35px rgba(34, 197, 94, 0.45)",
                marginBottom: "16px",
                animation: "scaleIn 0.35s ease-out",
              }}
            >
              <CheckCircle2 size={56} color="#ffffff" strokeWidth={2.5} />
            </div>

            {/* Big Green Heading */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#dcfce7",
                color: "#15803d",
                fontSize: "12px",
                fontWeight: "700",
                padding: "4px 12px",
                borderRadius: "20px",
                marginBottom: "8px",
              }}
            >
              <Sparkles size={14} /> {t("payment.verified", "TRANSACTION VERIFIED")}
            </span>

            <h2
              style={{
                fontSize: "28px",
                fontWeight: "900",
                color: "#15803d",
                margin: "0 0 6px 0",
                letterSpacing: "-0.5px",
              }}
            >
              {t("payment.successTitle", "Payment Successful!")}
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#166534",
                margin: "0 0 20px 0",
                maxWidth: "360px",
                lineHeight: "1.4",
              }}
            >
              {t("payment.successDesc", { item: itemTitle, defaultValue: `Your payment for ${itemTitle} has been processed successfully.` })}
            </p>

            {/* Receipt Summary Card */}
            <div
              style={{
                width: "100%",
                background: "#ffffff",
                border: "1.5px solid #bbf7d0",
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
                  borderBottom: "1px solid #f1f5f9",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>{t("payment.amountPaid", "Amount Paid:")}</span>
                <strong style={{ fontSize: "16px", color: "#15803d" }}>
                  LKR {numTotal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #f1f5f9",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>{t("payment.method", "Payment Method:")}</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                  {selectedMethod === "cashpoints"
                    ? `🪙 ${t("payment.cashpoints", "Cash Points")}`
                    : selectedMethod === "card"
                    ? `💳 ${t("payment.card", "Card (PayHere Gateway)")}`
                    : `💵 ${t("payment.cash", "Cash on Pickup")}`}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #f1f5f9",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>{t("payment.status", "Status:")}</span>
                <span
                  style={{
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {t("payment.paid", "PAID ✓")}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Ref Number:</span>
                <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace", fontWeight: "600" }}>
                  {txnRef}
                </span>
              </div>
            </div>

            {/* Done Action Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "12px",
                backgroundColor: "#16a34a",
                color: "#ffffff",
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
              <span>{t("payment.done", "Done / View Bookings")}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          /* ============================================================== */
          /* PAYMENT SELECTION SCREEN                                       */
          /* ============================================================== */
          <>
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                padding: "18px 20px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "16.5px", fontWeight: "700" }}>
                  {t("payment.title", "Select Payment Option")}
                </h3>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {t("payment.totalPayable", "Total Payable")}:{" "}
                  <strong style={{ color: "#4ade80", fontSize: "14px" }}>
                    LKR {numTotal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Payment Choices List */}
            <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
              <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#475569" }}>
                Choose how you would like to pay for <strong>{itemTitle}</strong>:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* 1. Cash Points Option */}
                <div
                  onClick={() => setSelectedMethod("cashpoints")}
                  style={{
                    border:
                      selectedMethod === "cashpoints"
                        ? "2px solid #eab308"
                        : "1.5px solid #e2e8f0",
                    backgroundColor:
                      selectedMethod === "cashpoints" ? "#fefce8" : "#ffffff",
                    borderRadius: "14px",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "10px",
                          backgroundColor: "#fef08a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Coins size={19} color="#ca8a04" />
                      </div>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "#713f12" }}>
                          {t("payment.cashpoints", "Pay with Cash Points")}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#854d0e",
                          }}
                        >
                          {t("payment.yourBalance", "Your Balance:")} <strong>{numPoints.toLocaleString()} Points</strong> (LKR {numPoints.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="paymentOption"
                      checked={selectedMethod === "cashpoints"}
                      onChange={() => setSelectedMethod("cashpoints")}
                      style={{ accentColor: "#ca8a04", width: "18px", height: "18px" }}
                    />
                  </div>

                  {hasEnoughPoints ? (
                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11.5px",
                        color: "#15803d",
                        fontWeight: "600",
                      }}
                    >
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span>{t("payment.sufficientBalance", "Sufficient balance. Points will be automatically deducted.")}</span>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "8px",
                        borderTop: "1px dashed #fde047",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#b45309" }}>
                        <AlertTriangle size={14} color="#d97706" />
                        <span>Need {(numTotal - numPoints).toLocaleString()} more points</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTopup && onOpenTopup();
                        }}
                        style={{
                          background: "#ca8a04",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>+ {t("payment.topupBtn", "Top Up Points")}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Card Payment (PayHere Gateway) Option */}
                <div
                  onClick={() => setSelectedMethod("card")}
                  style={{
                    border:
                      selectedMethod === "card"
                        ? "2px solid #2563eb"
                        : "1.5px solid #e2e8f0",
                    backgroundColor:
                      selectedMethod === "card" ? "#eff6ff" : "#ffffff",
                    borderRadius: "14px",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: selectedMethod === "card" ? "12px" : "0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "10px",
                          backgroundColor: "#dbeafe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CreditCard size={19} color="#1e3a8a" />
                      </div>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "#1e3a8a" }}>
                          {t("payment.card", "Card Payment (PayHere Gateway)")}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#3b82f6",
                          }}
                        >
                          {t("payment.cardDesc", "Debit / Credit Card (Visa / Master)")}
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="paymentOption"
                      checked={selectedMethod === "card"}
                      onChange={() => setSelectedMethod("card")}
                      style={{ accentColor: "#2563eb", width: "18px", height: "18px" }}
                    />
                  </div>

                  {selectedMethod === "card" && (
                    <div
                      style={{
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: "1px solid #bfdbfe",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#475569", marginBottom: "3px" }}>
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12.5px",
                            background: "#fff",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#475569", marginBottom: "3px" }}>
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              background: "#fff",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#475569", marginBottom: "3px" }}>
                            CVV
                          </label>
                          <input
                            type="text"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "12.5px",
                              background: "#fff",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Cash on Pickup Option */}
                <div
                  onClick={() => setSelectedMethod("cash")}
                  style={{
                    border:
                      selectedMethod === "cash"
                        ? "2px solid #16a34a"
                        : "1.5px solid #e2e8f0",
                    backgroundColor:
                      selectedMethod === "cash" ? "#f0fdf4" : "#ffffff",
                    borderRadius: "14px",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "10px",
                          backgroundColor: "#dcfce7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Banknote size={19} color="#15803d" />
                      </div>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "#166534" }}>
                          {t("payment.cash", "Cash on Pickup")}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#16a34a",
                          }}
                        >
                          {t("payment.cashDesc", "Pay directly to the owner when collecting the item")}
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="paymentOption"
                      checked={selectedMethod === "cash"}
                      onChange={() => setSelectedMethod("cash")}
                      style={{ accentColor: "#16a34a", width: "18px", height: "18px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: "22px" }}>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting || (selectedMethod === "cashpoints" && !hasEnoughPoints)}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "12px",
                    backgroundColor:
                      selectedMethod === "cashpoints"
                        ? "#ca8a04"
                        : selectedMethod === "card"
                        ? "#2563eb"
                        : "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor:
                      isSubmitting || (selectedMethod === "cashpoints" && !hasEnoughPoints)
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity:
                      isSubmitting || (selectedMethod === "cashpoints" && !hasEnoughPoints)
                        ? 0.6
                        : 1,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {isSubmitting ? (
                    <span>{t("payment.processing", "Processing Payment...")}</span>
                  ) : selectedMethod === "cashpoints" ? (
                    <>
                      <Coins size={18} />
                      <span>{t("payment.confirmPay", "Confirm & Pay")} ({numTotal.toLocaleString()} Points)</span>
                    </>
                  ) : selectedMethod === "card" ? (
                    <>
                      <CreditCard size={18} />
                      <span>{t("payment.confirmPay", "Confirm & Pay")} (LKR {numTotal.toLocaleString()})</span>
                    </>
                  ) : (
                    <>
                      <Banknote size={18} />
                      <span>{t("payment.confirmRental", "Confirm Rental")} ({t("payment.cash", "Cash on Pickup")})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
