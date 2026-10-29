import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddItem.css";

const initialForm = {
  title: "",
  category: "Tools",
  condition: "Good",
  price: "",
  priceType: "day",
  description: "",
};

export default function AddItem({ onItemAdded }) {
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

  // Image select කරන විට
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

    if (!form.title.trim() || !form.category || !form.price.trim()) {
      setMessage("Please complete all required fields.");
      setIsError(true);
      return;
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      setMessage("Please enter a valid price greater than zero.");
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
      // LocalStorage එකේ ඇති Logged-in User Object එකෙන් user_id එක ලබා ගැනීම
      const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = loggedUser.user_id || localStorage.getItem("userId") || 1;

      // FormData එක සාදාගෙන Data සහ File එක append කිරීම
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("title", form.title.trim());
      formData.append("category", form.category);
      formData.append("condition", form.condition);
      formData.append("price", Number(form.price));
      formData.append("priceType", form.priceType);
      formData.append("description", form.description.trim());
      formData.append("image", imageFile); // Multer name 'image'

      const response = await fetch("http://localhost:5001/api/items", {
        method: "POST",
        body: formData, // Multipart FormData ලෙස යවයි
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

      // සාර්ථකව එකතු වූ පසු Profile එකට Navigate වීම
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
          <h1>List Your Item</h1>
          <p>
            Turn your unused items into opportunities.
            Share them with the Rent-Hub community.
          </p>
        </div>

        <section className="add-item-card">
          <div className="add-item-card-heading">
            <div className="add-item-icon" aria-hidden="true">+</div>
            <div>
              <h2>Item Information</h2>
              <p>Enter the details of the item you want to rent out.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="add-item-field">
              <label htmlFor="title">Item Name <span>*</span></label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Electric Drill"
                maxLength={100}
                required
              />
            </div>

            <div className="add-item-row">
              <div className="add-item-field">
                <label htmlFor="category">Category <span>*</span></label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option>Tools</option>
                  <option>Electronics</option>
                  <option>Vehicles</option>
                  <option>Furniture</option>
                  <option>Sports</option>
                  <option>Camping</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="add-item-field">
                <label htmlFor="condition">Item Condition</label>
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

            {/* Image File Upload Field */}
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

            {/* Image Preview */}
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
                {loading ? "Publishing..." : "Publish Item"}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => navigate("/profile")}
                disabled={loading}
              >
                Back
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