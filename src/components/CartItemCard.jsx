import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, User, Calendar, ExternalLink } from 'lucide-react';
import './components.css';

/**
 * CartItemCard
 * Displays a single cart entry with rich styling.
 */
export default function CartItemCard({
  cartItem,
  onRemove,
  isSelected = false,
  onToggleSelect,
}) {
  const {
    id,
    itemId,
    title,
    price,
    priceType,
    image,
    quantity,
    startDate,
    endDate,
    sellerName,
    sellerPic,
    category,
  } = cartItem;

  const API_URL = "https://rent-hub-ashen.vercel.app";

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`
    : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400";

  const sellerPicUrl = sellerPic
    ? sellerPic.startsWith("http")
      ? sellerPic
      : `${API_URL}${sellerPic.startsWith("/") ? "" : "/"}${sellerPic}`
    : null;

  const isRented =
    cartItem.available === "Rented Out" ||
    String(cartItem.available).toLowerCase() === "rented out" ||
    String(cartItem.available).toLowerCase() === "rented" ||
    cartItem.available === 0 ||
    cartItem.available === "0" ||
    (cartItem.available !== undefined &&
      cartItem.available !== null &&
      cartItem.available !== "" &&
      !isNaN(Number(cartItem.available)) &&
      Number(cartItem.available) < 1);

  return (
    <div
      className={`cart-item-card ${
        isSelected && !isRented ? "is-selected" : ""
      } ${isRented ? "is-rented-out" : ""}`}
      data-cart-id={id}
      style={isRented ? { opacity: 0.75 } : {}}
    >
      {/* Checkbox */}
      <div className="cart-item-checkbox-container">
        <input
          type="checkbox"
          id={`cart-check-${id}`}
          checked={isSelected && !isRented}
          onChange={() => onToggleSelect && onToggleSelect(id)}
          className="cart-item-checkbox"
          disabled={isRented}
          title={isRented ? "Item is currently rented out" : `Select ${title}`}
          aria-label={`Select ${title}`}
        />
      </div>

      {/* Image Wrapper */}
      <div className="cart-item-img-wrapper" style={{ position: "relative" }}>
        {isRented && (
          <span
            style={{
              position: "absolute",
              top: "6px",
              left: "6px",
              background: "var(--badge-red-text)",
              color: "var(--text-inverse)",
              fontSize: "10px",
              fontWeight: "700",
              padding: "2px 6px",
              borderRadius: "4px",
              zIndex: 2,
            }}
          >
            Rented Out
          </span>
        )}
        <img
          src={imageUrl}
          alt={title}
          className="cart-item-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400";
          }}
        />
        {category && (
          <span className="cart-item-category-tag">{category}</span>
        )}
      </div>

      {/* Main Body */}
      <div className="cart-item-body">
        <div className="cart-item-header-row">
          <h4 className="cart-item-title">
            <Link to={`/item/${itemId}`} className="cart-item-link" title={title}>
              {title}
            </Link>
          </h4>

          {onRemove && (
            <button
              type="button"
              className="cart-item-remove-btn"
              onClick={() => onRemove(id)}
              title="Remove from Cart"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          )}
        </div>

        {/* Seller Info */}
        <div className="cart-item-seller">
          <div className="cart-item-seller-avatar-wrap">
            {sellerPicUrl ? (
              <img src={sellerPicUrl} alt={sellerName} className="cart-item-seller-avatar" />
            ) : (
              <User size={13} color="var(--primary)" />
            )}
          </div>
          <span className="cart-item-seller-label">Listed by:</span>
          <span className="cart-item-seller-name">{sellerName || "Owner"}</span>
        </div>

        {/* Meta badges: Quantity, Dates */}
        <div className="cart-item-meta-row">
          <span className="cart-item-badge cart-badge-qty">
            Qty: <strong>{quantity || 1}</strong>
          </span>

          {startDate && endDate && (
            <span className="cart-item-badge cart-badge-dates">
              <Calendar size={13} />
              <span>{startDate} → {endDate}</span>
            </span>
          )}
        </div>

        {/* Footer: Price & View Item Button */}
        <div className="cart-item-footer">
          <div className="cart-item-price-block">
            <span className="cart-item-price-label">Rental Rate</span>
            <div className="cart-item-price">
              Rs. {Number(price || 0).toLocaleString()}
              <span className="cart-item-price-type"> / {priceType || "day"}</span>
            </div>
          </div>

          <Link to={`/item/${itemId}`} className="cart-item-action-btn">
            <span>View Details</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

