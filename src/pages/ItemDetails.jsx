import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  User,
  MapPin,
  CartonIcon,
  ShoppingCart,
  Star,
  ChevronDown,
  CornerDownRight,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import ChatBox from "../components/ChatBox";
import "./ItemDetails.css";
import CartIcon from "../components/CartIcon";
import AddToRentCartButton from "../components/AddToRentCartButton";
import RentRequestButton from "../components/RentRequestButton";
import RentRequestForm from "../components/RentRequestForm";
import RentRequestSuccessModal from "../components/RentRequestSuccessModal";
import LeaveReviewModal from "../components/LeaveReviewModal";
import GoogleMapIcon from "../components/GoogleMapIcon";
import ShopDistanceModal from "../components/ShopDistanceModal";
import EditItemModal from "../components/EditItemModal";
import { getCachedItemById } from "../utils/itemsCache";

const API_URL = "http://https://rent-hub-ashen.vercel.app";

export const isItemRented = (item) => {
  if (!item) return false;

  const stock =
    item.available_quantity !== undefined && item.available_quantity !== null
      ? Number(item.available_quantity)
      : null;

  if (stock !== null) {
    return stock <= 0;
  }

  return (
    item.available === "Rented Out" ||
    String(item.available).toLowerCase() === "rented out" ||
    item.available === 0 ||
    item.available === "0"
  );
};

