import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  Inbox,
  ArrowUpRight,
  ArrowDownLeft,
  PackageCheck,
} from "lucide-react";
import RentRequestCard from "./RentRequestCard";
import RentalVerificationModal from "./RentalVerificationModal";

/**
 * RentRequestsTab
 * Renders the Rental Requests tab with filtering, empty state, requests list,
 * and the Rental Handover Verification modal flow.
 */
export default function RentRequestsTab({
  requests,
  requestFilter,
  setRequestFilter,
  userId,
  loadingRequests,
  updatingReqId,
  onAction,
  onMarkPicked,
  onCustomerReturn,
  onReturnItem,
  onRateItem,
  API_URL = "https://rent-hub-ashen.vercel.app",
  hideSentByMe = false,
  searchTerm = "",
}) {
  const { t } = useTranslation();
  const [pickedUpNotices, setPickedUpNotices] = useState({});
  const [handoverModalReq, setHandoverModalReq] = useState(null);
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);

  // Initiates handover: opens verification form WITHOUT changing status or database
  const handleInitiateHandover = (req) => {
    setHandoverModalReq(req);
  };

  // Cancels handover: closes form, original card remains as before
  const handleCancelHandover = () => {
    setHandoverModalReq(null);
  };

  // Confirms handover: saves verification, updates status to rented, moves item to Sented Out
  const handleConfirmHandover = async (targetReq, verificationData) => {
    if (!targetReq) return;
    setIsSubmittingHandover(true);
    try {
      // Trigger temporary 2-second success notice in place of card
      setPickedUpNotices((prev) => ({
        ...prev,
        [String(targetReq.id)]: true,
      }));

      setTimeout(() => {
        setPickedUpNotices((prev) => {
          const next = { ...prev };
          delete next[String(targetReq.id)];
          return next;
        });
      }, 2000);

      // Perform handover action via parent handler
      onAction && onAction(targetReq.id, "rented", verificationData);
      setHandoverModalReq(null);
    } catch (err) {
      console.error("Handover error:", err);
    } finally {
      setIsSubmittingHandover(false);
    }
  };

  const handleAction = (reqId, newStatus, itemTitle) => {
    if (newStatus?.toLowerCase() === "rented") {
      setPickedUpNotices((prev) => ({
        ...prev,
        [String(reqId)]: true,
      }));

      setTimeout(() => {
        setPickedUpNotices((prev) => {
          const next = { ...prev };
          delete next[String(reqId)];
          return next;
        });
      }, 2000);
    }
    onAction && onAction(reqId, newStatus);
  };

  // Filter requests for Rent Requests tab:
  // - Pending and Approved requests waiting for pickup are shown in Rent Requests.
  // - Once picked up / handed over (status === 'rented' or 'return_pending' or 'completed'),
  //   it moves to Rented Items for both seller and buyer.
  const activeRequests = requests.filter((r) => {
    const status = r.status?.toLowerCase();
    if (
      status === "declined" ||
      status === "cancelled" ||
      status === "completed" ||
      status === "returned"
    ) {
      return false;
    }

    if (status === "rented" || status === "return_pending") {
      if (pickedUpNotices[String(r.id)]) {
        return true;
      }
      return false;
    }

    return true;
  });

  const sentCount = activeRequests.filter(
    (r) =>
      !pickedUpNotices[String(r.id)] &&
      (Number(r.buyerId || r.buyer_id) === Number(userId) ||
        (!r.sellerId && !r.seller_id) ||
        r.reqType === "sent")
  ).length;

  const receivedCount = activeRequests.filter(
    (r) =>
      !pickedUpNotices[String(r.id)] &&
      !(
        Number(r.buyerId || r.buyer_id) === Number(userId) ||
        (!r.sellerId && !r.seller_id) ||
        r.reqType === "sent"
      )
  ).length;

  const filteredRequests = activeRequests.filter((req) => {
    const isSender =
      Number(req.buyerId || req.buyer_id) === Number(userId) ||
      (!req.sellerId && !req.seller_id) ||
      req.reqType === "sent";
    if (hideSentByMe || requestFilter === "received") return !isSender;
    return isSender;
  });

  return (
    <div className="rent-requests-section">
      {/* Subtabs for Rent Requests */}
      <div className="my-items-subtabs">
        {!hideSentByMe && (
          <button
            type="button"
            className={`my-items-subtab-btn ${
              requestFilter === "sent" ? "active" : ""
            }`}
            onClick={() => setRequestFilter("sent")}
          >
            <ArrowUpRight size={14} />
            <span>{t("rentsPage.filters.sent", "Sent by Me")}</span>
            <span className="my-items-tab-count">{sentCount}</span>
          </button>
        )}
        <button
          type="button"
          className={`my-items-subtab-btn ${
            hideSentByMe || requestFilter === "received" ? "active" : ""
          }`}
          onClick={() => setRequestFilter("received")}
        >
          <ArrowDownLeft size={14} />
          <span>{t("rentsPage.filters.received", "Received")}</span>
          <span className="my-items-tab-count">{receivedCount}</span>
        </button>
      </div>

      {loadingRequests && (!requests || requests.length === 0) ? (
        <div className="my-items-loader">
          <div className="my-items-spinner" />
          <p>Loading rental requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="my-items-empty">
          <div
            className="my-items-empty-icon"
            style={{
              background: "var(--badge-gray-bg, rgba(100, 116, 139, 0.1))",
            }}
          >
            <Inbox size={48} color="var(--text-secondary)" />
          </div>
          <h3>
            {searchTerm
              ? t("rentsPage.noRequestsFound", "No matching requests found")
              : requestFilter === "sent"
                ? t("rentsPage.noSentRequests", "No sent rental requests")
                : t("rentsPage.noReceivedRequests", "No received rental requests")}
          </h3>
          <p>
            {searchTerm
              ? t(
                  "rentsPage.noSearchRequestsDesc",
                  `We couldn't find any rental requests matching "${searchTerm}". Try checking your spelling or search by item, username, or date.`
                )
              : requestFilter === "sent"
                ? t(
                    "rentsPage.noSentRequestsDesc",
                    "Requests you send to rent items from others will appear here."
                  )
                : t(
                    "rentsPage.noReceivedRequestsDesc",
                    "Incoming requests from users wanting to rent your items will appear here."
                  )}
          </p>
        </div>
      ) : (
        <div className="rent-requests-list">
          {filteredRequests.map((req) => {
            if (pickedUpNotices[String(req.id)]) {
              return (
                <div
                  key={`picked-up-notice-${req.id}`}
                  style={{
                    padding: "12px 18px",
                    backgroundColor: "var(--badge-red-bg)",
                    border: "1px solid var(--badge-red-bg)",
                    borderRadius: "10px",
                    color: "var(--badge-notif-bg)",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    animation: "fadeIn 0.2s ease-in-out",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "var(--badge-notif-bg)",
                      display: "inline-block",
                      opacity: 0.85,
                      flexShrink: 0,
                    }}
                  />
                  <span>Added to Rented List</span>
                </div>
              );
            }

            return (
              <RentRequestCard
                key={req.id}
                req={req}
                userId={userId}
                updatingReqId={updatingReqId}
                onAction={handleAction}
                onInitiateHandover={handleInitiateHandover}
                onMarkPicked={onMarkPicked}
                onCustomerReturn={onCustomerReturn}
                onReturnItem={onReturnItem}
                onRateItem={onRateItem}
                API_URL={API_URL}
              />
            );
          })}
        </div>
      )}

      {/* Rental Handover Verification Modal */}
      <RentalVerificationModal
        isOpen={Boolean(handoverModalReq)}
        req={handoverModalReq}
        onClose={handleCancelHandover}
        onConfirm={handleConfirmHandover}
        isSubmitting={isSubmittingHandover}
      />
    </div>
  );
}
