import React from "react";
import { useTranslation } from "react-i18next";
import {
  Coins,
  Sparkles,
  Package,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function BusinessWelcomeCard({
  earningsData,
  onOpenEarningsModal,
  totalListings = 0,
  availableCount = 0,
  rentedCount = 0,
  totalPortfolioValue = 0,
}) {
  const { t } = useTranslation();

  return (
    <div className="business-welcome-card">
      {/* TOTAL EARNED BANNER (Net 90% after 10% platform fee deduction) */}
      <div
        className="business-total-earn-card"
        onClick={onOpenEarningsModal}
        role="button"
        tabIndex={0}
        title="Click to view item earnings breakdown, add bank account & request payouts"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpenEarningsModal();
          }
        }}
      >
        <div className="total-earn-left">
          <div className="total-earn-icon-wrap">
            <Coins size={28} color="var(--badge-yellow-text)" />
          </div>
          <div>
            <div className="total-earn-tag-row">
              <span className="total-earn-tag">{t("earnings.totalEarned", "Total Earned (90% Net)")}</span>
              <span className="total-earn-fee-pill">{t("earnings.feeDeducted", "10% Platform Fee Deducted")}</span>
            </div>
            <div className="total-earn-value">
              <span style={{ fontSize: "18px", fontWeight: "700", opacity: 0.9 }}>
                LKR
              </span>{" "}
              {Number(earningsData?.totalNetEarnings || 0).toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="total-earn-sub">
              <span>{t("earnings.availableWithdraw", "Available to Withdraw")}:</span>
              <strong className="total-earn-available">
                LKR{" "}
                {Number(earningsData?.availableBalance || 0).toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
              <span>• {t("earnings.viewBreakdown", "Click to view item breakdown & payout")} →</span>
            </div>
          </div>
        </div>

        <div className="total-earn-withdraw-cta">
          <Sparkles size={16} />
          <span>{t("earnings.viewBreakdown", "View Breakdown & Payout")}</span>
        </div>
      </div>

      {/* COMPACT MINI STATS (Total Listings, Available, Rented, Catalog Value) */}
      <div className="welcome-mini-stats">
        <div className="mini-stat-pill">
          <div className="mini-stat-icon green">
            <Package size={15} />
          </div>
          <div className="mini-stat-text">
            <span className="mini-stat-label">
              {t("businessHub.totalListings", "Total Listings")}
            </span>
            <span className="mini-stat-num">{totalListings}</span>
          </div>
        </div>

        <div className="mini-stat-pill">
          <div className="mini-stat-icon blue">
            <CheckCircle2 size={15} />
          </div>
          <div className="mini-stat-text">
            <span className="mini-stat-label">
              {t("businessHub.availableForRent", "Available")}
            </span>
            <span className="mini-stat-num">{availableCount}</span>
          </div>
        </div>

        <div className="mini-stat-pill">
          <div className="mini-stat-icon amber">
            <Clock size={15} />
          </div>
          <div className="mini-stat-text">
            <span className="mini-stat-label">
              {t("businessHub.rentedOutOfStock", "Rented Out")}
            </span>
            <span className="mini-stat-num">{rentedCount}</span>
          </div>
        </div>

        <div className="mini-stat-pill">
          <div className="mini-stat-icon purple">
            <TrendingUp size={15} />
          </div>
          <div className="mini-stat-text">
            <span className="mini-stat-label">
              {t("businessHub.catalogValue", "Catalog Value")}
            </span>
            <span className="mini-stat-num">
              {t("item.currency", "LKR")}{" "}
              {totalPortfolioValue.toLocaleString("en-LK")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
