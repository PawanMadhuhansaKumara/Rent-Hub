import React from "react";
import { Clock, ArrowUpRight, ArrowDownLeft, Inbox } from "lucide-react";
import RentedItemCard from "./RentedItemCard";

/**
 * RentedItemsTab
 * Renders the Rented Items section with subtabs, empty states, and grid.
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
  returningItemId,
  onNavigateTab,
  API_URL = "http://localhost:5001",
  hideRentedIn = false,
}) {
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
          <span>Sented Out</span>
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
            <span>Rented In</span>
            <span className="my-items-tab-count">{rentedInCount}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="my-items-loader">
          <div className="my-items-spinner" />
          <p>Loading rented items...</p>
        </div>
      ) : displayedRentedItems.length === 0 ? (
        <div className="my-items-empty">
          <div
            className="my-items-empty-icon"
            style={{
              background:
                !hideRentedIn && rentedSubTab === "rented-in"
                  ? "#e0f2fe"
                  : "#fef3c7",
            }}
          >
            <Clock
              size={48}
              color={
                !hideRentedIn && rentedSubTab === "rented-in"
                  ? "#0284c7"
                  : "#d97706"
              }
            />
          </div>
          <h3>
            {!hideRentedIn && rentedSubTab === "rented-in"
              ? "No items currently rented in"
              : "No items currently sented out"}
          </h3>
          <p>
            {!hideRentedIn && rentedSubTab === "rented-in"
              ? "Items you have rented from other shops or owners will appear here once approved or picked up."
              : 'Items marked as "Rented Out" in your inventory or picked up by renters will appear here.'}
          </p>
          {!hideRentedIn && rentedSubTab === "rented-in" ? (
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("rent-requests")}
              className="my-items-empty-add-btn"
            >
              <Inbox size={18} /> View Rent Requests
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("my-items")}
              className="my-items-empty-add-btn"
            >
              View All Items
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
              isReturning={
                String(returningItemId) === String(item.itemId || item.id) ||
                String(returningItemId) === String(item.requestId)
              }
              API_URL={API_URL}
            />
          ))}
        </div>
      )}
    </div>
  );
}
