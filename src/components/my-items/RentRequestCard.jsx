import React from "react";
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
} from "lucide-react";
import { formatRentalDate, formatRequestTime } from "../../utils/dateUtils";

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
  onRateItem,
  API_URL = "http://localhost:5001",
}) {
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

      {/* PICKUP BUTTON: Shown for Shop's Approved Rent Requests */}
      {!isSender && isApproved && (
        <div className="rent-request-actions">
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

      {/* Review Action: Shown for Buyer when Request is Completed */}
      {isSender && (String(req.status).toLowerCase() === "completed" || String(req.status).toLowerCase() === "returned") && (
        <div className="rent-request-actions" style={{ marginTop: "12px" }}>
          {req.reviewId || req.hasReviewed ? (
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
                <span>You rated this: {req.reviewRating || "5.0"}★</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "#854d0e" }}>Reviewed</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRateItem && onRateItem(req);
                  }}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRateItem && onRateItem(req);
              }}
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
      )}
    </div>
  );
}
