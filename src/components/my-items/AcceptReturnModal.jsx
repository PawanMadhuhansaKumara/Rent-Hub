import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, X, AlertTriangle } from "lucide-react";

export default function AcceptReturnModal({
  isOpen,
  onClose,
  item,
  onConfirm,
  submitting = false,
}) {
  const [rating, setRating] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setRating(10);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const itemTitle = item.itemTitle || item.title || "Rental Item";
  const itemImage = item.itemImage || item.image || item.image_url;
  const buyerName = item.buyerName || item.buyer_name || item.userName || "Customer";

  const getRatingFeedback = (val) => {
    if (val === 10) {
      return {
        label: "🌟 10/10 - Perfect Condition (No Defects)",
        desc: "Item returned in excellent condition with no defects. Gives customer maximum Trust Score (+100%) and rental limit boost.",
        color: "#15803d",
        bg: "#f0fdf4",
        border: "#86efac",
      };
    }
    if (val >= 8) {
      return {
        label: `👍 ${val}/10 - Very Good Condition (Minimal Wear)`,
        desc: "Item returned safely with only minor normal wear. Customer receives a high Trust Score and limit boost.",
        color: "#166534",
        bg: "#f0fdf4",
        border: "#bbf7d0",
      };
    }
    if (val >= 5) {
      return {
        label: `⚠️ ${val}/10 - Fair Condition (Minor Scratches / Wear)`,
        desc: "Item returned with slight cosmetic wear, minor scratches, or slight delay. Moderate Trust Score boost.",
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
      };
    }
    return {
      label: `❌ ${val}/10 - Damaged / Defective (Notable Issues)`,
      desc: "Item returned with noticeable defects or damaged parts. No Trust Score or rental limit boost will be given.",
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca",
    };
  };

  const feedback = getRatingFeedback(rating);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onConfirm) {
      onConfirm(rating);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          maxWidth: "520px",
          width: "100%",
          padding: "26px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          position: "relative",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <ShieldCheck size={22} color="#00aa5b" />
              <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "700", color: "#111827" }}>
                Inspect & Accept Return
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
              Inspect the returned item and select the customer's return trust rating.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "4px",
              borderRadius: "50%",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Item & Customer Mini Preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 14px",
            backgroundColor: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            marginBottom: "20px",
          }}
        >
          {itemImage ? (
            <img
              src={itemImage.startsWith("http") ? itemImage : `http://localhost:5001${itemImage.startsWith("/") ? "" : "/"}${itemImage}`}
              alt={itemTitle}
              style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#e5e7eb",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                color: "#6b7280",
              }}
            >
              No Pic
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: "0 0 2px 0", fontSize: "14.5px", fontWeight: "700", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {itemTitle}
            </h4>
            <span style={{ fontSize: "12.5px", color: "#4b5563" }}>
              Customer: <strong>{buyerName}</strong>
            </span>
          </div>
        </div>

        {/* Trust Rating (0-10) Selection */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ fontSize: "13.5px", fontWeight: "700", color: "#374151" }}>
              Rate Customer Trust & Care (0 - 10):
            </label>
            <span style={{ fontSize: "13px", fontWeight: "800", color: feedback.color }}>
              Score: {rating} / 10
            </span>
          </div>

          {/* Number Pills 0 to 10 */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "14px" }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSelected = rating === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  style={{
                    flex: "1 0 calc(9% - 4px)",
                    minWidth: "36px",
                    height: "38px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid #00aa5b" : "1.5px solid #e5e7eb",
                    backgroundColor: isSelected ? "#00aa5b" : "#f9fafb",
                    color: isSelected ? "#ffffff" : "#374151",
                    fontWeight: isSelected ? "800" : "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 4px 10px rgba(0, 170, 91, 0.3)" : "none",
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Dynamic Feedback Banner */}
          <div
            style={{
              backgroundColor: feedback.bg,
              border: `1.5px solid ${feedback.border}`,
              borderRadius: "12px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <div>
              <strong style={{ color: feedback.color, fontSize: "13.5px", display: "block", marginBottom: "2px" }}>
                {feedback.label}
              </strong>
              <p style={{ margin: 0, fontSize: "12px", color: "#4b5563", lineHeight: 1.4 }}>
                {feedback.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1.5px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontSize: "13.5px",
              fontWeight: "600",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#00aa5b",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: "700",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(0, 170, 91, 0.25)",
            }}
          >
            {submitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Confirm & Accept ({rating}/10)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
