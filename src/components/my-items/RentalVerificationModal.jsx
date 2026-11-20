import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  ClipboardCheck,
  ShieldCheck,
  UserCheck,
  Package,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Coins,
} from "lucide-react";
import "../components.css";
import { formatRentalDate } from "../../utils/dateUtils";

/**
 * RentalVerificationModal
 * Modal form for shop owners to complete a handover verification
 * checklist before handing over a rented item to the customer.
 */
export default function RentalVerificationModal({
  isOpen = false,
  req,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const { t } = useTranslation();
  const [idCardChecked, setIdCardChecked] = useState(false);
  const [customerDetailsVerified, setCustomerDetailsVerified] = useState(false);
  const [rentalPaymentStatus, setRentalPaymentStatus] = useState("Paid");
  const [securityDeposit, setSecurityDeposit] = useState("Not Required");
  const [itemCondition, setItemCondition] = useState("Good");
  const [accessoriesIncluded, setAccessoriesIncluded] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [validationError, setValidationError] = useState("");

  // Reset form when modal opens or request changes
  useEffect(() => {
    if (isOpen) {
      setIdCardChecked(false);
      setCustomerDetailsVerified(false);
      setRentalPaymentStatus("Paid");
      setSecurityDeposit("Not Required");
      setItemCondition("Good");
      setAccessoriesIncluded(true);
      setAdditionalNotes("");
      setValidationError("");
    }
  }, [isOpen, req?.id]);

  // ESC key listener to cancel / close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting && onClose) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !req) return null;

  const customerName =
    req.requesterName ||
    req.buyerName ||
    req.buyer_name ||
    req.userName ||
    "Customer";
  const customerPhone =
    req.requesterPhone || req.buyerPhone || req.buyer_phone || "";

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    // Required fields validation
    if (!idCardChecked || !customerDetailsVerified) {
      setValidationError(
        "Please verify the customer's ID Card and verify customer details before confirming handover."
      );
      return;
    }

    const verificationData = {
      idCardChecked,
      customerDetailsVerified,
      rentalPaymentStatus,
      securityDeposit,
      itemCondition,
      accessoriesIncluded,
      additionalNotes: additionalNotes.trim(),
    };

    onConfirm && onConfirm(req, verificationData);
  };

  return (
    <div
      className="rent-request-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && onClose) {
          onClose();
        }
      }}
    >
      <div
        className="rent-request-modal-content"
        style={{ maxWidth: "520px", borderRadius: "18px" }}
      >
        <form
          className="rent-request-form"
          onSubmit={handleSubmit}
          style={{ padding: "24px 22px", gap: "16px" }}
        >
          {/* Header */}
          <div className="request-form-heading" style={{ marginBottom: "0" }}>
            <div
              className="request-form-icon"
              style={{ background: "#dcfce7", color: "#15803d" }}
            >
              <ClipboardCheck size={22} />
            </div>
            <div className="request-form-heading-text">
              <h2 style={{ fontSize: "18px", color: "#0f172a" }}>
                {t("rentModals.verifyHandover", "Rental Handover Verification")}
              </h2>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                {t("rentModals.handoverDesc", "Verify customer & item condition before handover")}
              </p>
            </div>
            <button
              type="button"
              className="request-form-close"
              onClick={onClose}
              disabled={isSubmitting}
              title="Cancel and close"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#64748b",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Booking Summary Box */}
          <div
            style={{
              padding: "12px 14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Item:</span>
              <strong style={{ color: "#0f172a" }}>
                {req.itemTitle || "Rental Item"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Customer:</span>
              <span style={{ fontWeight: "600", color: "#0f172a" }}>
                {customerName} {customerPhone ? `(${customerPhone})` : ""}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Rental Period:</span>
              <span style={{ color: "#1e293b", fontWeight: "600" }}>
                {formatRentalDate(req.startDate || req.start_date)} →{" "}
                {formatRentalDate(req.endDate || req.end_date)}
              </span>
            </div>
            {req.totalPrice && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Total Amount:</span>
                <strong style={{ color: "#15803d" }}>
                  Rs. {Number(req.totalPrice).toLocaleString()}
                </strong>
              </div>
            )}
          </div>

          {/* Cash on Pickup Warning: 10% platform fee deducted upon handover confirmation */}
          {(req.paymentMethod || req.payment_method || "cash").toLowerCase().includes("cash") && (
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1.5px solid #fde68a",
                borderRadius: "12px",
                padding: "11px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <Coins size={20} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "12.5px", color: "#92400e", lineHeight: "1.4" }}>
                <strong>Cash on Pickup Payment:</strong> Collect <strong>Rs. {Number(req.totalPrice || req.total_price || 0).toLocaleString()}</strong> in cash from the customer.
                Upon confirming handover, <strong>10% platform fee (Rs. {Number(((req.totalPrice || req.total_price || 0) * 0.10)).toLocaleString()})</strong> will be automatically deducted from your shop's earnings.
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                color: "#b91c1c",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Verification Checklist */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "14px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                color: "#475569",
                letterSpacing: "0.5px",
              }}
            >
              Mandatory Verifications
            </span>

            {/* Checkbox 1: ID Card */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              <input
                type="checkbox"
                checked={idCardChecked}
                onChange={(e) => {
                  setIdCardChecked(e.target.checked);
                  if (e.target.checked && customerDetailsVerified) {
                    setValidationError("");
                  }
                }}
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "#15803d",
                  cursor: "pointer",
                }}
              />
              <div>
                <strong style={{ color: "#0f172a", display: "block" }}>
                  ID Card / Driving License Checked *
                </strong>
                <span style={{ color: "#64748b", fontSize: "12px" }}>
                  Physical or digital identification verified
                </span>
              </div>
            </label>

            {/* Checkbox 2: Customer Details */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              <input
                type="checkbox"
                checked={customerDetailsVerified}
                onChange={(e) => {
                  setCustomerDetailsVerified(e.target.checked);
                  if (e.target.checked && idCardChecked) {
                    setValidationError("");
                  }
                }}
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "#15803d",
                  cursor: "pointer",
                }}
              />
              <div>
                <strong style={{ color: "#0f172a", display: "block" }}>
                  Customer Details Verified *
                </strong>
                <span style={{ color: "#64748b", fontSize: "12px" }}>
                  Name and phone number confirmed with renter
                </span>
              </div>
            </label>

            {/* Checkbox 3: Accessories Included */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
                fontSize: "13px",
                paddingTop: "4px",
                borderTop: "1px dashed #e2e8f0",
              }}
            >
              <input
                type="checkbox"
                checked={accessoriesIncluded}
                onChange={(e) => setAccessoriesIncluded(e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "#15803d",
                  cursor: "pointer",
                }}
              />
              <div>
                <strong style={{ color: "#0f172a", display: "block" }}>
                  Accessories Included
                </strong>
                <span style={{ color: "#64748b", fontSize: "12px" }}>
                  All standard cables, chargers, cases, and components provided
                </span>
              </div>
            </label>
          </div>

          {/* Handover Details Form Controls */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {/* Rental Payment Status */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Rental Payment
              </label>
              <select
                value={rentalPaymentStatus}
                onChange={(e) => setRentalPaymentStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "#ffffff",
                  color: "#0f172a",
                  outline: "none",
                }}
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            {/* Security Deposit */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Security Deposit
              </label>
              <select
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "#ffffff",
                  color: "#0f172a",
                  outline: "none",
                }}
              >
                <option value="Not Required">Not Required</option>
                <option value="Received">Received</option>
                <option value="Not Received">Not Received</option>
              </select>
            </div>

            {/* Item Condition */}
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Item Condition at Handover
              </label>
              <select
                value={itemCondition}
                onChange={(e) => setItemCondition(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "#ffffff",
                  color: "#0f172a",
                  outline: "none",
                }}
              >
                <option value="Excellent">Excellent (Like New)</option>
                <option value="Good">Good (Working Condition)</option>
                <option value="Damaged">Damaged / Minor Scratches</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Additional Notes (Optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Serial numbers, inspection remarks, payment receipts..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Action Buttons: Cancel & Confirm Handover */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "4px",
              paddingTop: "12px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            {/* CANCEL BUTTON: Closes modal, does NOT touch database or status */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#475569",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {t("buyerLocation.cancel", "Cancel")}
            </button>

            {/* CONFIRM BUTTON: Validates & confirms handover */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 22px",
                borderRadius: "10px",
                border: "none",
                background: isSubmitting ? "#86efac" : "#15803d",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(21, 128, 61, 0.2)",
                transition: "all 0.2s ease",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid #ffffff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  <span>{t("rentRequest.submitting", "Confirming...")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{t("rentModals.confirmReceipt", "Confirm Handover")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
