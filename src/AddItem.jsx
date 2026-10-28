
import { useState } from "react";
import "./AddItem.css";

const initialForm = {
  title: "",
  category: "Tools",
  condition: "Good",
  price: "",
  priceType: "day",
  description: "",
  image: "",
};

export default function AddItem({ onItemAdded }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!form.title.trim() || !form.category || !form.price.trim()) {
      setMessage("Please complete the required fields.");
      setIsError(true);
      return;
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      setMessage("Please enter a valid price greater than zero.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/items",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            image: form.image.trim(),
            price: Number(form.price),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Could not add item.");
      }

      setMessage("Your item has been published successfully!");
      setIsError(false);
      setForm({ ...initialForm });

      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      setMessage(
        error.message || "Could not connect to the backend."
      );
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
            <div className="add-item-icon" aria-hidden="true">
              +
            </div>
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
              <small className="add-item-hint">
                Help customers understand what they are renting.
              </small>
            </div>

            <div className="add-item-field">
              <label htmlFor="image">Item Image URL</label>
              <input
                id="image"
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/item.jpg"
              />
              <small className="add-item-hint">
                Paste a direct link to your item's image.
              </small>
            </div>

            {form.image.trim() && (
              <div className="add-item-image-preview">
                <p>Image Preview</p>
                <img
                  src={form.image}
                  alt="Preview of the item"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  onLoad={(event) => {
                    event.currentTarget.style.display = "block";
                  }}
                />
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
                onClick={() => window.history.back()}
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
