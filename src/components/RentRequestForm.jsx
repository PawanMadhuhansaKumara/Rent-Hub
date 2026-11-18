import React, { useEffect, useMemo, useState } from "react";
import { X, Calendar, CheckCircle } from "lucide-react";
import "./components.css";

export default function RentRequestForm({
  isOpen = true,
  onClose,
  handleRequestSubmit,
  minDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  quantity,
  setQuantity,
  paymentMethod = "cash",
  setPaymentMethod,
  available,
  priceType = "day",
  price = 0,
  itemTitle,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localPaymentMethod, setLocalPaymentMethod] = useState(paymentMethod || "cash");

  const currentPaymentMethod = paymentMethod || localPaymentMethod;
  const handlePaymentSelect = (method) => {
    setLocalPaymentMethod(method);
    if (setPaymentMethod) setPaymentMethod(method);
  };

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock background body scroll while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const today = new Date();
  const calculatedMinDate =
    minDate ||
    [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e - s;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [startDate, endDate]);

  const numPrice = Number(price) || 0;
  const numQty = Number(quantity) || 1;
  const estimatedTotal =
    priceType === "day" ? numPrice * numQty * daysCount : numPrice * numQty;

  const isRentedOut =
    available === "Rented Out" ||
    String(available).toLowerCase() === "rented out" ||
    String(available).toLowerCase() === "rented" ||
    available === 0 ||
    available === "0" ||
    (available !== undefined &&
      available !== null &&
      available !== "" &&
      !isNaN(Number(available)) &&
      Number(available) < 1);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isRentedOut) return;
    setIsSubmitting(true);
    try {
      const res = await handleRequestSubmit(e);
      if (res !== false) {
        // Close the form modal immediately upon confirmation!
        if (onClose) onClose();
      }
    } catch (err) {
      console.error("Rental request submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="rent-request-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="rent-request-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="rent-request-form" onSubmit={onSubmit}>
          <div className="request-form-heading">
            <span className="request-form-icon">
              <CheckCircle size={22} color="#15803d" />
            </span>
            <div className="request-form-heading-text">
              <h2>Rental Request</h2>
              <p>
                {itemTitle ? itemTitle : "Choose your preferred rental dates."}
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                className="rent-modal-close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <label htmlFor="startDate">
            <Calendar
              size={14}
              style={{
                display: "inline",
                marginRight: "6px",
                verticalAlign: "middle",
              }}
            />
            Rental Start Date
          </label>
          <input
            id="startDate"
            type="date"
            min={calculatedMinDate}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate("");
              }
            }}
            required
          />

          <label htmlFor="endDate">
            <Calendar
              size={14}
              style={{
                display: "inline",
                marginRight: "6px",
                verticalAlign: "middle",
              }}
            />
            Rental End Date
          </label>
          <input
            id="endDate"
            type="date"
            min={startDate || calculatedMinDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <div style={{ marginTop: "12px", marginBottom: "4px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Payment Method (Pay upon pickup)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => handlePaymentSelect("cash")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border:
                    currentPaymentMethod === "cash"
                      ? "2px solid #16a34a"
                      : "1.5px solid #cbd5e1",
                  backgroundColor:
                    currentPaymentMethod === "cash" ? "#f0fdf4" : "#ffffff",
                  color:
                    currentPaymentMethod === "cash" ? "#15803d" : "#475569",
                  fontWeight: currentPaymentMethod === "cash" ? "700" : "500",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>💵 Cash on Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentSelect("card")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border:
                    currentPaymentMethod === "card"
                      ? "2px solid #2563eb"
                      : "1.5px solid #cbd5e1",
                  backgroundColor:
                    currentPaymentMethod === "card" ? "#eff6ff" : "#ffffff",
                  color:
                    currentPaymentMethod === "card" ? "#1d4ed8" : "#475569",
                  fontWeight: currentPaymentMethod === "card" ? "700" : "500",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>💳 Card Payment</span>
              </button>
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginTop: "5px",
                marginBottom: "0",
              }}
            >
              {currentPaymentMethod === "card"
                ? "💳 You will pay with your credit/debit card at item handover."
                : "💵 You will pay cash directly to the shop owner at item handover."}
            </p>
          </div>

          <div className="request-price-summary">
            <div className="request-price-row">
              <span>Rate per {priceType}:</span>
              <strong>
                LKR{" "}
                {numPrice.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            <div className="request-price-row">
              <span>Payment Method:</span>
              <strong style={{ color: currentPaymentMethod === "card" ? "#1d4ed8" : "#15803d" }}>
                {currentPaymentMethod === "card" ? "💳 Card Payment" : "💵 Cash on Pickup"}
              </strong>
            </div>

            {startDate && endDate && (
              <div className="request-price-row request-total-row">
                <span>
                  Estimated Total ({daysCount}{" "}
                  {daysCount === 1 ? "day" : "days"} × {numQty} qty):
                </span>
                <strong className="request-total-amount">
                  LKR{" "}
                  {estimatedTotal.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-request-button"
            disabled={isRentedOut || isSubmitting}
            style={
              isRentedOut || isSubmitting
                ? { opacity: 0.75, cursor: "not-allowed" }
                : {}
            }
          >
            {isRentedOut
              ? "Item Currently Rented Out"
              : isSubmitting
              ? "Sending Request..."
              : "Confirm & Send Request →"}
          </button>

          <p className="request-note">
            Your rental request will be sent to the owner for confirmation.
          </p>
        </form>
      </div>
    </div>
  );
}
