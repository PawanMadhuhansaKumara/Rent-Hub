import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Plus,
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
} from "lucide-react";
import CartItemCard from "../CartItemCard";
import RentRequestButton from "../RentRequestButton";

/**
 * RentCartTab
 * Renders the user's rental cart with multi-cart management, tab switching,
 * inline cart creation, and item checkout actions.
 */
export default function RentCartTab({
  cartItems = [],
  loadingCart = false,
  errorCart = "",
  selectedCartIds = [],
  totalSelectedPrice = 0,
  onToggleSelect,
  onSelectAll,
  onRemoveFromCart,
  onRentNow,
  isSubmittingRent = false,
  onRetry,
  searchTerm = "",
  cartsList = ["Default"],
  activeCartName = "Default",
  onSelectCart,
  onCreateCart,
  onRenameCart,
  onDeleteCart,
  onMoveCartItem,
}) {
  const { t } = useTranslation();

  // Inline / Modal state for creating a new named cart
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCartInput, setNewCartInput] = useState("");
  const [createError, setCreateError] = useState("");

  // State for renaming a cart
  const [renamingCart, setRenamingCart] = useState(null);
  const [renameInput, setRenameInput] = useState("");

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

  // Filter items that belong to the currently active cart
  const activeCartItems = cartItems.filter(
    (ci) => ((ci.cartName || "").trim() || "Default") === activeCartName
  );

  const selectableCartItems = activeCartItems.filter(
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

  // Handle creating a new cart
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const trimmed = newCartInput.trim();
    if (!trimmed) {
      setCreateError("Please enter a cart name.");
      return;
    }
    if (
      cartsList.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setCreateError("A cart with this name already exists.");
      return;
    }

    setCreateError("");
    onCreateCart && onCreateCart(trimmed);
    setNewCartInput("");
    setShowCreateModal(false);
  };

  // Handle renaming a cart
  const handleRenameSubmit = (e) => {
    e.preventDefault();
    const trimmed = renameInput.trim();
    if (!trimmed || !renamingCart) return;
    if (
      trimmed.toLowerCase() !== renamingCart.toLowerCase() &&
      cartsList.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      alert("A cart with this name already exists.");
      return;
    }
    onRenameCart && onRenameCart(renamingCart, trimmed);
    setRenamingCart(null);
    setRenameInput("");
  };

  // Handle deleting active custom cart
  const handleDeleteActiveCart = () => {
    if (activeCartName === "Default") return;
    const confirmMsg = t(
      "rentsPage.confirmDeleteCart",
      `Are you sure you want to delete "${activeCartName}"?\nAny items in this cart will be moved to your Default Cart.`
    );
    if (window.confirm(confirmMsg)) {
      onDeleteCart && onDeleteCart(activeCartName);
    }
  };

  return (
    <div className="rent-cart-items">
      {/* 1. Multi-Cart Header & Switcher Row */}
      <div className="rent-cart-switcher-section">
        <div className="rent-cart-switcher-header">
          <div className="rent-cart-switcher-title-wrap">
            <h3 className="rent-cart-switcher-title">
              {t("rentsPage.yourCarts", "Your Rental Carts")}
            </h3>
            <span className="rent-cart-switcher-count">
              {cartsList.length} {cartsList.length === 1 ? "Cart" : "Carts"}
            </span>
          </div>

          <button
            type="button"
            className="rent-cart-add-btn"
            onClick={() => {
              setShowCreateModal(true);
              setCreateError("");
              setNewCartInput("");
            }}
            title="Create a new custom cart"
          >
            <Plus size={15} />
            <span>{t("rentsPage.newCart", "New Cart")}</span>
          </button>
        </div>

        {/* Carts Horizontal Scrollable Pills */}
        <div className="rent-cart-pills-row">
          {cartsList.map((cName) => {
            const isDefault = cName === "Default";
            const isActive = cName === activeCartName;
            const itemsInThisCart = cartItems.filter(
              (ci) => ((ci.cartName || "").trim() || "Default") === cName
            );

            return (
              <div
                key={cName}
                className={`rent-cart-pill ${isActive ? "active" : ""}`}
                onClick={() => onSelectCart && onSelectCart(cName)}
                title={isDefault ? "Default Cart (Main)" : `Cart: ${cName}`}
              >
                {isDefault ? (
                  <ShoppingCart size={14} className="pill-icon" />
                ) : (
                  <Folder size={14} className="pill-icon" />
                )}

                <span className="pill-name">
                  {isDefault ? t("rentsPage.defaultCart", "Default Cart") : cName}
                </span>

                <span className={`pill-badge ${itemsInThisCart.length > 0 ? "has-items" : ""}`}>
                  {itemsInThisCart.length}
                </span>

                {/* Edit / Delete quick buttons for active custom cart */}
                {isActive && !isDefault && (
                  <div
                    className="pill-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="pill-action-btn"
                      onClick={() => {
                        setRenamingCart(cName);
                        setRenameInput(cName);
                      }}
                      title="Rename this cart"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      className="pill-action-btn pill-delete-btn"
                      onClick={handleDeleteActiveCart}
                      title="Delete this cart (items move to Default Cart)"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Rename Cart Inline Bar (if editing active cart) */}
      {renamingCart && (
        <form onSubmit={handleRenameSubmit} className="rent-cart-inline-rename-form">
          <span className="rename-label">Rename "{renamingCart}":</span>
          <input
            type="text"
            className="rename-input"
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
            placeholder="Enter new cart name..."
            autoFocus
          />
          <button type="submit" className="rename-save-btn" title="Save name">
            <Check size={14} /> Save
          </button>
          <button
            type="button"
            className="rename-cancel-btn"
            onClick={() => setRenamingCart(null)}
            title="Cancel"
          >
            <X size={14} />
          </button>
        </form>
      )}

      {/* 3. Create New Cart Modal / Overlay */}
      {showCreateModal && (
        <div className="rent-cart-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div
            className="rent-cart-create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="create-modal-header">
              <div className="create-modal-title">
                <FolderPlus size={18} color="var(--primary)" />
                <h4>{t("rentsPage.createCartTitle", "Create a New Cart")}</h4>
              </div>
              <button
                type="button"
                className="create-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="create-modal-desc">
              {t(
                "rentsPage.createCartDesc",
                "Give your cart a unique name (e.g. Wedding Shoot, Weekend Trip, Studio Rig) to organize items separately."
              )}
            </p>

            <form onSubmit={handleCreateSubmit}>
              <div className="create-modal-input-wrap">
                <label>{t("rentsPage.cartNameLabel", "Cart Name")}</label>
                <input
                  type="text"
                  className="create-cart-input"
                  placeholder="e.g. Wedding Shoot, Video Project, Ella Trip"
                  value={newCartInput}
                  onChange={(e) => {
                    setNewCartInput(e.target.value);
                    if (createError) setCreateError("");
                  }}
                  autoFocus
                  maxLength={50}
                />
                {createError && <span className="create-cart-error">{createError}</span>}
              </div>

              <div className="create-modal-actions">
                <button
                  type="button"
                  className="create-modal-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button type="submit" className="create-modal-submit">
                  <Check size={16} />
                  <span>{t("rentsPage.createCartBtn", "Create Cart")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Active Cart Content */}
      {activeCartItems.length === 0 ? (
        <div className="my-items-empty rent-cart-custom-empty">
          <div className="my-items-empty-icon" style={{ background: "var(--badge-blue-bg)" }}>
            <ShoppingCart size={44} color="var(--badge-blue-text)" />
          </div>
          <h3>
            {searchTerm
              ? t("rentsPage.noCartFound", "No matching cart items found")
              : activeCartName === "Default"
              ? t("rentsPage.cartEmptyTitle", "Your Default Cart is empty")
              : `"${activeCartName}" Cart is empty`}
          </h3>
          <p>
            {searchTerm
              ? t(
                  "rentsPage.noSearchCartDesc",
                  `We couldn't find any items in "${activeCartName}" matching "${searchTerm}".`
                )
              : activeCartName === "Default"
              ? t(
                  "rentsPage.cartEmptyDesc",
                  "Browse items and add them to your rent cart to request rentals."
                )
              : `You haven't added any items to "${activeCartName}" yet. Browse items or move items from other carts here!`}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "12px" }}>
            <Link to="/" className="my-items-empty-add-btn">
              {t("rentsPage.browseItemsBtn", "Browse Items")}
            </Link>
            {activeCartName !== "Default" && (
              <button
                type="button"
                className="my-items-retry-btn"
                onClick={() => onSelectCart && onSelectCart("Default")}
                style={{ padding: "10px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "13px" }}
              >
                {t("rentsPage.goToDefaultCart", "Go to Default Cart")}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Toolbar for Selection within Active Cart */}
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
                disabled={selectedCartIds.length === 0 || isSubmittingRent}
                onClick={onRentNow}
              />
            </div>
          </div>

          {/* List of items in active cart */}
          {activeCartItems.map((ci) => (
            <CartItemCard
              key={ci.id}
              cartItem={ci}
              isSelected={selectedCartIds.includes(ci.id)}
              onToggleSelect={onToggleSelect}
              onRemove={onRemoveFromCart}
              availableCarts={cartsList}
              onMoveCartItem={onMoveCartItem}
            />
          ))}

          {/* Bottom Bar for active cart */}
          {activeCartItems.length > 1 && (
            <div className="rent-cart-bottom-bar">
              <div className="rent-cart-bottom-summary">
                <span>
                  {t("rentsPage.selectedCount", "Selected")}: <strong>{selectedCartIds.length}</strong> / {activeCartItems.length}
                </span>
                <span>
                  {t("rentsPage.totalAmountLabel", "Total Amount")}:{" "}
                  <strong className="summary-price">
                    LKR {totalSelectedPrice.toLocaleString()}
                  </strong>
                </span>
              </div>
              <RentRequestButton
                disabled={selectedCartIds.length === 0 || isSubmittingRent}
                onClick={onRentNow}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
