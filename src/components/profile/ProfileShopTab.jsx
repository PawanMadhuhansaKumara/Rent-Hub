import React from "react";
import { Calendar, Eye, CheckCircle2, Clock, Trash2 } from "lucide-react";

export default function ProfileShopTab({
  items = [],
  isOwnProfile,
  isItemRented,
  handleToggleStatus,
  handleDeleteItem,
  navigate,
  t,
}) {
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
            color: "#111",
          }}
        >
          {isOwnProfile ? "My Items" : "Shop Items"}
        </h3>
        <span
          onClick={() => navigate("/add-item")}
          style={{
            fontSize: "13px",
            color: "#00aa5b",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          View All &rarr;
        </span>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#777",
            fontSize: "14px",
            backgroundColor: "#fafafa",
            borderRadius: "16px",
            border: "1px dashed #ddd",
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
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/item/${item.id}`)}
                title="Click to view & manage this item"
              >
                <div className="profile-item-img-container">
                  <img
                    src={
                      item.image
                        ? item.image.startsWith("http")
                          ? item.image
                          : `http://localhost:5001${item.image}`
                        : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300"
                    }
                    alt={item.title}
                    className="profile-item-img"
                  />

                  {/* Availability Status Badge (Click to toggle) */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      cursor: isOwnProfile ? "pointer" : "default",
                    }}
                    onClick={(e) => {
                      if (isOwnProfile && handleToggleStatus) {
                        e.stopPropagation();
                        handleToggleStatus(item.id, isRented);
                      }
                    }}
                    title={
                      isOwnProfile ? "Click to toggle availability" : ""
                    }
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        padding: "4px 10px",
                        borderRadius: "14px",
                        backgroundColor: isRented ? "#dc2626" : "#00aa5b",
                        color: "#ffffff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        transition: "all 0.2s",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          display: "inline-block",
                        }}
                      />
                      {isRented ? "Rented Out" : "Available"}
                    </span>
                  </div>
                </div>

                <div style={{ padding: "14px" }}>
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#222",
                    }}
                  >
                    {item.title}
                  </h4>

                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#00aa5b",
                      margin: "4px 0 10px 0",
                    }}
                  >
                    Rs. {item.price}{" "}
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "normal",
                        color: "#666",
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
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        color: "#666",
                      }}
                    >
                      <Calendar size={13} color="#00aa5b" />{" "}
                      {item.bookings ?? 0}{" "}
                      {item.bookings === 1 ? "booking" : "bookings"}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        color: "#666",
                      }}
                    >
                      <Eye size={13} color="#666" /> {item.views ?? 0} views
                    </span>
                  </div>

                  {isOwnProfile && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginTop: "12px",
                      }}
                    >
                      {/* Status Toggle Button (Available <-> Rented Out) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(item.id, isRented);
                        }}
                        style={{
                          width: "100%",
                          backgroundColor: isRented ? "#f0fdf4" : "#fef2f2",
                          color: isRented ? "#16a34a" : "#dc2626",
                          border: `1px solid ${isRented ? "#bbf7d0" : "#fecaca"}`,
                          padding: "7px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.2s",
                        }}
                        title="Click to change availability status"
                      >
                        {isRented ? (
                          <>
                            <CheckCircle2 size={14} color="#16a34a" /> Mark as Available
                          </>
                        ) : (
                          <>
                            <Clock size={14} color="#dc2626" /> Mark as Rented Out
                          </>
                        )}
                      </button>

                      {/* Delete Item Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        style={{
                          width: "100%",
                          backgroundColor: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          padding: "6px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          transition: "background 0.2s",
                        }}
                      >
                        <Trash2 size={13} /> Delete Item
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
