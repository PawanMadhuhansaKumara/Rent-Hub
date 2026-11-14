import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Camera,
  Check,
  Loader2,
  Package,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const API_URL = "http://localhost:5001";

const CATEGORIES = [
  "Tools",
  "Electronics",
  "Vehicles",
  "Party & Events",
  "Sports",
  "Camping",
  "Clothing",
  "Home Appliances",
  "Books",
  "Other",
];

const CONDITIONS = ["Brand New", "Like New", "Good", "Fair"];

export default function EditItemModal({ isOpen, onClose, item, onItemUpdated }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "Tools",
    condition: "Good",
    price: "",
    priceType: "day",
    available_quantity: "1",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (item && isOpen) {
      setForm({
        title: item.title || "",
        category: item.category || "Tools",
        condition: item.condition || "Good",
        price: item.price ? String(item.price) : "",
        priceType: item.priceType || item.price_type || "day",
        available_quantity: String(
          item.available_quantity !== undefined && item.available_quantity !== null
            ? item.available_quantity
            : "1"
        ),
        description: item.description || "",
      });

      const currentImg = item.image || item.image_url;
      if (currentImg) {
        setImagePreview(
          currentImg.startsWith("http")
            ? currentImg
            : `${API_URL}${currentImg.startsWith("/") ? "" : "/"}${currentImg}`
        );
      } else {
        setImagePreview("");
      }
      setImageFile(null);
      setErrorMessage("");
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.title.trim()) {
      setErrorMessage(t("itemEdit.titleRequired"));
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setErrorMessage(t("itemEdit.priceRequired"));
      return;
    }

    if (!form.available_quantity || Number(form.available_quantity) < 1) {
      setErrorMessage(t("itemEdit.qtyRequired"));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("category", form.category);
      formData.append("condition", form.condition);
      formData.append("price", Number(form.price));
      formData.append("priceType", form.priceType);
      formData.append("available_quantity", Number(form.available_quantity));
      formData.append("description", form.description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_URL}/api/items/${item.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || t("itemEdit.updateFailed"));
      }

      if (onItemUpdated) {
        onItemUpdated(data.item);
      }

      window.dispatchEvent(new Event("items_updated"));
      window.dispatchEvent(new Event("rent_requests_updated"));

      alert(t("itemEdit.updateSuccess"));
      onClose();
    } catch (err) {
      console.error("Update item error:", err);
      setErrorMessage(err.message || t("itemEdit.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "650px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.28)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "94vh",
          animation: "modalFadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #f8fafc, #ffffff)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "clamp(16px, 2.5vw, 18px)",
                fontWeight: 700,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Sparkles size={18} color="#00aa5b" />
              {t("itemEdit.editItemListing")}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                color: "#64748b",
                marginTop: "2px",
              }}
            >
              {t("itemEdit.editItemDesc")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#475569",
              flexShrink: 0,
              marginLeft: "8px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "16px 20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {errorMessage && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Image Upload Area (Responsive wrap) */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              {t("itemEdit.itemPhoto")}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "10px 14px",
                border: "1px dashed #cbd5e1",
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Item Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Package size={28} color="#94a3b8" />
                )}
              </div>

              <div style={{ flex: "1 1 180px" }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#0f172a",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Camera size={14} color="#00aa5b" />
                  {imageFile
                    ? t("itemEdit.changeSelectedImage")
                    : t("itemEdit.uploadNewImage")}
                </button>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    margin: "5px 0 0 0",
                  }}
                >
                  {t("itemEdit.photoHint")}
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              {t("itemEdit.itemTitle")}
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={t("itemEdit.titlePlaceholder")}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category & Condition (Auto-fit grid) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                {t("itemEdit.category")}
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  backgroundColor: "#ffffff",
                  boxSizing: "border-box",
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                {t("itemEdit.condition")}
              </label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  backgroundColor: "#ffffff",
                  boxSizing: "border-box",
                }}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing, Period & Quantity (Responsive grid) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "10px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                {t("itemEdit.rentalPrice")}
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="1"
                step="any"
                placeholder="2500"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                {t("itemEdit.pricePer")}
              </label>
              <select
                name="priceType"
                value={form.priceType}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  backgroundColor: "#ffffff",
                  boxSizing: "border-box",
                }}
              >
                <option value="day">{t("itemEdit.perDay")}</option>
                <option value="week">{t("itemEdit.perWeek")}</option>
                <option value="month">{t("itemEdit.perMonth")}</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                {t("itemEdit.stockQuantity")}
              </label>
              <input
                type="number"
                name="available_quantity"
                value={form.available_quantity}
                onChange={handleChange}
                min="1"
                step="1"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              {t("itemEdit.description")}
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder={t("itemEdit.descPlaceholder")}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Footer Submit Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "4px",
              paddingTop: "14px",
              borderTop: "1px solid #e2e8f0",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              {t("map.cancel")}
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 22px",
                borderRadius: "8px",
                border: "none",
                background: "#00aa5b",
                fontSize: "13px",
                fontWeight: 700,
                color: "#ffffff",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 5px rgba(0, 170, 91, 0.25)",
              }}
            >
              {loading ? (
                <Loader2 size={15} className="spin-animation" />
              ) : (
                <Check size={15} />
              )}
              {t("itemEdit.updateItem")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
