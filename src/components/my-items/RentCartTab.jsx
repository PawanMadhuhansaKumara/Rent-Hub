import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
        <div className="my-items-empty-icon" style={{ background: "var(--badge-blue-bg)" }}>
          <ShoppingCart size={48} color="var(--badge-blue-text)" />
        </div>
        <h3>{t("rentsPage.cartEmptyTitle", "Your Rent Cart is empty")}</h3>
        <p>{t("rentsPage.cartEmptyDesc", "Browse items and add them to your rent cart to request rentals.")}</p>
        <Link to="/" className="my-items-empty-add-btn">
          {t("rentsPage.browseItemsBtn", "Browse Items")}
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
          <span>
            {t("rentsPage.selectAll", {
              count: selectableCartItems.length,
              defaultValue: `Select All (${selectableCartItems.length} available)`,
            })}
          </span>
        </label>

        <div className="rent-cart-toolbar-actions">
          {selectedCartIds.length > 0 && (
            <div className="rent-cart-selected-summary">
              <span className="selected-count">
                {t("rentsPage.selectedCount", "Selected")}: <strong>{selectedCartIds.length}</strong>
              </span>
              <span className="selected-total">
                {t("rentsPage.selectedTotal", "Total")}: <strong>LKR {totalSelectedPrice.toLocaleString()}</strong>
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
              {t("rentsPage.selectedCount", "Selected")}: <strong>{selectedCartIds.length}</strong> / {cartItems.length}
            </span>
            <span>
              {t("rentsPage.totalAmountLabel", "Total Amount")}:{" "}
              <strong className="summary-price">
                LKR {totalSelectedPrice.toLocaleString()}
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
