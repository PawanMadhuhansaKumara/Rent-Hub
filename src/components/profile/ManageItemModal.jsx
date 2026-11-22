import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Package,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Tag,
  DollarSign,
  AlertCircle,
  Sparkles,
  Layers,
} from "lucide-react";

export default function ManageItemModal({
  isOpen,
  onClose,
  item,
  isItemRented,
  onItemUpdated,
  onToggleStatus,
  onDeleteItem,
  navigate,
  API_URL = "http://localhost:5001",
}) {
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tools");
  const [condition, setCondition] = useState("Good");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("day");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [currentIsRented, setCurrentIsRented] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Populate state when item opens
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setCategory(item.category || "Tools");
      setCondition(item.condition || "Good");
      setPrice(item.price !== undefined ? String(item.price) : "");
      setPriceType(item.priceType || item.price_type || "day");
      setQuantity(
        item.available_quantity !== undefined
          ? String(item.available_quantity)
          : "1"
      );
      setDescription(item.description || "");

      const rentedStatus = isItemRented ? isItemRented(item) : false;
      setCurrentIsRented(rentedStatus);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [item, isItemRented]);

  if (!isOpen || !item) return null;

  // Handle Quick Toggle Availability
  const handleQuickStatusToggle = async () => {
    const newStatus = !currentIsRented;
    setCurrentIsRented(newStatus);

    if (onToggleStatus) {
      onToggleStatus(item.id, currentIsRented);
    }

    try {
      await fetch(`${API_URL}/api/items/status/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          available: newStatus ? "Rented Out" : "Available",
        }),
      });
      window.dispatchEvent(new Event("items_updated"));
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  // Handle Save Item Details
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim()) {
      setErrorMsg("Item title is required.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMsg("Please enter a valid rental price.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          condition,
          price: Number(price),
          priceType,
          available_quantity: Number(quantity) || 1,
          available: currentIsRented ? "Rented Out" : "Available",
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Item details updated successfully!");

        const updatedItem = {
          ...item,
          title: title.trim(),
          category,
          condition,
          price: Number(price),
          priceType,
          price_type: priceType,
          available_quantity: Number(quantity) || 1,
          available: currentIsRented ? "Rented Out" : "Available",
          description: description.trim(),
        };

        if (onItemUpdated) {
          onItemUpdated(updatedItem);
        }

        window.dispatchEvent(new Event("items_updated"));

        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(data.message || "Failed to update item details.");
      }
    } catch (err) {
      console.error("Item update error:", err);
      setErrorMsg("Server error while updating item.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Item
  const handleDelete = () => {
    if (onDeleteItem) {
      onDeleteItem(item.id);
      onClose();
    }
  };

  const itemImg = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${API_URL}${item.image.startsWith("/") ? "" : "/"}${item.image}`
    : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-modal, var(--bg-card, #ffffff))",
          borderRadius: "22px",
          width: "100%",
          maxWidth: "500px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(22, 163, 74, 0.15)",
          overflow: "hidden",
          animation: "fadeIn 0.25s ease-out",
          border: "1px solid var(--border-light, #e2e8f0)",
          color: "var(--text-main, #0f172a)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* GREEN GRADIENT HEADER                                          */}
        {/* ============================================================== */}
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--primary, #00aa5b) 0%, var(--primary-hover, #008748) 100%)",
            padding: "18px 20px",
            color: "var(--text-inverse, #ffffff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={20} color="var(--text-inverse, #ffffff)" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#ffffff",
                }}
              >
                {t("manageItem.title", "Manage Item")}
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  opacity: 0.9,
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                {t(
                  "manageItem.subtitle",
                  "Edit details, toggle availability or delete"
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-inverse, #ffffff)",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.35)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)")
            }
            title={t("common.close", "Close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* ============================================================== */}
        {/* BODY (SCROLLABLE)                                              */}
        {/* ============================================================== */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* ITEM QUICK CARD & AVAILABILITY TOGGLE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "var(--bg-app-alt, #f8fafc)",
              border: "1px solid var(--border-light, #e2e8f0)",
              borderRadius: "14px",
              padding: "12px",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={itemImg}
                alt={item.title}
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  border: "1px solid var(--border-light, #e2e8f0)",
                  flexShrink: 0,
                }}
              />
              <div>
                <h4
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--text-main, #0f172a)",
                    maxWidth: "200px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </h4>
                <span
                  style={{
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: "var(--primary, #00aa5b)",
                  }}
                >
                  Rs. {item.price} / {item.priceType || "day"}
                </span>
              </div>
            </div>

            {/* Availability Toggle Switch */}
            <button
              type="button"
              onClick={handleQuickStatusToggle}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border: currentIsRented
                  ? "1px solid var(--badge-yellow-border, #fcd34d)"
                  : "1px solid var(--badge-green-bg, #bbf7d0)",
                backgroundColor: currentIsRented
                  ? "var(--badge-yellow-bg, #fef3c7)"
                  : "var(--badge-green-bg, #dcfce7)",
                color: currentIsRented
                  ? "var(--badge-yellow-text, #b45309)"
                  : "var(--primary-hover, #15803d)",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              title="Click to toggle Available vs Rented Out"
            >
              {currentIsRented ? (
                <>
                  <Clock size={14} />
                  <span>Rented Out</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Available</span>
                </>
              )}
            </button>
          </div>

          {/* ALERTS (Error / Success) */}
          {errorMsg && (
            <div
              style={{
                background: "var(--badge-red-bg, #fef2f2)",
                border: "1px solid var(--badge-red-border, #fecaca)",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--badge-red-text, #b91c1c)",
                fontSize: "12.5px",
                fontWeight: "600",
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: "var(--badge-green-bg, #f0fdf4)",
                border: "1px solid var(--badge-green-bg, #bbf7d0)",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--primary, #15803d)",
                fontSize: "12.5px",
                fontWeight: "600",
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* EDIT FORM */}
          <form
            onSubmit={handleSave}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {/* Title */}
            <div>
              <label style={styles.fieldLabel}>Item Title</label>
              <input
                type="text"
                style={styles.prettyInput}
                placeholder="e.g. Tent 4-Person Waterproof"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category & Condition Row */}
            <div style={styles.twoColumnRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Category</label>
                <select
                  style={styles.prettySelect}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Tools">Tools</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Cameras">Cameras</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Sports">Sports</option>
                  <option value="Camping">Camping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Condition</label>
                <select
                  style={styles.prettySelect}
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            {/* Price & Period Row */}
            <div style={styles.twoColumnRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Price (LKR)</label>
                <input
                  type="number"
                  step="any"
                  style={styles.prettyInput}
                  placeholder="500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Rental Period</label>
                <select
                  style={styles.prettySelect}
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                >
                  <option value="day">Per Day</option>
                  <option value="hour">Per Hour</option>
                  <option value="week">Per Week</option>
                  <option value="month">Per Month</option>
                </select>
              </div>
            </div>

            {/* Quantity / Stock */}
            <div>
              <label style={styles.fieldLabel}>Available Quantity (Stock)</label>
              <input
                type="number"
                min="0"
                style={styles.prettyInput}
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label style={styles.fieldLabel}>Description</label>
              <textarea
                style={styles.prettyTextarea}
                placeholder="Describe your item, accessories, deposit rules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* SAVE BUTTON */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: "12px",
                backgroundColor: "var(--primary, #00aa5b)",
                color: "var(--text-inverse, #ffffff)",
                border: "none",
                fontSize: "14px",
                fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(0, 170, 91, 0.25)",
                transition: "all 0.2s ease",
                marginTop: "4px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
            >
              <CheckCircle2 size={17} />
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </form>

          {/* BOTTOM SECONDARY ACTIONS: View Page & Delete */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-light, #e2e8f0)",
            }}
          >
            {/* View item public page */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (navigate) navigate(`/item/${item.id}`);
              }}
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--border-light, #cbd5e1)",
                color: "var(--text-secondary, #475569)",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "12.5px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary, #00aa5b)";
                e.currentTarget.style.color = "var(--primary, #00aa5b)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-light, #cbd5e1)";
                e.currentTarget.style.color = "var(--text-secondary, #475569)";
              }}
            >
              <ExternalLink size={14} />
              <span>View Public Page</span>
            </button>

            {/* Delete Item */}
            <button
              type="button"
              onClick={handleDelete}
              style={{
                backgroundColor: "var(--badge-red-bg, #fef2f2)",
                border: "1px solid var(--badge-red-border, #fecaca)",
                color: "var(--badge-red-text, #b91c1c)",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "12.5px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(0.95)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
            >
              <Trash2 size={14} />
              <span>Delete Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  twoColumnRow: {
    display: "flex",
    gap: "10px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-secondary, #475569)",
    marginBottom: "5px",
  },
  prettyInput: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid var(--border-light, #cbd5e1)",
    fontSize: "13.5px",
    backgroundColor: "var(--bg-card, #ffffff)",
    color: "var(--text-main, #0f172a)",
    outline: "none",
    boxSizing: "border-box",
  },
  prettySelect: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid var(--border-light, #cbd5e1)",
    fontSize: "13.5px",
    backgroundColor: "var(--bg-card, #ffffff)",
    color: "var(--text-main, #0f172a)",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  prettyTextarea: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid var(--border-light, #cbd5e1)",
    fontSize: "13.5px",
    backgroundColor: "var(--bg-card, #ffffff)",
    color: "var(--text-main, #0f172a)",
    outline: "none",
    minHeight: "70px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical",
  },
};
