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
  Tv,
  Armchair,
  Car,
  Wrench,
  Trophy,
  Package,
  X,
  User,
  AtSign,
  MoreVertical,
  ChevronDown
} from "lucide-react";

export default function Profile({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("shop");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAllShopItems, setShowAllShopItems] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Hidden File Input References
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Profile State
  const [profile, setProfile] = useState({
    userId: user?.user_id || user?.id || localStorage.getItem("userId") || 1,
    fullName: user?.full_name || user?.fullName || "Pawan Madhuhansa",
    username: user?.username || "user_renthub",
    phone: user?.phone_no || user?.phone || "+94 77 123 4567",
    email: user?.email || "madhuhansapawan@gmail.com",
    location: user?.address || user?.location || "Colombo, Sri Lanka",
    about: user?.about || "Hi! I rent and sell quality items. Feel free to contact me!",
    trustScore: user?.trust_score || 92,
    reviewsCount: user?.reviews_count || 12,
    likesCount: user?.likes_count || 68,
    profilePic: user?.profile_pic_url ? `http://localhost:5001${user.profile_pic_url}` : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    coverPic: user?.cover_pic_url ? `http://localhost:5001${user.cover_pic_url}` : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000",
  });

  // Items List (Filtered for this logged-in user only)
  const [items, setItems] = useState([]);

  useEffect(() => {
    // localStorage එකෙන් userId එක ලබා ගැනීම
    const currentUserId = localStorage.getItem("userId");
    
    if (currentUserId) {
      fetchUserItems(currentUserId);
    }
  }, []);

  // Login වුණු User ගේ Items පමණක් Fetch කර ගැනීම
  const fetchUserItems = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/items/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching user items:", err);
    }
  };
  // Image Upload Handlers
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, profilePic: URL.createObjectURL(file) }));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, coverPic: URL.createObjectURL(file) }));
    }
  };

  const categoriesList = [
    { name: t("profile.categories.electronics"), key: "Electronics", icon: Tv },
    { name: t("profile.categories.furniture"), key: "Furniture", icon: Armchair },
    { name: t("profile.categories.vehicles"), key: "Vehicles", icon: Car },
    { name: t("profile.categories.tools"), key: "Tools", icon: Wrench },
    { name: t("profile.categories.sports"), key: "Sports", icon: Trophy },
    { name: t("profile.categories.others"), key: "Others", icon: Package },
  ];

  const getCategoryCount = (catKey) => {
    return items.filter((i) => i.category === catKey).length;
  };

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <div style={styles.desktopPageBackground}>
      <div style={styles.desktopContainer}>
        
        {/* Hidden Inputs */}
        <input type="file" ref={profileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfileImageChange} />
        <input type="file" ref={coverInputRef} style={{ display: "none" }} accept="image/*" onChange={handleCoverImageChange} />

        {/* Cover Photo Banner */}
        <div style={styles.desktopCoverWrapper}>
          <img src={profile.coverPic} alt="Cover" style={styles.coverImg} />
          <button onClick={() => coverInputRef.current.click()} style={styles.cameraCoverBtn}>
            <Camera size={18} color="#333" />
          </button>
        </div>

        {/* Profile Content Body */}
        <div style={styles.desktopProfileBody}>
          
          <div style={styles.desktopHeaderRow}>
            
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-end" }}>
              <div style={styles.desktopAvatarWrapper}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={profile.profilePic} alt="Profile" style={styles.desktopProfileImg} />
                  <button onClick={() => profileInputRef.current.click()} style={styles.desktopCameraAvatarBtn}>
                    <Camera size={16} color="#fff" />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={styles.desktopUserName}>{profile.fullName}</h2>
                  <CheckCircle2 size={22} color="#007bff" fill="#007bff" />
                </div>
                <p style={styles.desktopUserHandle}>@{profile.username}</p>
                <p style={styles.desktopUserTagline}>
                  Rent • Buy • Share | <span style={{ color: "#28a745", fontWeight: "bold" }}>✓ {t("profile.trustedSeller")}</span>
                </p>
              </div>
            </div>

            {/* Add Item Button - Navigate to AddItem Page */}
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
            <div style={styles.contactItem}><Phone size={16} color="#007bff"/> {profile.phone}</div>
            <div style={styles.contactItem}><MapPin size={16} color="#007bff"/> {profile.location}</div>
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
                      <span style={{ color: "#007bff" }}>{profile.trustScore}%</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{ ...styles.progressBarFill, width: `${profile.trustScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statValRow}>
                    <Star size={20} color="#ffc107" fill="#ffc107" />
                    <span style={styles.statNum}>{profile.reviewsCount}</span>
                  </div>
                  <span style={styles.statLabel}>{t("profile.reviews")}</span>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValRow}>
                    <Heart size={20} color="#e63946" fill="#e63946" />
                    <span style={styles.statNum}>{profile.likesCount}</span>
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
                  onClick={() => setActiveTab("reviews")}
                  style={{ ...styles.desktopTabBtn, ...(activeTab === "reviews" ? styles.activeTabBtn : {}) }}
                >
                  {t("profile.reviews")} ({profile.reviewsCount})
                </button>
              </div>

              {activeTab === "shop" && (
                <div style={{ marginTop: "20px" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{t("profile.category")}</h3>
                    <span 
                      onClick={() => setShowAllShopItems(true)} 
                      style={{ fontSize: "13px", color: "#007bff", fontWeight: "bold", cursor: "pointer" }}
                    >
                      {t("profile.viewAll")}
                    </span>
                  </div>

                  <div style={styles.desktopCategoryGrid}>
                    {categoriesList.map((cat) => {
                      const Icon = cat.icon;
                      const count = getCategoryCount(cat.key);
                      return (
                        <div
                          key={cat.key}
                          onClick={() => {
                            setSelectedCategory(cat.key);
                            setShowAllShopItems(true);
                          }}
                          style={{
                            ...styles.categoryCard,
                            ...(selectedCategory === cat.key ? styles.categoryCardSelected : {})
                          }}
                        >
                          <Icon size={24} color="#007bff" />
                          <span style={styles.catName}>{cat.name}</span>
                          <span style={styles.catCount}>{count} items</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>{t("profile.recentItems")}</h4>
                    {filteredItems.length === 0 ? (
                      <div style={styles.emptyState}>
                        {t("profile.noItems")}
                      </div>
                    ) : (
                      <div style={styles.desktopItemsGrid}>
                        {filteredItems.map((item, idx) => (
                          <div key={item.id || idx} style={styles.desktopItemCard}>
                            <img 
                              src={item.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300"} 
                              alt={item.title} 
                              style={styles.desktopItemImg} 
                            />
                            <div style={{ padding: "12px" }}>
                              <span style={styles.itemCategoryBadge}>{item.category}</span>
                              <h4 style={{ margin: "6px 0 4px 0", fontSize: "15px", fontWeight: "bold" }}>{item.title}</h4>
                              <p style={styles.itemStatus}>● {t("profile.available")} ({item.condition || 'Good'})</p>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                <p style={styles.itemPrice}>Rs. {item.price} / {item.priceType || 'day'}</p>
                                <button style={styles.prettyEditBtn}>
                                  <Edit3 size={13} /> Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
              
              <div style={styles.prettyModalHeader}>
                <button onClick={() => setShowEditProfile(false)} style={styles.circleBackBtn}>
                  <X size={18} color="#333" />
                </button>
                <h3 style={styles.prettyModalTitle}>{t("profile.editProfile")}</h3>
                <button onClick={() => setShowEditProfile(false)} style={styles.topSaveBtn}>
                  {t("profile.save")}
                </button>
              </div>

              <div style={styles.centerAvatarContainer}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={profile.profilePic} alt="Avatar" style={styles.modalAvatarImg} />
                  <button onClick={() => profileInputRef.current.click()} style={styles.modalCameraBtn}>
                    <Camera size={15} color="#007bff" />
                  </button>
                </div>
              </div>

              <div style={styles.formFieldsStack}>
                <div style={styles.twoColumnRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>{t("profile.fullName")}</label>
                    <div style={styles.inputWithIconWrapper}>
                      <User size={18} color="#777" style={styles.inputIcon} />
                      <input 
                        style={styles.prettyInput} 
                        type="text" 
                        value={profile.fullName} 
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})} 
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
                        value={profile.phone} 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})} 
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

                <div>
                  <label style={styles.fieldLabel}>{t("profile.location")}</label>
                  <div style={styles.inputWithIconWrapper}>
                    <MapPin size={18} color="#777" style={styles.inputIcon} />
                    <input 
                      style={styles.prettyInput} 
                      type="text" 
                      value={profile.location} 
                      onChange={(e) => setProfile({...profile, location: e.target.value})} 
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
              </div>

            </div>
          </div>
        )}

        {/* MY SHOP ITEMS POPUP */}
        {showAllShopItems && (
          <div style={styles.modalOverlay}>
            <div style={styles.prettyModalBoxWide}>
              
              <div style={styles.prettyModalHeaderCenter}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={styles.prettyModalTitle}>{t("profile.myShopItems")}</h3>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button onClick={() => { setShowAllShopItems(false); navigate("/add-item"); }} style={styles.smallAddBtn}>
                    <Plus size={14} /> {t("profile.addItem")}
                  </button>
                  <button onClick={() => setShowAllShopItems(false)} style={styles.circleBackBtn}>
                    <X size={18} color="#333" />
                  </button>
                </div>
              </div>

              <div style={styles.pillsRow}>
                <button 
                  onClick={() => setSelectedCategory("All")}
                  style={{ ...styles.pillBtn, ...(selectedCategory === "All" ? styles.pillBtnActive : {}) }}
                >
                  All ({items.length})
                </button>
                {categoriesList.map((cat) => (
                  <button 
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    style={{ ...styles.pillBtn, ...(selectedCategory === cat.key ? styles.pillBtnActive : {}) }}
                  >
                    {cat.name} ({getCategoryCount(cat.key)})
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "18px" }}>
                {filteredItems.length === 0 ? (
                  <div style={styles.emptyState}>{t("profile.noItems")}</div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <div key={item.id || idx} style={styles.shopListCard}>
                      <img src={item.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300"} alt={item.title} style={styles.shopListCardImg} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "bold" }}>{item.title}</h4>
                        <span style={styles.itemCategoryBadge}>{item.category}</span>
                        <p style={styles.itemStatus}>● {item.available || 5} {t("profile.available")}</p>
                        <p style={styles.itemPrice}>Rs. {item.price || "1,000"} / {item.priceType || "day"}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button style={styles.prettyEditBtn}><Edit3 size={13} /> Edit</button>
                        <button style={styles.circleMoreBtn}><MoreVertical size={16} color="#666" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

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
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  desktopContainer: {
    width: "100%",
    maxWidth: "1100px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 4px 25px rgba(0,0,0,0.06)",
    border: "1px solid #eaeaea",
    paddingBottom: "30px"
  },
  desktopCoverWrapper: {
    position: "relative",
    height: "240px",
    backgroundColor: "#007bff"
  },
  coverImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  cameraCoverBtn: {
    position: "absolute",
    bottom: "16px",
    right: "20px",
    backgroundColor: "rgba(255,255,255,0.9)",
    border: "none",
    borderRadius: "50%",
    padding: "8px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  desktopProfileBody: {
    padding: "0 35px"
  },
  desktopHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "-60px",
    flexWrap: "wrap",
    gap: "20px"
  },
  desktopAvatarWrapper: {
    position: "relative"
  },
  desktopProfileImg: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    border: "5px solid #ffffff",
    objectFit: "cover",
    backgroundColor: "#eee",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  desktopCameraAvatarBtn: {
    position: "absolute",
    bottom: "6px",
    right: "6px",
    backgroundColor: "#007bff",
    border: "2px solid #fff",
    borderRadius: "50%",
    padding: "6px",
    display: "flex",
    cursor: "pointer"
  },
  desktopUserName: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "bold",
    color: "#111"
  },
  desktopUserHandle: {
    margin: "2px 0 0 0",
    fontSize: "14px",
    color: "#666"
  },
  desktopUserTagline: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#444"
  },
  desktopActionBtns: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },
  desktopContactBar: {
    marginTop: "20px",
    paddingTop: "15px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    gap: "30px",
    flexWrap: "wrap"
  },
  contactItem: {
    fontSize: "13px",
    color: "#444",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500"
  },
  desktopGridColumns: {
    display: "flex",
    gap: "30px",
    marginTop: "25px",
    flexWrap: "wrap"
  },
  trustScoreBox: {
    backgroundColor: "#eef6ff",
    border: "1px solid #d0e3ff",
    borderRadius: "16px",
    padding: "16px 20px",
    width: "280px",
    boxSizing: "border-box"
  },
  trustIconWrapper: {
    backgroundColor: "#007bff",
    borderRadius: "10px",
    padding: "8px",
    display: "flex"
  },
  progressBarBg: {
    width: "100%",
    height: "8px",
    backgroundColor: "#cce2ff",
    borderRadius: "4px",
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007bff"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    width: "280px"
  },
  statCard: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #eeeeee",
    borderRadius: "16px",
    padding: "14px",
    textAlign: "center"
  },
  statValRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px"
  },
  statNum: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#222"
  },
  statLabel: {
    fontSize: "12px",
    color: "#777"
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  secondaryBtn: {
    backgroundColor: "#f0f2f5",
    color: "#333",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  iconBtn: {
    backgroundColor: "#f0f2f5",
    border: "none",
    padding: "10px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  desktopTabsRow: {
    display: "flex",
    borderBottom: "2px solid #f0f0f0",
    gap: "10px"
  },
  desktopTabBtn: {
    padding: "12px 20px",
    border: "none",
    backgroundColor: "transparent",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#888",
    cursor: "pointer",
    borderBottom: "3px solid transparent"
  },
  activeTabBtn: {
    color: "#007bff",
    borderBottom: "3px solid #007bff"
  },
  desktopCategoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "12px"
  },
  categoryCard: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #eee",
    borderRadius: "14px",
    padding: "14px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  categoryCardSelected: {
    backgroundColor: "#eef6ff",
    borderColor: "#007bff"
  },
  catName: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#333",
    marginTop: "6px"
  },
  catCount: {
    fontSize: "11px",
    color: "#888"
  },
  desktopItemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px"
  },
  desktopItemCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #eee",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
  },
  desktopItemImg: {
    width: "100%",
    height: "130px",
    objectFit: "cover"
  },
  itemCategoryBadge: {
    fontSize: "10px",
    backgroundColor: "#eef6ff",
    color: "#007bff",
    padding: "3px 8px",
    borderRadius: "6px",
    fontWeight: "bold"
  },
  itemStatus: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#28a745"
  },
  itemPrice: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "bold"
  },
  prettyEditBtn: {
    backgroundColor: "#fff",
    border: "1px solid #2563eb",
    color: "#2563eb",
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer"
  },
  emptyState: {
    padding: "30px",
    textAlign: "center",
    fontSize: "13px",
    color: "#999",
    backgroundColor: "#f9f9f9",
    borderRadius: "14px"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  prettyModalBox: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: "520px",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  prettyModalBoxWide: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: "680px",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  prettyModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px"
  },
  prettyModalHeaderCenter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px"
  },
  prettyModalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: "#111"
  },
  circleBackBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#f2f4f7",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  topSaveBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 22px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  centerAvatarContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "18px"
  },
  modalAvatarImg: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover"
  },
  modalCameraBtn: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    backgroundColor: "#e0ebff",
    border: "2px solid #fff",
    borderRadius: "50%",
    padding: "6px",
    display: "flex",
    cursor: "pointer"
  },
  formFieldsStack: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  twoColumnRow: {
    display: "flex",
    gap: "14px"
  },
  fieldLabel: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#222",
    display: "block",
    marginBottom: "6px"
  },
  inputWithIconWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  inputIcon: {
    position: "absolute",
    left: "14px"
  },
  prettyInput: {
    width: "100%",
    padding: "12px 12px 12px 42px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box"
  },
  prettyTextarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontSize: "14px",
    outline: "none",
    height: "85px",
    resize: "none",
    boxSizing: "border-box"
  },
  charCounter: {
    textAlign: "right",
    fontSize: "11px",
    color: "#aaa",
    marginTop: "3px"
  },
  smallAddBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer"
  },
  pillsRow: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "6px"
  },
  pillBtn: {
    padding: "8px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    cursor: "pointer"
  },
  pillBtnActive: {
    backgroundColor: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb"
  },
  shopListCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 16px",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    backgroundColor: "#fff"
  },
  shopListCardImg: {
    width: "70px",
    height: "70px",
    borderRadius: "12px",
    objectFit: "cover"
  },
  circleMoreBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#f8fafc",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  }
};