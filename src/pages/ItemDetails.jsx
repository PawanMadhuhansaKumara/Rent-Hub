
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import ChatBox from "../components/ChatBox";
import "./ItemDetails.css";

const API_URL = "http://localhost:5001";

export default function ItemDetails() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error reading current user:", e);
      }
    }
  }, []);

  const handleOpenChat = () => {
    if (!currentUser) {
      alert("Please login to chat with the seller.");
      navigate("/login");
      return;
    }

    const sellerId = item?.user_id || item?.seller_id || 1;
    const myId = currentUser?.user_id || currentUser?.id;

    if (Number(myId) === Number(sellerId)) {
      alert("This is your own item. You cannot chat with yourself.");
      return;
    }

    setShowChat(true);
  };

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/items`);

        if (!response.ok) {
          throw new Error("Failed to load items.");
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : data.items || [];

        const selectedItem = items.find(
          (product) => String(product.id) === String(id)
        );

        if (!selectedItem) {
          setError("Item not found.");
          return;
        }

        setItem(selectedItem);
      } catch {
        setError("Unable to load item details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleRequestSubmit = (event) => {
    event.preventDefault();

    if (!startDate || !endDate) {
      alert("Please select the rental start and end dates.");
      return;
    }

    if (endDate < startDate) {
      alert("End date must be on or after the start date.");
      return;
    }

    if (
      quantity < 1 ||
      quantity > Number(item.available ?? 0)
    ) {
      alert("Please select a valid quantity.");
      return;
    }

    alert(
      "Form validation successful. Rental request saving is not connected yet."
    );

    setShowRequestForm(false);
    setStartDate("");
    setEndDate("");
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="details-message">
        <div className="details-loader" />
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="details-message">
        <span className="details-message-icon">!</span>
        <h2>Item unavailable</h2>
        <p>{error || "We couldn't find this item."}</p>
        <Link to="/" className="details-back-button">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const imageUrl = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${API_URL}/${item.image.replace(/^\/+/, "")}`
    : "";

  const available = Number(item.available ?? 0);
  const price = Number(item.price) || 0;
  const priceType = item.priceType || "day";

  return (
    <main className="item-details-page">
      <div className="details-container">
        <div className="details-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Item Details</span>
        </div>

        <div className="item-details-card">
          {/* Item Image */}
          <div className="details-image-section">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.title}
                className="details-image"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="details-no-image">
                <span>▧</span>
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Item Information */}
          <div className="details-content">
            <span className="details-eyebrow">
              RENT-HUB MARKETPLACE
            </span>

            <h1>{item.title}</h1>

            <div className="details-badges">
              <span className="details-category">
                {item.category || "General"}
              </span>

              <span className="details-condition">
                Condition: {item.condition || "Not specified"}
              </span>
            </div>

            <div className="details-price-box">
              <span className="details-price-label">
                Rental price
              </span>
              <p className="details-price">
                LKR {price.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span> / {priceType}</span>
              </p>
            </div>

            <div className="details-availability">
              <span
                className={`availability-dot ${
                  available < 1 ? "unavailable" : ""
                }`}
              />
              <span>
                {available > 0
                  ? `${available} item(s) available`
                  : "Currently unavailable"}
              </span>
            </div>

            <div className="details-description">
              <h2>About this item</h2>
              <p>
                {item.description ||
                  "No description has been provided for this item yet."}
              </p>
            </div>

            <div className="details-actions">
              <button
                type="button"
                className="chat-seller-button"
                onClick={handleOpenChat}
              >
                <MessageCircle size={18} />
                <span>{t("chat.chatWithSeller") || "Chat with Seller"}</span>
              </button>

              <button
                type="button"
                className="rent-request-button"
                onClick={() => setShowRequestForm(!showRequestForm)}
                disabled={available < 1}
              >
                {available < 1
                  ? "Not Available"
                  : showRequestForm
                  ? "Cancel Request"
                  : "Request to Rent"}
              </button>

              <Link to="/" className="details-back-button">
                ← Back to Home
              </Link>
            </div>

            {showRequestForm && (
              <form
                className="rent-request-form"
                onSubmit={handleRequestSubmit}
              >
                <div className="request-form-heading">
                  <span className="request-form-icon">✓</span>
                  <div>
                    <h2>Rental Request</h2>
                    <p>Choose your preferred rental dates.</p>
                  </div>
                </div>

                <label htmlFor="startDate">
                  Rental Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  min={minDate}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) {
                      setEndDate("");
                    }
                  }}
                  required
                />

                <label htmlFor="endDate">
                  Rental End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  min={startDate || minDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />

                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={available}
                  value={quantity}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setQuantity(
                      value > available ? available : value
                    );
                  }}
                  required
                />

                <div className="request-price-summary">
                  <span>Price per {priceType}</span>
                  <strong>
                    LKR {price.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="submit-request-button"
                >
                  Submit Request →
                </button>

                <p className="request-note">
                  This is a demo form. Your request is not saved
                  to the database yet.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {showChat && (
        <ChatBox
          itemId={item.id}
          itemTitle={item.title}
          itemImage={imageUrl}
          itemPrice={price}
          itemPriceType={priceType}
          sellerId={item.user_id || item.seller_id || 1}
          sellerName={item.seller_name || "Seller"}
          currentUser={currentUser}
          onClose={() => setShowChat(false)}
        />
      )}
    </main>
  );
}
