import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Package, AlertCircle } from "lucide-react";

export const isItemAvailable = (it) =>
  it &&
  it.available !== "Rented Out" &&
  it.available !== 0 &&
  it.available !== "0" &&
  (it.available === "Available" || Number(it.available ?? 0) > 0);

export default function BusinessRecentListings({
  items = [],
  loading = false,
  error = "",
  API_URL = "http://https://rent-hub-ashen.vercel.app",
}) {
  const { t } = useTranslation();

  return (
    <div className="business-listings-section">
      <div className="section-heading-row">
        <h3>{t("businessHub.recentListings", "Your Recent Listings")}</h3>
        {items.length > 0 && (
          <Link
            to="/my-items?tab=my-items"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            {t("businessHub.viewAllCount", {
              count: items.length,
              defaultValue: `View all (${items.length}) →`,
            })}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="business-hub-loader">
          <div className="hub-spinner" />
          <p>{t("businessHub.loadingInventory", "Loading inventory...")}</p>
        </div>
      ) : error ? (
        <div className="business-empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={28} />
          </div>
          <h4>{t("businessHub.errorLoading", "Error Loading Items")}</h4>
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="business-empty-state">
          <div className="empty-state-icon">
            <Package size={28} />
          </div>
          <h4>{t("businessHub.noItems", "No items listed yet")}</h4>
          <p>
            {t(
              "businessHub.noItemsDesc",
              "Start earning by listing your tools, cameras, equipment, or party gear for rent."
            )}
          </p>
          <Link to="/add-item" className="business-hub-add-btn">
            <Plus size={16} />
            {t("businessHub.listFirstItem", "List Your First Item")}
          </Link>
        </div>
      ) : (
        <div className="listings-list">
          {items.slice(0, 5).map((item) => {
            const itemImg = item.image
              ? item.image.startsWith("http")
                ? item.image
                : `${API_URL}/${item.image.replace(/^\/+/, "")}`
              : null;
            const isAvail = isItemAvailable(item);

            return (
              <div key={item.id} className="listing-row-card">
                <div className="listing-row-left">
                  {itemImg ? (
                    <img
                      src={itemImg}
                      alt={item.title}
                      className="listing-row-img"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="listing-row-img"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Package size={22} color="var(--text-muted)" />
                    </div>
                  )}

                  <div className="listing-row-info">
                    <h4>{item.title}</h4>
                    <div className="listing-row-meta">
                      <span>
                        {item.category
                          ? t(
                              `categories.${item.category.toLowerCase()}`,
                              item.category
                            )
                          : t("categories.general", "General")}
                      </span>
                      <span>•</span>
                      <span
                        className={`listing-status-tag ${
                          isAvail ? "available" : "unavailable"
                        }`}
                      >
                        {isAvail
                          ? t("businessHub.inStock", {
                              count: item.available,
                              defaultValue: `In Stock (${item.available})`,
                            })
                          : t("businessHub.rentedOut", "Rented Out")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="listing-row-right">
                  <div className="listing-price-tag">
                    {t("item.currency", "LKR")}{" "}
                    {Number(item.price || 0).toLocaleString("en-LK")}
                    <span>
                      {" "}
                      /{" "}
                      {t(
                        `item.${(item.priceType || "day").toLowerCase()}`,
                        item.priceType || "day"
                      )}
                    </span>
                  </div>
                  <Link
                    to={`/item/${item.id}`}
                    className="listing-view-btn"
                  >
                    {t("businessHub.viewItem", "View Item")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
