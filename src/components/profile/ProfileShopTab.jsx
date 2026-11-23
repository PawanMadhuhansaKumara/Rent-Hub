import React, { useState } from "react";
import {
  Calendar,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import ManageItemModal from "./ManageItemModal";

export default function ProfileShopTab({
  items = [],
  isOwnProfile,
  isItemRented,
  handleToggleStatus,
  handleDeleteItem,
  onItemUpdated,
  navigate,
  t = (k, f) => (typeof f === "string" ? f : k),
}) {
  const [managingItem, setManagingItem] = useState(null);

  const handleCardClick = (item) => {
    if (isOwnProfile) {
      setManagingItem(item);
    } else if (navigate) {
      navigate(`/item/${item.id}`);
    }
  };

  return (
    <div id="profile-shop-section" style={{ marginTop: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "bold",
            color: "var(--text-main)",
          }}
        >
          {isOwnProfile ? "My Items" : "Shop Items"}
        </h3>
        <span
          onClick={() => navigate && navigate("/add-item")}
          style={{
            fontSize: "13px",
            color: "var(--primary)",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {isOwnProfile ? "+ Add New Item" : "View All →"}
        </span>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "14px",
            backgroundColor: "var(--bg-card-hover)",
            borderRadius: "16px",
            border: "1px dashed var(--border-light)",
          }}
        >
          {t("profile.noItems", "No items available in shop.")}
        </div>
      ) : (
        <div className="profile-items-grid">
          {items.map((item, idx) => {
            const isRented = isItemRented ? isItemRented(item) : false;
            return (
              <div
                key={item.id || idx}
                className="profile-item-card"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  position: "relative",
                }}
                onClick={() => handleCardClick(item)}
                title={
                  isOwnProfile
                    ? "Click to manage item details, availability & options"
                    : "Click to view item"
                }
              >
                <div className="profile-item-img-container">
                  <img
                    src={
                      item.image
                        ? item.image.startsWith("http")
                          ? item.image
                          : `http://https://rent-hub-ashen.vercel.app${item.image}`
                        : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300"
                    }
                    alt={item.title}
                    className="profile-item-img"
                  />

                  {/* Modern Glassmorphic Availability Status Badge (Top Left) */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.2px",
                        padding: "5px 11px",
                        borderRadius: "20px",
                        backgroundColor: isRented
                          ? "rgba(255, 241, 242, 0.94)"
                          : "rgba(240, 253, 244, 0.94)",
                        color: isRented ? "#be123c" : "#15803d",
                        border: isRented
                          ? "1px solid rgba(244, 63, 94, 0.35)"
                          : "1px solid rgba(34, 197, 94, 0.35)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: isRented ? "#e11d48" : "#16a34a",
                          boxShadow: isRented
                            ? "0 0 0 2px rgba(225, 29, 72, 0.25)"
                            : "0 0 0 2px rgba(22, 163, 74, 0.25)",
                          display: "inline-block",
                        }}
                      />
                      <span>{isRented ? "Rented Out" : "Available"}</span>
                    </span>
                  </div>

                  {/* Top-Right Manage Icon Button for Owner */}
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManagingItem(item);
                      }}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.92)",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      title="Manage Item (Edit, Availability, Delete)"
                    >
                      <SlidersHorizontal size={14} color="var(--primary, #00aa5b)" />
                    </button>
                  )}
                </div>

                <div style={{ padding: "14px" }}>
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "var(--text-main)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </h4>

                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "var(--primary)",
                      margin: "4px 0 10px 0",
                    }}
                  >
                    Rs. {Number(item.price || 0).toLocaleString()}{" "}
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "normal",
                        color: "var(--text-muted)",
                      }}
                    >
                      / {item.priceType || "day"}
                    </span>
                  </p>

                  {/* Bookings & Views Indicators */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid var(--bg-card-hover)",
                      paddingTop: "8px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Calendar size={13} color="var(--primary)" />{" "}
                      {item.bookings ?? 0}{" "}
                      {item.bookings === 1 ? "booking" : "bookings"}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Eye size={13} color="var(--text-muted)" /> {item.views ?? 0} views
                    </span>
                  </div>

                  {/* Clean Manage Item Action Button for Owner */}
                  {isOwnProfile && (
                    <div style={{ marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setManagingItem(item);
                        }}
                        style={{
                          width: "100%",
                          backgroundColor: "var(--bg-app-alt, #f8fafc)",
                          color: "var(--text-main, #1e293b)",
                          border: "1px solid var(--border-light, #e2e8f0)",
                          padding: "7px 12px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--primary, #00aa5b)";
                          e.currentTarget.style.color =
                            "var(--primary, #00aa5b)";
                          e.currentTarget.style.backgroundColor =
                            "var(--badge-green-bg, #f0fdf4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--border-light, #e2e8f0)";
                          e.currentTarget.style.color =
                            "var(--text-main, #1e293b)";
                          e.currentTarget.style.backgroundColor =
                            "var(--bg-app-alt, #f8fafc)";
                        }}
                        title="Edit details, availability or delete"
                      >
                        <SlidersHorizontal
                          size={13}
                          color="var(--primary, #00aa5b)"
                        />
                        <span>Manage Item</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MANAGE ITEM MODAL POPUP */}
      {managingItem && (
        <ManageItemModal
          isOpen={Boolean(managingItem)}
          onClose={() => setManagingItem(null)}
          item={managingItem}
          isItemRented={isItemRented}
          onItemUpdated={(updated) => {
            if (onItemUpdated) {
              onItemUpdated(updated);
            }
            setManagingItem(null);
          }}
          onToggleStatus={(itemId, isRented) => {
            if (handleToggleStatus) {
              handleToggleStatus(itemId, isRented);
            }
          }}
          onDeleteItem={(itemId) => {
            if (handleDeleteItem) {
              handleDeleteItem(itemId);
            }
            setManagingItem(null);
          }}
          navigate={navigate}
        />
      )}
    </div>
  );
}
