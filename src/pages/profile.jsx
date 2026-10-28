import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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

export default function Profile({ user, setUser }) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("shop");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAllShopItems, setShowAllShopItems] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // File Input References
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const itemImageInputRef = useRef(null);

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

  // Items List
  const [items, setItems] = useState([]);

  // New Item State
  const [newItem, setNewItem] = useState({
    title: "",
    category: "Electronics",
    condition: "Good",
    price: "",
    priceType: "day",
    description: "",
    image: ""
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // Image Upload Handlers
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

  const handleItemImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItem((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  // Save Profile via FormData to Backend Database
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

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        setShowAddItem(false);
        resetAddItemForm();
        fetchItems();
      } else {
        setItems((prev) => [...prev, { ...newItem, id: Date.now(), available: 5 }]);
        setShowAddItem(false);
        resetAddItemForm();
      }
    } catch (err) {
      setItems((prev) => [...prev, { ...newItem, id: Date.now(), available: 5 }]);
      setShowAddItem(false);
      resetAddItemForm();
    }
  };

  const resetAddItemForm = () => {
    setNewItem({
      title: "",
      category: "Electronics",
      condition: "Good",
      price: "",
      priceType: "day",
      description: "",
      image: ""
    });
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
              <button onClick={() => setShowAddItem(true)} style={styles.primaryBtn}>
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
                  onClick={() => setActiveTab("reviews")}
                  style={{ ...styles.desktopTabBtn, ...(activeTab === "reviews" ? styles.activeTabBtn : {}) }}
                >
                  {t("profile.reviews")} ({profile.reviews_count})
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

              {/* Cover Photo Edit Section */}
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

              {/* Profile Avatar Edit Section */}
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

        {/* ADD ITEM POPUP */}
        {showAddItem && (
          <div style={styles.modalOverlay}>
            <div style={styles.prettyModalBox}>
              <input type="file" ref={itemImageInputRef} style={{ display: "none" }} accept="image/*" onChange={handleItemImageChange} />
              
              <div style={styles.prettyModalHeaderCenter}>
                <h3 style={styles.prettyModalTitle}>{t("profile.addNewItem")}</h3>
                <button onClick={() => setShowAddItem(false)} style={styles.circleBackBtn}>
                  <X size={18} color="#333" />
                </button>
              </div>

              <form onSubmit={handleAddItem} style={styles.formFieldsStack}>
                <div>
                  <label style={styles.fieldLabel}>{t("profile.itemPhoto")}</label>
                  <div style={styles.singlePhotoUploadContainer}>
                    {newItem.image ? (
                      <div style={{ position: "relative", width: "100%", height: "120px" }}>
                        <img src={newItem.image} alt="Selected Item" style={styles.selectedItemPreviewImg} />
                        <button type="button" onClick={() => setNewItem({...newItem, image: ""})} style={styles.removeImgBtn}>
                          <X size={14} color="#fff" />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => itemImageInputRef.current.click()} style={styles.addPhotoTileLarge}>
                        <Camera size={28} color="#007bff" />
                        <span style={{ fontSize: "12px", color: "#007bff", fontWeight: "600", marginTop: "6px" }}>{t("profile.clickUpload")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={styles.fieldLabel}>{t("profile.itemTitle")}</label>
                  <input 
                    required 
                    style={styles.prettyInputNoIcon} 
                    type="text" 
                    placeholder="e.g. MacBook Pro 2023" 
                    value={newItem.title} 
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})} 
                  />
                </div>

                <div style={styles.twoColumnRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>{t("profile.category")}</label>
                    <div style={{ position: "relative" }}>
                      <select 
                        style={styles.prettySelect} 
                        value={newItem.category} 
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      >
                        {categoriesList.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={18} color="#555" style={styles.selectArrow} />
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>{t("profile.condition")}</label>
                    <div style={{ position: "relative" }}>
                      <select 
                        style={styles.prettySelect} 
                        value={newItem.condition} 
                        onChange={(e) => setNewItem({...newItem, condition: e.target.value})}
                      >
                        <option value="Good">{t("profile.good")}</option>
                        <option value="Brand New">{t("profile.brandNew")}</option>
                        <option value="Used">{t("profile.used")}</option>
                      </select>
                      <ChevronDown size={18} color="#555" style={styles.selectArrow} />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={styles.fieldLabel}>{t("profile.price")}</label>
                  <input 
                    required 
                    style={styles.prettyInputNoIcon} 
                    type="text" 
                    placeholder="Rs. 1,000" 
                    value={newItem.price} 
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})} 
                  />
                </div>

                <div>
                  <label style={styles.fieldLabel}>{t("profile.description")}</label>
                  <textarea 
                    style={styles.prettyTextarea} 
                    placeholder="..." 
                    value={newItem.description} 
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})} 
                  />
                  <div style={styles.charCounter}>{newItem.description.length}/500</div>
                </div>

                <button type="submit" style={styles.fullBlueBtn}>
                  {t("profile.addItem")}
                </button>
              </form>

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
                  <button onClick={() => { setShowAllShopItems(false); setShowAddItem(true); }} style={styles.smallAddBtn}>
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
  desktopCategoryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" },
  categoryCard: { backgroundColor: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: "14px", padding: "14px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" },
  categoryCardSelected: { borderColor: "#007bff", backgroundColor: "#eef6ff" },
  catName: { display: "block", fontSize: "13px", fontWeight: "bold", color: "#333", marginTop: "8px" },
  catCount: { display: "block", fontSize: "11px", color: "#777", marginTop: "2px" },
  desktopItemsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" },
  desktopItemCard: { backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" },
  desktopItemImg: { width: "100%", height: "120px", objectFit: "cover" },
  itemCategoryBadge: { backgroundColor: "#eef6ff", color: "#007bff", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" },
  itemStatus: { fontSize: "11px", color: "#28a745", margin: "2px 0 0 0", fontWeight: "500" },
  itemPrice: { fontSize: "13px", fontWeight: "bold", color: "#111", margin: 0 },
  prettyEditBtn: { backgroundColor: "#f0f2f5", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" },
  emptyState: { padding: "30px", textAlign: "center", color: "#777", fontSize: "14px", backgroundColor: "#fafafa", borderRadius: "12px", border: "1px dashed #ddd" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" },
  prettyModalBox: { backgroundColor: "#fff", width: "100%", maxWidth: "480px", borderRadius: "20px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
  prettyModalBoxWide: { backgroundColor: "#fff", width: "100%", maxWidth: "650px", borderRadius: "20px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
  prettyModalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  prettyModalHeaderCenter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
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
  singlePhotoUploadContainer: { border: "2px dashed #007bff", borderRadius: "12px", backgroundColor: "#f8f9fa", overflow: "hidden", textAlign: "center" },
  addPhotoTileLarge: { padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" },
  selectedItemPreviewImg: { width: "100%", height: "120px", objectFit: "cover" },
  removeImgBtn: { position: "absolute", top: "8px", right: "8px", backgroundColor: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyCenter: "center", cursor: "pointer" },
  prettySelect: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", backgroundColor: "#fff", appearance: "none", boxSizing: "border-box", cursor: "pointer" },
  selectArrow: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  fullBlueBtn: { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", marginTop: "10px", width: "100%" },
  pillsRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" },
  pillBtn: { padding: "6px 14px", borderRadius: "20px", border: "1px solid #ddd", backgroundColor: "#f8f9fa", fontSize: "13px", fontWeight: "600", color: "#555", cursor: "pointer" },
  pillBtnActive: { backgroundColor: "#007bff", color: "#fff", borderColor: "#007bff" },
  shopListCard: { display: "flex", alignItems: "center", gap: "14px", backgroundColor: "#f9f9f9", border: "1px solid #eee", borderRadius: "12px", padding: "10px" },
  shopListCardImg: { width: "70px", height: "70px", borderRadius: "8px", objectFit: "cover" },
  circleMoreBtn: { backgroundColor: "#f0f2f5", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  smallAddBtn: { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }
};