import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AddItem.css";

const initialForm = {
  title: "",
  category: "Tools",
  condition: "Good",
  price: "",
  priceType: "day",
  available_quantity: "1",
  description: "",
};

export default function AddItem({ onItemAdded }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setMessage("");
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!form.title.trim() || !form.category || !form.price.trim() || !form.available_quantity) {
      setMessage("Please complete all required fields.");
      setIsError(true);
      return;
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      setMessage("Please enter a valid price greater than zero.");
      setIsError(true);
      return;
    }

    if (!Number.isInteger(Number(form.available_quantity)) || Number(form.available_quantity) < 1) {
      setMessage("Please enter a valid available quantity (at least 1).");
      setIsError(true);
      return;
    }

    if (!imageFile) {
      setMessage("Please select an item image to upload.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = loggedUser.user_id || loggedUser.id || localStorage.getItem("userId") || 1;

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("user_id", userId);
      formData.append("title", form.title.trim());
      formData.append("category", form.category);
      formData.append("condition", form.condition);
      formData.append("price", Number(form.price));
      formData.append("priceType", form.priceType);
      formData.append("available_quantity", Number(form.available_quantity));
      formData.append("available", "Available");
      formData.append("description", form.description.trim());
      formData.append("image", imageFile);

      const response = await fetch("http://localhost:5001/api/items", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Could not add item.");
      }

      setMessage("Your item has been published successfully!");
      setIsError(false);
      setForm({ ...initialForm });
      setImageFile(null);
      setImagePreview("");

      if (onItemAdded) {
        onItemAdded();
      }

      setTimeout(() => {
        navigate("/profile");
      }, 1000);

    } catch (error) {
      console.error("Add Item Error:", error);
      setMessage(error.message || "Could not connect to the backend.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="add-item-page">
      <div className="add-item-container">
        <div className="add-item-heading">
          <span className="add-item-eyebrow">RENT-HUB MARKETPLACE</span>
          <h1>{t("addItemPage.title", "List Your Item")}</h1>
          <p>
            {t("addItemPage.subtitle", "Turn your unused items into opportunities. Share them with the Rent-Hub community.")}
          </p>
        </div>

        <section className="add-item-card">
          <div className="add-item-card-heading">
            <div className="add-item-icon" aria-hidden="true">+</div>
            <div>
              <h2>{t("addItemPage.title", "Item Information")}</h2>
              <p>{t("addItemPage.subtitle", "Enter the details of the item you want to rent out.")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="add-item-field">
              <label htmlFor="title">{t("addItemPage.itemTitle", "Item Name *")}</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={t("addItemPage.titlePlaceholder", "e.g. Electric Drill")}
                maxLength={100}
                required
              />
            </div>

            <div className="add-item-row">
              <div className="add-item-field">
                <label htmlFor="category">{t("addItemPage.category", "Category *")}</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Tools">{t("categories.tools", "Tools")}</option>
                  <option value="Electronics">{t("categories.electronics", "Electronics")}</option>
                  <option value="Cameras">{t("categories.cameras", "Cameras")}</option>
                  <option value="Vehicles">{t("categories.vehicles", "Vehicles")}</option>
                  <option value="Furniture">{t("categories.furniture", "Furniture")}</option>
                  <option value="Sports">{t("categories.sports", "Sports")}</option>
                  <option value="Camping">{t("categories.camping", "Camping")}</option>
                  <option value="Other">{t("categories.other", "Other")}</option>
                </select>
              </div>

              <div className="add-item-field">
                <label htmlFor="condition">{t("addItemPage.condition", "Item Condition")}</label>
                <select
                  id="condition"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                >
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>
            </div>

            <div className="add-item-row">
              <div className="add-item-field">
                <label htmlFor="price">Rental Price (LKR) <span>*</span></label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  required
                />
              </div>

              <div className="add-item-field">
                <label htmlFor="priceType">Price Period</label>
                <select
                  id="priceType"
                  name="priceType"
                  value={form.priceType}
                  onChange={handleChange}
                >
                  <option value="day">Per day</option>
                  <option value="hour">Per hour</option>
                </select>
              </div>
            </div>

            {/* Available Quantity Field */}
            <div className="add-item-field">
              <label htmlFor="available_quantity">Available Quantity (Stock) <span>*</span></label>
              <input
                id="available_quantity"
                name="available_quantity"
                type="number"
                min="1"
                step="1"
                value={form.available_quantity}
                onChange={handleChange}
                placeholder="e.g. 1"
                required
              />
              <small className="add-item-hint">
                Specify total number of units available for rent.
              </small>
            </div>

            <div className="add-item-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your item, its features and condition..."
                rows={5}
                maxLength={2000}
              />
            </div>

            <div className="add-item-field">
              <label htmlFor="image">Upload Item Image <span>*</span></label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              <small className="add-item-hint">
                Choose an image file from your device.
              </small>
            </div>

            {imagePreview && (
              <div className="add-item-image-preview">
                <p>Image Preview</p>
                <img src={imagePreview} alt="Preview of the item" />
              </div>
            )}

            {message && (
              <div
                className={`add-item-message ${
                  isError ? "add-item-error" : "add-item-success"
                }`}
                role="status"
                aria-live="polite"
              >
                {message}
              </div>
            )}

            <div className="add-item-actions">
              <button
                type="submit"
                className="publish-item-button"
                disabled={loading}
              >
                {loading ? t("addItemPage.submitting", "Publishing...") : t("addItemPage.submitBtn", "Publish Item")}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => navigate("/profile")}
                disabled={loading}
              >
                {t("map.cancel", "Back")}
              </button>
            </div>

            <p className="add-item-required-note">
              Fields marked with * are required.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}