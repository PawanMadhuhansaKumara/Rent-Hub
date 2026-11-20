import React from "react";
import { useTranslation } from "react-i18next";
import { Package, CheckCircle2, Star, Coins } from "lucide-react";

export default function ProfileStatsBar({
  profile = {},
  items = [],
  activeTab = "shop",
  setActiveTab = () => {},
  isOwnProfile = false,
  setShowTopupModal = () => {},
}) {
  const { t } = useTranslation();
  return (
    <div className="profile-stats-bar-grid">
      {/* 1. Total Items */}
      <div
        className="profile-stat-box profile-stat-item-with-border"
        onClick={() => {
          setActiveTab("shop");
          setTimeout(() => {
            document
              .getElementById("profile-shop-section")
              ?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }}
        style={{
          cursor: "pointer",
          padding: "6px 8px",
          borderRadius: "12px",
          backgroundColor: activeTab === "shop" ? "#e6f7ef" : "transparent",
          transition: "all 0.2s ease",
        }}
        title="Click to view shop items"
        role="button"
        tabIndex={0}
      >
        <div className="profile-stat-icon-wrapper">
          <Package size={20} color="#00aa5b" />
        </div>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <span className="profile-stat-val">{items?.length || 0}</span>
          <span className="profile-stat-lbl">{t("stats.totalItems", "Total Items")}</span>
        </div>
      </div>

      {/* 2. Trust Score */}
      <div
        className="profile-stat-box profile-stat-item-with-border"
        style={{
          padding: "6px 8px",
          borderRadius: "12px",
        }}
        title={`Trust Score: ${profile?.trust_score || 50}% | Max Rental Limit: LKR ${(
          profile?.max_rental_limit || 1000
        ).toLocaleString()}`}
      >
        <div className="profile-stat-icon-wrapper">
          <CheckCircle2 size={20} color="#00aa5b" />
        </div>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <span className="profile-stat-val">
            {profile?.trust_score || 50}%
          </span>
          <span className="profile-stat-lbl">{t("stats.trustScore", "Trust Score")}</span>
        </div>
      </div>

      {/* 3. Reviews */}
      <div
        className="profile-stat-box profile-stat-item-with-border"
        onClick={() => {
          setActiveTab("reviews");
          setTimeout(() => {
            document
              .getElementById("profile-reviews-section")
              ?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }}
        style={{
          cursor: "pointer",
          padding: "6px 8px",
          borderRadius: "12px",
          backgroundColor: activeTab === "reviews" ? "#e6f7ef" : "transparent",
          transition: "all 0.2s ease",
        }}
        title="Click to view customer reviews & comments"
        role="button"
        tabIndex={0}
      >
        <div className="profile-stat-icon-wrapper">
          <Star size={20} color="#00aa5b" fill="#00aa5b" />
        </div>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <span className="profile-stat-val">
            {profile?.user_rating && profile.user_rating > 0
              ? Number(profile.user_rating).toFixed(1)
              : profile?.reviews_count > 0
              ? "5.0"
              : "0.0"}
          </span>
          <span className="profile-stat-lbl">
            {t("stats.fromReviews", {
              count: profile?.reviews_count || 0,
              defaultValue: `from ${profile?.reviews_count || 0} reviews`,
            })}
          </span>
        </div>
      </div>

      {/* 4. Cash Points */}
      <div
        className="profile-stat-cashpoints"
        onClick={() => {
          if (isOwnProfile && setShowTopupModal) {
            setShowTopupModal(true);
          }
        }}
        style={{
          cursor: isOwnProfile ? "pointer" : "default",
          padding: "6px 8px",
          borderRadius: "12px",
          backgroundColor: isOwnProfile ? "#fefce8" : "transparent",
          border: isOwnProfile ? "1px dashed #facc15" : "none",
          transition: "all 0.2s ease",
        }}
        title={
          isOwnProfile
            ? "Click to Top Up Cash Points via Payment Gateway"
            : "Seller Cash Points"
        }
        role={isOwnProfile ? "button" : undefined}
        tabIndex={isOwnProfile ? 0 : undefined}
      >
        <div
          className="profile-stat-icon-wrapper"
          style={{ backgroundColor: "#fef9c3" }}
        >
          <Coins size={20} color="#ca8a04" />
        </div>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <span
            className="profile-stat-val"
            style={{ color: "#854d0e" }}
          >
            {Number(profile?.cash_points || 0).toLocaleString()}
          </span>
          <span
            className="profile-stat-lbl"
            style={{ color: "#a16207" }}
          >
            {t("stats.cashPoints", "Cash Points")}{" "}
            {isOwnProfile && (
              <span style={{ color: "#16a34a", fontWeight: "800" }}>+</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
