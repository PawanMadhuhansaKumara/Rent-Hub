import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./components.css";

export default function CartIcon({ count = 0 }) {
  const navigate = useNavigate();

  return (
    <div className="cart-icon-container">
    <button
      className="cart-icon-button"
      onClick={() => navigate("/MyItems?tab=rent-cart")}
      aria-label="Shopping cart"
    >
        <ShoppingCart size={21} color="var(--text-inverse)" />

      {count > 0 && <span className="cart-count">{count}</span>}
    </button>
    </div>
  );
}
