import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Calendar, CheckCircle } from "lucide-react";
import PaymentOptionsModal from "./PaymentOptionsModal";
import CashPointsTopupModal from "./CashPointsTopupModal";
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
  currentUser,
  API_URL = "https://rent-hub-ashen.vercel.app",
}) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [userPoints, setUserPoints] = useState(Number(currentUser?.cash_points || 0));

  // Fetch latest user cash points
  useEffect(() => {
    const userId = currentUser?.id || currentUser?.user_id;
    if (userId) {
      fetch(`${API_URL}/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUserPoints(Number(data.user.cash_points || 0));
          }
        })
        .catch(() => {});
    }
  }, [currentUser, API_URL]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose && !showPaymentModal && !showTopupModal) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showPaymentModal, showTopupModal]);

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

  const onDatesProceed = (e) => {
    e.preventDefault();
    if (isRentedOut || isSubmitting) return;

    if (!startDate || !endDate) {
      alert("Please select the rental start and end dates.");
      return;
    }

    if (endDate < startDate) {
      alert("End date must be on or after the start date.");
      return;
    }

    setShowPaymentModal(true);
  };

  const handleFinalPaymentConfirm = async (paymentData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await handleRequestSubmit(paymentData);
      if (res !== false) {
        setShowPaymentModal(false);
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
    <>
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
          <form className="rent-request-form" onSubmit={onDatesProceed}>
            <div className="request-form-heading">
              <span className="request-form-icon">
                <CheckCircle size={22} color="var(--primary)" />
              </span>
              <div className="request-form-heading-text">
                <h2>{t("rentRequest.requestToRent", "Rental Request")}</h2>
                <p>
                  {itemTitle ? itemTitle : t("rentRequest.rentalPeriod", "Choose your preferred rental dates.")}
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
              {t("rentRequest.startDate", "Rental Start Date")}
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
              {t("rentRequest.endDate", "Rental End Date")}
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
                ? t("rentRequest.itemRentedOut", "Item Currently Rented Out")
                : isSubmitting
                ? t("rentRequest.submitting", "Processing...")
                : t("rentRequest.proceedPayment", "Proceed to Payment Options →")}
            </button>

            <p className="request-note">
              {t("rentRequest.paymentNote", "Choose your payment method in the next step: Cash Points, Card, or Cash on Pickup.")}
            </p>
          </form>
        </div>
      </div>

      {/* DEDICATED PAYMENT OPTIONS MODAL */}
      {showPaymentModal && (
        <PaymentOptionsModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          itemTitle={itemTitle}
          totalPrice={estimatedTotal}
          currentUser={currentUser}
          currentUserPoints={userPoints}
          isSubmitting={isSubmitting}
          onOpenTopup={() => setShowTopupModal(true)}
          onConfirmPayment={handleFinalPaymentConfirm}
        />
      )}

      {/* TOP-UP CASH POINTS MODAL */}
      {showTopupModal && (
        <CashPointsTopupModal
          isOpen={showTopupModal}
          onClose={() => setShowTopupModal(false)}
          currentUser={currentUser}
          currentBalance={userPoints}
          API_URL={API_URL}
          onSuccess={(newPoints) => {
            setUserPoints(newPoints);
          }}
        />
      )}
    </>
  );
}
