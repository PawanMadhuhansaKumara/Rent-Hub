
import React from "react";
import { ShoppingCart } from "lucide-react";
import "./components.css";

function AddToRentCartButton({
  available,
  isAdded = false,
  loading = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`add-to-rent-cart-button ${isAdded ? "added" : ""}`}
      onClick={onClick}
      disabled={available < 1 || loading}
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
              : available < 1
              ? "Not Available"
              : "Add to Rent Cart"}
          </span>
        </>
      )}
    </button>
  );
}

export default AddToRentCartButton;
