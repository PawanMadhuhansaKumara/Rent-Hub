import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, User, Calendar, ExternalLink, ArrowRightLeft } from 'lucide-react';
import './components.css';

/**
 * CartItemCard
 * Displays a single cart entry with rich styling and multi-cart movement options.
 */
export default function CartItemCard({
  cartItem,
  onRemove,
  isSelected = false,
  onToggleSelect,
  availableCarts = [],
  onMoveCartItem,
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
          <span className="cart-item-rented-badge">
            Rented
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
      </div>

      {/* Main Body */}
      <div className="cart-item-body">
        <div className="cart-item-header-row">
          <div className="cart-item-title-group">
            <h4 className="cart-item-title">
              <Link to={`/item/${itemId}`} className="cart-item-link" title={title}>
                {title}
              </Link>
            </h4>
            {category && (
              <span className="cart-item-category-pill">{category}</span>
            )}
          </div>

          {onRemove && (
            <button
              type="button"
              className="cart-item-remove-btn"
              onClick={() => onRemove(id)}
              title="Remove from Cart"
            >
              <Trash2 size={13} />
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

        {/* Meta badges: Quantity, Dates, Move Cart */}
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

          {availableCarts && availableCarts.length > 1 && onMoveCartItem && (
            <div className="cart-item-move-wrapper" title="Move item to another cart">
              <ArrowRightLeft size={12} className="cart-item-move-icon" />
              <select
                className="cart-item-move-select"
                value={cartItem.cartName || "Default"}
                onChange={(e) => onMoveCartItem(id, e.target.value)}
              >
                {availableCarts.map((cName) => (
                  <option key={cName} value={cName}>
                    {cName === (cartItem.cartName || "Default")
                      ? `In: ${cName === "Default" ? "Default Cart" : cName}`
                      : `Move to: ${cName === "Default" ? "Default Cart" : cName}`}
                  </option>
                ))}
              </select>
            </div>
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

