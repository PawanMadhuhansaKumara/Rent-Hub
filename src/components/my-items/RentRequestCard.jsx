import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { formatRentalDate, formatRequestTime, isRentalLate, getDaysOverdue } from "../../utils/dateUtils";
import GoogleMapIcon from "../GoogleMapIcon";
import ShopDistanceModal from "../ShopDistanceModal";

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
  API_URL = "https://rent-hub-ashen.vercel.app",
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [fetchedShopData, setFetchedShopData] = useState(null);
  const [loadingShopLocation, setLoadingShopLocation] = useState(false);

  const isSender =
    Number(req.buyerId || req.buyer_id) === Number(userId) ||
    (!req.sellerId && !req.seller_id) ||
    req.reqType === "sent";

  const isCompletedOrReturned =
    String(req.status).toLowerCase() === "completed" ||
    String(req.status).toLowerCase() === "returned";

  const targetUserId = isSender
    ? req.sellerId || req.seller_id || req.userId || req.user_id
    : req.buyerId || req.buyer_id || req.requesterId || req.renterId;

  const targetUserName = isSender
    ? req.sellerName || req.seller_name || req.userName || "Item Owner"
    : req.requesterName || req.buyerName || req.buyer_name || "Buyer";

  const sellerLat = req.seller_map_latitude ?? req.map_latitude ?? req.sellerMapLatitude;
  const sellerLng = req.seller_map_longitude ?? req.map_longitude ?? req.sellerMapLongitude;
  const sellerLocName = req.seller_map_location_name ?? req.map_location_name ?? req.sellerMapLocationName;
  const sellerCity = req.sellerCity ?? req.seller_city ?? req.nearest_city ?? req.nearestCity;
  const sellerAddress = req.sellerAddress ?? req.seller_address ?? req.address;

  const handleOpenLocation = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if ((sellerLat && sellerLng) || fetchedShopData) {
      setShowLocationModal(true);
      return;
    }

    if (targetUserId) {
      setLoadingShopLocation(true);
      try {
        const res = await fetch(`${API_URL}/api/users/${targetUserId}`);
        const data = await res.json();
        if (data.success && data.user) {
          setFetchedShopData({
            name: data.user.full_name || targetUserName,
            map_latitude: data.user.map_latitude,
            map_longitude: data.user.map_longitude,
            map_location_name: data.user.map_location_name,
            nearest_city: data.user.nearest_city,
            address: data.user.address,
          });
        }
      } catch (err) {
        console.warn("Could not fetch shop location:", err);
      } finally {
        setLoadingShopLocation(false);
        setShowLocationModal(true);
      }
    } else {
      setShowLocationModal(true);
    }
  };

  const shopDataToPass = fetchedShopData || {
    name: targetUserName,
    map_latitude: sellerLat,
    map_longitude: sellerLng,
    map_location_name: sellerLocName,
    nearest_city: sellerCity,
    address: sellerAddress,
  };

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

  const isLate = (isCustomerPicked || isRented) && isRentalLate(req);
  const daysOverdue = isLate ? getDaysOverdue(req) : 0;

  const statusBadgeClass = isRented
    ? "badge-rented"
    : isApproved
    ? "badge-approved"
    : isDeclinedOrCancelled
    ? "badge-declined"
    : "badge-pending";

  return (
    <div className={`rent-request-card ${isLate ? "late-rent" : ""} ${isExpanded ? "is-expanded" : ""}`}>
      <div className="rent-request-top">
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, minWidth: 0 }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={req.itemTitle}
              className="rent-request-thumb"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                objectFit: "cover",
                border: "1px solid var(--border-light)",
                flexShrink: 0,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="rent-request-time">
              {formatRequestTime(req.createdAt || req.created_at)}
            </span>
            <h4 className="rent-request-item-title" title={req.itemTitle}>{req.itemTitle}</h4>
            {/* Mobile quick essential price */}
            <span className="rent-request-mobile-price">
              Rs. {Number(req.totalPrice || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div
          className="rent-request-top-badges"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <span
            className="rent-card-badge-desktop"
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "3px 8px",
              borderRadius: "12px",
              backgroundColor: isSender ? "var(--badge-blue-bg)" : "var(--badge-purple-bg)",
              color: isSender ? "var(--badge-blue-text)" : "var(--badge-purple-text)",
              border: isSender ? "1px solid var(--badge-blue-bg)" : "1px solid var(--badge-purple-bg)",
            }}
          >
            {isSender ? "Sent Request" : "Received"}
          </span>

          {(req.paymentMethod || req.payment_method) && (
            <span
              className="rent-card-badge-desktop"
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "12px",
                backgroundColor:
                  (req.paymentMethod || req.payment_method) === "cashpoints"
                    ? "var(--badge-yellow-bg)"
                    : (req.paymentMethod || req.payment_method) === "card"
                    ? "var(--badge-blue-bg)"
                    : "var(--badge-green-bg)",
                color:
                  (req.paymentMethod || req.payment_method) === "cashpoints"
                    ? "var(--badge-yellow-text)"
                    : (req.paymentMethod || req.payment_method) === "card"
                    ? "var(--badge-blue-text)"
                    : "var(--primary)",
                border:
                  (req.paymentMethod || req.payment_method) === "cashpoints"
                    ? "1px solid var(--badge-yellow-text)"
                    : (req.paymentMethod || req.payment_method) === "card"
                    ? "1px solid var(--badge-blue-bg)"
                    : "1px solid var(--badge-green-bg)",
              }}
            >
              {(req.paymentMethod || req.payment_method) === "cashpoints"
                ? "🪙 Points (Paid)"
                : (req.paymentMethod || req.payment_method) === "card"
                ? "💳 Card (Paid)"
                : "💵 Cash on Pickup"}
            </span>
          )}

          <span className={`rent-request-status-badge ${statusBadgeClass}`}>
            {req.status}
          </span>
        </div>
      </div>

      <div className={`rent-request-meta-grid ${isExpanded ? "expanded" : "collapsed"}`}>
        <div className="rent-request-meta-item rent-request-user-meta">
          <User size={16} color="var(--primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
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
          <Calendar size={16} color="var(--primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <span className="rent-request-user-label">Rental Period</span>
            <span className="rent-request-meta-val">
              {formatRentalDate(req.startDate || req.start_date)} →{" "}
              {formatRentalDate(req.endDate || req.end_date)}
            </span>
          </div>
        </div>

        <div className="rent-request-meta-item rent-request-meta-price">
          <ShoppingBag size={16} color="var(--primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <span className="rent-request-user-label">
              Total ({req.quantity || 1} item)
            </span>
            <span className="rent-request-meta-val rent-request-total-price">
              Rs. {Number(req.totalPrice || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Mobile extra details shown when expanded */}
        <div className="rent-card-mobile-extra">
          <div className="rent-card-mobile-extra-badges">
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                padding: "3px 8px",
                borderRadius: "12px",
                backgroundColor: isSender ? "var(--badge-blue-bg)" : "var(--badge-purple-bg)",
                color: isSender ? "var(--badge-blue-text)" : "var(--badge-purple-text)",
                border: isSender ? "1px solid var(--badge-blue-bg)" : "1px solid var(--badge-purple-bg)",
              }}
            >
              {isSender ? "Sent Request" : "Received"}
            </span>

            {(req.paymentMethod || req.payment_method) && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  backgroundColor:
                    (req.paymentMethod || req.payment_method) === "cashpoints"
                      ? "var(--badge-yellow-bg)"
                      : (req.paymentMethod || req.payment_method) === "card"
                      ? "var(--badge-blue-bg)"
                      : "var(--badge-green-bg)",
                  color:
                    (req.paymentMethod || req.payment_method) === "cashpoints"
                      ? "var(--badge-yellow-text)"
                      : (req.paymentMethod || req.payment_method) === "card"
                      ? "var(--badge-blue-text)"
                      : "var(--primary)",
                  border:
                    (req.paymentMethod || req.payment_method) === "cashpoints"
                      ? "1px solid var(--badge-yellow-text)"
                      : (req.paymentMethod || req.payment_method) === "card"
                      ? "1px solid var(--badge-blue-bg)"
                      : "1px solid var(--badge-green-bg)",
                }}
              >
                {(req.paymentMethod || req.payment_method) === "cashpoints"
                  ? "🪙 Points (Paid)"
                  : (req.paymentMethod || req.payment_method) === "card"
                  ? "💳 Card (Paid)"
                  : "💵 Cash on Pickup"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile See More / See Less Toggle Button */}
      <div className="rent-card-toggle-wrap">
        <button
          type="button"
          className="rent-card-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? t("common.seeLess", "See Less") : t("common.seeMore", "See More")}</span>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Shop Location Button (Identical to shop's profile location option, hidden on completed/returned items) */}
      {isSender && !isCompletedOrReturned && (
        <div className="rent-card-location-row">
          <button
            type="button"
            onClick={handleOpenLocation}
            className="rent-card-location-btn"
            title="Click to view shop location, route & distance on map"
            disabled={loadingShopLocation}
          >
            <div className="rent-card-location-left">
              <GoogleMapIcon size={16} />
              <span className="rent-card-location-title">
                {fetchedShopData?.map_location_name ||
                  sellerLocName ||
                  fetchedShopData?.nearest_city ||
                  sellerCity ||
                  (loadingShopLocation ? "Loading..." : "Shop Location")}
              </span>
            </div>
            <span className="rent-card-location-badge">
              {t("map.viewDistanceRoute", "Distance & Route →")}
            </span>
          </button>
        </div>
      )}

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
        <div className="rent-request-actions" style={{ marginTop: "12px" }}>
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              backgroundColor: "var(--badge-green-bg, #f0fdf4)",
              border: "1px solid var(--badge-green-border, #bbf7d0)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--primary, #166534)",
              boxSizing: "border-box",
            }}
          >
            <CheckCircle2 size={16} color="var(--primary, #16a34a)" />
            <span>Approved! Visit the shop to collect your item. Shop will mark as picked up upon handover.</span>
          </div>
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
              backgroundColor: "var(--primary)",
              color: "var(--text-inverse)",
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
              backgroundColor: "var(--badge-yellow-text)",
              color: "var(--text-inverse)",
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
              backgroundColor: "var(--badge-yellow-bg)",
              border: "1px solid var(--badge-yellow-border)",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--badge-yellow-text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Clock size={16} color="var(--badge-yellow-text)" />
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
              backgroundColor: "var(--primary)",
              color: "var(--text-inverse)",
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
              backgroundColor: "var(--badge-green-bg)",
              border: "1px solid var(--badge-green-bg)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--primary-hover)",
              boxSizing: "border-box",
            }}
          >
            <CheckCircle2 size={15} color="var(--primary)" />
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
                  backgroundColor: "var(--badge-yellow-bg)",
                  border: "1px solid var(--badge-yellow-border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--badge-yellow-text)",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Star size={15} color="var(--badge-yellow-text)" fill="var(--badge-yellow-text)" />
                  <span>You rated this: {currentRating}★</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--badge-yellow-text)" }}>Reviewed</span>
                  <button
                    type="button"
                    onClick={triggerRateItem}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--badge-yellow-text)",
                      color: "var(--badge-yellow-text)",
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
                  backgroundColor: "var(--primary)",
                  color: "var(--text-inverse)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0, 170, 91, 0.25)",
                }}
                title="Leave a review for this item and shop"
              >
                <Star size={16} color="var(--text-inverse)" fill="var(--text-inverse)" />
                <span>Rate & Review Item</span>
              </button>
            )}
          </div>
        );
      })()}

      {showLocationModal && (
        <ShopDistanceModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          shopData={shopDataToPass}
        />
      )}
    </div>
  );
}
