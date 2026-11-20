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
        className="payment-modal-box"
        style={{
          background: "var(--bg-modal)",
          borderRadius: "22px",
          width: "100%",
          maxWidth: "490px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(22, 163, 74, 0.15)",
          overflow: "hidden",
          animation: "fadeIn 0.25s ease-out",
          border: paymentDone ? "2px solid var(--badge-green-bg)" : "1px solid var(--border-light)",
          color: "var(--text-main)",
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
                animation: "scaleIn 0.35s ease-out",
              }}
            >
              <CheckCircle2 size={56} color="var(--text-inverse)" strokeWidth={2.5} />
            </div>

            {/* Big Green Heading */}
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
              <Sparkles size={14} /> {t("payment.verified", "TRANSACTION VERIFIED")}
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
              {t("payment.successTitle", "Payment Successful!")}
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
              {t("payment.successDesc", { item: itemTitle, defaultValue: `Your payment for ${itemTitle} has been processed successfully.` })}
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
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{t("payment.amountPaid", "Amount Paid:")}</span>
                <strong style={{ fontSize: "16px", color: "var(--primary)" }}>
                  LKR {numTotal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
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
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{t("payment.method", "Payment Method:")}</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>
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
                  borderBottom: "1px solid var(--bg-card-hover)",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{t("payment.status", "Status:")}</span>
                <span
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--text-inverse)",
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
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Ref Number:</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace", fontWeight: "600" }}>
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
                background: "linear-gradient(135deg, var(--text-main) 0%, var(--text-main) 100%)",
                padding: "18px 20px",
                color: "var(--text-inverse)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "16.5px", fontWeight: "700" }}>
                  {t("payment.title", "Select Payment Option")}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {t("payment.totalPayable", "Total Payable")}:{" "}
                  <strong style={{ color: "var(--primary-light)", fontSize: "14px" }}>
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
                  color: "var(--text-inverse)",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Payment Choices List */}
            <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
              <p style={{ margin: "0 0 14px", fontSize: "13px", color: "var(--text-secondary)" }}>
                Choose how you would like to pay for <strong>{itemTitle}</strong>:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* 1. Cash Points Option */}
                <div
                  onClick={() => setSelectedMethod("cashpoints")}
                  style={{
                    border:
                      selectedMethod === "cashpoints"
                        ? "2px solid var(--badge-yellow-text)"
                        : "1.5px solid var(--border-light)",
                    backgroundColor:
                      selectedMethod === "cashpoints" ? "var(--badge-yellow-bg)" : "var(--bg-card-elevated)",
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
                          backgroundColor: "var(--badge-yellow-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Coins size={19} color="var(--badge-yellow-text)" />
                      </div>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "var(--badge-yellow-text)" }}>
                          {t("payment.cashpoints", "Pay with Cash Points")}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "var(--badge-yellow-text)",
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
                      style={{ accentColor: "var(--badge-yellow-text)", width: "18px", height: "18px" }}
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
                        color: "var(--primary)",
                        fontWeight: "600",
                      }}
                    >
                      <CheckCircle2 size={14} color="var(--primary)" />
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
                        borderTop: "1px dashed var(--badge-yellow-text)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--badge-yellow-text)" }}>
                        <AlertTriangle size={14} color="var(--badge-yellow-text)" />
                        <span>Need {(numTotal - numPoints).toLocaleString()} more points</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTopup && onOpenTopup();
                        }}
                        style={{
                          background: "var(--badge-yellow-text)",
                          color: "var(--text-inverse)",
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
                        ? "2px solid var(--badge-blue-text)"
                        : "1.5px solid var(--border-light)",
                    backgroundColor:
                      selectedMethod === "card" ? "var(--badge-blue-bg)" : "var(--bg-card-elevated)",
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
                          backgroundColor: "var(--badge-blue-bg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CreditCard size={19} color="var(--badge-blue-text)" />
                      </div>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "var(--badge-blue-text)" }}>
                          {t("payment.card", "Card Payment (PayHere Gateway)")}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "var(--badge-blue-text)",
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
                      style={{ accentColor: "var(--badge-blue-text)", width: "18px", height: "18px" }}
                    />
                  </div>

                  {selectedMethod === "card" && (
                    <div
                      style={{
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: "1px solid var(--badge-blue-bg)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "3px" }}>
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
                            border: "1px solid var(--border-light)",
                            fontSize: "12.5px",
                            background: "var(--bg-modal, var(--bg-card))",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "3px" }}>
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
                              border: "1px solid var(--border-light)",
                              fontSize: "12.5px",
                              background: "var(--bg-modal, var(--bg-card))",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "3px" }}>
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
                              border: "1px solid var(--border-light)",
                              fontSize: "12.5px",
                              background: "var(--bg-modal, var(--bg-card))",
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
                        ? "2px solid var(--primary)"
                        : "1.5px solid var(--border-light)",
                    backgroundColor:
                      selectedMethod === "cash" ? "var(--badge-green-bg)" : "var(--bg-card-elevated)",
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
                          backgroundColor: "var(--badge-green-bg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Banknote size={19} color="var(--primary)" />
                      </div>
                      <div>
                        <strong style={{ fontSize: "13.5px", color: "var(--primary-hover)" }}>
                          {t("payment.cash", "Cash on Pickup")}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "var(--primary)",
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
                      style={{ accentColor: "var(--primary)", width: "18px", height: "18px" }}
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
                        ? "var(--badge-yellow-text)"
                        : selectedMethod === "card"
                        ? "var(--badge-blue-text)"
                        : "var(--primary)",
                    color: "var(--text-inverse)",
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
