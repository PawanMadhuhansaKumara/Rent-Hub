import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  PackageCheck,
  ExternalLink,
  Star,
  Edit3,
  Clock,
  RotateCcw,
} from "lucide-react";
import { formatRentalDate, formatRequestTime } from "../../utils/dateUtils";
import QRPaymentModal from "./QRPaymentModal";
import CardPaymentModal from "./CardPaymentModal";

/**
 * RentRequestCard
 * Displays a single rental request card with requester info, status, and actions.
 */
export default function RentRequestCard({
  req,
  userId,
  updatingReqId,
  onAction,
  onInitiateHandover,
  onMarkPicked,
  onCustomerReturn,
  onReturnItem,
  onRateItem,
  API_URL = "http://localhost:5001",
}) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(req.payment_status || req.paymentStatus || "pending");
  const isSender =
    Number(req.buyerId || req.buyer_id) === Number(userId) ||
    (!req.sellerId && !req.seller_id) ||
    req.reqType === "sent";

  const targetUserId = isSender
    ? req.sellerId || req.seller_id || req.userId || req.user_id
    : req.buyerId || req.buyer_id || req.requesterId || req.renterId;

  const targetUserName = isSender
    ? req.sellerName || req.seller_name || req.userName || "Item Owner"
    : req.requesterName || req.buyerName || req.buyer_name || "Buyer";

  const itemImg = req.itemImage || req.image_url || req.image;
  const imageUrl = itemImg
    ? itemImg.startsWith("http")
      ? itemImg
      : `${API_URL}${itemImg.startsWith("/") ? "" : "/"}${itemImg}`
    : null;

  const isPending =
    req.status === "Pending" || req.status?.toLowerCase() === "pending";
  const isApproved =
    req.status === "Approved" || req.status?.toLowerCase() === "approved";
  const isCustomerPicked =
    Number(req.customerPicked ?? req.customer_picked ?? req.isCustomerPicked) === 1 ||
    req.customerPicked === true ||
    req.customer_picked === true ||
    Boolean(req.customerPickedAt || req.customer_picked_at);
  const isRented = req.status?.toLowerCase() === "rented";
  const isDeclinedOrCancelled =
    req.status === "Declined" ||
    req.status === "Cancelled" ||
    req.status?.toLowerCase() === "declined" ||
    req.status?.toLowerCase() === "cancelled" ||
    req.status?.toLowerCase() === "rejected";

  const statusBadgeClass = isRented
    ? "badge-rented"
    : isApproved
    ? "badge-approved"
    : isDeclinedOrCancelled
    ? "badge-declined"
    : "badge-pending";

  return (
    <div className="rent-request-card">
      <div className="rent-request-top">
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={req.itemTitle}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                objectFit: "cover",
                border: "1px solid #e2e8f0",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div>
            <span className="rent-request-time">
              {formatRequestTime(req.createdAt || req.created_at)}
            </span>
            <h4 className="rent-request-item-title">{req.itemTitle}</h4>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "3px 8px",
              borderRadius: "12px",
              backgroundColor: isSender ? "#eff6ff" : "#fdf4ff",
              color: isSender ? "#1d4ed8" : "#9333ea",
              border: isSender ? "1px solid #bfdbfe" : "1px solid #f0abfc",
            }}
          >
            {isSender ? "Sent Request" : "Received"}
          </span>

          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "3px 8px",
              borderRadius: "12px",
              backgroundColor:
                (req.paymentMethod || req.payment_method)?.toLowerCase() === "card"
                  ? "#eff6ff"
                  : "#f0fdf4",
              color:
                (req.paymentMethod || req.payment_method)?.toLowerCase() === "card"
                  ? "#1d4ed8"
                  : "#15803d",
              border:
                (req.paymentMethod || req.payment_method)?.toLowerCase() === "card"
                  ? "1px solid #bfdbfe"
                  : "1px solid #bbf7d0",
            }}
          >
            {(req.paymentMethod || req.payment_method)?.toLowerCase() === "card"
              ? "💳 Card"
              : "💵 Cash"}
          </span>

          <span className={`rent-request-status-badge ${statusBadgeClass}`}>
            {req.status}
          </span>
        </div>
      </div>

      <div className="rent-request-meta-grid">
        <div className="rent-request-meta-item rent-request-user-meta">
          <User size={16} color="#15803d" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="rent-request-user-label">
              {isSender ? "Item Owner" : "Requested by"}
            </span>

            {targetUserId ? (
              <Link
                to={`/profile/${targetUserId}`}
                className="rent-request-user-link"
                title={`Click to view ${targetUserName}'s profile`}
              >
                <span className="rent-request-user-text">{targetUserName}</span>
                <ExternalLink size={13} className="rent-ext-icon" />
              </Link>
            ) : (
              <span className="rent-request-user-name">{targetUserName}</span>
            )}
          </div>
        </div>

        <div className="rent-request-meta-item">
          <Calendar size={16} color="#15803d" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <span className="rent-request-user-label">Rental Period</span>
            <span className="rent-request-meta-val">
              {formatRentalDate(req.startDate || req.start_date)} →{" "}
              {formatRentalDate(req.endDate || req.end_date)}
            </span>
          </div>
        </div>

        <div className="rent-request-meta-item">
          <ShoppingBag size={16} color="#15803d" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <span className="rent-request-user-label">
              Total ({req.quantity || 1} item)
            </span>
            <span className="rent-request-meta-val rent-request-total-price">
              Rs. {Number(req.totalPrice || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="rent-request-actions">
          {!isSender ? (
            <>
              <button
                type="button"
                disabled={String(updatingReqId) === String(req.id)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAction && onAction(req.id, "Approved");
                }}
                className="req-btn req-btn-approve"
              >
                {String(updatingReqId) === String(req.id) ? (
                  <span className="req-btn-spinner" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>
                  {String(updatingReqId) === String(req.id)
                    ? "Updating..."
                    : "Approve Request"}
                </span>
              </button>
              <button
                type="button"
                disabled={String(updatingReqId) === String(req.id)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAction && onAction(req.id, "Declined");
                }}
                className="req-btn req-btn-decline"
              >
                <XCircle size={16} /> Decline
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={String(updatingReqId) === String(req.id)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction && onAction(req.id, "Cancelled");
              }}
              className="req-btn req-btn-decline"
            >
              <XCircle size={16} /> Cancel Request
            </button>
          )}
        </div>
      )}

      {/* 1. CUSTOMER SIDE: Approved Rent Request - Waiting for shop handover */}
      {isSender && isApproved && (
        <div className="rent-request-actions" style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* QR Scan button */}
          <button
            type="button"
            className="req-btn"
            onClick={() => setShowQRModal(true)}
          >
            QR Scan to Pay
          </button>

          {/* Card Pay button */}
          <button
            type="button"
            className="req-btn"
            onClick={() => setShowCardModal(true)}
          >
            Pay with Card
          </button>
        </div>
      )}

      {/* 2. SELLER / SHOP SIDE: Approved Rent Request - Mark as Picked Up button */}
      {!isSender && isApproved && (
        <div className="rent-request-actions" style={{ marginTop: "12px" }}>
          <button
            type="button"
            disabled={String(updatingReqId) === String(req.id)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onInitiateHandover) {
                onInitiateHandover(req);
              } else if (onAction) {
                onAction(req.id, "rented", req.itemTitle);
              }
            }}
            className="req-btn req-btn-pickup"
            style={{
              width: "100%",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#00aa5b",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: String(updatingReqId) === String(req.id) ? "not-allowed" : "pointer",
            }}
            title="Verify customer details and confirm handover"
          >
            {String(updatingReqId) === String(req.id) ? (
              <span className="req-btn-spinner" />
            ) : (
              <PackageCheck size={16} />
            )}
            <span>
              {String(updatingReqId) === String(req.id)
                ? "Marking Picked Up..."
                : "Mark as Picked Up"}
            </span>
          </button>
        </div>
      )}

      {/* 3. CUSTOMER SIDE: Item is active/rented -> Customer can Mark as Returned */}
      {isSender && isRented && (
        <div className="rent-request-actions" style={{ marginTop: "12px" }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCustomerReturn && onCustomerReturn(req);
            }}
            className="req-btn req-btn-pickup"
            style={{
              width: "100%",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#f59e0b",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
            title="Click when you have returned this item to the shop"
          >
            <RotateCcw size={16} />
            <span>Mark as Returned</span>
          </button>
        </div>
      )}

      {/* 4. CUSTOMER SIDE: Return Submitted, waiting for shop owner */}
      {isSender && req.status?.toLowerCase() === "return_pending" && (
        <div className="rent-request-actions" style={{ marginTop: "12px" }}>
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              backgroundColor: "#fefce8",
              border: "1px solid #fef08a",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#854d0e",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Clock size={16} color="#d97706" />
            <span>Return Submitted! Waiting for shop owner to inspect and accept the item.</span>
          </div>
        </div>
      )}

      {/* 5. SELLER / SHOP SIDE: Customer has returned item, inspect and accept */}
      {!isSender && req.status?.toLowerCase() === "return_pending" && (
        <div className="rent-request-actions" style={{ marginTop: "12px" }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReturnItem && onReturnItem(req);
            }}
            className="req-btn req-btn-pickup"
            style={{
              width: "100%",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#00aa5b",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
            title="Inspect for defects and accept returned item"
          >
            <CheckCircle2 size={16} />
            <span>✅ Inspect & Accept Return (Rate 0-10)</span>
          </button>
        </div>
      )}

      {/* 6. SELLER / SHOP SIDE: Item active with customer */}
      {!isSender && isRented && (
        <div className="rent-request-actions" style={{ marginTop: "12px" }}>
          <div
            style={{
              width: "100%",
              padding: "9px 14px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#166534",
              boxSizing: "border-box",
            }}
          >
            <CheckCircle2 size={15} color="#16a34a" />
            <span>Item Handed Over • Currently with Customer</span>
          </div>
        </div>
      )}

      {/* 7. Review Action: Shown for Buyer AFTER item is completed/returned */}
      {isSender && (
        String(req.status).toLowerCase() === "completed" ||
        String(req.status).toLowerCase() === "returned"
      ) && (() => {
        const hasReview = Boolean(req.reviewId || req.review_id || req.hasReviewed);
        const currentRating = hasReview ? (req.reviewRating || req.review_rating || 5) : 5;
        const currentComment = hasReview ? (req.reviewComment || req.review_comment || "") : "";
        const triggerRateItem = (e) => {
          e.preventDefault();
          e.stopPropagation();
          onRateItem && onRateItem({
            ...req,
            requestId: req.id,
            itemId: req.itemId || req.item_id,
            sellerId: req.sellerId || req.seller_id,
            title: req.itemTitle || req.item_title,
            image: req.itemImage || req.item_image,
            reviewId: hasReview ? (req.reviewId || req.review_id || null) : null,
            reviewRating: currentRating,
            reviewComment: currentComment,
            hasReviewed: hasReview,
          });
        };

        return (
          <div className="rent-request-actions" style={{ marginTop: "12px" }}>
            {hasReview ? (
              <div
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fefce8",
                  border: "1px solid #fef08a",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#a16207",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Star size={15} color="#eab308" fill="#eab308" />
                  <span>You rated this: {currentRating}★</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#854d0e" }}>Reviewed</span>
                  <button
                    type="button"
                    onClick={triggerRateItem}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#ffffff",
                      border: "1px solid #fde047",
                      color: "#854d0e",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                    title="Edit or delete your review"
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerRateItem}
                className="req-btn"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "#00aa5b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0, 170, 91, 0.25)",
                }}
                title="Leave a review for this item and shop"
              >
                <Star size={16} color="#ffffff" fill="#ffffff" />
                <span>Rate & Review Item</span>
              </button>
            )}
          </div>
        );
      })()}
{showQRModal && (
        <QRPaymentModal
          requestId={req.id}
          onClose={() => setShowQRModal(false)}
          onSuccess={() => {
            setPaymentStatus('paid');
            setShowQRModal(false);
          }}
        />
      )}
      {showCardModal && (
        <CardPaymentModal
          requestId={req.id}
          onClose={() => setShowCardModal(false)}
          onSuccess={() => {
            setPaymentStatus('paid');
            setShowCardModal(false);
          }}
        />
      )}
    </div>
  );
}
