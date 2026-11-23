import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./BusinessHub.css";
import SellerEarningsModal from "../components/SellerEarningsModal";
import {
  BusinessHubHeader,
  BusinessWelcomeCard,
  BusinessQuickOperations,
  BusinessRecentListings,
  BusinessTipsBanner,
  isItemAvailable,
} from "../components/business-hub";

const API_URL = "https://rent-hub-ashen.vercel.app";

export default function BusinessHub({ user }) {
  const { t } = useTranslation();

  const currentUser =
    user ||
    (() => {
      try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();

  const userId = currentUser?.user_id || currentUser?.id;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [earningsData, setEarningsData] = useState({
    totalNetEarnings: 0,
    totalGross: 0,
    totalCommission: 0,
    totalWithdrawn: 0,
    availableBalance: 0,
    cashPoints: 0,
    history: [],
  });

  const fetchEarnings = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/earnings`);
      const data = await res.json();
      if (res.ok && data.success) {
        setEarningsData(data);
      }
    } catch (err) {
      console.error("Error loading seller earnings:", err);
    }
  };

  useEffect(() => {
    const fetchUserItems = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_URL}/api/items/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch your inventory.");
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading inventory:", err);
        setError(
          t(
            "businessHub.errorLoadingDesc",
            "Could not load your items at this moment."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();
    fetchEarnings();

    window.addEventListener("items_updated", fetchUserItems);
    window.addEventListener("rent_requests_updated", fetchUserItems);
    window.addEventListener("rent_requests_updated", fetchEarnings);
    window.addEventListener("user_updated", fetchEarnings);
    return () => {
      window.removeEventListener("items_updated", fetchUserItems);
      window.removeEventListener("rent_requests_updated", fetchUserItems);
      window.removeEventListener("rent_requests_updated", fetchEarnings);
      window.removeEventListener("user_updated", fetchEarnings);
    };
  }, [userId]);

  // Derived metrics
  const totalListings = items.length;
  const availableCount = items.filter(isItemAvailable).length;
  const rentedCount = items.filter((it) => !isItemAvailable(it)).length;
  const totalPortfolioValue = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  );

  return (
    <main className="business-hub-page">
      <div className="business-hub-container">
        {/* Header Bar */}
        <BusinessHubHeader />

        {/* Store Welcome Card & Net Earnings Banner with Compact Stats */}
        <BusinessWelcomeCard
          earningsData={earningsData}
          onOpenEarningsModal={() => setShowEarningsModal(true)}
          totalListings={totalListings}
          availableCount={availableCount}
          rentedCount={rentedCount}
          totalPortfolioValue={totalPortfolioValue}
        />

        {/* Quick Operations Grid */}
        <BusinessQuickOperations />

        {/* Recent Listings Preview */}
        <BusinessRecentListings
          items={items}
          loading={loading}
          error={error}
          API_URL={API_URL}
        />

        {/* Business Tips Banner */}
        <BusinessTipsBanner />

        {/* SELLER EARNINGS & PAYOUT MODAL */}
        {showEarningsModal && (
          <SellerEarningsModal
            isOpen={showEarningsModal}
            onClose={() => setShowEarningsModal(false)}
            userId={userId}
            API_URL={API_URL}
            onEarningsUpdated={(data) => setEarningsData(data)}
          />
        )}
      </div>
    </main>
  );
}
