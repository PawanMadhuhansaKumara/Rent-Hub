import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Search,
  PackageSearch,
  Plus,
  RotateCcw,
  ShieldCheck,
  Zap,
  Tag,
  ArrowRight,
  TrendingUp,
  X,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  Handshake,
  DollarSign,
  ArrowDown,
  Lock,
} from "lucide-react";
import "./Home.css";
import ItemCard from "../components/ItemCard";
import HomeStickyBar from "../components/HomeStickyBar";
import BuyerLocationPicker from "../components/BuyerLocationPicker";
import TrustScoreModal from "../components/TrustScoreModal";
import {
  getCachedItems,
  setCachedItems,
  areItemsEqual,
} from "../utils/itemsCache";

const API_URL = "https://rent-hub-ashen.vercel.app/api/items";

export default function Home({
  user,
  searchTerm: propSearchTerm,
  setSearchTerm: propSetSearchTerm,
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState(() => getCachedItems() || []);
  const [loading, setLoading] = useState(
    () => !getCachedItems() || getCachedItems().length === 0,
  );
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [error, setError] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const searchTerm =
    propSearchTerm !== undefined ? propSearchTerm : localSearchTerm;
  const setSearchTerm = propSetSearchTerm || setLocalSearchTerm;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showBuyerPicker, setShowBuyerPicker] = useState(false);
  const [buyerLocation, setBuyerLocation] = useState(null);
  const [radius, setRadius] = useState("all");
  const [showTrustModal, setShowTrustModal] = useState(false);

  // Check if current user is logged in
  const currentUser =
    user ||
    (() => {
      try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();

  // Show hero banner ONLY for new / guest visitors who haven't dismissed it
  const [showHero, setShowHero] = useState(() => {
    if (currentUser) return false;
    try {
      const dismissed = localStorage.getItem("renthub_hero_dismissed");
      return dismissed !== "true";
    } catch {
      return false;
    }
  });

  const searchInputRef = useRef(null);
  const location = useLocation();

  // Focus search input when coming with focusSearch state
  useEffect(() => {
    if (location.state?.focusSearch) {
      const focusSearch = () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      };

      focusSearch();
      const timer = setTimeout(focusSearch, 150);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const loadItems = (isSilent = false) => {
    const hasItems = itemsRef.current && itemsRef.current.length > 0;
    if (!isSilent && !hasItems) {
      setLoading(true);
    }
    setError("");

    let requestURL = API_URL;
    let cacheKey = "all";

    // Buyer location selected
    if (buyerLocation) {
      const params = new URLSearchParams({
        lat: buyerLocation.latitude,
        lng: buyerLocation.longitude,
        radius: radius,
      });

      requestURL = `${API_URL}/nearby?${params.toString()}`;
      cacheKey = `${buyerLocation.latitude}_${buyerLocation.longitude}_${radius}`;
    }

    fetch(requestURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load rental items");
        }
        return response.json();
      })
      .then((data) => {
        const itemList = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : [];

        // Check if data actually changed compared to current items
        const isSame = areItemsEqual(itemsRef.current, itemList);

        if (!isSame || cacheKey !== "all") {
          setCachedItems(itemList, cacheKey);
          setItems(itemList);
        }
      })
      .catch((err) => {
        if (!itemsRef.current || itemsRef.current.length === 0) {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Initial fetch: silent if we already have cached items, showing skeleton only on initial cold start
    const hasExisting = itemsRef.current && itemsRef.current.length > 0;
    loadItems(hasExisting);

    // Live update listeners: always run silently in the background and only update if data changed
    const handleSilentRefresh = () => loadItems(true);

    window.addEventListener("items_updated", handleSilentRefresh);
    window.addEventListener("rent_requests_updated", handleSilentRefresh);
    window.addEventListener("user_updated", handleSilentRefresh);

    return () => {
      window.removeEventListener("items_updated", handleSilentRefresh);
      window.removeEventListener("rent_requests_updated", handleSilentRefresh);
      window.removeEventListener("user_updated", handleSilentRefresh);
    };
  }, [buyerLocation, radius]);

  // Compute item counts per category
  const itemCounts = useMemo(() => {
    const counts = { All: items.length };
    items.forEach((item) => {
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1;
        if (
          item.category.toLowerCase() === "camera" ||
          item.category.toLowerCase() === "cameras"
        ) {
          counts["Cameras"] = (counts["Cameras"] || 0) + 1;
        }
      }
    });
    return counts;
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        item.title?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.nearestCity?.toLowerCase().includes(term) ||
        item.nearest_city?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory ||
        (selectedCategory === "Cameras" &&
          (item.category?.toLowerCase() === "camera" ||
            item.category?.toLowerCase() === "cameras"));

      const isRented =
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

      const matchesAvailability = availableOnly ? !isRented : true;

      return matchesSearch && matchesCategory && matchesAvailability;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else {
      // Newest first by ID
      result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }

    return result;
  }, [items, searchTerm, selectedCategory, availableOnly, sortBy]);

  // --- RENTAL LIMIT & TRUST SCORE COMPUTATION ---
  const userLimit = currentUser
    ? Number(currentUser.rental_limit || currentUser.max_rental_limit || 1000)
    : 1000;
  const userTrustScore = currentUser
    ? Number(currentUser.trust_score || 50)
    : 50;
  const completedRentals = currentUser
    ? Number(currentUser.completed_rentals || 0)
    : 0;
  const accountDays = currentUser ? Number(currentUser.account_days || 0) : 0;

  // Split items into Affordable (Within Limit) vs Locked (Exceeds Limit)
  const affordableItems = useMemo(() => {
    return filteredAndSortedItems.filter(
      (item) => (Number(item.price) || 0) <= userLimit,
    );
  }, [filteredAndSortedItems, userLimit]);

  const lockedItems = useMemo(() => {
    return filteredAndSortedItems.filter(
      (item) => (Number(item.price) || 0) > userLimit,
    );
  }, [filteredAndSortedItems, userLimit]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setAvailableOnly(false);
    setSortBy("newest");
  };

  const handleExploreItems = () => {
    setShowHero(false);
    try {
      localStorage.setItem("renthub_hero_dismissed", "true");
    } catch {}
    const el = document.getElementById("rental-items");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDismissHero = () => {
    setShowHero(false);
    try {
      localStorage.setItem("renthub_hero_dismissed", "true");
    } catch {}
  };

  return (
    <main className="items-page">
      {/* 1. HERO SECTION */}
      {showHero && !searchTerm.trim() && selectedCategory === "All" && (
        <section className="hero-section">
          <button
            type="button"
            className="hero-dismiss-btn"
            onClick={handleDismissHero}
            aria-label="Dismiss banner"
            title="Dismiss banner"
          >
            <X size={18} />
          </button>

          <div className="hero-content">
            <div className="hero-tag-badge">
              <Sparkles size={14} color="var(--primary)" />
              <span>
                {t("home.tag", "Sri Lanka's Community Rental Platform")}
              </span>
            </div>

            <h1>
              {t("home.titleLine1", "Find What You Need.")}
              <br />
              <span>{t("home.titleLine2", "Rent What You Love.")}</span>
            </h1>

            <p>
              {t(
                "home.subtitle",
                "Why buy when you can rent? Borrow tools, electronics, camping gear, and everyday items from verified neighbors at affordable daily rates.",
              )}
            </p>

            <div className="hero-action-buttons">
              <button
                type="button"
                className="hero-button hero-primary-btn"
                onClick={handleExploreItems}
              >
                <span>{t("home.exploreItems", "Explore Items")}</span>
                <ArrowDown size={16} />
              </button>
            </div>

            <div className="hero-features">
              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <ShieldCheck size={18} color="var(--primary)" />
                </div>
                <div>
                  <strong>
                    {t("home.verifiedCommunity", "Verified Community")}
                  </strong>
                  <small>
                    {t(
                      "home.verifiedCommunityDesc",
                      "Safe & trusted member profiles",
                    )}
                  </small>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <DollarSign size={18} color="var(--primary)" />
                </div>
                <div>
                  <strong>{t("home.budgetFriendly", "Budget Friendly")}</strong>
                  <small>
                    {t("home.budgetFriendlyDesc", "Pay only for days you use")}
                  </small>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <Zap size={18} color="var(--primary)" />
                </div>
                <div>
                  <strong>{t("home.easyHandovers", "Easy Handovers")}</strong>
                  <small>
                    {t("home.easyHandoversDesc", "Quick pickup in your town")}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. RENTAL ITEMS & DISCOVERY SECTION */}
      <section id="rental-items" className="rental-section">
        {/* Categories & Filter Controls Bar */}
        <HomeStickyBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          itemCounts={itemCounts}
          filteredCount={filteredAndSortedItems.length}
          availableOnly={availableOnly}
          setAvailableOnly={setAvailableOnly}
          sortBy={sortBy}
          setSortBy={setSortBy}
          buyerLocation={buyerLocation}
          setBuyerLocation={setBuyerLocation}
          radius={radius}
          setRadius={setRadius}
          setShowBuyerPicker={setShowBuyerPicker}
          user={currentUser}
        />

        {/* Items Grid / Empty / Loading States */}
        {loading ? (
          <div className="items-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="item-card-skeleton">
                <div className="skeleton-image shimmer" />
                <div className="skeleton-body">
                  <div className="skeleton-line shimmer short" />
                  <div className="skeleton-line shimmer medium" />
                  <div className="skeleton-line shimmer price" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="home-error-state">
            <p className="items-message error-message">{error}</p>
            <button
              type="button"
              className="home-reset-filters-btn"
              onClick={loadItems}
            >
              {t("home.tryAgain", "Try Again")}
            </button>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="home-empty-state">
            <div className="home-empty-icon-wrapper">
              <PackageSearch size={42} color="var(--primary)" />
            </div>
            <h3>{t("home.noItemsFound", "No rental items found")}</h3>
            <p>
              {searchTerm
                ? t("home.noItemsSearch", {
                    term: searchTerm,
                    defaultValue: `We couldn't find anything matching "${searchTerm}". Try checking your spelling or search for another item.`,
                  })
                : availableOnly
                  ? t(
                      "home.noItemsAvailable",
                      "No items are currently available in this category. Try unticking 'Available Only'.",
                    )
                  : t(
                      "home.noItemsCategory",
                      "No items listed under this category yet.",
                    )}
            </p>
            <button
              type="button"
              className="home-reset-filters-btn"
              onClick={handleResetFilters}
            >
              <RotateCcw size={15} />
              <span>{t("home.resetFilters", "Reset All Filters")}</span>
            </button>
          </div>
        ) : (
          <div>
            {/* --- SECTION 1: AFFORDABLE ITEMS (Within Limit) --- */}
            {affordableItems.length > 0 && (
              <div
                style={{ marginBottom: lockedItems.length > 0 ? "40px" : "0" }}
              >
                <h3 style={styles.subSectionTitle}>
                  <CheckCircle2
                    size={18}
                    color="var(--primary)"
                    style={{ marginRight: "6px" }}
                  />
                  Available For You (Within Your LKR{" "}
                  {userLimit.toLocaleString()} Limit)
                </h3>
                <div className="items-grid">
                  {affordableItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* --- SECTION 2: LOCKED ITEMS (Exceeds Limit) --- */}
            {lockedItems.length > 0 && (
              <div>
                <div
                  style={{ ...styles.lockedHeader, cursor: "pointer" }}
                  onClick={() => setShowTrustModal(true)}
                  title="Click to view your Trust Score details & how to increase your limit"
                >
                  <h3
                    style={{
                      ...styles.subSectionTitle,
                      color: "var(--badge-yellow-text)",
                      margin: 0,
                    }}
                  >
                    <Lock
                      size={18}
                      color="var(--badge-yellow-text)"
                      style={{ marginRight: "6px" }}
                    />
                    Higher Trust Score Required (Exceeds LKR{" "}
                    {userLimit.toLocaleString()})
                  </h3>
                  <span style={styles.lockedSubnote}>
                    Complete more rentals and return on time to increase your
                    LKR {userLimit.toLocaleString()} limit!{" "}
                    <strong style={{ color: "var(--primary)", textDecoration: "underline" }}>
                      View Details →
                    </strong>
                  </span>
                </div>
                <div className="items-grid" style={{ opacity: 0.9 }}>
                  {lockedItems.map((item) => (
                    <div key={item.id} style={{ position: "relative" }}>
                      <div style={styles.lockBadgeOverlay}>
                        <Lock size={12} /> Requires LKR{" "}
                        {Number(item.price).toLocaleString()}
                      </div>
                      <ItemCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="how-it-works-section">
        <div className="how-it-works-header">
          <span className="how-it-works-tag">
            {t("home.howItWorksTag", "Simple & Transparent")}
          </span>
          <h2>{t("home.howItWorksTitle", "How Rent-Hub Works")}</h2>
          <p>
            {t(
              "home.howItWorksSubtitle",
              "Get started with renting or renting out in 3 simple steps",
            )}
          </p>
        </div>

        <div className="how-it-works-steps">
          <div className="how-step-card">
            <div className="how-step-number">1</div>
            <div className="how-step-icon">
              <Search size={22} color="var(--primary)" />
            </div>
            <h3>{t("home.step1Title", "Find & Choose")}</h3>
            <p>
              {t(
                "home.step1Desc",
                "Browse everyday items, tools, and equipment available for rent near your location.",
              )}
            </p>
          </div>

          <div className="how-step-card">
            <div className="how-step-number">2</div>
            <div className="how-step-icon">
              <Calendar size={22} color="var(--primary)" />
            </div>
            <h3>{t("home.step2Title", "Send Request")}</h3>
            <p>
              {t(
                "home.step2Desc",
                "Select your rental start and end dates, view the calculated total, and send the request.",
              )}
            </p>
          </div>

          <div className="how-step-card">
            <div className="how-step-number">3</div>
            <div className="how-step-icon">
              <Handshake size={22} color="var(--primary)" />
            </div>
            <h3>{t("home.step3Title", "Pickup & Enjoy")}</h3>
            <p>
              {t(
                "home.step3Desc",
                "Verify details with the owner, inspect the item together, and enjoy your rental!",
              )}
            </p>
          </div>
        </div>

        <div className="owner-cta-banner">
          <div className="owner-cta-text">
            <h3>
              {t("home.ownerCtaTitle", "Have items sitting idle at home?")}
            </h3>
            <p>
              {t(
                "home.ownerCtaDesc",
                "List your unused tools, electronics, or gear and start earning rental income today.",
              )}
            </p>
          </div>
          <Link to="/add-item" className="owner-cta-btn">
            <span>{t("home.ownerCtaBtn", "List Item Now")}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      {/* Buyer Location Picker */}

      <BuyerLocationPicker
        isOpen={showBuyerPicker}
        onClose={() => setShowBuyerPicker(false)}
        onLocationSelect={(selectedLocation) => {
          console.log("Selected Buyer Location:", selectedLocation);

          setBuyerLocation(selectedLocation);
        }}
      />
      {/* Trust Score & Rental Limit Modal */}
      {showTrustModal && (
        <TrustScoreModal
          isOpen={showTrustModal}
          onClose={() => setShowTrustModal(false)}
          userId={currentUser?.user_id || currentUser?.id}
          trustScore={userTrustScore}
          rentalLimit={userLimit}
          completedRentals={completedRentals}
          accountDays={accountDays}
        />
      )}
    </main>
  );
}

// --- THEME-COMPLIANT STYLES ---
const styles = {
  trustBar: {
    backgroundColor: "var(--bg-card)",
    border: "1.5px solid var(--border-light)",
    padding: "18px 22px",
    borderRadius: "18px",
    marginBottom: "26px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
  },
  trustBarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "12px",
  },
  trustScorePill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "var(--bg-card-elevated)",
    border: "1px solid var(--border-light)",
    padding: "8px 16px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  limitPill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "var(--bg-card-elevated)",
    border: "1px solid var(--border-light)",
    padding: "8px 16px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  trustScoreLabel: {
    fontSize: "11px",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: "0.5px",
    lineHeight: 1,
    marginBottom: "2px",
  },
  trustScoreValue: {
    fontSize: "18px",
    color: "var(--badge-green-text)",
    fontWeight: "800",
  },
  limitValue: {
    fontSize: "18px",
    color: "var(--badge-green-text)",
    fontWeight: "800",
  },
  statsPillsGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginLeft: "auto",
  },
  statMiniBadge: {
    fontSize: "12px",
    backgroundColor: "var(--bg-card-hover)",
    color: "var(--text-main)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "500",
    border: "1px solid var(--border-light)",
  },
  progressBarWrapper: {
    width: "100%",
    height: "8px",
    backgroundColor: "var(--bg-card-hover)",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "10px",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--text-accent) 0%, var(--primary) 100%)",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },
  trustBarDesc: {
    margin: 0,
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  subSectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--text-main)",
    display: "flex",
    alignItems: "center",
    marginBottom: "14px",
  },
  lockedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "30px",
    marginBottom: "14px",
    borderTop: "1px solid var(--border-light)",
    paddingTop: "24px",
  },
  lockedSubnote: {
    fontSize: "12.5px",
    color: "var(--text-muted)",
    fontWeight: "600",
  },
  lockBadgeOverlay: {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 5,
    backgroundColor: "rgba(217, 119, 6, 0.95)",
    color: "var(--text-inverse)",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
};
