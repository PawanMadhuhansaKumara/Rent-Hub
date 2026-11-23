import React from "react";
import { Link } from "react-router-dom";
import { Package, Plus } from "lucide-react";
import InventoryItemCard from "./InventoryItemCard";

/**
 * InventoryItemsTab
 * Renders the user's listed inventory items.
 */
export default function InventoryItemsTab({
  items,
  loading,
  error,
  onStatusChange,
  onRetry,
  API_URL = "https://rent-hub-ashen.vercel.app",
}) {
  if (loading && (!items || items.length === 0)) {
    return (
      <div className="my-items-loader">
        <div className="my-items-spinner" />
        <p>Loading your items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-items-error">
        <p>{error}</p>
        <button onClick={onRetry} className="my-items-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="my-items-empty">
        <div className="my-items-empty-icon">
          <Package size={48} color="var(--primary)" />
        </div>
        <h3>No items listed yet</h3>
        <p>Start earning by listing your items for rent in the marketplace.</p>
        <Link to="/add-item" className="my-items-empty-add-btn">
          <Plus size={18} /> Add Your First Item
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-items-grid">
      {items.map((item) => (
        <InventoryItemCard
          key={item.id}
          item={item}
          onStatusChange={onStatusChange}
          API_URL={API_URL}
        />
      ))}
    </div>
  );
}
