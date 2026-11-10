
import React from "react";
import { ShoppingCart } from "lucide-react";
import "./components.css";

function AddToRentCartButton({
  available,
  isAdded = false,
  loading = false,
  onClick,
}) {
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

  return (
    <button
      type="button"
      className={`add-to-rent-cart-button ${isAdded ? "added" : ""}`}
      onClick={onClick}
      disabled={isRentedOut || loading}
    >
      {isAdded ? (
        <>
          <ShoppingCart size={18} />
          <span>View Cart</span>
        </>
      ) : (
        <>
          <ShoppingCart size={18} />
          <span>
            {loading
              ? "Adding..."
              : isRentedOut
              ? "Rented Out"
              : "Add to Rent Cart"}
          </span>
        </>
      )}
    </button>
  );
}

export default AddToRentCartButton;
