import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  MessageCircle,
  User,
  MapPin,
  CartonIcon,
  ShoppingCart,
} from "lucide-react";
import ChatBox from "../components/ChatBox";
import "./ItemDetails.css";
import CartIcon from "../components/CartIcon";
import AddToRentCartButton from "../components/AddToRentCartButton";
import RentRequestButton from "../components/RentRequestButton";
import RentRequestForm from "../components/RentRequestForm";

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
  const [isInCart, setIsInCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("rent") === "true") {
      setShowRequestForm(true);
    }
  }, [searchParams]);

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

  // Check if item is already in cart
  useEffect(() => {
    const checkCartStatus = async () => {
      const myId = currentUser?.user_id || currentUser?.id;
      if (!myId || !id) return;
      try {
        const res = await fetch(`${API_URL}/api/cart/${myId}`);
        if (res.ok) {
          const cartData = await res.json();
          if (Array.isArray(cartData)) {
            const exists = cartData.some(
              (ci) => String(ci.itemId || ci.item_id) === String(id),
            );
            setIsInCart(exists);
          }
        }
      } catch (err) {
        console.error("Error checking cart status:", err);
      }
    };
    checkCartStatus();
  }, [currentUser, id]);

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
          (product) => String(product.id) === String(id),
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

  const handleOpenRentForm = () => {
    if (!currentUser) {
      alert("Please login to request a rental.");
      navigate("/login");
      return;
    }

    const sellerId = item?.user_id || item?.userId || item?.seller_id;
    const myId = currentUser?.user_id || currentUser?.id;

    if (Number(myId) === Number(sellerId)) {
      alert("This is your own item. You cannot rent your own item.");
      return;
    }

    setShowRequestForm(true);
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      alert("Please login to request a rental.");
      navigate("/login");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select the rental start and end dates.");
      return;
    }

    if (endDate < startDate) {
      alert("End date must be on or after the start date.");
      return;
    }

    if (quantity < 1 || quantity > Number(item.available ?? 0)) {
      alert("Please select a valid quantity.");
      return;
    }

    const myId = currentUser?.user_id || currentUser?.id;
    const sellerId = item?.user_id || item?.userId || item?.seller_id;

    // Calculate duration in days and total price
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e - s;
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const numPrice = Number(item.price) || 0;
    const numQty = Number(quantity) || 1;
    const itemPriceType = item.priceType || item.price_type || "day";
    const calculatedTotal =
      itemPriceType === "day" ? numPrice * numQty * diffDays : numPrice * numQty;

    const requestPayload = {
      itemId: item.id,
      buyerId: myId,
      sellerId: sellerId,
      startDate: startDate,
      endDate: endDate,
      quantity: numQty,
      totalPrice: calculatedTotal,
      status: "Pending",
    };

    let createdRequest = null;

    try {
      const res = await fetch(`${API_URL}/api/rent-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success !== false || data.requestId)) {
        createdRequest = {
          id: data.requestId || data.request?.id || Date.now(),
          ...requestPayload,
          createdAt: data.request?.createdAt || new Date().toISOString(),
          itemTitle: item.title,
          itemImage: item.image || item.image_url,
          itemPrice: numPrice,
          priceType: itemPriceType,
          sellerName: item.userName || item.user_name || item.sellerName || "Item Owner",
          sellerPhone: item.userPhone || item.user_phone || item.phone_no || "",
          sellerCity: item.nearestCity || item.nearest_city || "",
        };
      }
    } catch (err) {
      console.warn("Rent request API error, saving locally:", err);
    }

    if (!createdRequest) {
      createdRequest = {
        id: Date.now(),
        ...requestPayload,
        createdAt: new Date().toISOString(),
        itemTitle: item.title,
        itemImage: item.image || item.image_url,
        itemPrice: numPrice,
        priceType: itemPriceType,
        sellerName: item.userName || item.user_name || item.sellerName || "Item Owner",
        sellerPhone: item.userPhone || item.user_phone || item.phone_no || "",
        sellerCity: item.nearestCity || item.nearest_city || "",
      };
    }

    try {
      const saved = JSON.parse(localStorage.getItem("rent_hub_requests") || "[]");
      const filtered = saved.filter((r) => String(r.id) !== String(createdRequest.id));
      localStorage.setItem("rent_hub_requests", JSON.stringify([createdRequest, ...filtered]));
      window.dispatchEvent(new Event("rent_requests_updated"));
    } catch (e) {
      console.error("Local storage update error:", e);
    }

    alert(`Rental request sent for "${item.title}"! Redirecting to your Rent Requests...`);
    setShowRequestForm(false);
    setStartDate("");
    setEndDate("");
    setQuantity(1);

    navigate("/my-items?tab=rent-requests");
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      alert("Please login to add items to your rent cart.");
      navigate("/login");
      return;
    }

    const sellerId = item?.user_id || item?.userId || item?.seller_id;
    const myId = currentUser?.user_id || currentUser?.id;

    if (Number(myId) === Number(sellerId)) {
      alert("This is your own item. You cannot add it to your rent cart.");
      return;
    }

    if (isInCart) {
      navigate("/my-items?tab=rent-cart");
      return;
    }

    try {
      setAddingToCart(true);
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: myId,
          itemId: item.id,
          quantity: quantity || 1,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsInCart(true);
      } else {
        alert(data.message || "Failed to add item to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Error adding item to cart. Please check your backend connection.");
    } finally {
      setAddingToCart(false);
    }
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

  const authorId = item.userId || item.user_id || item.seller_id;
  const authorProfileLink = authorId ? `/profile/${authorId}` : "/profile";

  const rawAvatar = item.userProfilePic || item.user_profile_pic;
  const avatarUrl = rawAvatar
    ? rawAvatar.startsWith("http")
      ? rawAvatar
      : `${API_URL}${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`
    : null;

  const authorName =
    item.userName || item.user_name || item.seller_name || "Rent Hub Member";

  const nearestCity =
    item.nearestCity || item.nearest_city || item.city || "Sri Lanka";

  return (
    <main className="item-details-page">
      <div className="details-container">
        <div className="details-breadcrumb">
          <Link to="/" className="details-back-button">
            ← Back to Home
          </Link>
        </div>

        <div className="item-details-card">
          {/* Author Header like Item Card */}
          <Link to={authorProfileLink} className="details-author-header">
            <div className="details-author-avatar-wrapper">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={authorName}
                  className="details-author-avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                    const fallback =
                      e.currentTarget.parentElement?.querySelector(
                        ".details-author-avatar-fallback",
                      );
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="details-author-avatar-fallback"
                style={{ display: avatarUrl ? "none" : "flex" }}
              >
                <User size={18} color="#15803d" />
              </div>
            </div>

            <div className="details-author-info">
              <span className="details-author-name">{authorName}</span>
              <span className="details-author-badge">
                <MapPin size={12} style={{ flexShrink: 0, color: "#16a34a" }} />
                <span>{nearestCity}</span>
              </span>
            </div>

            <span className="details-author-view-profile">
              Visit Store <span>→</span>
            </span>
          </Link>

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
            <span className="details-eyebrow">RENT-HUB MARKETPLACE</span>

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
              <span className="details-price-label">Rental price</span>
              <p className="details-price">
                LKR{" "}
                {price.toLocaleString("en-LK", {
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

            {/* button section */}

            <div className="details-actions">
              <button
                type="button"
                className="chat-seller-button"
                onClick={handleOpenChat}
              >
                <MessageCircle size={18} />
              </button>
              <AddToRentCartButton
                available={available}
                isAdded={isInCart}
                loading={addingToCart}
                onClick={handleAddToCart}
              />
              <RentRequestButton
                available={available}
                onClick={handleOpenRentForm}
              />
            </div>
          </div>
        </div>
      </div>

      {showRequestForm && (
        <RentRequestForm
          isOpen={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          handleRequestSubmit={handleRequestSubmit}
          minDate={minDate}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          quantity={quantity}
          setQuantity={setQuantity}
          available={available}
          priceType={priceType}
          price={price}
          itemTitle={item.title}
        />
      )}

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
