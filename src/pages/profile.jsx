import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  AtSign
} from "lucide-react";

export default function Profile({ user, setUser }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    full_name: user?.full_name || "Pawan Madhuhansa",
    username: user?.username || "user_renthub",
    phone_no: user?.phone_no || "+94 77 123 4567",
    email: user?.email || "madhuhansapawan@gmail.com",
    address: user?.address || "Colombo, Sri Lanka",
    nearest_city: user?.nearest_city || "Colombo",
    about: user?.about || "Hi! I rent and sell quality items. Feel free to contact me!",
    trust_score: user?.user_rating ? user.user_rating * 20 : 92,
    reviews_count: user?.reviews_count || 12,
    likes_count: user?.likes_count || 68,
    profile_pic_url: user?.profile_pic_url ? `http://localhost:5001${user.profile_pic_url}` : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    coverphoto: user?.coverphoto ? `http://localhost:5001${user.coverphoto}` : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000",
    is_verified: user?.is_verified || 1
  });

  // Items List & User Posts States
  const [items, setItems] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [postImageFile, setPostImageFile] = useState(null);
  const postImageInputRef = useRef(null);

  useEffect(() => {
    fetchItems();
    fetchUserPosts();
  }, [profile.user_id]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/items/${profile.user_id}`);
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
      const res = await fetch(`http://localhost:5001/api/posts/${profile.user_id}`);
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
      const res = await fetch(`http://localhost:5001/api/items/status/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local state smoothly without reloading
        setItems(prevItems =>
          prevItems.map(item => item.id === itemId ? { ...item, available: newStatus } : item)
        );
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating item status:", err);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfile((prev) => ({ ...prev, profile_pic_url: URL.createObjectURL(file) }));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPicFile(file);
      setProfile((prev) => ({ ...prev, coverphoto: URL.createObjectURL(file) }));
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
      const res = await fetch(`http://localhost:5001/api/users/${profile.user_id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((prev) => ({
          ...prev,
          ...data.user,
          profile_pic_url: data.user.profile_pic_url ? `http://localhost:5001${data.user.profile_pic_url}` : prev.profile_pic_url,
          coverphoto: data.user.coverphoto ? `http://localhost:5001${data.user.coverphoto}` : prev.coverphoto
        }));
        localStorage.setItem('user', JSON.stringify(data.user));
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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("user_id", profile.user_id);
    formData.append("content", newPostContent);
    if (postImageFile) {
      formData.append("post_image", postImageFile);
    }

    try {
      const res = await fetch("http://localhost:5001/api/posts", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setNewPostContent("");
        setPostImageFile(null);
        fetchUserPosts();
      }
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  return (
    <div style={styles.desktopPageBackground}>
      <div style={styles.desktopContainer}>

        {/* Cover Photo Banner */}
        <div style={styles.desktopCoverWrapper}>
          <img src={profile.coverphoto} alt="Cover" style={styles.coverImg} />
        </div>

        {/* Profile Content Body */}
        <div style={styles.desktopProfileBody}>
          
          <div style={styles.desktopHeaderRow}>
            
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-end" }}>
              <div style={styles.desktopAvatarWrapper}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={profile.profile_pic_url} alt="Profile" style={styles.desktopProfileImg} />
                </div>
              </div>

              <div style={{ marginBottom: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={styles.desktopUserName}>{profile.full_name}</h2>
                  {profile.is_verified ? <CheckCircle2 size={22} color="#007bff" fill="#007bff" /> : null}
                </div>
                <p style={styles.desktopUserHandle}>@{profile.username}</p>
                <p style={styles.desktopUserTagline}>
                  Rent • Buy • Share | <span style={{ color: "#28a745", fontWeight: "bold" }}>✓ {t("profile.trustedSeller")}</span>
                </p>
              </div>
            </div>

            <div style={styles.desktopActionBtns}>
              <button onClick={() => navigate("/add-item")} style={styles.primaryBtn}>
                <Plus size={18} /> {t("profile.addItem")}
              </button>
              <button onClick={() => setShowEditProfile(true)} style={styles.secondaryBtn}>
                <Edit3 size={18} /> {t("profile.editProfile")}
              </button>
              <button style={styles.iconBtn}>
                <Settings size={18} color="#444" />
              </button>
            </div>

          </div>

          <div style={styles.desktopContactBar}>
            <div style={styles.contactItem}><Phone size={16} color="#007bff"/> {profile.phone_no}</div>
            <div style={styles.contactItem}><MapPin size={16} color="#007bff"/> {profile.address}, {profile.nearest_city}</div>
            <div style={styles.contactItem}><Mail size={16} color="#007bff"/> {profile.email}</div>
          </div>

          <div style={styles.desktopGridColumns}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={styles.trustScoreBox}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={styles.trustIconWrapper}>
                    <CheckCircle2 size={22} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>
                      <span style={{ color: "#007bff" }}>{t("profile.trustScore")}</span>
                      <span style={{ color: "#007bff" }}>{profile.trust_score}%</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{ ...styles.progressBarFill, width: `${profile.trust_score}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statValRow}>
                    <Star size={20} color="#ffc107" fill="#ffc107" />
                    <span style={styles.statNum}>{profile.reviews_count}</span>
                  </div>
                  <span style={styles.statLabel}>{t("profile.reviews")}</span>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValRow}>
                    <Heart size={20} color="#e63946" fill="#e63946" />
                    <span style={styles.statNum}>{profile.likes_count}</span>
                  </div>
                  <span style={styles.statLabel}>{t("profile.profileLikes")}</span>
                </div>
              </div>

            </div>

            <div style={{ flex: 1 }}>
              
              <div style={styles.desktopTabsRow}>
                <button 
                  onClick={() => setActiveTab("shop")}
                  style={{ ...styles.desktopTabBtn, ...(activeTab === "shop" ? styles.activeTabBtn : {}) }}
                >
                  {t("profile.myShopItems")} ({items.length})
                </button>
                <button 
                  onClick={() => setActiveTab("posts")}
                  style={{ ...styles.desktopTabBtn, ...(activeTab === "posts" ? styles.activeTabBtn : {}) }}
                >
                  Posts ({userPosts.length})
                </button>
                <button 
                  onClick={() => setActiveTab("reviews")}
                  style={{ ...styles.desktopTabBtn, ...(activeTab === "reviews" ? styles.activeTabBtn : {}) }}
                >
                  {t("profile.reviews")} ({profile.reviews_count})
                </button>
              </div>

              {activeTab === "shop" && (
                <div style={{ marginTop: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#111" }}>{t("profile.recentItems")}</h3>
                    <span style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>Total: {items.length} items</span>
                  </div>

                  {items.length === 0 ? (
                    <div style={styles.emptyState}>
                      {t("profile.noItems")}
                    </div>
                  ) : (
                    <div style={styles.desktopItemsGrid}>
                      {items.map((item, idx) => (
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
                            <span style={styles.itemCategoryBadge}>{item.category}</span>
                          </div>
                          
                          <div style={{ padding: "14px" }}>
                            <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: "bold", color: "#222" }}>{item.title}</h4>
                            
                            {/* Direct Availability Dropdown Selector inside card */}
                            <div style={{ margin: "6px 0 10px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "12px", color: "#666" }}>Status:</span>
                              <select 
                                value={item.available || "Available"}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  padding: "3px 6px",
                                  borderRadius: "6px",
                                  border: "1px solid #ddd",
                                  backgroundColor: item.available === "Rented Out" ? "#fff3cd" : "#d4edda",
                                  color: item.available === "Rented Out" ? "#856404" : "#155724",
                                  cursor: "pointer",
                                  outline: "none"
                                }}
                              >
                                <option value="Available">Available</option>
                                <option value="Rented Out">Rented Out</option>
                              </select>
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px solid #f0f0f0", paddingTop: "10px" }}>
                              <div>
                                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Price</span>
                                <p style={styles.itemPrice}>Rs. {item.price} <span style={{ fontSize: "11px", fontWeight: "normal", color: "#666" }}>/ {item.priceType || 'day'}</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "posts" && (
                <div style={{ marginTop: "20px", maxWidth: "600px" }}>
                  <div style={styles.createPostCard}>
                    <form onSubmit={handleCreatePost}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                        <img src={profile.profile_pic_url} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                        <textarea
                          style={styles.postInputBox}
                          placeholder="What's on your mind, rent & sell items?"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                        />
                      </div>

                      {postImageFile && (
                        <div style={{ position: "relative", marginBottom: "12px" }}>
                          <img src={URL.createObjectURL(postImageFile)} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }} />
                          <button type="button" onClick={() => setPostImageFile(null)} style={styles.removeImgBtn}>
                            <X size={14} color="#fff" />
                          </button>
                        </div>
                      )}

                      <input type="file" ref={postImageInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => setPostImageFile(e.target.files[0])} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: "10px" }}>
                        <button type="button" onClick={() => postImageInputRef.current.click()} style={styles.photoUploadBtn}>
                          <Camera size={18} color="#007bff" /> Add Photo
                        </button>
                        <button type="submit" style={styles.postSubmitBtn}>Post</button>
                      </div>
                    </form>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                    {userPosts.length === 0 ? (
                      <div style={styles.emptyState}>No posts yet. Share something with the community!</div>
                    ) : (
                      userPosts.map((post) => (
                        <div key={post.id} style={styles.feedCard}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <img src={profile.profile_pic_url} alt="Author" style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }} />
                            <div>
                              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>{profile.full_name}</h4>
                              <span style={{ fontSize: "11px", color: "#888" }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {post.content && <p style={{ fontSize: "14px", color: "#333", lineHeight: "1.5", margin: "0 0 10px 0" }}>{post.content}</p>}

                          {post.image && (
                            <img src={post.image} alt="Post Attachment" style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "8px", marginTop: "5px" }} />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* EDIT PROFILE POPUP */}
        {showEditProfile && (
          <div style={styles.modalOverlay}>
            <div style={styles.prettyModalBox}>
              
              <input type="file" ref={profileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfileImageChange} />
              <input type="file" ref={coverInputRef} style={{ display: "none" }} accept="image/*" onChange={handleCoverImageChange} />

              <div style={styles.prettyModalHeader}>
                <button onClick={() => setShowEditProfile(false)} style={styles.circleBackBtn}>
                  <X size={18} color="#333" />
                </button>
                <h3 style={styles.prettyModalTitle}>{t("profile.editProfile")}</h3>
                <button onClick={handleSaveProfile} style={styles.topSaveBtn}>
                  {t("profile.save")}
                </button>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={styles.fieldLabel}>Cover Photo</label>
                <div style={{ position: "relative", height: "100px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#ddd" }}>
                  <img src={profile.coverphoto} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button 
                    type="button" 
                    onClick={() => coverInputRef.current.click()} 
                    style={{ position: "absolute", bottom: "8px", right: "8px", backgroundColor: "#fff", border: "none", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Camera size={12} color="#007bff"/> Change Cover
                  </button>
                </div>
              </div>

              <div style={styles.centerAvatarContainer}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={profile.profile_pic_url} alt="Avatar" style={styles.modalAvatarImg} />
                  <button onClick={() => profileInputRef.current.click()} style={styles.modalCameraBtn}>
                    <Camera size={15} color="#007bff" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={styles.formFieldsStack}>
                <div style={styles.twoColumnRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>{t("profile.fullName")}</label>
                    <div style={styles.inputWithIconWrapper}>
                      <User size={18} color="#777" style={styles.inputIcon} />
                      <input 
                        style={styles.prettyInput} 
                        type="text" 
                        value={profile.full_name} 
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>{t("profile.username")}</label>
                    <div style={styles.inputWithIconWrapper}>
                      <AtSign size={18} color="#777" style={styles.inputIcon} />
                      <input 
                        style={styles.prettyInput} 
                        type="text" 
                        value={profile.username} 
                        onChange={(e) => setProfile({...profile, username: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.twoColumnRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>{t("profile.phoneNumber")}</label>
                    <div style={styles.inputWithIconWrapper}>
                      <Phone size={18} color="#777" style={styles.inputIcon} />
                      <input 
                        style={styles.prettyInput} 
                        type="text" 
                        value={profile.phone_no} 
                        onChange={(e) => setProfile({...profile, phone_no: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>{t("profile.email")}</label>
                    <div style={styles.inputWithIconWrapper}>
                      <Mail size={18} color="#777" style={styles.inputIcon} />
                      <input 
                        style={styles.prettyInput} 
                        type="email" 
                        value={profile.email} 
                        onChange={(e) => setProfile({...profile, email: e.target.value})} 
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
                      onChange={(e) => setProfile({...profile, address: e.target.value})} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Nearest City</label>
                    <input 
                      style={styles.prettyInputNoIcon} 
                      type="text" 
                      value={profile.nearest_city} 
                      onChange={(e) => setProfile({...profile, nearest_city: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.fieldLabel}>{t("profile.aboutMe")}</label>
                  <textarea 
                    style={styles.prettyTextarea} 
                    value={profile.about} 
                    onChange={(e) => setProfile({...profile, about: e.target.value})} 
                  />
                  <div style={styles.charCounter}>{profile.about.length}/200</div>
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
  desktopPageBackground: { backgroundColor: "#f4f6f8", minHeight: "100vh", padding: "30px 20px", display: "flex", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" },
  desktopContainer: { width: "100%", maxWidth: "1100px", backgroundColor: "#ffffff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 25px rgba(0,0,0,0.06)", border: "1px solid #eaeaea", paddingBottom: "30px" },
  desktopCoverWrapper: { position: "relative", height: "240px", backgroundColor: "#007bff" },
  coverImg: { width: "100%", height: "100%", objectFit: "cover" },
  desktopProfileBody: { padding: "0 35px" },
  desktopHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-60px", flexWrap: "wrap", gap: "20px" },
  desktopAvatarWrapper: { position: "relative" },
  desktopProfileImg: { width: "130px", height: "130px", borderRadius: "50%", border: "5px solid #ffffff", objectFit: "cover", backgroundColor: "#eee", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  desktopUserName: { margin: 0, fontSize: "26px", fontWeight: "bold", color: "#111" },
  desktopUserHandle: { margin: "2px 0 0 0", fontSize: "14px", color: "#666" },
  desktopUserTagline: { margin: "4px 0 0 0", fontSize: "13px", color: "#444" },
  desktopActionBtns: { display: "flex", gap: "10px", alignItems: "center" },
  desktopContactBar: { marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "30px", flexWrap: "wrap" },
  contactItem: { fontSize: "13px", color: "#444", display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" },
  desktopGridColumns: { display: "flex", gap: "30px", marginTop: "25px", flexWrap: "wrap" },
  trustScoreBox: { backgroundColor: "#eef6ff", border: "1px solid #d0e3ff", borderRadius: "16px", padding: "16px 20px", width: "280px", boxSizing: "border-box" },
  trustIconWrapper: { backgroundColor: "#007bff", borderRadius: "10px", padding: "8px", display: "flex" },
  progressBarBg: { width: "100%", height: "8px", backgroundColor: "#cce2ff", borderRadius: "4px", overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#007bff" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "280px" },
  statCard: { backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "16px", padding: "14px", textAlign: "center" },
  statValRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" },
  statNum: { fontSize: "18px", fontWeight: "bold", color: "#222" },
  statLabel: { fontSize: "12px", color: "#777" },
  primaryBtn: { backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  secondaryBtn: { backgroundColor: "#f0f2f5", color: "#333", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  iconBtn: { backgroundColor: "#f0f2f5", border: "none", padding: "10px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center" },
  desktopTabsRow: { display: "flex", borderBottom: "2px solid #f0f0f0", gap: "10px" },
  desktopTabBtn: { padding: "12px 20px", border: "none", backgroundColor: "transparent", fontWeight: "bold", fontSize: "14px", color: "#888", cursor: "pointer", borderBottom: "3px solid transparent" },
  activeTabBtn: { color: "#007bff", borderBottom: "3px solid #007bff" },
  desktopItemsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" },
  desktopItemCard: { backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" },
  itemImgContainer: { position: "relative", width: "100%", height: "160px", backgroundColor: "#f8f9fa" },
  desktopItemImg: { width: "100%", height: "100%", objectFit: "cover" },
  itemCategoryBadge: { position: "absolute", top: "10px", left: "10px", backgroundColor: "rgba(0, 123, 255, 0.9)", color: "#fff", fontSize: "10px", fontWeight: "bold", padding: "4px 8px", borderRadius: "6px", textTransform: "uppercase" },
  itemPrice: { fontSize: "15px", fontWeight: "bold", color: "#111", margin: 0 },
  emptyState: { padding: "40px", textAlign: "center", color: "#777", fontSize: "14px", backgroundColor: "#fafafa", borderRadius: "16px", border: "1px dashed #ddd" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  prettyModalBox: { backgroundColor: "#fff", width: "100%", maxWidth: "480px", borderRadius: "20px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
  prettyModalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  prettyModalTitle: { margin: 0, fontSize: "18px", fontWeight: "bold" },
  circleBackBtn: { backgroundColor: "#f0f2f5", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  topSaveBtn: { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" },
  centerAvatarContainer: { display: "flex", justifyContent: "center", marginBottom: "20px" },
  modalAvatarImg: { width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "3px solid #007bff" },
  modalCameraBtn: { position: "absolute", bottom: "0", right: "0", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "50%", padding: "6px", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  formFieldsStack: { display: "flex", flexDirection: "column", gap: "14px" },
  twoColumnRow: { display: "flex", gap: "12px" },
  fieldLabel: { display: "block", fontSize: "12px", fontWeight: "bold", color: "#555", marginBottom: "5px" },
  inputWithIconWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "12px" },
  prettyInput: { width: "100%", padding: "10px 12px 10px 38px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  prettyInputNoIcon: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  prettyTextarea: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", minHeight: "80px", boxSizing: "border-box", fontFamily: "inherit" },
  charCounter: { fontSize: "11px", color: "#888", textAlign: "right", marginTop: "2px" },
  createPostCard: { backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", marginBottom: "20px" },
  postInputBox: { width: "100%", border: "none", outline: "none", resize: "none", fontSize: "14px", fontFamily: "inherit", minHeight: "50px", paddingTop: "8px" },
  photoUploadBtn: { background: "none", border: "none", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontSize: "13px", color: "#007bff", cursor: "pointer" },
  postSubmitBtn: { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "6px 20px", borderRadius: "8px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" },
  feedCard: { backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }
};