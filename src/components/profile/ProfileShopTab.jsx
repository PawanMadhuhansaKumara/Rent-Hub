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
            color: "var(--text-main)",
          }}
        >
          {isOwnProfile ? "My Items" : "Shop Items"}
        </h3>
        <span
          onClick={() => navigate("/add-item")}
          style={{
            fontSize: "13px",
            color: "var(--primary)",
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
                        backgroundColor: isRented ? "var(--badge-red-text)" : "var(--primary)",
                        color: "var(--text-inverse)",
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
                          backgroundColor: "var(--bg-card)",
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
                      color: "var(--text-main)",
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
                    Rs. {item.price}{" "}
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
                      marginBottom: "8px",
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
                          backgroundColor: isRented ? "var(--badge-green-bg)" : "var(--badge-red-bg)",
                          color: isRented ? "var(--primary)" : "var(--badge-red-text)",
                          border: `1px solid ${isRented ? "var(--badge-green-bg)" : "var(--badge-red-border)"}`,
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
                            <CheckCircle2 size={14} color="var(--primary)" /> Mark as Available
                          </>
                        ) : (
                          <>
                            <Clock size={14} color="var(--badge-red-text)" /> Mark as Rented Out
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
                          backgroundColor: "var(--badge-red-bg)",
                          color: "var(--badge-red-text)",
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
