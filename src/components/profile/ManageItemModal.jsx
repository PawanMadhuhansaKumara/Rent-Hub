import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Package,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  AlertCircle,
  Camera,
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
  API_URL = "https://rent-hub-ashen.vercel.app",
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tools");
  const [condition, setCondition] = useState("Good");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("day");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [currentIsRented, setCurrentIsRented] = useState(false);

  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

      setImageFile(null);
      setImagePreview(null);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [item, isItemRented]);

  if (!isOpen || !item) return null;

  // Handle Image File Selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

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

  // Handle Save Item Details (including Image via FormData)
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
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("condition", condition);
      formData.append("price", Number(price));
      formData.append("priceType", priceType);
      formData.append("available_quantity", Number(quantity) || 1);
      formData.append("available", currentIsRented ? "Rented Out" : "Available");
      formData.append("description", description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_URL}/api/items/${item.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Item details and photo updated successfully!");

        const updatedImageUrl =
          data.item?.image ||
          data.item?.image_url ||
          (imagePreview || item.image);

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
          image: updatedImageUrl,
          image_url: updatedImageUrl,
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
    <div className="manage-modal-overlay" onClick={onClose}>
      {/* Responsive Inline CSS Styles */}
      <style>{`
        .manage-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          box-sizing: border-box;
        }

        .manage-modal-box {
          background: var(--bg-modal, var(--bg-card, #ffffff));
          border-radius: 22px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(22, 163, 74, 0.15);
          overflow: hidden;
          animation: fadeIn 0.25s ease-out;
          border: 1px solid var(--border-light, #e2e8f0);
          color: var(--text-main, #0f172a);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          box-sizing: border-box;
        }

        .manage-modal-header {
          background: linear-gradient(135deg, var(--primary, #00aa5b) 0%, var(--primary-hover, #008748) 100%);
          padding: 16px 20px;
          color: var(--text-inverse, #ffffff);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .manage-modal-body {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-sizing: border-box;
        }

        .manage-quick-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--bg-app-alt, #f8fafc);
          border: 1px solid var(--border-light, #e2e8f0);
          border-radius: 14px;
          padding: 12px;
          gap: 12px;
          box-sizing: border-box;
        }

        .manage-quick-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .manage-two-col {
          display: flex;
          gap: 10px;
        }

        .manage-two-col > div {
          flex: 1;
          min-width: 0;
        }

        .manage-avail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .manage-bottom-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid var(--border-light, #e2e8f0);
          box-sizing: border-box;
        }

        /* MOBILE RESPONSIVE OPTIMIZATIONS (screens <= 480px) */
        @media (max-width: 480px) {
          .manage-modal-overlay {
            padding: 8px !important;
            align-items: flex-end !important;
          }

          .manage-modal-box {
            max-height: 94vh !important;
            max-height: calc(100dvh - 16px) !important;
            border-radius: 20px 20px 14px 14px !important;
          }

          .manage-modal-header {
            padding: 14px 16px !important;
          }

          .manage-modal-body {
            padding: 14px !important;
            gap: 14px !important;
          }

          .manage-quick-card {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 10px !important;
          }

          .manage-quick-card button {
            width: 100% !important;
            justify-content: center !important;
          }

          .manage-two-col {
            flex-direction: column !important;
            gap: 12px !important;
          }

          .manage-avail-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .manage-bottom-actions {
            flex-direction: column-reverse !important;
            gap: 8px !important;
          }

          .manage-bottom-actions button {
            width: 100% !important;
            justify-content: center !important;
            padding: 10px 14px !important;
          }
        }
      `}</style>

      <div className="manage-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Hidden File Input for Changing Photo */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageChange}
        />

        {/* ============================================================== */}
        {/* GREEN GRADIENT HEADER                                          */}
        {/* ============================================================== */}
        <div className="manage-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Package size={20} color="var(--text-inverse, #ffffff)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t("manageItem.title", "Manage Item")}
              </h3>
              <span
                style={{
                  fontSize: "11.5px",
                  opacity: 0.9,
                  color: "rgba(255, 255, 255, 0.9)",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t(
                  "manageItem.subtitle",
                  "Edit details, photo, availability or delete"
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
              flexShrink: 0,
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
        {/* BODY (SCROLLABLE & FULLY RESPONSIVE)                           */}
        {/* ============================================================== */}
        <div className="manage-modal-body">
          {/* ITEM QUICK CARD WITH PHOTO CHANGER & AVAILABILITY TOGGLE */}
          <div className="manage-quick-card">
            <div className="manage-quick-info">
              {/* Photo Box with Camera Overlay */}
              <div
                style={{
                  position: "relative",
                  width: "56px",
                  height: "56px",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to change item photo"
              >
                <img
                  src={imagePreview || itemImg}
                  alt={item.title}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    border: imagePreview
                      ? "2px solid var(--primary, #00aa5b)"
                      : "1px solid var(--border-light, #e2e8f0)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    backgroundColor: "var(--primary, #00aa5b)",
                    color: "#ffffff",
                    border: "2px solid #ffffff",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                    transition: "transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Camera size={11} color="#ffffff" />
                </div>
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <h4
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--text-main, #0f172a)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </h4>
                <div
                  style={{
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: "var(--primary, #00aa5b)",
                    marginBottom: "4px",
                  }}
                >
                  Rs. {item.price} / {item.priceType || "day"}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: imageFile ? "var(--primary, #00aa5b)" : "var(--text-secondary, #475569)",
                    background: imageFile ? "var(--badge-green-bg, #dcfce7)" : "var(--bg-card-hover, #e2e8f0)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Camera size={11} />
                  <span>{imageFile ? "✓ Photo Selected" : "Change Photo"}</span>
                </button>
              </div>
            </div>

            {/* Availability Toggle Switch */}
            <button
              type="button"
              onClick={handleQuickStatusToggle}
              style={{
                padding: "7px 14px",
                borderRadius: "20px",
                border: currentIsRented
                  ? "1px solid rgba(245, 158, 11, 0.4)"
                  : "1px solid rgba(34, 197, 94, 0.4)",
                backgroundColor: currentIsRented
                  ? "#fffbeb"
                  : "#f0fdf4",
                color: currentIsRented
                  ? "#b45309"
                  : "#15803d",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: currentIsRented
                  ? "0 2px 8px rgba(245, 158, 11, 0.15)"
                  : "0 2px 8px rgba(22, 163, 74, 0.15)",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              title="Click to toggle Available vs Rented Out"
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: currentIsRented ? "#f59e0b" : "#16a34a",
                  boxShadow: currentIsRented
                    ? "0 0 0 2px rgba(245, 158, 11, 0.25)"
                    : "0 0 0 2px rgba(22, 163, 74, 0.25)",
                  display: "inline-block",
                }}
              />
              <span>{currentIsRented ? "Rented Out" : "Available"}</span>
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
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
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
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
            <div className="manage-two-col">
              <div>
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

              <div>
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
            <div className="manage-two-col">
              <div>
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

              <div>
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

            {/* Availability Status Selector */}
            <div>
              <label style={styles.fieldLabel}>Availability Status</label>
              <div className="manage-avail-grid">
                <button
                  type="button"
                  onClick={() => setCurrentIsRented(false)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: !currentIsRented
                      ? "2px solid #16a34a"
                      : "1px solid var(--border-light, #e2e8f0)",
                    backgroundColor: !currentIsRented
                      ? "rgba(240, 253, 244, 0.95)"
                      : "var(--bg-app-alt, #f8fafc)",
                    color: !currentIsRented
                      ? "#15803d"
                      : "var(--text-secondary, #64748b)",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                    boxShadow: !currentIsRented
                      ? "0 2px 8px rgba(22, 163, 74, 0.15)"
                      : "none",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#16a34a",
                      boxShadow: "0 0 0 2px rgba(22, 163, 74, 0.25)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span>Available (In Stock)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIsRented(true)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: currentIsRented
                      ? "2px solid #f59e0b"
                      : "1px solid var(--border-light, #e2e8f0)",
                    backgroundColor: currentIsRented
                      ? "rgba(254, 243, 199, 0.95)"
                      : "var(--bg-app-alt, #f8fafc)",
                    color: currentIsRented
                      ? "#b45309"
                      : "var(--text-secondary, #64748b)",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                    boxShadow: currentIsRented
                      ? "0 2px 8px rgba(245, 158, 11, 0.15)"
                      : "none",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#f59e0b",
                      boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.25)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span>Rented Out (Reserved)</span>
                </button>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                padding: "13px 20px",
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
          <div className="manage-bottom-actions">
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
                padding: "9px 14px",
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
                padding: "9px 14px",
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
