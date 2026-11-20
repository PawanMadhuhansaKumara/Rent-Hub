import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Inbox, ArrowRight, X, Sparkles } from "lucide-react";
import "./components.css";

export default function RentRequestSuccessModal({
  isOpen = false,
  onClose,
  onShowRequests,
  itemTitle,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleShowRequests = () => {
    if (onShowRequests) {
      onShowRequests();
    } else {
      navigate("/my-items?tab=rent-requests");
    }
    if (onClose) onClose();
  };

  return (
    <div
      className="rent-request-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
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
    >
      <div
        className="rent-request-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "460px",
          borderRadius: "22px",
          background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
          border: "2px solid #86efac",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(22, 163, 74, 0.2)",
          padding: "30px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {onClose && (
            <button
              type="button"
              className="rent-modal-close-btn"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "rgba(0, 0, 0, 0.05)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Big Glowing Green Success Badge */}
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 35px rgba(34, 197, 94, 0.45)",
              marginBottom: "16px",
            }}
          >
            <CheckCircle2 size={52} color="#ffffff" strokeWidth={2.5} />
          </div>

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
            <Sparkles size={14} /> ORDER CONFIRMED
          </span>

          <h2
            style={{
              fontSize: "26px",
              fontWeight: "900",
              color: "#15803d",
              margin: "0 0 8px 0",
              letterSpacing: "-0.5px",
            }}
          >
            Payment Successful!
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "#166534",
              margin: "0 0 18px 0",
              lineHeight: "1.4",
              maxWidth: "360px",
            }}
          >
            {t(
              "rentRequest.requestSentMsg",
              "Your rental order has been placed successfully! The shop owner will verify and prepare your item for pickup."
            )}
          </p>

          {itemTitle && (
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #bbf7d0",
                borderRadius: "12px",
                padding: "10px 14px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#15803d",
                fontWeight: "700",
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>📦</span>
              <span>Item: {itemTitle}</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: "100%",
            }}
          >
            <button
              type="button"
              onClick={handleShowRequests}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "12px",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                border: "none",
                fontSize: "14.5px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 10px rgba(22, 163, 74, 0.35)",
              }}
            >
              <Inbox size={17} />
              <span>{t("rentRequest.showRequests", "View My Bookings & Requests")}</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "transparent",
                color: "#64748b",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {t("map.close", "Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
