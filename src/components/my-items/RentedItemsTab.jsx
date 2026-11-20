import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ArrowDownLeft, Clock, Inbox } from "lucide-react";
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
  API_URL = "http://localhost:5001",
  hideRentedIn = false,
}) {
  const { t } = useTranslation();

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
      ) : (
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
      )}
    </div>
  );
}