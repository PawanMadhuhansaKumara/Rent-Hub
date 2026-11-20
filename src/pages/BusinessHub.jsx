import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Plus,
  Package,
  TrendingUp,
  Clock,
  ArrowRight,
  Store,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  List,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import "./BusinessHub.css";

const API_URL = "http://localhost:5001";

export default function BusinessHub({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
            "Could not load your items at this moment.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();

    window.addEventListener("items_updated", fetchUserItems);
    window.addEventListener("rent_requests_updated", fetchUserItems);
    return () => {
      window.removeEventListener("items_updated", fetchUserItems);
      window.removeEventListener("rent_requests_updated", fetchUserItems);
    };
  }, [userId]);

  const totalListings = items.length;
  const isItemAvailable = (it) =>
    it.available !== "Rented Out" &&
    it.available !== 0 &&
    it.available !== "0" &&
    (it.available === "Available" || Number(it.available ?? 0) > 0);

  const availableCount = items.filter(isItemAvailable).length;
  const rentedCount = items.filter((it) => !isItemAvailable(it)).length;

  const totalPortfolioValue = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  );

  const rawAvatar = currentUser?.profile_pic_url || currentUser?.profilePic;
  const avatarUrl = rawAvatar
    ? rawAvatar.startsWith("http")
      ? rawAvatar
      : `${API_URL}${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`
    : null;

  const userName =
    currentUser?.full_name ||
    currentUser?.name ||
    t("businessHub.businessOwner", "Business Owner");

  return (
    <main className="business-hub-page">
      <div className="business-hub-container">
        {/* Header Bar */}
        <div className="business-hub-header">
          <div className="business-hub-header-left">
            <div>
              <h1 className="business-hub-title">
                {t("businessHub.title", "Business Hub")}
                <span className="business-hub-badge">
                  {t("businessHub.sellerCenter", "Seller Center")}
                </span>
              </h1>
              <p className="business-hub-subtitle">
                {t(
                  "businessHub.subtitle",
                  "Manage your rental inventory, track availability, and grow your earnings.",
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Store Welcome Card */}
        <div className="business-welcome-card">
          <div className="welcome-info-section">
            <div className="welcome-avatar-wrap">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="welcome-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Store size={30} color="#ffffff" />
              )}
            </div>
            <div className="welcome-text">
              <h2>
                {t("businessHub.userRentalStore", {
                  name: userName,
                  defaultValue: `${userName}'s Rental Store`,
                })}
              </h2>
            </div>
          </div>

          <div className="welcome-actions">
            <Link to="/profile" className="welcome-btn-white">
              <Eye size={15} />
              {t("businessHub.viewPublicStore", "View Public Store")}
            </Link>
            <Link
              to="/my-items?tab=my-items"
              className="welcome-btn-translucent"
            >
              <List size={15} />
              {t("businessHub.manageInventory", "Manage Inventory")}
            </Link>
          </div>
        </div>

        {/* Analytics & Key Metrics */}
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
                  "Currently with renters",
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

        {/* Quick Actions Grid */}
        <div className="business-actions-section">
          <div className="section-heading-row">
            <h3>{t("businessHub.quickOperations", "Quick Operations")}</h3>
          </div>

          <div className="business-actions-grid">
            <Link to="/add-item" className="action-card">
              <div className="action-icon">
                <Plus size={20} />
              </div>
              <div className="action-info">
                <h4>{t("businessHub.addNewItem", "Add New Item")}</h4>
                <p>
                  {t(
                    "businessHub.addNewItemDesc",
                    "Upload photos, set rates & stock",
                  )}
                </p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </Link>

            <Link
              to="/my-items?tab=rent-requests&filter=received&from=business-hub"
              className="action-card"
            >
              <div className="action-icon">
                <ShoppingBag size={20} />
              </div>
              <div className="action-info">
                <h4>{t("businessHub.rentalRequests", "Rental Requests")}</h4>
                <p>
                  {t(
                    "businessHub.rentalRequestsDesc",
                    "Review customer booking requests",
                  )}
                </p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </Link>

            <Link
              to="/my-items?tab=rented-items&subtab=sented-out&from=business-hub"
              className="action-card"
            >
              <div className="action-icon">
                <Clock size={20} />
              </div>
              <div className="action-info">
                <h4>
                  {t("businessHub.activeRentedItems", "Active Rented Items")}
                </h4>
                <p>
                  {t(
                    "businessHub.activeRentedItemsDesc",
                    "Track return dates & item status",
                  )}
                </p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </Link>

            <Link to="/my-items?tab=my-items" className="action-card">
              <div className="action-icon">
                <Package size={20} />
              </div>
              <div className="action-info">
                <h4>{t("businessHub.fullInventory", "Full Inventory")}</h4>
                <p>
                  {t(
                    "businessHub.fullInventoryDesc",
                    "Edit prices, availability & details",
                  )}
                </p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </Link>
          </div>
        </div>

        {/* Recent Listings Preview */}
        <div className="business-listings-section">
          <div className="section-heading-row">
            <h3>{t("businessHub.recentListings", "Your Recent Listings")}</h3>
            {items.length > 0 && (
              <Link
                to="/my-items?tab=my-items"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#15803d",
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
                  "Start earning by listing your tools, cameras, equipment, or party gear for rent.",
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
                          <Package size={22} color="#94a3b8" />
                        </div>
                      )}

                      <div className="listing-row-info">
                        <h4>{item.title}</h4>
                        <div className="listing-row-meta">
                          <span>
                            {item.category
                              ? t(
                                  `categories.${item.category.toLowerCase()}`,
                                  item.category,
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
                            item.priceType || "day",
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

        {/* Business Tips Banner */}
        <div className="business-tips-banner">
          <div className="tips-icon-wrap">
            <Sparkles size={22} />
          </div>
          <div className="tips-content">
            <h4>{t("businessHub.tipsTitle", "Boost Your Rental Income")}</h4>
            <p>
              {t(
                "businessHub.tipsDesc",
                "High quality pictures, quick replies to chat inquiries, and offering fair daily rates help items rent 3x faster on Rent-Hub.",
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
