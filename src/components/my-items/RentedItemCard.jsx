import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Star,
  Edit3,
  Clock,
  RotateCcw,
} from "lucide-react";
import { formatRentalDate } from "../../utils/dateUtils";

/**
 * RentedItemCard
 * Clean rental item card showing handover status, customer return, and shop owner acceptance.
 */
export default function RentedItemCard({
  item,
  onReturnItem,
  onCustomerReturn,
  isReturning = false,
  onRateItem,
  API_URL = "http://localhost:5001",
}) {
  const isSentedOut = item.rentType === "sented-out";
  const targetUserId = isSentedOut ? item.renterId : item.sellerId;
  const targetUserName = isSentedOut
    ? item.renterName || "Customer"
    : item.sellerName || "Item Owner";

  const itemImg = item.image || item.image_url;
  const imageUrl = itemImg
    ? itemImg.startsWith("http")
      ? itemImg
      : `${API_URL}${itemImg.startsWith("/") ? "" : "/"}${itemImg}`
    : null;

  return (
    <div
      className={`rent-request-card ${
        isSentedOut ? "rented-border" : "rented-in-border"
      }`}
    >
      {/* Top Header Row: 48px Image, Title, Type Badge & Status */}
      <div className="rent-request-top">
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={item.title}
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
              {item.category ||
                (isSentedOut ? "Sented Out Rental" : "Rented In Item")}
            </span>
            <h4 className="rent-request-item-title">
              <Link
                to={`/item/${item.itemId || item.id}`}
                className="rented-item-title-link"
              >
                {item.title}
              </Link>
            </h4>
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
              backgroundColor: isSentedOut ? "#fffbeb" : "#eff6ff",
              color: isSentedOut ? "#d97706" : "#2563eb",
              border: isSentedOut ? "1px solid #fde68a" : "1px solid #bfdbfe",
            }}
          >
            {isSentedOut ? "Sented Out" : "Rented In"}
          </span>

          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "3px 8px",
              borderRadius: "12px",
              backgroundColor:
                (item.paymentMethod || item.payment_method)?.toLowerCase() === "card"
                  ? "#eff6ff"
                  : "#f0fdf4",
              color:
                (item.paymentMethod || item.payment_method)?.toLowerCase() === "card"
                  ? "#1d4ed8"
                  : "#15803d",
              border:
                (item.paymentMethod || item.payment_method)?.toLowerCase() === "card"
                  ? "1px solid #bfdbfe"
                  : "1px solid #bbf7d0",
            }}
          >
            {(item.paymentMethod || item.payment_method)?.toLowerCase() === "card"
              ? "💳 Card"
              : "💵 Cash"}
          </span>

          <span
            className={`rent-request-status-badge ${
              isSentedOut ? "badge-rented" : "badge-approved"
            }`}
          >
            {item.requestStatus === "return_pending"
              ? "Return Pending"
              : item.requestStatus === "rented"
              ? "Rented / Active"
              : item.requestStatus || (isSentedOut ? "Rented Out" : "Active Rental")}
          </span>
        </div>
      </div>

      {/* Meta Grid: Rented To/From, Rental Period, Price */}
      <div className="rent-request-meta-grid">
        {/* User (Rented To / From) */}
        <div className="rent-request-meta-item rent-request-user-meta">
          <User
            size={16}
            color={isSentedOut ? "#d97706" : "#2563eb"}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="rent-request-user-label">
              {isSentedOut ? "Rented to" : "Rented from"}
            </span>

            {targetUserId ? (
              <Link
                to={`/profile/${targetUserId}`}
                className="rent-request-user-link"
                style={{
                  color: isSentedOut ? "#b45309" : "#1d4ed8",
                }}
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

        {/* Rental Period */}
        <div className="rent-request-meta-item">
          <Calendar
            size={16}
            color={isSentedOut ? "#d97706" : "#2563eb"}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <div>
            <span className="rent-request-user-label">Rental Period</span>
            <span className="rent-request-meta-val">
              {(item.startDate || item.start_date) &&
              (item.endDate || item.end_date)
                ? `${formatRentalDate(
                    item.startDate || item.start_date
                  )} → ${formatRentalDate(item.endDate || item.end_date)}`
                : "Active"}
            </span>
          </div>
        </div>

        {/* Total Price / Rate */}
        <div className="rent-request-meta-item">
          <ShoppingBag
            size={16}
            color={isSentedOut ? "#d97706" : "#2563eb"}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <div>
            <span className="rent-request-user-label">
              {item.totalPrice ? "Total Rent" : "Rental Rate"}
            </span>
            <span className="rent-request-meta-val rent-request-total-price">
              Rs.{" "}
              {Number(item.totalPrice || item.price || 0).toLocaleString()}
              {!item.totalPrice && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "normal",
                    color: "#64748b",
                  }}
                >
                  {" "}
                  / {item.priceType || "day"}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. SHOP OWNER VIEW (Sented Out): Customer ආපසු භාරදුන් විට අඩුපාඩු නැත්නම් බාරගන්නා Button එක
         ========================================================================= */}
      {isSentedOut && (
        <div className="rent-request-actions" style={{ marginTop: "14px" }}>
          {item.requestStatus?.toLowerCase() === "return_pending" && (
            <div
              style={{
                width: "100%",
                marginBottom: "8px",
                padding: "8px 12px",
                backgroundColor: "#fefce8",
                border: "1px solid #fef08a",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#854d0e",
              }}
            >
              🔔 Customer has returned the item! Please inspect for defects.
            </div>
          )}

          <button
            type="button"
            disabled={isReturning}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReturnItem && onReturnItem(item);
            }}
            className="req-btn req-btn-pickup"
            style={{
              width: "100%",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: item.requestStatus?.toLowerCase() === "return_pending" ? "#00aa5b" : "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: isReturning ? "not-allowed" : "pointer",
            }}
            title="Inspect for defects and accept returned item"
          >
            {isReturning ? (
              <span className="req-btn-spinner" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>
              {isReturning
                ? "Processing Acceptance..."
                : item.requestStatus?.toLowerCase() === "return_pending"
                ? "✅ Inspect & Accept Return (Rate 0-10)"
                : "Accept Return & Restore Stock"}
            </span>
          </button>
        </div>
      )}

      {/* =========================================================================
          2. CUSTOMER VIEW (Rented In): කඩයෙන් භාණ්ඩය ලැබුණු පසු Customer ට කෙලින්ම භාණ්ඩය ආපසු භාරදුන් බව සටහන් කිරීමට ඇති Button එක
         ========================================================================= */}
      {!isSentedOut && item.requestStatus?.toLowerCase() === "rented" && (
        <div className="rent-request-actions" style={{ marginTop: "14px" }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCustomerReturn && onCustomerReturn(item);
            }}
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
            <span>Mark as Returned </span>
          </button>
        </div>
      )}

      {/* =========================================================================
          3. CUSTOMER VIEW: භාරදුන් පසු කඩයෙන් අඩුපාඩු බලා accept කරන තෙක් පෙන්වන Notice එක
         ========================================================================= */}
      {!isSentedOut && item.requestStatus?.toLowerCase() === "return_pending" && (
        <div className="rent-request-actions" style={{ marginTop: "14px" }}>
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

      {/* =========================================================================
          4. CUSTOMER VIEW: කඩය විසින් භාරගත් පසු (Completed වූ පසු) Review දැමීමට ඇති Button එක
         ========================================================================= */}
      {!isSentedOut && (
        item.requestStatus?.toLowerCase() === "completed" ||
        item.requestStatus?.toLowerCase() === "returned"
      ) && (() => {
        const hasReview = Boolean(item.reviewId || item.review_id || item.hasReviewed);
        const currentRating = hasReview ? (item.reviewRating || item.review_rating || 5) : 5;
        const currentComment = hasReview ? (item.reviewComment || item.review_comment || "") : "";
        const triggerRateItem = (e) => {
          e.preventDefault();
          e.stopPropagation();
          onRateItem && onRateItem({
            ...item,
            requestId: item.requestId || item.request_id || item.id,
            itemId: item.itemId || item.item_id || item.id,
            sellerId: item.sellerId || item.seller_id || item.userId || item.user_id,
            title: item.title || item.itemTitle,
            image: item.image || item.itemImage,
            reviewId: hasReview ? (item.reviewId || item.review_id || null) : null,
            reviewRating: currentRating,
            reviewComment: currentComment,
            hasReviewed: hasReview,
          });
        };

        return (
          <div className="rent-request-actions" style={{ marginTop: "14px" }}>
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
    </div>
  );
}