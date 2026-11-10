import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import CartItemCard from "../CartItemCard";
import RentRequestButton from "../RentRequestButton";

/**
 * RentCartTab
 * Renders the user's rental cart with item selection, total calculation, and rent actions.
 */
export default function RentCartTab({
  cartItems,
  loadingCart,
  errorCart,
  selectedCartIds,
  totalSelectedPrice,
  onToggleSelect,
  onSelectAll,
  onRemoveFromCart,
  onRentNow,
  onRetry,
}) {
  if (loadingCart) {
    return (
      <div className="my-items-loader">
        <div className="my-items-spinner" />
        <p>Loading cart items...</p>
      </div>
    );
  }

  if (errorCart) {
    return (
      <div className="my-items-error">
        <p>{errorCart}</p>
        <button onClick={onRetry} className="my-items-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="my-items-empty">
        <div className="my-items-empty-icon" style={{ background: "#eff6ff" }}>
          <ShoppingCart size={48} color="#2563eb" />
        </div>
        <h3>Your Rent Cart is empty</h3>
        <p>Browse items and add them to your rent cart to request rentals.</p>
        <Link to="/" className="my-items-empty-add-btn">
          Browse Items
        </Link>
      </div>
    );
  }

  const selectableCartItems = cartItems.filter(
    (ci) =>
      ci.available !== "Rented Out" &&
      String(ci.available).toLowerCase() !== "rented out" &&
      String(ci.available).toLowerCase() !== "rented" &&
      ci.available !== 0 &&
      ci.available !== "0" &&
      (ci.available === undefined ||
        ci.available === null ||
        isNaN(Number(ci.available)) ||
        Number(ci.available) >= 1)
  );

  return (
    <div className="rent-cart-items">
      {/* Toolbar for Selection */}
      <div className="rent-cart-toolbar">
        <label className="rent-cart-select-all">
          <input
            type="checkbox"
            checked={
              selectableCartItems.length > 0 &&
              selectedCartIds.length === selectableCartItems.length
            }
            onChange={onSelectAll}
            disabled={selectableCartItems.length === 0}
          />
          <span>Select All ({selectableCartItems.length} available)</span>
        </label>

        <div className="rent-cart-toolbar-actions">
          {selectedCartIds.length > 0 && (
            <div className="rent-cart-selected-summary">
              <span className="selected-count">
                Selected: <strong>{selectedCartIds.length}</strong>
              </span>
              <span className="selected-total">
                Total: <strong>Rs. {totalSelectedPrice.toLocaleString()}</strong>
              </span>
            </div>
          )}

          <RentRequestButton
            disabled={selectedCartIds.length === 0}
            onClick={onRentNow}
          />
        </div>
      </div>

      {cartItems.map((ci) => (
        <CartItemCard
          key={ci.id}
          cartItem={ci}
          isSelected={selectedCartIds.includes(ci.id)}
          onToggleSelect={onToggleSelect}
          onRemove={onRemoveFromCart}
        />
      ))}

      {cartItems.length > 1 && (
        <div className="rent-cart-bottom-bar">
          <div className="rent-cart-bottom-summary">
            <span>
              Selected: <strong>{selectedCartIds.length}</strong> of{" "}
              {cartItems.length} items
            </span>
            <span>
              Total Amount:{" "}
              <strong className="summary-price">
                Rs. {totalSelectedPrice.toLocaleString()}
              </strong>
            </span>
          </div>
          <RentRequestButton
            disabled={selectedCartIds.length === 0}
            onClick={onRentNow}
          />
        </div>
      )}
    </div>
  );
}
