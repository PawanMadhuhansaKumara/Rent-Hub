import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,CheckCircle2, Phone,MapPin, Clock, Mail, Star, Heart, Plus, Edit3, Settings, X, User,AtSign, ArrowLeft, Package, Calendar, Eye, Trash2, ChevronDown, CornerDownRight,
} from "lucide-react";
import SettingsPopup from "../components/SettingsPopup";
import LeaveReviewModal from "../components/LeaveReviewModal";

const isItemRented = (item) => {
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

export default function Profile({ user, setUser }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();

  // Determine if viewing own profile or someone else's
  const isOwnProfile =
    !paramUserId || (user && String(user.user_id) === String(paramUserId));

  const [activeTab, setActiveTab] = useState("shop");
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Hidden File Input References for Modal (Profile & Cover)
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // File States for upload
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [coverPicFile, setCoverPicFile] = useState(null);

  // Profile State mapping exactly to database columns
  const [profile, setProfile] = useState({
    user_id: user?.user_id || 1,
    full_name: user?.full_name || "RentHub Shop",
    username: user?.username || "renthub_shop",
    phone_no: user?.phone_no || "+94 77 123 4567",
    email: user?.email || "renthub@gmail.com",
    address: user?.address || "Colombo, Sri Lanka",
    nearest_city: user?.nearest_city || "Colombo",
    about:
      user?.about ||
      "Rent smarter. Live better.",
    trust_score: user?.user_rating ? user.user_rating * 20 : 92,
    reviews_count: user?.reviews_count || 12,
    likes_count: user?.likes_count || 68,
    profile_pic_url: user?.profile_pic_url
      ? `http://localhost:5001${user.profile_pic_url}`
      : "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300",
    coverphoto: user?.coverphoto
      ? `http://localhost:5001${user.coverphoto}`
      : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000",
    is_verified: user?.is_verified || 1,
  });

  // Items List & User Posts States
  const [items, setItems] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [postImageFile, setPostImageFile] = useState(null);
  const postImageInputRef = useRef(null);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [visibleProfileReviews, setVisibleProfileReviews] = useState(3);
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const handlePostReply = async (reviewId) => {
    if (!replyText.trim()) return;
    const sellerId = profile.user_id;

    setSubmittingReply(true);
    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          reply: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSellerReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  sellerReply: data.sellerReply,
                  sellerReplyAt: data.sellerReplyAt,
                }
              : r
          )
        );
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
    const sellerId = profile.user_id;

    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${reviewId}/reply`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSellerReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  sellerReply: null,
                  sellerReplyAt: null,
                }
              : r
          )
        );
      } else {
        alert(data.message || "Failed to delete reply.");
      }
    } catch (err) {
      console.error("Delete reply error:", err);
      alert("Error deleting reply: " + err.message);
    }
  };

  const loggedInUser =
    user || JSON.parse(localStorage.getItem("user") || "null");
  const loggedInUserId = loggedInUser?.user_id || loggedInUser?.id;
  const [editingCustomerReview, setEditingCustomerReview] = useState(null);

  const handleDeleteCustomerReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    if (!loggedInUserId) {
      alert("Please log in to delete your review.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerId: loggedInUserId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSellerReviews((prev) => {
          const updatedList = prev.filter((r) => r.id !== reviewId);
          const total = updatedList.length;
          const avg =
            total > 0
              ? (
                  updatedList.reduce(
                    (acc, curr) => acc + Number(curr.rating),
                    0
                  ) / total
                ).toFixed(1)
              : 0;
          setProfile((p) => ({
            ...p,
            user_rating: Number(avg),
            reviews_count: total,
          }));
          return updatedList;
        });
      } else {
        alert(data.message || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      alert("Network error while deleting review.");
    }
  };

  // Fetch live reviews for this seller/shop
  useEffect(() => {
    const targetUserId = paramUserId || profile.user_id;
    if (targetUserId) {
      setLoadingReviews(true);
      fetch(`http://localhost:5001/api/reviews/seller/${targetUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSellerReviews(data.reviews || []);
            setProfile((prev) => ({
              ...prev,
              user_rating: data.avgRating || prev.user_rating,
              reviews_count: data.totalReviews ?? prev.reviews_count,
            }));
          }
        })
        .catch((err) => console.error("Error fetching reviews:", err))
        .finally(() => setLoadingReviews(false));
    }
  }, [paramUserId, profile.user_id]);

  // If viewing someone else's profile via /profile/:userId, fetch their data
  useEffect(() => {
    if (paramUserId && !isOwnProfile) {
      fetch(`http://localhost:5001/api/users/${paramUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const u = data.user;
            setProfile({
              user_id: u.user_id,
              full_name: u.full_name || "RentHub Shop",
              username: u.username || "",
              phone_no: u.phone_no || "",
              email: u.email || "",
              address: u.address || "",
              nearest_city: u.nearest_city || "",
              about: u.about || "Rent smarter. Live better.",
              trust_score: u.user_rating ? u.user_rating * 20 : 80,
              reviews_count: u.reviews_count || 0,
              likes_count: u.likes_count || 0,
              profile_pic_url: u.profile_pic_url
                ? u.profile_pic_url.startsWith("http")
                  ? u.profile_pic_url
                  : `http://localhost:5001${u.profile_pic_url}`
                : "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300",
              coverphoto: u.coverphoto
                ? u.coverphoto.startsWith("http")
                  ? u.coverphoto
                  : `http://localhost:5001${u.coverphoto}`
                : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000",
              is_verified: u.is_verified || 0,
            });
          }
        })
        .catch((err) => console.error("Fetch public profile error:", err));
    } else if (isOwnProfile && user) {
      setProfile((prev) => ({
        ...prev,
        user_id: user.user_id,
        full_name: user.full_name || prev.full_name,
        username: user.username || prev.username,
        phone_no: user.phone_no || prev.phone_no,
        email: user.email || prev.email,
        address: user.address || prev.address,
        nearest_city: user.nearest_city || prev.nearest_city,
        about: user.about || prev.about,
        trust_score: user.user_rating
          ? user.user_rating * 20
          : prev.trust_score,
        reviews_count: user.reviews_count || prev.reviews_count,
        likes_count: user.likes_count || prev.likes_count,
        profile_pic_url: user.profile_pic_url
          ? user.profile_pic_url.startsWith("http")
            ? user.profile_pic_url
            : `http://localhost:5001${user.profile_pic_url}`
          : prev.profile_pic_url,
        coverphoto: user.coverphoto
          ? user.coverphoto.startsWith("http")
            ? user.coverphoto
            : `http://localhost:5001${user.coverphoto}`
          : prev.coverphoto,
        is_verified: user.is_verified ?? prev.is_verified,
      }));
    }
  }, [paramUserId, isOwnProfile, user]);

  useEffect(() => {
    if (profile.user_id) {
      fetchItems();
      fetchUserPosts();
    }

    const handleUpdate = () => {
      if (profile.user_id) {
        fetchItems();
      }
    };

    window.addEventListener("items_updated", handleUpdate);
    window.addEventListener("rent_requests_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("items_updated", handleUpdate);
      window.removeEventListener("rent_requests_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [profile.user_id]);

  const fetchItems = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/items/${profile.user_id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/posts/${profile.user_id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setUserPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  // Direct Status Update function for an Item
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/items/status/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ available: newStatus }),
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, available: newStatus } : item,
          ),
        );
        window.dispatchEvent(new Event("rent_requests_updated"));
        window.dispatchEvent(new Event("items_updated"));
        window.dispatchEvent(new Event("storage"));
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating item status:", err);
    }
  };

    // Profile එකෙන් Item Status එක (Available <-> Rented Out) මාරු කිරීම
  const handleToggleStatus = async (itemId, currentIsRented) => {
    const newStatus = currentIsRented ? "Available" : "Rented Out";

    // 1. Profile state එකේ ක්ෂණිකව වෙනස් කිරීම
    setItems((prevItems) =>
      prevItems.map((it) =>
        String(it.id) === String(itemId)
          ? {
              ...it,
              available: newStatus,
              available_qty: newStatus,
              available_quantity:
                newStatus === "Available"
                  ? Math.max(1, Number(it.available_quantity) || 1)
                  : 0,
            }
          : it
      )
    );

    // 2. Database එකට sync කිරීම
    try {
      await fetch(`http://localhost:5001/api/items/status/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: newStatus }),
      });

      // අනෙකුත් පිටු (Home, Details, MyItems) වලටද update වීම දැනුම් දීම
      window.dispatchEvent(new Event("items_updated"));
      window.dispatchEvent(new Event("rent_requests_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  // Delete Item Functionality
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/items/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
        alert("Item deleted successfully!");
      } else {
        alert(data.message || "Failed to delete item.");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Server error while deleting item.");
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfile((prev) => ({
        ...prev,
        profile_pic_url: URL.createObjectURL(file),
      }));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPicFile(file);
      setProfile((prev) => ({
        ...prev,
        coverphoto: URL.createObjectURL(file),
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("full_name", profile.full_name);
    formData.append("phone_no", profile.phone_no);
    formData.append("email", profile.email || "");
    formData.append("address", profile.address || "");
    formData.append("nearest_city", profile.nearest_city || "");

    if (profilePicFile) {
      formData.append("profile_pic", profilePicFile);
    }
    if (coverPicFile) {
      formData.append("cover_pic", coverPicFile);
    }

    try {
      const res = await fetch(
        `http://localhost:5001/api/users/${profile.user_id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((prev) => ({
          ...prev,
          ...data.user,
          profile_pic_url: data.user.profile_pic_url
            ? `http://localhost:5001${data.user.profile_pic_url}`
            : prev.profile_pic_url,
          coverphoto: data.user.coverphoto
            ? `http://localhost:5001${data.user.coverphoto}`
            : prev.coverphoto,
        }));
        localStorage.setItem("user", JSON.stringify(data.user));
        if (setUser) setUser(data.user);
        setShowEditProfile(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      alert("Server error occurred while updating profile.");
    }
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div style={styles.desktopPageBackground}>
      <div style={styles.desktopContainer}>
        {/* Cover Photo Banner */}
        <div style={styles.desktopCoverWrapper}>
          <img src={profile.coverphoto} alt="Cover" style={styles.coverImg} />
          <button
            type="button"
            onClick={handleBack}
            style={styles.backBtn}
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft size={18} color="#1f2937" />
          </button>
        </div>

        {/* Profile Content Body */}
        <div style={styles.desktopProfileBody}>
          <div style={styles.desktopHeaderRow}>
            <div
              style={{ display: "flex", gap: "24px", alignItems: "flex-end" }}
            >
              <div style={styles.desktopAvatarWrapper}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={profile.profile_pic_url}
                    alt="Profile"
                    style={styles.desktopProfileImg}
                  />
                </div>
              </div>

              {/* Name adjusted slightly downwards so cover photo won't cover it */}
              <div style={{ marginBottom: "5px", paddingTop: "10px" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <h2 style={styles.desktopUserName}>{profile.full_name}</h2>
                  {profile.is_verified ? (
                    <CheckCircle2 size={22} color="#00aa5b" fill="#00aa5b" />
                  ) : null}
                </div>
                <p style={styles.desktopUserTagline}>{profile.about}</p>
                <p style={styles.locationText}>
                  <MapPin size={14} color="#666" /> {profile.address},{" "}
                  {profile.nearest_city} &nbsp;|&nbsp; <Mail size={14} color="#666" />{" "}
                  {profile.email}
                </p>
              </div>
            </div>

            {isOwnProfile && (
              <div style={styles.desktopActionBtns}>
                <button
                  onClick={() => navigate("/add-item")}
                  style={styles.primaryBtn}
                >
                  <Plus size={16} /> {t("profile.addItem")}
                </button>
                <button
                  onClick={() => setShowEditProfile(true)}
                  style={styles.secondaryBtn}
                >
                  <Edit3 size={16} /> {t("profile.editProfile")}
                </button>
                <SettingsPopup />
              </div>
            )}
          </div>

          {/* Stats Bar Layout (Total Items, Trust Score, Reviews) */}
          <div style={styles.statsBarContainer}>
            <div
              onClick={() => {
                setActiveTab("shop");
                setTimeout(() => {
                  document.getElementById("profile-shop-section")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              style={{
                ...styles.statBox,
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: "12px",
                backgroundColor: activeTab === "shop" ? "#e6f7ef" : "transparent",
                transition: "all 0.2s ease",
              }}
              title="Click to view shop items"
              role="button"
              tabIndex={0}
            >
              <div style={styles.statIconBg}>
                <Package size={22} color="#00aa5b" />
              </div>
              <div>
                <span style={styles.statBoxVal}>{items.length}</span>
                <span style={styles.statBoxLbl}>Total Items</span>
              </div>
            </div>

            <div style={styles.statBoxDivider}></div>

            <div style={styles.statBox}>
              <div style={styles.statIconBg}>
                <CheckCircle2 size={22} color="#00aa5b" />
              </div>
              <div>
                <span style={styles.statBoxVal}>{profile.trust_score}%</span>
                <span style={styles.statBoxLbl}>Trust Score</span>
              </div>
            </div>

            <div style={styles.statBoxDivider}></div>

            <div
              onClick={() => {
                setActiveTab("reviews");
                setTimeout(() => {
                  document.getElementById("profile-reviews-section")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              style={{
                ...styles.statBox,
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: "12px",
                backgroundColor: activeTab === "reviews" ? "#e6f7ef" : "transparent",
                transition: "all 0.2s ease",
              }}
              title="Click to view customer reviews & comments"
              role="button"
              tabIndex={0}
            >
              <div style={styles.statIconBg}>
                <Star size={22} color="#00aa5b" fill="#00aa5b" />
              </div>
              <div>
                <span style={styles.statBoxVal}>
                  {profile.user_rating && profile.user_rating > 0
                    ? Number(profile.user_rating).toFixed(1)
                    : profile.reviews_count > 0
                    ? "5.0"
                    : "0.0"}
                </span>
                <span style={styles.statBoxLbl}>
                  {profile.reviews_count > 0
                    ? `from ${profile.reviews_count} ${
                        profile.reviews_count === 1 ? "review" : "reviews"
                      }`
                    : "from 0 reviews"}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div style={styles.desktopTabsRow}>
            <button
              onClick={() => setActiveTab("shop")}
              style={{
                ...styles.desktopTabBtn,
                ...(activeTab === "shop" ? styles.activeTabBtn : {}),
              }}
            >
              <Package size={16} /> {t("profile.myShopItems")} ({items.length})
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              style={{
                ...styles.desktopTabBtn,
                ...(activeTab === "reviews" ? styles.activeTabBtn : {}),
              }}
            >
              <Star size={16} /> {t("profile.reviews")} ({profile.reviews_count})
            </button>
          </div>

          {activeTab === "shop" && (
            <div style={{ marginTop: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#111",
                  }}
                >
                  My Items
                </h3>
                <span
                  onClick={() => navigate("/add-item")}
                  style={{
                    fontSize: "13px",
                    color: "#00aa5b",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  View All &rarr;
                </span>
              </div>

              {items.length === 0 ? (
                <div style={styles.emptyState}>{t("profile.noItems")}</div>
              ) : (
                <div style={styles.desktopItemsGrid}>
                  {items.map((item, idx) => {
                    const isRented = isItemRented(item);
                    return (
                      <div key={item.id || idx} style={styles.desktopItemCard}>
                        <div style={styles.itemImgContainer}>
                          <img
                            src={
                              item.image
                                ? item.image.startsWith("http")
                                  ? item.image
                                  : `http://localhost:5001${item.image}`
                                : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300"
                            }
                            alt={item.title}
                            style={styles.desktopItemImg}
                          />

                                                    {/* Availability Status Badge (Click to toggle) */}
                          <div
                            style={{
                              ...styles.badgeOverlay,
                              cursor: isOwnProfile ? "pointer" : "default",
                            }}
                            onClick={(e) => {
                              if (isOwnProfile) {
                                e.stopPropagation();
                                handleToggleStatus(item.id, isRented);
                              }
                            }}
                            title={isOwnProfile ? "Click to toggle availability" : ""}
                          >
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                                padding: "4px 10px",
                                borderRadius: "14px",
                                backgroundColor: isRented ? "#dc2626" : "#00aa5b",
                                color: "#ffffff",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                transition: "all 0.2s",
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: "#ffffff",
                                  display: "inline-block",
                                }}
                              />
                              {isRented ? "Rented Out" : "Available"}
                            </span>
                          </div>

                        </div>

                        <div style={{ padding: "14px" }}>
                          <h4
                            style={{
                              margin: "0 0 6px 0",
                              fontSize: "15px",
                              fontWeight: "bold",
                              color: "#222",
                            }}
                          >
                            {item.title}
                          </h4>

                          <p style={styles.itemPrice}>
                            Rs. {item.price}{" "}
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "normal",
                                color: "#666",
                              }}
                            >
                              / {item.priceType || "day"}
                            </span>
                          </p>

                          {/* Bookings & Views Indicators + Delete Button */}
                            <div style={styles.cardFooterMeta}>
                            <span style={styles.metaBadgeText}>
                            <Calendar size={13} color="#00aa5b" /> {item.bookings ?? 0} {item.bookings === 1 ? "booking" : "bookings"}
                            </span>
                            <span style={styles.metaBadgeText}>
                              <Eye size={13} color="#666" /> {item.views ?? 0} views
                            </span>
                          </div>

                                                    {isOwnProfile && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                              {/* Status Toggle Button (Available <-> Rented Out) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(item.id, isRented);
                                }}
                                style={{
                                  width: "100%",
                                  backgroundColor: isRented ? "#f0fdf4" : "#fef2f2",
                                  color: isRented ? "#16a34a" : "#dc2626",
                                  border: `1px solid ${isRented ? "#bbf7d0" : "#fecaca"}`,
                                  padding: "7px 10px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  transition: "all 0.2s",
                                }}
                                title="Click to change availability status"
                              >
                                {isRented ? (
                                  <>
                                    <CheckCircle2 size={14} color="#16a34a" /> Mark as Available
                                  </>
                                ) : (
                                  <>
                                    <Clock size={14} color="#dc2626" /> Mark as Rented Out
                                  </>
                                )}
                              </button>

                              {/* Delete Item Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id);
                                }}
                                style={styles.deleteBtn}
                              >
                                <Trash2 size={13} /> Delete Item
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div id="profile-reviews-section" style={{ marginTop: "24px" }}>
              {/* Reviews Summary Header Card */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "24px 28px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "20px",
                  marginBottom: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "18px",
                      backgroundColor: "#fef9c3",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #fef08a",
                    }}
                  >
                    <span style={{ fontSize: "24px", fontWeight: "800", color: "#a16207", lineHeight: 1 }}>
                      {profile.user_rating && profile.user_rating > 0
                        ? Number(profile.user_rating).toFixed(1)
                        : "0.0"}
                    </span>
                    <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={10}
                          color="#eab308"
                          fill={s <= Math.round(profile.user_rating || 0) ? "#eab308" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                      Customer Reviews & Ratings
                    </h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      Based on{" "}
                      <strong>
                        {profile.reviews_count || sellerReviews.length}{" "}
                        {profile.reviews_count === 1 ? "review" : "reviews"}
                      </strong>{" "}
                      from verified renters
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {loadingReviews ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  <p>Loading reviews...</p>
                </div>
              ) : sellerReviews.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    backgroundColor: "#f8fafc",
                    borderRadius: "16px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <Star size={40} color="#cbd5e1" style={{ marginBottom: "12px" }} />
                  <h4 style={{ margin: "0 0 6px 0", color: "#334155", fontSize: "16px" }}>
                    No reviews yet
                  </h4>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                    Reviews from customers who completed rentals will be featured here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {sellerReviews.slice(0, visibleProfileReviews).map((rev) => {
                    const buyerPic = rev.buyerPic
                      ? rev.buyerPic.startsWith("http")
                        ? rev.buyerPic
                        : `http://localhost:5001${rev.buyerPic}`
                      : null;

                    const itemImg = rev.itemImage
                      ? rev.itemImage.startsWith("http")
                        ? rev.itemImage
                        : `http://localhost:5001${rev.itemImage}`
                      : null;

                    const isMyReview =
                      loggedInUserId &&
                      Number(loggedInUserId) === Number(rev.buyerId);

                    return (
                      <div
                        key={rev.id}
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "16px",
                          padding: "20px 24px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                        }}
                      >
                        {/* Top Row: User info & Rating */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "10px",
                            marginBottom: "12px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {buyerPic ? (
                              <img
                                src={buyerPic}
                                alt={rev.buyerName}
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1px solid #e2e8f0",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius: "50%",
                                  backgroundColor: "#00aa5b",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "700",
                                  fontSize: "16px",
                                }}
                              >
                                {rev.buyerName ? rev.buyerName[0].toUpperCase() : "U"}
                              </div>
                            )}
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <h5 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                                  {rev.buyerName || "Verified Renter"}
                                </h5>
                                {isMyReview && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      color: "#0369a1",
                                      backgroundColor: "#e0f2fe",
                                      padding: "1px 6px",
                                      borderRadius: "10px",
                                    }}
                                  >
                                    You
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Recent Review"}
                                {rev.buyerCity ? ` • ${rev.buyerCity}` : ""}
                              </p>
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
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  color="#eab308"
                                  fill={star <= Number(rev.rating) ? "#eab308" : "none"}
                                />
                              ))}
                              <span style={{ marginLeft: "4px", fontSize: "13px", fontWeight: "700", color: "#b45309" }}>
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
                                    setEditingCustomerReview({
                                      ...rev,
                                      title: rev.itemTitle,
                                      itemTitle: rev.itemTitle,
                                      image: rev.itemImage,
                                      itemImage: rev.itemImage,
                                    })
                                  }
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    background: "#f0f9ff",
                                    border: "1px solid #bae6fd",
                                    color: "#0284c7",
                                    borderRadius: "6px",
                                    padding: "2px 7px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                  title="Edit your review"
                                >
                                  <Edit3 size={12} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomerReview(rev.id)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    background: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    color: "#ef4444",
                                    borderRadius: "6px",
                                    padding: "2px 7px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                  }}
                                  title="Delete your review"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Item Tag */}
                        {rev.itemTitle && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              backgroundColor: "#f8fafc",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              marginBottom: "12px",
                              fontSize: "12px",
                              color: "#475569",
                            }}
                          >
                            {itemImg && (
                              <img
                                src={itemImg}
                                alt={rev.itemTitle}
                                style={{ width: "20px", height: "20px", borderRadius: "4px", objectFit: "cover" }}
                              />
                            )}
                            <span>
                              Rented: <strong>{rev.itemTitle}</strong>
                            </span>
                          </div>
                        )}

                        {/* Comment text */}
                        {rev.comment ? (
                          <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: "1.5" }}>
                            "{rev.comment}"
                          </p>
                        ) : (
                          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>
                            (Rating only, no written comment provided)
                          </p>
                        )}

                        {/* Seller / Shop Response Display */}
                        {rev.sellerReply && editingReplyId !== rev.id && (
                          <div
                            style={{
                              marginTop: "14px",
                              backgroundColor: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              borderRadius: "12px",
                              padding: "14px 16px",
                              borderLeft: "4px solid #16a34a",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "6px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <CornerDownRight size={15} color="#15803d" />
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>
                                  Response from Shop Owner
                                </span>
                                {rev.sellerReplyAt && (
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                                    • {new Date(rev.sellerReplyAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                  </span>
                                )}
                              </div>

                              {isOwnProfile && (
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
                                      color: "#16a34a",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      padding: "2px 6px",
                                    }}
                                    title="Edit your reply"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReply(rev.id)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#ef4444",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      padding: "2px 6px",
                                    }}
                                    title="Delete your reply"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: "13px", color: "#1e293b", lineHeight: "1.5" }}>
                              {rev.sellerReply}
                            </p>
                          </div>
                        )}

                        {/* Reply Form (When Shop Owner clicks Reply or Edit) */}
                        {isOwnProfile && (replyingReviewId === rev.id || editingReplyId === rev.id) && (
                          <div
                            style={{
                              marginTop: "14px",
                              backgroundColor: "#f8fafc",
                              border: "1px solid #cbd5e1",
                              borderRadius: "12px",
                              padding: "14px",
                            }}
                          >
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                              {editingReplyId === rev.id ? "Edit your response:" : "Write a response to this customer:"}
                            </label>
                            <textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Thank the customer or address their feedback..."
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "13px",
                                fontFamily: "inherit",
                                resize: "vertical",
                                outline: "none",
                              }}
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
                                  border: "1px solid #cbd5e1",
                                  backgroundColor: "#ffffff",
                                  color: "#475569",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePostReply(rev.id)}
                                disabled={submittingReply || !replyText.trim()}
                                style={{
                                  padding: "6px 16px",
                                  borderRadius: "6px",
                                  border: "none",
                                  backgroundColor: "#00aa5b",
                                  color: "#ffffff",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: submittingReply || !replyText.trim() ? "not-allowed" : "pointer",
                                  opacity: submittingReply || !replyText.trim() ? 0.6 : 1,
                                }}
                              >
                                {submittingReply ? "Posting..." : "Post Reply"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Reply Button (When no reply yet and owner is viewing) */}
                        {isOwnProfile && !rev.sellerReply && replyingReviewId !== rev.id && (
                          <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(rev.id);
                                setEditingReplyId(null);
                                setReplyText("");
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #bbf7d0",
                                backgroundColor: "#f0fdf4",
                                color: "#16a34a",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <CornerDownRight size={14} />
                              <span>Reply to Review</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* See more reviews button (loads 3 more each time) */}
                  {sellerReviews.length > visibleProfileReviews && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={() => setVisibleProfileReviews((prev) => prev + 3)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: "#f0fdf4",
                          border: "1.5px solid #86efac",
                          color: "#15803d",
                          padding: "10px 24px",
                          borderRadius: "9999px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>See more reviews</span>
                        <span style={{ fontSize: "12px", opacity: 0.85 }}>
                          ({sellerReviews.length - visibleProfileReviews} remaining)
                        </span>
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* EDIT PROFILE POPUP */}
        {isOwnProfile && showEditProfile && (
          <div style={styles.modalOverlay}>
            <div style={styles.prettyModalBox}>
              <input
                type="file"
                ref={profileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleProfileImageChange}
              />
              <input
                type="file"
                ref={coverInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleCoverImageChange}
              />

              <div style={styles.prettyModalHeader}>
                <button
                  onClick={() => setShowEditProfile(false)}
                  style={styles.circleBackBtn}
                >
                  <X size={18} color="#333" />
                </button>
                <h3 style={styles.prettyModalTitle}>
                  {t("profile.editProfile")}
                </h3>
                <button onClick={handleSaveProfile} style={styles.topSaveBtn}>
                  {t("profile.save")}
                </button>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={styles.fieldLabel}>Cover Photo</label>
                <div
                  style={{
                    position: "relative",
                    height: "100px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor: "#ddd",
                  }}
                >
                  <img
                    src={profile.coverphoto}
                    alt="Cover Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current.click()}
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Camera size={12} color="#00aa5b" /> Change Cover
                  </button>
                </div>
              </div>

              <div style={styles.centerAvatarContainer}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={profile.profile_pic_url}
                    alt="Avatar"
                    style={styles.modalAvatarImg}
                  />
                  <button
                    onClick={() => profileInputRef.current.click()}
                    style={styles.modalCameraBtn}
                  >
                    <Camera size={15} color="#00aa5b" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={styles.formFieldsStack}>
                <div style={styles.twoColumnRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>
                      {t("profile.fullName")}
                    </label>
                    <div style={styles.inputWithIconWrapper}>
                      <User size={18} color="#777" style={styles.inputIcon} />
                      <input
                        style={styles.prettyInput}
                        type="text"
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>
                      {t("profile.username")}
                    </label>
                    <div style={styles.inputWithIconWrapper}>
                      <AtSign size={18} color="#777" style={styles.inputIcon} />
                      <input
                        style={styles.prettyInput}
                        type="text"
                        value={profile.username}
                        onChange={(e) =>
                          setProfile({ ...profile, username: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.twoColumnRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>
                      {t("profile.phoneNumber")}
                    </label>
                    <div style={styles.inputWithIconWrapper}>
                      <Phone size={18} color="#777" style={styles.inputIcon} />
                      <input
                        style={styles.prettyInput}
                        type="text"
                        value={profile.phone_no}
                        onChange={(e) =>
                          setProfile({ ...profile, phone_no: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>
                      {t("profile.email")}
                    </label>
                    <div style={styles.inputWithIconWrapper}>
                      <Mail size={18} color="#777" style={styles.inputIcon} />
                      <input
                        style={styles.prettyInput}
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.twoColumnRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Address</label>
                    <input
                      style={styles.prettyInputNoIcon}
                      type="text"
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Nearest City</label>
                    <input
                      style={styles.prettyInputNoIcon}
                      type="text"
                      value={profile.nearest_city}
                      onChange={(e) =>
                        setProfile({ ...profile, nearest_city: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.fieldLabel}>
                    {t("profile.aboutMe")}
                  </label>
                  <textarea
                    style={styles.prettyTextarea}
                    value={profile.about}
                    onChange={(e) =>
                      setProfile({ ...profile, about: e.target.value })
                    }
                  />
                </div>
              </form>
            </div>
          </div>
        )}
        {/* CUSTOMER EDIT REVIEW MODAL */}
        {editingCustomerReview && (
          <LeaveReviewModal
            isOpen={Boolean(editingCustomerReview)}
            onClose={() => setEditingCustomerReview(null)}
            item={editingCustomerReview}
            currentUser={loggedInUser}
            onReviewSubmitted={(updated) => {
              setSellerReviews((prev) => {
                const updatedList = prev.map((r) =>
                  r.id === updated.reviewId
                    ? { ...r, rating: updated.rating, comment: updated.comment }
                    : r
                );
                const total = updatedList.length;
                const avg =
                  total > 0
                    ? (
                        updatedList.reduce(
                          (acc, curr) => acc + Number(curr.rating),
                          0
                        ) / total
                      ).toFixed(1)
                    : 0;
                setProfile((p) => ({
                  ...p,
                  user_rating: Number(avg),
                  reviews_count: total,
                }));
                return updatedList;
              });
            }}
            onReviewDeleted={(deleted) => {
              setSellerReviews((prev) => {
                const updatedList = prev.filter(
                  (r) => r.id !== deleted.reviewId
                );
                const total = updatedList.length;
                const avg =
                  total > 0
                    ? (
                        updatedList.reduce(
                          (acc, curr) => acc + Number(curr.rating),
                          0
                        ) / total
                      ).toFixed(1)
                    : 0;
                setProfile((p) => ({
                  ...p,
                  user_rating: Number(avg),
                  reviews_count: total,
                }));
                return updatedList;
              });
            }}
            API_URL="http://localhost:5001"
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  desktopPageBackground: {
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    padding: "30px 20px",
    display: "flex",
    justifyContent: "center",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  desktopContainer: {
    marginBottom: "50px",
    width: "100%",
    maxWidth: "1100px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 4px 25px rgba(0,0,0,0.06)",
    border: "1px solid #eaeaea",
    paddingBottom: "30px",
  },
  desktopCoverWrapper: {
    position: "relative",
    height: "200px",
    backgroundColor: "#00aa5b",
  },
  backBtn: {
    position: "absolute",
    top: "16px",
    left: "16px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
  },
  coverImg: { width: "100%", height: "100%", objectFit: "cover" },
  desktopProfileBody: { padding: "0 35px" },
  desktopHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "-45px", // Adjusted so name sits nicely and isn't hidden by cover photo
    flexWrap: "wrap",
    gap: "20px",
  },
  desktopAvatarWrapper: { position: "relative" },
  desktopProfileImg: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "4px solid #ffffff",
    objectFit: "cover",
    backgroundColor: "#eee",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  desktopUserName: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111",
  },
  desktopUserTagline: { margin: "2px 0 4px 0", fontSize: "14px", color: "#555" },
  locationText: {
    margin: 0,
    fontSize: "12px",
    color: "#777",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  desktopActionBtns: { display: "flex", gap: "10px", alignItems: "center" },
  primaryBtn: {
    backgroundColor: "#e8f8f0", // Stats box eke thiyena light green background eka
    color: "#00aa5b", // Green color text
    border: "1px solid #c7e9d7", // Stats box eke border eka wageema
    padding: "10px 18px",
    borderRadius: "14px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
  },
  secondaryBtn: {
    backgroundColor: "#e8f8f0", // Eka wageema light green background eka
    color: "#00aa5b", // Green color text
    border: "1px solid #c7e9d7", // Border eka
    padding: "10px 18px",
    borderRadius: "14px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
  },
  
  statsBarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#e8f8f0",
    border: "1px solid #c7e9d7",
    borderRadius: "16px",
    padding: "16px",
    marginTop: "25px",
  },
  statBox: { display: "flex", alignItems: "center", gap: "12px" },
  statIconBg: {
    backgroundColor: "#ffffff",
    padding: "8px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
    display: "flex",
  },
  statBoxVal: {
    display: "block",
    fontSize: "17px",
    fontWeight: "bold",
    color: "#111",
  },
  statBoxLbl: { display: "block", fontSize: "12px", color: "#666" },
  statBoxDivider: { width: "1px", height: "32px", backgroundColor: "#c7e9d7" },
  desktopTabsRow: {
    display: "flex",
    borderBottom: "2px solid #f0f0f0",
    gap: "20px",
    marginTop: "25px",
  },
  desktopTabBtn: {
    padding: "10px 4px",
    border: "none",
    backgroundColor: "transparent",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#777",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    borderBottom: "3px solid transparent",
    marginBottom: "-2px",
  },
  activeTabBtn: { color: "#00aa5b", borderBottom: "3px solid #00aa5b" },
  desktopItemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },
  desktopItemCard: {
    backgroundColor: "#fff",
    border: "1px solid #eaeaea",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
  },
  itemImgContainer: {
    position: "relative",
    width: "100%",
    height: "150px",
    backgroundColor: "#f8f9fa",
  },
  desktopItemImg: { width: "100%", height: "100%", objectFit: "cover" },
  badgeOverlay: { position: "absolute", top: "10px", left: "10px" },
  itemPrice: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#00aa5b",
    margin: "4px 0 10px 0",
  },
  cardFooterMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "8px",
    marginBottom: "8px",
  },
  metaBadgeText: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#666",
  },
  deleteBtn: {
    width: "100%",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "6px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    transition: "background 0.2s",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#777",
    fontSize: "14px",
    backgroundColor: "#fafafa",
    borderRadius: "16px",
    border: "1px dashed #ddd",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  prettyModalBox: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "480px",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  prettyModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  prettyModalTitle: { margin: 0, fontSize: "18px", fontWeight: "bold" },
  circleBackBtn: {
    backgroundColor: "#f0f2f5",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  topSaveBtn: {
    backgroundColor: "#00aa5b",
    color: "#fff",
    border: "none",
    padding: "6px 16px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "13px",
    cursor: "pointer",
  },
  centerAvatarContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  modalAvatarImg: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00aa5b",
  },
  modalCameraBtn: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "50%",
    padding: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  formFieldsStack: { display: "flex", flexDirection: "column", gap: "14px" },
  twoColumnRow: { display: "flex", gap: "12px" },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "5px",
  },
  inputWithIconWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: { position: "absolute", left: "12px" },
  prettyInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  prettyInputNoIcon: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  prettyTextarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    minHeight: "80px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
};