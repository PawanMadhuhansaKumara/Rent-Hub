
import React from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import "./components.css";

function AddToRentCartButton({
  available,
  isAdded = false,
  loading = false,
  disabled = false,
  onClick,
}) {
  const { t } = useTranslation();
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

  return (
    <button
      type="button"
      className={`add-to-rent-cart-button ${isAdded ? "added" : ""}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {isAdded ? (
        <>
          <ShoppingCart size={18} />
          <span>{t("rentsPage.tabs.cart", "View Cart")}</span>
        </>
      ) : (
        <>
          <ShoppingCart size={18} />
          <span>
            {loading
              ? "Adding..."
              : disabled
              ? "Limit Exceeded"
              : isRentedOut
              ? t("rentsPage.status.rented", "Rented Out")
              : t("item.addToRentCart", "Add to Rent Cart")}
          </span>
        </>
      )}
    </button>
  );
}

export default AddToRentCartButton;
