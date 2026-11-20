import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Inbox, ArrowRight, X } from "lucide-react";
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
    >
      <div
        className="rent-request-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "440px" }}
      >
        <div className="rent-request-success-view">
          <div className="rent-request-success-header">
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

          <div className="rent-request-success-body">
            <div className="rent-request-success-icon-wrap">
              <CheckCircle2 size={36} color="#15803d" />
            </div>

            <h2 className="rent-request-success-title">
              {t("rentRequest.requestSentTitle", "Rental Request Sent!")}
            </h2>

            <p className="rent-request-success-message">
              {t("rentRequest.requestSentMsg", "Your rental request has been sent! Once the owner accepts your request, you can go and pick up the item.")}
            </p>

            {itemTitle && (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "18px",
                  fontSize: "13px",
                  color: "#334155",
                  fontWeight: "600",
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                Item: {itemTitle}
              </div>
            )}

            <div className="rent-request-success-actions">
              <button
                type="button"
                className="rent-request-view-btn"
                onClick={handleShowRequests}
              >
                <Inbox size={16} />
                <span>{t("rentRequest.showRequests", "Show Requests")}</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="rent-request-done-btn"
                onClick={onClose}
              >
                {t("map.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
