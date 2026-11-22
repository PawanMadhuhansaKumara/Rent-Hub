import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import LeaveReviewModal from "../components/LeaveReviewModal";
import MapLocationPickerModal from "../components/MapLocationPickerModal";
import ShopDistanceModal from "../components/ShopDistanceModal";
import CashPointsTopupModal from "../components/CashPointsTopupModal";
import TrustScoreModal from "../components/TrustScoreModal";
import {
  ProfileHeader,
  ProfileStatsBar,
  ProfileTabsNav,
  ProfileShopTab,
  ProfileReviewsTab,
  ProfileHistoryTab,
  EditProfileModal,
} from "../components/profile";
import "../components/profile/Profile.css";

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
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);

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
    map_latitude: user?.map_latitude ? parseFloat(user.map_latitude) : null,
    map_longitude: user?.map_longitude ? parseFloat(user.map_longitude) : null,
    map_location_name: user?.map_location_name || "",
    about: user?.about || "Rent smarter. Live better.",
    trust_score:
      user?.trust_score !== undefined
        ? user.trust_score
        : user?.user_rating
          ? user.user_rating * 20
          : 50,
    max_rental_limit: user?.rental_limit || user?.max_rental_limit || 1000,
    cash_points: user?.cash_points !== undefined ? Number(user.cash_points) : 0,
    reviews_count: user?.reviews_count || 12,
    likes_count: user?.likes_count || 68,
    profile_pic_url: user?.profile_pic_url
      ? user.profile_pic_url.startsWith("http")
        ? user.profile_pic_url
        : `http://localhost:5001${user.profile_pic_url}`
      : "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300",
    coverphoto: user?.coverphoto
      ? user.coverphoto.startsWith("http")
        ? user.coverphoto
        : `http://localhost:5001${user.coverphoto}`
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
  // Rental history (only shown on the logged-in user's own profile)
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const handlePostReply = async (reviewId) => {
    if (!replyText.trim()) return;
    const sellerId = profile.user_id;

    setSubmittingReply(true);
    try {
      const res = await fetch(
        `http://localhost:5001/api/reviews/${reviewId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sellerId,
            reply: replyText.trim(),
          }),
        },
      );

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
              : r,
          ),
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
    if (
      !window.confirm(
        "Are you sure you want to delete your response to this review?",
      )
    )
      return;
    const sellerId = profile.user_id;

    try {
      const res = await fetch(
        `http://localhost:5001/api/reviews/${reviewId}/reply`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerId }),
        },
      );

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
              : r,
          ),
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
                    0,
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

  // Load completed rental history as both buyer and seller automatically.
  useEffect(() => {
    if (activeTab !== "history" || !isOwnProfile) return;

    const fetchRentalHistory = async () => {
      setLoadingHistory(true);
      setHistoryError("");

      // Helper to read local completed/returned/handed-over requests
      const getLocalHistory = () => {
        try {
          const raw = localStorage.getItem("rent_hub_requests");
          if (!raw) return [];
          const allReqs = JSON.parse(raw);
          if (!Array.isArray(allReqs)) return [];

          const currentUserId = profile.user_id || user?.id || user?.user_id;

          return allReqs
            .filter((r) => {
              const status = r.status?.toLowerCase();
              return (
                status === "completed" ||
                status === "returned" ||
                status === "return_pending"
              );
            })
            .map((r) => {
              const isBuyer =
                Number(r.buyerId || r.buyer_id) === Number(currentUserId) ||
                (!r.sellerId && !r.seller_id) ||
                r.reqType === "sent";

              return {
                transactionId: r.id || r.requestId || `${r.itemId}-${r.id}`,
                itemId: r.itemId || r.item_id,
                itemTitle: r.itemTitle || r.item_title || "Rental item",
                itemImage: r.itemImage || r.item_image || r.image,
                startDate: r.startDate || r.start_date,
                endDate: r.endDate || r.end_date,
                quantity: r.quantity || 1,
                totalDays: r.totalDays || r.total_days || 1,
                totalPrice: r.totalPrice || r.total_price || 0,
                status: r.status || "Completed",
                trustRating: r.trust_rating || r.trustRating || 10,
                otherUserName: isBuyer
                  ? r.sellerName || r.seller_name || "Shop Owner"
                  : r.buyerName || r.buyer_name || r.requesterName || "Customer",
                otherUserPhone: isBuyer ? r.sellerPhone : r.buyerPhone,
                otherUserPic: isBuyer ? r.sellerPic : r.buyerPic,
                historyType: isBuyer ? "buyer" : "seller",
                completedAt:
                  r.completedAt ||
                  r.updatedAt ||
                  r.updated_at ||
                  r.createdAt ||
                  r.created_at ||
                  new Date().toISOString(),
              };
            });
        } catch (e) {
          console.warn("Failed to parse local history:", e);
          return [];
        }
      };

      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");

        let apiList = [];
        if (token) {
          const headers = { Authorization: `Bearer ${token}` };
          const [buyerRes, sellerRes] = await Promise.allSettled([
            fetch("http://localhost:5001/api/rent-requests/history/buyer", {
              headers,
            }),
            fetch("http://localhost:5001/api/rent-requests/history/seller", {
              headers,
            }),
          ]);

          if (buyerRes.status === "fulfilled" && buyerRes.value.ok) {
            const bData = await buyerRes.value.json();
            if (bData.success && Array.isArray(bData.history)) {
              apiList.push(
                ...bData.history.map((rental) => ({
                  ...rental,
                  historyType: "buyer",
                }))
              );
            }
          }

          if (sellerRes.status === "fulfilled" && sellerRes.value.ok) {
            const sData = await sellerRes.value.json();
            if (sData.success && Array.isArray(sData.history)) {
              apiList.push(
                ...sData.history.map((rental) => ({
                  ...rental,
                  historyType: "seller",
                }))
              );
            }
          }
        }

        const localList = getLocalHistory();

        // Merge backend records with local records, keyed by transactionId
        const historyMap = new Map();
        [...apiList, ...localList].forEach((item) => {
          const key = String(item.transactionId || item.id);
          if (!historyMap.has(key)) {
            historyMap.set(key, item);
          } else {
            historyMap.set(key, { ...historyMap.get(key), ...item });
          }
        });

        const combinedHistory = Array.from(historyMap.values()).sort(
          (a, b) => {
            const dateA = new Date(a.completedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.completedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
          }
        );

        setRentalHistory(combinedHistory);
      } catch (error) {
        console.error("Fetch rental history error:", error);
        const localOnly = getLocalHistory();
        if (localOnly.length > 0) {
          setRentalHistory(localOnly);
        } else {
          setRentalHistory([]);
          setHistoryError("Unable to load rental history.");
        }
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchRentalHistory();

    const handleUpdate = () => fetchRentalHistory();
    window.addEventListener("rent_requests_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("rent_requests_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [activeTab, isOwnProfile, profile.user_id, user?.id, user?.user_id]);

  // Fetch profile user data from backend (both for own profile and public view)
  useEffect(() => {
    const targetUserId = paramUserId || user?.user_id || user?.id;
    if (targetUserId) {
      fetch(`http://localhost:5001/api/users/${targetUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const u = data.user;
            setProfile((prev) => ({
              ...prev,
              user_id: u.user_id,
              full_name: u.full_name || prev.full_name || "RentHub Shop",
              username: u.username || prev.username || "",
              phone_no: u.phone_no || prev.phone_no || "",
              email: u.email || prev.email || "",
              address: u.address || prev.address || "",
              nearest_city: u.nearest_city || prev.nearest_city || "",
              map_latitude: u.map_latitude ? parseFloat(u.map_latitude) : prev.map_latitude,
              map_longitude: u.map_longitude ? parseFloat(u.map_longitude) : prev.map_longitude,
              map_location_name: u.map_location_name || prev.map_location_name || "",
              about: u.about || prev.about || "Rent smarter. Live better.",
              trust_score:
                u.trust_score !== undefined
                  ? u.trust_score
                  : u.user_rating
                    ? u.user_rating * 20
                    : prev.trust_score || 50,
              max_rental_limit: u.max_rental_limit || prev.max_rental_limit || 1000,
              avg_trust_rating: u.avg_trust_rating || prev.avg_trust_rating || 10,
              reviews_count: u.reviews_count || prev.reviews_count || 0,
              likes_count: u.likes_count || prev.likes_count || 0,
              profile_pic_url: u.profile_pic_url
                ? u.profile_pic_url.startsWith("http")
                  ? u.profile_pic_url
                  : `http://localhost:5001${u.profile_pic_url}`
                : prev.profile_pic_url,
              coverphoto: u.coverphoto
                ? u.coverphoto.startsWith("http")
                  ? u.coverphoto
                  : `http://localhost:5001${u.coverphoto}`
                : prev.coverphoto,
              cash_points:
                u.cash_points !== undefined ? Number(u.cash_points) : prev.cash_points || 0,
              is_verified: u.is_verified ?? prev.is_verified ?? 0,
            }));
            if (isOwnProfile && setUser) {
              setUser(data.user);
              localStorage.setItem("user", JSON.stringify(data.user));
            }
          }
        })
        .catch((err) => console.error("Fetch profile data error:", err));
    } else if (isOwnProfile && user) {
      setProfile((prev) => ({
        ...prev,
        user_id: user.user_id,
        full_name: user.full_name || prev.full_name || "RentHub Shop",
        username: user.username || prev.username || "",
        phone_no: user.phone_no || prev.phone_no || "",
        email: user.email || prev.email || "",
        address: user.address || prev.address || "",
        nearest_city: user.nearest_city || prev.nearest_city || "",
        about: user.about || prev.about,
      }));
    }
  }, [paramUserId, isOwnProfile, user?.user_id, user?.id]);

  // Live Trust Score loader from backend (ensures accurate calculation)
  useEffect(() => {
    const targetId = paramUserId || user?.user_id || user?.id;
    if (targetId) {
      fetch(`http://localhost:5001/api/users/${targetId}/trust-score`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProfile((prev) => ({
              ...prev,
              trust_score: data.trustScore,
              max_rental_limit: data.maxRentalLimit,
              completed_rentals: data.completedRentals,
              avg_trust_rating: data.avgTrustRating,
            }));
          }
        })
        .catch(() => {});
    }
  }, [paramUserId, user]);

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
          : it,
      ),
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
    if (profile.map_latitude !== null && profile.map_latitude !== undefined) {
      formData.append("map_latitude", profile.map_latitude);
    }
    if (profile.map_longitude !== null && profile.map_longitude !== undefined) {
      formData.append("map_longitude", profile.map_longitude);
    }
    if (profile.map_location_name) {
      formData.append("map_location_name", profile.map_location_name);
    }

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
            ? data.user.profile_pic_url.startsWith("http")
              ? data.user.profile_pic_url
              : `http://localhost:5001${data.user.profile_pic_url}`
            : prev.profile_pic_url,
          coverphoto: data.user.coverphoto
            ? data.user.coverphoto.startsWith("http")
              ? data.user.coverphoto
              : `http://localhost:5001${data.user.coverphoto}`
            : prev.coverphoto,
        }));
        localStorage.setItem("user", JSON.stringify(data.user));
        if (setUser) setUser(data.user);
        setShowEditProfile(false);
        window.dispatchEvent(new Event("items_updated"));
        window.dispatchEvent(new Event("user_updated"));
        window.dispatchEvent(new Event("storage"));
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
    <div className="profile-page-wrapper">
      <div className="profile-main-card">
        {/* Profile Header (Avatar, Info, Map badge & Action buttons) */}
        <ProfileHeader
          handleBack={handleBack}
          isOwnProfile={isOwnProfile}
          profile={profile}
          setShowMapPicker={setShowMapPicker}
          setShowDistanceModal={setShowDistanceModal}
          navigate={navigate}
          setShowEditProfile={setShowEditProfile}
          t={t}
        />

        {/* 4-Stat Box Bar */}
        <ProfileStatsBar
          items={items}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          isOwnProfile={isOwnProfile}
          setShowTopupModal={setShowTopupModal}
          onOpenTrustScore={() => setShowTrustModal(true)}
          styles={styles}
        />

        {/* Tabs Navigation */}
        <ProfileTabsNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          items={items}
          itemsCount={items.length}
          sellerReviews={sellerReviews}
          reviewsCount={profile.reviews_count || sellerReviews.length}
          profile={profile}
          isOwnProfile={isOwnProfile}
          styles={styles}
          t={t}
        />

        {/* Tab 1: Shop Items Grid */}
        {activeTab === "shop" && (
          <ProfileShopTab
            items={items}
            isOwnProfile={isOwnProfile}
            isItemRented={isItemRented}
            handleToggleStatus={handleToggleStatus}
            handleDeleteItem={handleDeleteItem}
            styles={styles}
            t={t}
          />
        )}

        {/* Tab 2: Reviews */}
        {activeTab === "reviews" && (
          <ProfileReviewsTab
            sellerReviews={sellerReviews}
            profile={profile}
            loadingReviews={loadingReviews}
            visibleProfileReviews={visibleProfileReviews}
            setVisibleProfileReviews={setVisibleProfileReviews}
            isOwnProfile={isOwnProfile}
            loggedInUserId={loggedInUserId}
            loggedInUser={loggedInUser}
            replyingReviewId={replyingReviewId}
            setReplyingReviewId={setReplyingReviewId}
            editingReplyId={editingReplyId}
            setEditingReplyId={setEditingReplyId}
            replyText={replyText}
            setReplyText={setReplyText}
            submittingReply={submittingReply}
            handlePostReply={handlePostReply}
            handleDeleteReply={handleDeleteReply}
            setEditingCustomerReview={setEditingCustomerReview}
            handleDeleteCustomerReview={handleDeleteCustomerReview}
            styles={styles}
            t={t}
          />
        )}

        {/* Tab 3: Rental History */}
        {activeTab === "history" && isOwnProfile && (
          <ProfileHistoryTab
            rentalHistory={rentalHistory}
            loadingHistory={loadingHistory}
            historyError={historyError}
            styles={styles}
            t={t}
          />
        )}

        {/* Edit Profile Modal */}
        {isOwnProfile && showEditProfile && (
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            profile={profile}
            setProfile={setProfile}
            profileInputRef={profileInputRef}
            coverInputRef={coverInputRef}
            handleProfileImageChange={handleProfileImageChange}
            handleCoverImageChange={handleCoverImageChange}
            handleSaveProfile={handleSaveProfile}
            setShowMapPicker={setShowMapPicker}
            t={t}
          />
        )}

        {/* Trust Score & Limits Modal */}
        {showTrustModal && (
          <TrustScoreModal
            isOpen={showTrustModal}
            onClose={() => setShowTrustModal(false)}
            userId={paramUserId || user?.user_id || user?.id}
            trustScore={profile.trust_score}
            rentalLimit={profile.max_rental_limit}
            completedRentals={profile.completed_rentals}
            avgTrustRating={profile.avg_trust_rating}
          />
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
                    : r,
                );
                const total = updatedList.length;
                const avg =
                  total > 0
                    ? (
                        updatedList.reduce(
                          (acc, curr) => acc + Number(curr.rating),
                          0,
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
                  (r) => r.id !== deleted.reviewId,
                );
                const total = updatedList.length;
                const avg =
                  total > 0
                    ? (
                        updatedList.reduce(
                          (acc, curr) => acc + Number(curr.rating),
                          0,
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

        {/* SHOP OWNER MAP LOCATION PICKER MODAL */}
        {showMapPicker && (
          <MapLocationPickerModal
            isOpen={showMapPicker}
            onClose={() => setShowMapPicker(false)}
            initialLat={profile.map_latitude}
            initialLng={profile.map_longitude}
            initialName={profile.map_location_name || profile.address}
            userId={profile.user_id}
            onLocationSaved={(newLoc) => {
              setProfile((prev) => ({
                ...prev,
                ...newLoc,
              }));
            }}
          />
        )}

        {/* CUSTOMER/VISITOR SHOP DISTANCE & ROUTE MODAL (UBER STYLE) */}
        {showDistanceModal && (
          <ShopDistanceModal
            isOpen={showDistanceModal}
            onClose={() => setShowDistanceModal(false)}
            shopData={{
              map_latitude: profile.map_latitude,
              map_longitude: profile.map_longitude,
              map_location_name: profile.map_location_name,
              name: profile.full_name,
              address: profile.address,
              nearest_city: profile.nearest_city,
            }}
          />
        )}
        {/* CASH POINTS TOP-UP MODAL (VIA GATEWAY - ONLY FOR PROFILE OWNER) */}
        {showTopupModal && isOwnProfile && (
          <CashPointsTopupModal
            isOpen={showTopupModal}
            onClose={() => setShowTopupModal(false)}
            currentUser={user}
            currentBalance={profile.cash_points || 0}
            onSuccess={(newPoints) => {
              setProfile((prev) => ({
                ...prev,
                cash_points: newPoints,
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  desktopPageBackground: {
    backgroundColor: "var(--bg-card-hover)",
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
    backgroundColor: "var(--bg-card)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 4px 25px rgba(0,0,0,0.06)",
    border: "1px solid var(--border-light)",
    paddingBottom: "30px",
  },
  desktopCoverWrapper: {
    position: "relative",
    height: "200px",
    backgroundColor: "var(--primary)",
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
    alignItems: "flex-start",
    marginTop: "0px",
    flexWrap: "wrap",
    gap: "20px",
  },
  desktopAvatarWrapper: {
    position: "relative",
    marginTop: "-60px",
    zIndex: 2,
    flexShrink: 0,
  },
  desktopProfileImg: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "4px solid var(--border-light)",
    objectFit: "cover",
    backgroundColor: "var(--bg-card-hover)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  desktopUserName: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
    color: "var(--text-main)",
  },
  desktopUserTagline: {
    margin: "2px 0 4px 0",
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
  locationText: {
    margin: 0,
    fontSize: "12px",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  desktopActionBtns: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    paddingTop: "12px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    backgroundColor: "var(--badge-green-bg)", // Stats box eke thiyena light green background eka
    color: "var(--primary)", // Green color text
    border: "1px solid var(--badge-green-border)", // Stats box eke border eka wageema
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
    backgroundColor: "var(--badge-green-bg)", // Eka wageema light green background eka
    color: "var(--primary)", // Green color text
    border: "1px solid var(--badge-green-border)", // Border eka
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
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px",
    alignItems: "center",
    backgroundColor: "var(--badge-green-bg)",
    border: "1px solid var(--badge-green-border)",
    borderRadius: "16px",
    padding: "14px 16px",
    marginTop: "25px",
    boxSizing: "border-box",
    width: "100%",
  },
  statBox: { display: "flex", alignItems: "center", gap: "12px" },
  statIconBg: {
    backgroundColor: "var(--bg-card)",
    padding: "8px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
    display: "flex",
  },
  statBoxVal: {
    display: "block",
    fontSize: "17px",
    fontWeight: "bold",
    color: "var(--text-main)",
  },
  statBoxLbl: { display: "block", fontSize: "12px", color: "var(--text-muted)" },
  statBoxDivider: { width: "1px", height: "32px", backgroundColor: "var(--badge-green-border)" },
  desktopTabsRow: {
    display: "flex",
    borderBottom: "2px solid var(--bg-card-hover)",
    gap: "20px",
    marginTop: "25px",
  },
  desktopTabBtn: {
    padding: "10px 4px",
    border: "none",
    backgroundColor: "transparent",
    fontWeight: "bold",
    fontSize: "14px",
    color: "var(--text-muted)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    borderBottom: "3px solid transparent",
    marginBottom: "-2px",
  },
  activeTabBtn: { color: "var(--primary)", borderBottom: "3px solid var(--primary)" },
  desktopItemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },
  desktopItemCard: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-light)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
  },
  itemImgContainer: {
    position: "relative",
    width: "100%",
    height: "150px",
    backgroundColor: "var(--bg-card-hover)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  desktopItemImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
    padding: "4px",
    boxSizing: "border-box",
  },
  badgeOverlay: { position: "absolute", top: "10px", left: "10px" },
  itemPrice: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "var(--primary)",
    margin: "4px 0 10px 0",
  },
  cardFooterMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid var(--bg-card-hover)",
    paddingTop: "8px",
    marginBottom: "8px",
  },
  metaBadgeText: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  deleteBtn: {
    width: "100%",
    backgroundColor: "var(--badge-red-bg)",
    color: "var(--badge-red-text)",
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
    color: "var(--text-muted)",
    fontSize: "14px",
    backgroundColor: "var(--bg-card-hover)",
    borderRadius: "16px",
    border: "1px dashed var(--border-light)",
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
    backgroundColor: "var(--bg-card)",
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
    backgroundColor: "var(--bg-card-hover)",
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
    backgroundColor: "var(--primary)",
    color: "var(--text-inverse)",
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
    border: "3px solid var(--primary)",
  },
  modalCameraBtn: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-light)",
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
    color: "var(--text-secondary)",
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
    border: "1px solid var(--border-light)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  prettyInputNoIcon: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid var(--border-light)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  prettyTextarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid var(--border-light)",
    fontSize: "14px",
    outline: "none",
    minHeight: "80px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
};