export default function ItemDetails() {
  const { id } = useParams();
  const { t } = useTranslation();

  const cachedMatch = getCachedItemById(id);
  const [item, setItem] = useState(() => cachedMatch || null);
  const [loading, setLoading] = useState(() => !cachedMatch);
  const itemRef = useRef(item);
  itemRef.current = item;
  const [error, setError] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isInCart, setIsInCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [itemReviewStats, setItemReviewStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const currentUserId = currentUser
    ? Number(currentUser.id || currentUser.user_id)
    : null;
  const itemSellerId = item
    ? Number(item.user_id || item.userId || item.seller_id)
    : null;
  const isItemSeller = Boolean(
    currentUserId && itemSellerId && currentUserId === itemSellerId
  );

  const userRentalLimit = currentUser
    ? Number(currentUser.rental_limit || currentUser.max_rental_limit || 1000)
    : 1000;
  const userTrustScore = currentUser ? Number(currentUser.trust_score || 50) : 50;
  const itemPrice = Number(item?.price) || 0;
  const isLimitExceeded = !isItemSeller && itemPrice > userRentalLimit;

  const handleToggleSellerStatus = async () => {
    if (!item) return;
    const newStatus = isRented ? "Available" : "Rented Out";
    try {
      const res = await fetch(`${API_URL}/api/items/status/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: newStatus }),
      });
      if (res.ok) {
        setItem((prev) => ({
          ...prev,
          available: newStatus,
          available_qty: newStatus,
          available_quantity:
            newStatus === "Available"
              ? Math.max(1, Number(prev?.available_quantity) || 1)
              : 0,
        }));
        window.dispatchEvent(new Event("items_updated"));
        window.dispatchEvent(new Event("rent_requests_updated"));
      }
    } catch (e) {
      console.error("Toggle status error:", e);
    }
  };

  const handlePostReply = async (reviewId) => {
    if (!replyText.trim()) return;
    const sellerId = currentUser?.id || currentUser?.user_id;

    setSubmittingReply(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          reply: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setItemReviewStats((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  sellerReply: data.sellerReply,
                  sellerReplyAt: data.sellerReplyAt,
                }
              : r
          ),
        }));
        setReplyingReviewId(null);
        setEditingReplyId(null);
        setReplyText("");
      } else {
        alert(data.message || "Failed to post reply.");
      }
    } catch (err) {
      console.error("Post reply error:", err);
      alert("Error posting reply: " + err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your response to this review?")) return;
    const sellerId = currentUser?.id || currentUser?.user_id;

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/reply`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setItemReviewStats((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  sellerReply: null,
                  sellerReplyAt: null,
                }
              : r
          ),
        }));
      } else {
        alert(data.message || "Failed to delete reply.");
      }
    } catch (err) {
      console.error("Delete reply error:", err);
      alert("Error deleting reply: " + err.message);
    }
  };

  const [editingReview, setEditingReview] = useState(null);

  const handleDeleteCustomerReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    const buyerId = currentUser?.id || currentUser?.user_id;
    if (!buyerId) {
      alert("Please log in to delete your review.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setItemReviewStats((prev) => {
          const updatedList = prev.reviews.filter((r) => r.id !== reviewId);
          const total = updatedList.length;
          const avg =
            total > 0
              ? (
                  updatedList.reduce((acc, curr) => acc + Number(curr.rating), 0) /
                  total
                ).toFixed(1)
              : 0;
          return {
            ...prev,
            totalReviews: total,
            avgRating: Number(avg),
            reviews: updatedList,
          };
        });
      } else {
        alert(data.message || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      alert("Network error while deleting review.");
    }
  };
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setVisibleReviewsCount(3);
  }, [id]);

  const isRented = isItemRented(item);

  const available = isRented
  ? 0
  : Number(item?.available_quantity ?? item?.available ?? 0);
    // Record view count once per session (Prevents double counting in React StrictMode)
  useEffect(() => {
    if (!id) return;
    const sessionKey = `viewed_item_${id}`;
    
    // මේ session එකේදී තවම view එක count කර නැත්නම් පමණක් API එකට යවන්න
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "true");
      fetch(`${API_URL}/api/items/${id}/view`, { method: "POST" }).catch(() => {});
    }
  }, [id]);
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

    // Fetch review stats for this item
    if (id) {
      fetch(`${API_URL}/api/reviews/item/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setItemReviewStats({
              avgRating: data.avgRating || 0,
              totalReviews: data.totalReviews || 0,
              reviews: data.reviews || [],
            });
          }
        })
        .catch(() => null);
    }
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
    const cached = getCachedItemById(id);
    if (cached) {
      setItem(cached);
      itemRef.current = cached;
      setLoading(false);
    } else if (!itemRef.current || String(itemRef.current.id) !== String(id)) {
      setItem(null);
      itemRef.current = null;
      setLoading(true);
    }

    const fetchItem = async (isSilent = false) => {
      try {
        if (!isSilent && !itemRef.current) {
          setLoading(true);
        }
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
          if (!itemRef.current) setError("Item not found.");
          return;
        }

        const cur = itemRef.current;
        const hasChanged =
          !cur ||
          cur.available !== selectedItem.available ||
          cur.available_quantity !== selectedItem.available_quantity ||
          cur.price !== selectedItem.price ||
          cur.title !== selectedItem.title;

        if (hasChanged) {
          setItem(selectedItem);
          itemRef.current = selectedItem;
        }
      } catch {
        if (!itemRef.current) {
          setError("Unable to load item details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem(Boolean(itemRef.current));

    const handleSilentRefresh = () => fetchItem(true);
    window.addEventListener("items_updated", handleSilentRefresh);
    window.addEventListener("rent_requests_updated", handleSilentRefresh);
    return () => {
      window.removeEventListener("items_updated", handleSilentRefresh);
      window.removeEventListener("rent_requests_updated", handleSilentRefresh);
    };
  }, [id]);

  // Synchronize latest seller map location if available
  useEffect(() => {
    const sellerId = item?.user_id || item?.userId;
    if (sellerId && (!item.seller_map_latitude || !item.seller_map_location_name)) {
      fetch(`${API_URL}/api/users/${sellerId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setItem((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                seller_map_latitude: data.user.map_latitude
                  ? parseFloat(data.user.map_latitude)
                  : prev.seller_map_latitude,
                seller_map_longitude: data.user.map_longitude
                  ? parseFloat(data.user.map_longitude)
                  : prev.seller_map_longitude,
                seller_map_location_name:
                  data.user.map_location_name || prev.seller_map_location_name,
              };
            });
          }
        })
        .catch(() => {});
    }
  }, [item?.user_id, item?.userId]);

  const handleOpenRentForm = () => {
    if (!currentUser) {
      alert("Please login to request a rental.");
      navigate("/login");
      return;
    }

    if (isLimitExceeded) {
      alert(
        `Trust Limit Exceeded!\n\nYour current maximum rental limit is LKR ${userRentalLimit.toLocaleString()}, but this item costs LKR ${itemPrice.toLocaleString()}.\n\nComplete and return previous rentals safely on RentHub to build your Trust Score and unlock higher-priced items!`
      );
      return;
    }

    if (isRented || available < 1) {
      alert("This item is currently rented out and cannot be rented.");
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

  const handleRequestSubmit = async (paymentData) => {
    if (paymentData && paymentData.preventDefault) {
      paymentData.preventDefault();
    }

    if (!currentUser) {
      alert("Please login to request a rental.");
      navigate("/login");
      return false;
    }

    if (isLimitExceeded) {
      alert(
        `Trust Limit Exceeded!\n\nYour current maximum rental limit is LKR ${userRentalLimit.toLocaleString()}, but this item costs LKR ${itemPrice.toLocaleString()}.\n\nComplete and return previous rentals safely on RentHub to build your Trust Score and unlock higher-priced items!`
      );
      return false;
    }

    if (isRented || available < 1) {
      alert("This item is currently rented out and cannot be rented.");
      return false;
    }

    if (!startDate || !endDate) {
      alert("Please select the rental start and end dates.");
      return false;
    }

    if (endDate < startDate) {
      alert("End date must be on or after the start date.");
      return false;
    }

    if (quantity < 1 || quantity > available)  {
      alert("Please select a valid quantity.");
      return false;
    }

    const chosenMethod = paymentData?.paymentMethod || "cash";
    const isPaid = Boolean(paymentData?.isPaid);

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
      itemPriceType === "day"
        ? numPrice * numQty * diffDays
        : numPrice * numQty;

    const requestPayload = {
      itemId: item.id,
      buyerId: myId,
      sellerId: sellerId,
      startDate: startDate,
      endDate: endDate,
      quantity: numQty,
      totalPrice: calculatedTotal,
      paymentMethod: chosenMethod,
      paymentStatus: isPaid ? "paid" : "pending",
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
      if (!res.ok) {
        alert(data.message || "Failed to submit rental request.");
        return false;
      }

      if (data.success !== false || data.requestId) {
        createdRequest = {
          id: data.requestId || data.request?.id || Date.now(),
          ...requestPayload,
          paymentMethod: chosenMethod,
          paymentStatus: isPaid ? "paid" : "pending",
          createdAt: data.request?.createdAt || new Date().toISOString(),
          itemTitle: item.title,
          itemImage: item.image || item.image_url,
          itemPrice: numPrice,
          priceType: itemPriceType,
          sellerName:
            item.userName || item.user_name || item.sellerName || "Item Owner",
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
        paymentMethod: chosenMethod,
        paymentStatus: isPaid ? "paid" : "pending",
        createdAt: new Date().toISOString(),
        itemTitle: item.title,
        itemImage: item.image || item.image_url,
        itemPrice: numPrice,
        priceType: itemPriceType,
        sellerName:
          item.userName || item.user_name || item.sellerName || "Item Owner",
        sellerPhone: item.userPhone || item.user_phone || item.phone_no || "",
        sellerCity: item.nearestCity || item.nearest_city || "",
      };
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem("rent_hub_requests") || "[]",
      );
      const filtered = saved.filter(
        (r) => String(r.id) !== String(createdRequest.id),
      );
      localStorage.setItem(
        "rent_hub_requests",
        JSON.stringify([createdRequest, ...filtered]),
      );
      window.dispatchEvent(new Event("rent_requests_updated"));
      window.dispatchEvent(new Event("user_updated"));
    } catch (e) {
      console.error("Local storage update error:", e);
    }

    setShowRequestForm(false);
    setStartDate("");
    setEndDate("");
    setQuantity(1);
    setShowSuccessModal(true);
    return true;
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      alert("Please login to add items to your rent cart.");
      navigate("/login");
      return;
    }

    if (isLimitExceeded) {
      alert(
        `Trust Limit Exceeded!\n\nYour current maximum rental limit is LKR ${userRentalLimit.toLocaleString()}, but this item costs LKR ${itemPrice.toLocaleString()}.\n\nComplete and return previous rentals safely on RentHub to build your Trust Score and unlock higher-priced items!`
      );
      return;
    }

    if (isRented || available < 1) {
      alert("This item is currently rented out and cannot be added to cart.");
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
        <h2>{t("itemDetails.itemUnavailable", "Item unavailable")}</h2>
        <p>{error || t("itemDetails.itemNotFound", "We couldn't find this item.")}</p>
        <button
          type="button"
          onClick={handleBack}
          className="details-back-button"
          title="Go Back"
          aria-label="Go Back"
        >
          <ArrowLeft size={16} style={{ marginRight: "6px" }} />
          <span>{t("common.back", "Back")}</span>
        </button>
      </div>
    );
  }

  const imageUrl = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${API_URL}/${item.image.replace(/^\/+/, "")}`
    : "";

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
          <button
            type="button"
            onClick={handleBack}
            className="details-back-button"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft size={16} style={{ marginRight: "6px" }} />
            <span>{t("common.back", "Back")}</span>
          </button>
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
                <User size={18} color="var(--primary)" />
              </div>
            </div>

            <div className="details-author-info">
              <span className="details-author-name">{authorName}</span>
              <span className="details-author-badge">
                <MapPin size={12} style={{ flexShrink: 0, color: "var(--primary)" }} />
                <span>{nearestCity}</span>
              </span>
            </div>

            <span className="details-author-view-profile">
              {t("itemDetails.visitStore", "Visit Store")} <span>→</span>
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
                <p>{t("itemDetails.noImage", "No image available")}</p>
              </div>
            )}
          </div>

          {/* Item Information */}
          <div className="details-content">
            <span className="details-eyebrow">{t("itemDetails.marketplace", "RENT-HUB MARKETPLACE")}</span>

            <div className="details-title-row">
              <h1 className="details-title-text">{item.title}</h1>
              {isItemSeller && (
                <button
                  type="button"
                  className="details-edit-item-top-btn"
                  onClick={() => setShowEditItemModal(true)}
                  title="Edit this item listing"
                >
                  <Edit3 size={15} />
                  <span>{t("itemEdit.editItem")}</span>
                </button>
              )}
            </div>
            {itemReviewStats.totalReviews > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "6px 0 14px 0" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      color="var(--badge-yellow-text)"
                      fill={s <= Math.round(itemReviewStats.avgRating) ? "var(--badge-yellow-text)" : "none"}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--badge-yellow-text)" }}>
                  {Number(itemReviewStats.avgRating).toFixed(1)}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  ({t("stats.fromReviews", { count: itemReviewStats.totalReviews, defaultValue: `${itemReviewStats.totalReviews} reviews` })})
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "6px 0 14px 0", fontSize: "13px", color: "var(--text-muted)" }}>
                <Star size={15} color="var(--border-light)" />
                <span>{t("itemDetails.noReviews", "No reviews yet")}</span>
              </div>
            )}

            <div className="details-badges">
              <span className="details-category">
                {item.category || "General"}
              </span>

              <span className="details-condition">
                {t("itemDetails.condition", "Condition")}: {item.condition || t("itemDetails.notSpecified", "Not specified")}
              </span>

              <button
                type="button"
                className="details-map-badge"
                onClick={() => setShowDistanceModal(true)}
                title="View Store Location, Distance & Route on Map"
              >
                <GoogleMapIcon size={16} />
                <span>
                  {item.seller_map_location_name || item.sellerMapLocationName || item.nearest_city || item.nearestCity || t("map.shop")}
                </span>
                <span className="details-map-badge-dist">{t("map.viewDistanceRoute")}</span>
              </button>
            </div>

            <div className="details-price-box">
              <span className="details-price-label">{t("itemDetails.rentalPrice", "Rental price")}</span>
              <p className="details-price">
                LKR{" "}
                {price.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span> / {priceType === "hour" ? t("addItemPage.perHour", "hour") : t("addItemPage.perDay", "day")}</span>
              </p>
            </div>

            <div className="details-availability">
              <span
                className={`availability-dot ${
                  isRented || available < 1 ? "unavailable" : ""
                }`}
              />
              <span
                style={{
                  fontWeight: isRented ? "700" : "600",
                  color: isRented ? "var(--badge-red-text)" : "inherit",
                }}
              >
                {isRented
                  ? t("rentRequest.itemRentedOut", "Currently Rented Out")
                  : available > 0
                    ? t("itemDetails.itemsAvailable", { count: available, defaultValue: `${available} item(s) available` })
                    : t("itemDetails.currentlyUnavailable", "Currently unavailable")}
              </span>
            </div>

            <div className="details-description">
              <h2>{t("itemDetails.aboutItem", "About this item")}</h2>
              <p>
                {item.description ||
                  t("itemDetails.noDescription", "No description has been provided for this item yet.")}
              </p>
            </div>

            {/* button section */}

            {isLimitExceeded && (
              <div
                style={{
                  backgroundColor: "var(--badge-yellow-bg)",
                  border: "1.5px solid var(--border-light)",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "20px" }}>🔒</span>
                <div>
                  <strong
                    style={{
                      color: "var(--badge-yellow-text)",
                      fontSize: "13.5px",
                      display: "block",
                      marginBottom: "3px",
                    }}
                  >
                    {t("itemDetails.trustLimitExceeded", {
                      limit: userRentalLimit.toLocaleString(),
                      defaultValue: `Trust Limit Exceeded (Your Limit: LKR ${userRentalLimit.toLocaleString()})`,
                    })}
                  </strong>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "12.5px",
                      lineHeight: "1.4",
                      display: "block",
                    }}
                  >
                    {t("itemDetails.trustLimitDesc", {
                      limit: userRentalLimit.toLocaleString(),
                      price: itemPrice.toLocaleString(),
                      defaultValue: `Your Trust Score allows rentals up to LKR ${userRentalLimit.toLocaleString()}. This item costs LKR ${itemPrice.toLocaleString()}. Rent and return more items safely on RentHub to unlock this item!`,
                    })}
                  </span>
                </div>
              </div>
            )}



            <div className="details-actions">
              {isItemSeller ? (
                <div className="details-owner-actions-wrap">
                  <button
                    type="button"
                    className="details-owner-edit-main-btn"
                    onClick={() => setShowEditItemModal(true)}
                  >
                    <Edit3 size={18} />
                    <span>{t("itemEdit.editItemListing")}</span>
                  </button>

                  <button
                    type="button"
                    className={`details-owner-status-btn ${
                      isRented ? "status-rented" : "status-avail"
                    }`}
                    onClick={handleToggleSellerStatus}
                    title="Click to toggle availability status"
                  >
                    {isRented ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>{t("itemEdit.markAsAvailable")}</span>
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        <span>{t("itemEdit.markAsRentedOut")}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
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
                    disabled={isLimitExceeded}
                    onClick={handleAddToCart}
                  />
                  <RentRequestButton
                    available={available}
                    disabled={isLimitExceeded}
                    onClick={handleOpenRentForm}
                  >
                    {isLimitExceeded ? `Limit: LKR ${userRentalLimit.toLocaleString()}` : undefined}
                  </RentRequestButton>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews & Comments Section */}
        <section className="item-reviews-section">
          {/* Section Header */}
          <div className="item-reviews-header">
            <div className="item-reviews-header-left">
              <div className="item-reviews-rating-badge">
                <span className="item-reviews-avg-number">
                  {itemReviewStats.totalReviews > 0
                    ? Number(itemReviewStats.avgRating).toFixed(1)
                    : "0.0"}
                </span>
                <div className="item-reviews-stars-mini">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={11}
                      color="var(--badge-yellow-text)"
                      fill={
                        s <= Math.round(itemReviewStats.avgRating)
                          ? "var(--badge-yellow-text)"
                          : "none"
                      }
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="item-reviews-title">{t("itemDetails.customerReviews", "Customer Reviews & Ratings")}</h3>
                <p className="item-reviews-subtitle">
                  {itemReviewStats.totalReviews > 0
                    ? t("itemDetails.basedOnReviews", {
                        count: itemReviewStats.totalReviews,
                        defaultValue: `Based on ${itemReviewStats.totalReviews} reviews from verified renters`,
                      })
                    : t("itemDetails.realFeedback", "Real feedback from renters who used this item")}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {itemReviewStats.reviews.length === 0 ? (
            <div className="item-reviews-empty">
              <Star size={38} color="var(--border-light)" style={{ marginBottom: "10px" }} />
              <h4>{t("itemDetails.noReviews", "No reviews yet")}</h4>
              <p>{t("itemDetails.firstReviewPrompt", "Be the first customer to rent and review this item!")}</p>
            </div>
          ) : (
            <>
              <div className="item-reviews-list">
                {itemReviewStats.reviews
                  .slice(0, visibleReviewsCount)
                  .map((rev) => {
                    const buyerPic = rev.buyerPic
                      ? rev.buyerPic.startsWith("http")
                        ? rev.buyerPic
                        : `${API_URL}${
                            rev.buyerPic.startsWith("/") ? "" : "/"
                          }${rev.buyerPic}`
                      : null;
                    const isMyReview =
                      currentUser &&
                      Number(currentUser.id || currentUser.user_id) ===
                        Number(rev.buyerId);

                    return (
                      <div key={rev.id} className="item-review-card">
                        {/* Review Header: User info + Star rating */}
                        <div className="item-review-card-header">
                          <div className="item-review-user-info">
                            {buyerPic ? (
                              <img
                                src={buyerPic}
                                alt={rev.buyerName || "User"}
                                className="item-review-avatar"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="item-review-avatar-fallback">
                                {rev.buyerName
                                  ? rev.buyerName.trim()[0].toUpperCase()
                                  : "U"}
                              </div>
                            )}
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <h5 className="item-review-user-name">
                                  {rev.buyerName || t("itemDetails.verifiedRenter", "Verified Renter")}
                                </h5>
                                {isMyReview && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      color: "var(--badge-blue-text)",
                                      backgroundColor: "var(--badge-blue-bg)",
                                      padding: "1px 6px",
                                      borderRadius: "10px",
                                    }}
                                  >
                                    {t("itemDetails.you", "You")}
                                  </span>
                                )}
                              </div>
                              <span className="item-review-date">
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )
                                  : t("itemDetails.recentReview", "Recent Review")}
                                {rev.buyerCity ? ` • ${rev.buyerCity}` : ""}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: "6px",
                            }}
                          >
                            <div className="item-review-stars-row">
                              <div className="item-review-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={15}
                                    color="var(--badge-yellow-text)"
                                    fill={
                                      star <= Math.round(Number(rev.rating))
                                        ? "var(--badge-yellow-text)"
                                        : "none"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="item-review-rating-num">
                                {Number(rev.rating).toFixed(1)}
                              </span>
                            </div>

                            {/* Customer Actions: Edit / Delete own review */}
                            {isMyReview && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingReview({
                                      ...rev,
                                      title: item?.title || rev.itemTitle,
                                      itemTitle: item?.title || rev.itemTitle,
                                      image:
                                        item?.image_url ||
                                        item?.images?.[0] ||
                                        rev.itemImage,
                                      itemImage:
                                        item?.image_url ||
                                        item?.images?.[0] ||
                                        rev.itemImage,
                                    })
                                  }
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    background: "var(--badge-blue-bg)",
                                    border: "1px solid var(--badge-blue-border)",
                                    color: "var(--badge-blue-text)",
                                    borderRadius: "6px",
                                    padding: "2px 7px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                  title="Edit your review"
                                >
                                  <Edit3 size={12} />
                                  <span>{t("itemDetails.edit", "Edit")}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomerReview(rev.id)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    background: "var(--badge-red-bg)",
                                    border: "1px solid var(--badge-red-border)",
                                    color: "var(--badge-red-text)",
                                    borderRadius: "6px",
                                    padding: "2px 7px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                  title="Delete your review"
                                >
                                  <Trash2 size={12} />
                                  <span>{t("itemDetails.delete", "Delete")}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Review Comment */}
                        {rev.comment && (
                          <p className="item-review-comment">{rev.comment}</p>
                        )}

                        {/* Seller Response Display */}
                        {rev.sellerReply && editingReplyId !== rev.id && (
                          <div className="item-review-seller-reply">
                            <div className="item-review-seller-reply-header">
                              <div className="item-review-seller-reply-title-row">
                                <CornerDownRight size={15} color="var(--primary)" />
                                <span className="item-review-seller-reply-badge">
                                  {t("itemDetails.responseFrom", {
                                    name: rev.sellerName || "Shop Owner",
                                    defaultValue: `Response from ${rev.sellerName || "Shop Owner"}`,
                                  })}
                                </span>
                                {rev.sellerReplyAt && (
                                  <span className="item-review-seller-reply-date">
                                    • {new Date(rev.sellerReplyAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                  </span>
                                )}
                              </div>

                              {isItemSeller && (
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingReplyId(rev.id);
                                      setReplyText(rev.sellerReply);
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "var(--primary)",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      padding: "2px 6px",
                                    }}
                                    title="Edit your reply"
                                  >
                                    {t("itemDetails.edit", "Edit")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReply(rev.id)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "var(--badge-red-text)",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      padding: "2px 6px",
                                    }}
                                    title="Delete your reply"
                                  >
                                    {t("itemDetails.delete", "Delete")}
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="item-review-seller-reply-text">
                              {rev.sellerReply}
                            </p>
                          </div>
                        )}

                        {/* Reply Form (When Shop Owner clicks Reply or Edit) */}
                        {isItemSeller && (replyingReviewId === rev.id || editingReplyId === rev.id) && (
                          <div className="item-review-reply-form">
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                              {editingReplyId === rev.id
                                ? t("itemDetails.editResponse", "Edit your response:")
                                : t("itemDetails.writeResponse", "Write a response to this customer:")}
                            </label>
                            <textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={t("itemDetails.replyPlaceholder", "Thank the customer or address their feedback...")}
                              className="item-review-reply-textarea"
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingReviewId(null);
                                  setEditingReplyId(null);
                                  setReplyText("");
                                }}
                                disabled={submittingReply}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--border-light)",
                                  backgroundColor: "var(--bg-card-elevated)",
                                  color: "var(--text-main)",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                {t("itemDetails.cancel", "Cancel")}
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePostReply(rev.id)}
                                disabled={submittingReply || !replyText.trim()}
                                style={{
                                  padding: "6px 16px",
                                  borderRadius: "6px",
                                  border: "none",
                                  backgroundColor: "var(--primary)",
                                  color: "var(--text-main)",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: submittingReply || !replyText.trim() ? "not-allowed" : "pointer",
                                  opacity: submittingReply || !replyText.trim() ? 0.6 : 1,
                                }}
                              >
                                {submittingReply
                                  ? t("itemDetails.posting", "Posting...")
                                  : t("itemDetails.postReply", "Post Reply")}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Reply Button (When no reply yet and owner is viewing) */}
                        {isItemSeller && !rev.sellerReply && replyingReviewId !== rev.id && (
                          <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(rev.id);
                                setEditingReplyId(null);
                                setReplyText("");
                              }}
                              className="item-review-reply-btn"
                            >
                              <CornerDownRight size={14} />
                              <span>{t("itemDetails.replyToReview", "Reply to Review")}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* See More Reviews Button (Loads 3 more each time) */}
              {itemReviewStats.reviews.length > visibleReviewsCount && (
                <div className="item-reviews-load-more-wrap">
                  <button
                    type="button"
                    className="item-reviews-load-more-btn"
                    onClick={() =>
                      setVisibleReviewsCount((prev) => prev + 3)
                    }
                  >
                    <span>{t("itemDetails.seeMoreReviews", "See more reviews")}</span>
                    <span className="item-reviews-remaining-count">
                      {t("itemDetails.remainingReviews", {
                        count: itemReviewStats.reviews.length - visibleReviewsCount,
                        defaultValue: `(${itemReviewStats.reviews.length - visibleReviewsCount} remaining)`,
                      })}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {showRequestForm && (
        <RentRequestForm
          isOpen={showRequestForm}
          onClose={() => {
            setShowRequestForm(false);
            setStartDate("");
            setEndDate("");
            setQuantity(1);
          }}
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
          currentUser={currentUser}
          API_URL={API_URL}
        />
      )}

      {showSuccessModal && (
        <RentRequestSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onShowRequests={() => {
            setShowSuccessModal(false);
            navigate("/my-items?tab=rent-requests");
          }}
          itemTitle={item?.title}
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

      {/* EDIT REVIEW MODAL FOR CUSTOMER */}
      {editingReview && (
        <LeaveReviewModal
          isOpen={Boolean(editingReview)}
          onClose={() => setEditingReview(null)}
          item={editingReview}
          currentUser={currentUser}
          onReviewSubmitted={(updated) => {
            setItemReviewStats((prev) => {
              const updatedList = prev.reviews.map((r) =>
                r.id === updated.reviewId
                  ? { ...r, rating: updated.rating, comment: updated.comment }
                  : r
              );
              const total = updatedList.length;
              const avg =
                total > 0
                  ? (
                      updatedList.reduce((acc, curr) => acc + Number(curr.rating), 0) /
                      total
                    ).toFixed(1)
                  : 0;
              return {
                ...prev,
                avgRating: Number(avg),
                reviews: updatedList,
              };
            });
          }}
          onReviewDeleted={(deleted) => {
            setItemReviewStats((prev) => {
              const updatedList = prev.reviews.filter(
                (r) => r.id !== deleted.reviewId
              );
              const total = updatedList.length;
              const avg =
                total > 0
                  ? (
                      updatedList.reduce((acc, curr) => acc + Number(curr.rating), 0) /
                      total
                    ).toFixed(1)
                  : 0;
              return {
                ...prev,
                totalReviews: total,
                avgRating: Number(avg),
                reviews: updatedList,
              };
            });
          }}
          API_URL={API_URL}
        />
      )}

      {showDistanceModal && item && (
        <ShopDistanceModal
          isOpen={showDistanceModal}
          onClose={() => setShowDistanceModal(false)}
          shopData={{
            map_latitude: item.seller_map_latitude || item.sellerMapLatitude,
            map_longitude: item.seller_map_longitude || item.sellerMapLongitude,
            map_location_name: item.seller_map_location_name || item.sellerMapLocationName,
            name: item.user_name || item.userName || "Shop",
            address: item.seller_address || item.sellerAddress,
            nearest_city: item.nearest_city || item.nearestCity,
          }}
        />
      )}

      {showEditItemModal && item && (
        <EditItemModal
          isOpen={showEditItemModal}
          onClose={() => setShowEditItemModal(false)}
          item={item}
          onItemUpdated={(updated) => {
            setItem((prev) => ({
              ...prev,
              ...updated,
            }));
          }}
        />
      )}
    </main>
  );
}
