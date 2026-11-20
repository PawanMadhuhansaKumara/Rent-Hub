import React from "react";
import { Package, Star, Clock } from "lucide-react";

export default function ProfileTabsNav({
  activeTab,
  setActiveTab,
  items = [],
  itemsCount,
  sellerReviews = [],
  reviewsCount,
  profile,
  isOwnProfile,
  styles = {},
  t = (key, fallback) => fallback || key,
}) {
  const displayItemsCount =
    itemsCount !== undefined ? itemsCount : items?.length || 0;

  const displayReviewsCount =
    reviewsCount !== undefined
      ? reviewsCount
      : profile?.reviews_count !== undefined
      ? profile.reviews_count
      : sellerReviews?.length || 0;

  return (
    <div className="profile-tabs-scroll-row">
      <button
        type="button"
        onClick={() => setActiveTab("shop")}
        className={`profile-tab-btn ${activeTab === "shop" ? "active" : ""}`}
      >
        <Package size={16} />
        <span>
          {t("profile.myShopItems", "My Shop Items")} ({displayItemsCount})
        </span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("reviews")}
        className={`profile-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
      >
        <Star size={16} />
        <span>
          {t("profile.reviews", "Reviews")} ({displayReviewsCount})
        </span>
      </button>

      {isOwnProfile && (
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`profile-tab-btn ${activeTab === "history" ? "active" : ""}`}
        >
          <Clock size={16} />
          <span>{t("profile.rentalHistory", "Rental History")}</span>
        </button>
      )}
    </div>
  );
}
