import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ArrowDownLeft, Clock, Inbox, Star } from "lucide-react";
import RentedItemCard from "./RentedItemCard";

/**
 * RentedItemsTab
 * Modern and responsive Rented Items tab rendering Sented Out & Rented In items.
 */
export default function RentedItemsTab({
  displayedRentedItems,
  rentedSubTab,
  setRentedSubTab,
  allRentedCount,
  sentedOutCount,
  rentedInCount,
  loading,
  onStatusChange,
  onReturnItem,
  onCustomerReturn,
  returningItemId,
  onMarkPicked,
  onRateItem,
  onNavigateTab,
  API_URL = "https://rent-hub-ashen.vercel.app",
  hideRentedIn = false,
}) {
  const { t } = useTranslation();

  const isRentedInTab = !hideRentedIn && rentedSubTab === "rented-in";

  // Separate currently active rentals and items waiting for review
  const activeRentedItems = isRentedInTab
    ? displayedRentedItems.filter(
        (it) =>
          it.requestStatus?.toLowerCase() !== "completed" &&
          it.requestStatus?.toLowerCase() !== "returned"
      )
    : displayedRentedItems;

  const pendingReviewItems = isRentedInTab
    ? displayedRentedItems.filter(
        (it) =>
          it.requestStatus?.toLowerCase() === "completed" ||
          it.requestStatus?.toLowerCase() === "returned"
      )
    : [];

  return (
    <div className="rented-items-section">
      {/* Sub-tabs: Sented Out, Rented In */}
      <div className="my-items-subtabs">
        <button
          type="button"
          className={`my-items-subtab-btn ${
            hideRentedIn || rentedSubTab === "sented-out" ? "active" : ""
          }`}
          onClick={() => setRentedSubTab("sented-out")}
        >
          <ArrowUpRight size={15} />
          <span>{t("rentsPage.filters.sentedOut", "Sented Out")}</span>
          <span className="my-items-tab-count">{sentedOutCount}</span>
        </button>
        {!hideRentedIn && (
          <button
            type="button"
            className={`my-items-subtab-btn ${
              rentedSubTab === "rented-in" ? "active" : ""
            }`}
            onClick={() => setRentedSubTab("rented-in")}
          >
            <ArrowDownLeft size={15} />
            <span>{t("rentsPage.filters.rentedIn", "Rented In")}</span>
            <span className="my-items-tab-count">{rentedInCount}</span>
          </button>
        )}
      </div>

      {loading && (!displayedRentedItems || displayedRentedItems.length === 0) ? (
        <div className="my-items-loader">
          <div className="my-items-spinner" />
          <p>{t("rentsPage.loadingRented", "Loading rented items...")}</p>
        </div>
      ) : displayedRentedItems.length === 0 ? (
        <div className="my-items-empty">
          <div
            className="my-items-empty-icon"
            style={{
              background:
                !hideRentedIn && rentedSubTab === "rented-in"
                  ? "var(--badge-blue-bg)"
                  : "var(--badge-yellow-bg)",
            }}
          >
            <Clock
              size={48}
              color={
                !hideRentedIn && rentedSubTab === "rented-in"
                  ? "var(--badge-blue-text)"
                  : "var(--badge-yellow-text)"
              }
            />
          </div>
          <h3>
            {!hideRentedIn && rentedSubTab === "rented-in"
              ? t("rentsPage.noRentedIn", "No items currently rented in")
              : t("rentsPage.noSentedOut", "No items currently sented out")}
          </h3>
          <p>
            {!hideRentedIn && rentedSubTab === "rented-in"
              ? t(
                  "rentsPage.noRentedInDesc",
                  "Items you have rented from other shops or owners will appear here once approved or picked up."
                )
              : t(
                  "rentsPage.noSentedOutDesc",
                  'Items marked as "Rented Out" in your inventory or picked up by renters will appear here.'
                )}
          </p>
          {!hideRentedIn && rentedSubTab === "rented-in" ? (
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("rent-requests")}
              className="my-items-empty-add-btn"
            >
              <Inbox size={18} /> {t("rentsPage.viewRentRequests", "View Rent Requests")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("my-items")}
              className="my-items-empty-add-btn"
            >
              {t("rentsPage.viewAllItems", "View All Items")}
            </button>
          )}
        </div>
      ) : !isRentedInTab ? (
        /* Sented Out List */
        <div className="rent-requests-list">
          {displayedRentedItems.map((item) => (
            <RentedItemCard
              key={item.uniqueKey || item.id}
              item={item}
              onReturnItem={onReturnItem}
              onCustomerReturn={onCustomerReturn}
              isReturning={
                String(returningItemId) === String(item.itemId || item.id) ||
                String(returningItemId) === String(item.requestId)
              }
              onMarkPicked={onMarkPicked}
              onRateItem={onRateItem}
              API_URL={API_URL}
            />
          ))}
        </div>
      ) : (
        /* Rented In Tab with Active Rentals & Pending Reviews Section */
        <div className="rented-in-sections-container">
          {/* 1. Currently Active Rentals (දැනට කුලියට ගෙන ඇති භාණ්ඩ) */}
          {activeRentedItems.length > 0 && (
            <div className="rented-in-active-group">
              {pendingReviewItems.length > 0 && (
                <div className="rented-in-section-title">
                  <div className="rented-in-title-left">
                    <Clock size={17} color="var(--badge-blue-text)" />
                    <h4>
                      {t(
                        "rentsPage.activeRentalsTitle",
                        "Active Rentals (දැනට කුලියට ගෙන ඇති භාණ්ඩ)"
                      )}
                    </h4>
                  </div>
                  <span className="rented-in-section-count">
                    {activeRentedItems.length}
                  </span>
                </div>
              )}

              <div className="rent-requests-list">
                {activeRentedItems.map((item) => (
                  <RentedItemCard
                    key={item.uniqueKey || item.id}
                    item={item}
                    onReturnItem={onReturnItem}
                    onCustomerReturn={onCustomerReturn}
                    isReturning={
                      String(returningItemId) ===
                        String(item.itemId || item.id) ||
                      String(returningItemId) === String(item.requestId)
                    }
                    onMarkPicked={onMarkPicked}
                    onRateItem={onRateItem}
                    API_URL={API_URL}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Pending Reviews Section (Underneath active rentals with separate title) */}
          {pendingReviewItems.length > 0 && (
            <div className="pending-reviews-section">
              <div className="pending-reviews-section-header">
                <div className="pending-reviews-title-left">
                  <div className="pending-reviews-icon-badge">
                    <Star size={18} color="#eab308" fill="#eab308" />
                  </div>
                  <div>
                    <h4 className="pending-reviews-main-title">
                      {t(
                        "rentsPage.pendingReviewsTitle",
                        "Rate & Review (Review ලබාදීමට ඇති භාණ්ඩ)"
                      )}
                    </h4>
                    <p className="pending-reviews-subtitle">
                      {t(
                        "rentsPage.pendingReviewsSubtitle",
                        "Return accepted by shop! Please leave a review to complete your rental record."
                      )}
                    </p>
                  </div>
                </div>
                <span className="pending-reviews-badge">
                  {pendingReviewItems.length}{" "}
                  {t("rentsPage.toReviewCount", "To Review")}
                </span>
              </div>

              <div className="rent-requests-list">
                {pendingReviewItems.map((item) => (
                  <RentedItemCard
                    key={item.uniqueKey || item.id}
                    item={item}
                    onReturnItem={onReturnItem}
                    onCustomerReturn={onCustomerReturn}
                    isReturning={
                      String(returningItemId) ===
                        String(item.itemId || item.id) ||
                      String(returningItemId) === String(item.requestId)
                    }
                    onMarkPicked={onMarkPicked}
                    onRateItem={onRateItem}
                    API_URL={API_URL}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}