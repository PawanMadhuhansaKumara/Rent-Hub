import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  Phone,
  MapPin,
  Mail,
  Star,
  Heart,
  Plus,
  Edit3,
  Settings,
  X,
  User,
  AtSign,
  ArrowLeft,
  Package,
  Calendar,
  Eye,
  Trash2,
} from "lucide-react";
import SettingsPopup from "../components/SettingsPopup";

const isItemRented = (item) => {
  if (!item) return false;

  const directRented =
    item.available === "Rented Out" ||
    String(item.available).toLowerCase() === "rented out" ||
    String(item.available).toLowerCase() === "rented" ||
    item.available === 0 ||
    item.available === "0" ||
    String(item.status).toLowerCase() === "rented" ||
    (item.available !== undefined &&
      item.available !== null &&
      item.available !== "" &&
      !isNaN(Number(item.available)) &&
      Number(item.available) < 1);

  if (directRented) return true;

  try {
    const saved = localStorage.getItem("rent_hub_requests");
    if (saved) {
      const requests = JSON.parse(saved);
      if (Array.isArray(requests)) {
        return requests.some((r) => {
          const matchItem = String(r.itemId || r.item_id) === String(item.id);
          const isRentedStatus = String(r.status).toLowerCase() === "rented";
          return matchItem && isRentedStatus;
        });
      }
    }
  } catch {}

  return false;
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
            <div style={styles.statBox}>
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

            <div style={styles.statBox}>
              <div style={styles.statIconBg}>
                <Star size={22} color="#00aa5b" fill="#00aa5b" />
              </div>
              <div>
                <span style={styles.statBoxVal}>{profile.reviews_count}</span>
                <span style={styles.statBoxLbl}>Revives</span>
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

                          {/* Availability Status Badge */}
                          <div style={styles.badgeOverlay}>
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
                              <Calendar size={13} color="#00aa5b" /> {item.bookings || 2} bookings
                            </span>
                            <span style={styles.metaBadgeText}>
                              <Eye size={13} color="#666" /> {item.views || 124}
                            </span>
                          </div>

                          {isOwnProfile && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              style={styles.deleteBtn}
                            >
                              <Trash2 size={13} /> Delete Item
                            </button>
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
            <div
              style={{
                marginTop: "20px",
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#fafafa",
                borderRadius: "16px",
                border: "1px dashed #ddd",
              }}
            >
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                Customer reviews and ratings will be listed here.
              </p>
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