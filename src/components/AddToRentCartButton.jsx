import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, ChevronDown, Check, Plus, X, Folder } from "lucide-react";
import "./components.css";

function AddToRentCartButton({
  available,
  isAdded = false,
  loading = false,
  disabled = false,
  onClick,
  carts = ["Default"],
  selectedCart = "Default",
  onSelectCart,
  onCreateCart,
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCartName, setNewCartName] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const isRentedOut =
    available === "Rented Out" ||
    String(available).toLowerCase() === "rented out" ||
    String(available).toLowerCase() === "rented" ||
    available === 0 ||
    available === "0" ||
    (available !== undefined &&
      available !== null &&
      available !== "" &&
      !isNaN(Number(available)) &&
      Number(available) < 1);

  const isDisabled = isRentedOut || loading || disabled;

  // Close dropdown on outside click or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewCartName("");
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsCreating(false);
        setNewCartName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleArrowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleCartSelect = (cartName) => {
    if (onSelectCart) {
      onSelectCart(cartName);
    }
    setIsOpen(false);
    setIsCreating(false);
    setNewCartName("");
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const trimmed = (newCartName || "").trim();
    if (!trimmed) return;
    if (onCreateCart) {
      onCreateCart(trimmed);
    } else if (onSelectCart) {
      onSelectCart(trimmed);
    }
    setIsCreating(false);
    setNewCartName("");
    setIsOpen(false);
  };

  // Ensure 'Default' and selectedCart are included in the display list
  const allCarts = Array.from(
    new Set(["Default", ...(carts || []), selectedCart].filter(Boolean))
  );

  return (
    <div
      className={`add-to-rent-cart-split ${isAdded ? "is-added" : ""} ${
        isDisabled ? "is-disabled" : ""
      }`}
      ref={dropdownRef}
    >
      {/* Normal Main Cart Button: adds to currently selected cart */}
      <button
        type="button"
        className={`add-to-rent-cart-main ${isAdded ? "added" : ""}`}
        onClick={onClick}
        disabled={isDisabled}
        title={
          isAdded
            ? t("rentsPage.tabs.cart", "View Cart")
            : t("item.addToRentCart", "Add to Rent Cart")
        }
      >
        <ShoppingCart size={18} className="cart-btn-icon" />
        <span className="cart-btn-text">
          {isAdded
            ? t("rentsPage.tabs.cart", "View Cart")
            : loading
            ? "Adding..."
            : disabled
            ? "Limit Exceeded"
            : isRentedOut
            ? t("rentsPage.status.rented", "Rented Out")
            : t("item.addToRentCart", "Add to Rent Cart")}
        </span>
      </button>

      {/* Subtle Divider */}
      <span className="add-to-rent-cart-divider" />

      {/* Right side Dropdown Arrow Button: selects destination cart */}
      <button
        type="button"
        className={`add-to-rent-cart-arrow-btn ${isOpen ? "open" : ""}`}
        onClick={handleArrowClick}
        disabled={isDisabled}
        title="Select Rent Cart"
        aria-label="Select Rent Cart"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <ChevronDown
          size={17}
          className={`arrow-chevron ${isOpen ? "rotate" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="cart-select-dropdown" role="menu">
          <div className="cart-select-dropdown-header">
            <Folder size={13} className="header-icon" />
            <span>{t("rentsPage.selectCart", "Select Rent Cart")}</span>
          </div>

          <div className="cart-select-dropdown-list">
            {allCarts.map((cName) => {
              const isCurrent = cName === (selectedCart || "Default");
              return (
                <button
                  key={cName}
                  type="button"
                  role="menuitem"
                  className={`cart-select-dropdown-item ${
                    isCurrent ? "active" : ""
                  }`}
                  onClick={() => handleCartSelect(cName)}
                >
                  <span className="cart-name-text">{cName}</span>
                  {isCurrent && <Check size={14} className="cart-check-icon" />}
                </button>
              );
            })}
          </div>

          <div className="cart-select-dropdown-footer">
            {!isCreating ? (
              <button
                type="button"
                className="cart-create-trigger-btn"
                onClick={() => {
                  setIsCreating(true);
                  setTimeout(() => inputRef.current?.focus(), 60);
                }}
              >
                <Plus size={14} />
                <span>{t("rentsPage.newCart", "New Cart")}</span>
              </button>
            ) : (
              <form
                onSubmit={handleCreateSubmit}
                className="cart-create-inline-form"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cart name..."
                  value={newCartName}
                  onChange={(e) => setNewCartName(e.target.value)}
                  className="cart-create-inline-input"
                  maxLength={30}
                />
                <div className="cart-create-inline-actions">
                  <button
                    type="submit"
                    className="cart-create-inline-btn confirm"
                    disabled={!newCartName.trim()}
                    title="Add Cart"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    className="cart-create-inline-btn cancel"
                    onClick={() => {
                      setIsCreating(false);
                      setNewCartName("");
                    }}
                    title="Cancel"
                  >
                    <X size={13} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AddToRentCartButton;
