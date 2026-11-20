import React from "react";
import { useTranslation } from "react-i18next";
import { Package, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function BusinessStatsGrid({
  totalListings = 0,
  availableCount = 0,
  rentedCount = 0,
  totalPortfolioValue = 0,
}) {
  const { t } = useTranslation();

  return (
    <div className="business-stats-grid">
      <div className="business-stat-card">
        <div className="stat-icon-wrapper green">
          <Package size={24} />
        </div>
        <div className="stat-content">
          <p className="stat-label">
            {t("businessHub.totalListings", "Total Listings")}
          </p>
          <p className="stat-value">{totalListings}</p>
          <p className="stat-sub">
            {t("businessHub.totalListingsDesc", "Items in your catalog")}
          </p>
        </div>
      </div>

      <div className="business-stat-card">
        <div className="stat-icon-wrapper blue">
          <CheckCircle2 size={24} />
        </div>
        <div className="stat-content">
          <p className="stat-label">
            {t("businessHub.availableForRent", "Available for Rent")}
          </p>
          <p className="stat-value">{availableCount}</p>
          <p className="stat-sub">
            {t("businessHub.availableForRentDesc", "Ready for customers")}
          </p>
        </div>
      </div>

      <div className="business-stat-card">
        <div className="stat-icon-wrapper amber">
          <Clock size={24} />
        </div>
        <div className="stat-content">
          <p className="stat-label">
            {t("businessHub.rentedOutOfStock", "Rented / Out of Stock")}
          </p>
          <p className="stat-value">{rentedCount}</p>
          <p className="stat-sub">
            {t(
              "businessHub.rentedOutOfStockDesc",
              "Currently with renters"
            )}
          </p>
        </div>
      </div>

      <div className="business-stat-card">
        <div className="stat-icon-wrapper purple">
          <TrendingUp size={24} />
        </div>
        <div className="stat-content">
          <p className="stat-label">
            {t("businessHub.catalogValue", "Catalog Price Value")}
          </p>
          <p className="stat-value">
            {t("item.currency", "LKR")}{" "}
            {totalPortfolioValue.toLocaleString("en-LK")}
          </p>
          <p className="stat-sub">
            {t("businessHub.catalogValueDesc", "Combined listing rates")}
          </p>
        </div>
      </div>
    </div>
  );
}
