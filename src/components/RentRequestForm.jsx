import React, { useEffect, useMemo } from "react";
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
  available,
  priceType = "day",
  price = 0,
  itemTitle,
}) {
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
        <form className="rent-request-form" onSubmit={handleRequestSubmit}>
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

          <button type="submit" className="submit-request-button">
            Confirm & Send Request →
          </button>

          <p className="request-note">
            Your rental request will be sent to the owner for confirmation.
          </p>
        </form>
      </div>
    </div>
  );
}
