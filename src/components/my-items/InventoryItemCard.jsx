import React from "react";
import { Link } from "react-router-dom";

/**
 * InventoryItemCard
 * Displays a single listed item owned by the user with status toggle.
 */
export default function InventoryItemCard({
  item,
  onStatusChange,
  API_URL = "http://localhost:5001",
}) {
  const imageUrl = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${API_URL}${item.image.startsWith("/") ? "" : "/"}${item.image}`
    : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400";

  const isAvailable = (() => {
    const isDirectAvailable =
      item.available === "Available" ||
      item.available === 1 ||
      item.available === "1";
    if (!isDirectAvailable) return false;

    try {
      const saved = localStorage.getItem("rent_hub_requests");
      if (saved) {
        const requests = JSON.parse(saved);
        if (Array.isArray(requests)) {
          const isRented = requests.some(
            (r) =>
              String(r.itemId || r.item_id) === String(item.id) &&
              String(r.status).toLowerCase() === "rented"
          );
          if (isRented) return false;
        }
      }
    } catch {}

    return true;
  })();

  return (
    <div className="profile-item-card">
      <div className="profile-item-img-container">
        <img
          src={imageUrl}
          alt={item.title}
          className="profile-item-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400";
          }}
        />
        {item.category && (
          <span className="profile-item-category-badge">{item.category}</span>
        )}
      </div>

      <div className="profile-item-body">
        <h4 className="profile-item-title">{item.title}</h4>

        <div className="profile-item-status-row">
          <span className="profile-item-status-label">Status:</span>
          <select
            value={isAvailable ? "Available" : "Rented Out"}
            onChange={(e) =>
              onStatusChange && onStatusChange(item.id, e.target.value)
            }
            className={`profile-item-status-select ${
              isAvailable ? "status-available" : "status-rented"
            }`}
          >
            <option value="Available">Available</option>
            <option value="Rented Out">Rented Out</option>
          </select>
        </div>

        <div className="profile-item-footer">
          <div>
            <span className="profile-item-price-label">Price</span>
            <p className="profile-item-price">
              Rs. {Number(item.price || 0).toLocaleString()}
              <span className="profile-item-price-type">
                {" "}
                / {item.priceType || "day"}
              </span>
            </p>
          </div>
          <Link to={`/item/${item.id}`} className="my-item-view-btn">
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
