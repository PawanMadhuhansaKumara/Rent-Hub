import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import "./Home.css";
import SearchBar from "../components/SearchBar";
import ItemCard from "../components/ItemCard";
import CategorySlider from "../components/CategorySlider";

const API_URL = "http://localhost:5001/api/items";

export default function Home({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [availableOnly, setAvailableOnly] = useState(false);

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

  const loadItems = () => {
    setLoading(true);
    setError("");
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load rental items");
        }
        return response.json();
      })
      .then((data) => setItems(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
    window.addEventListener("items_updated", loadItems);
    window.addEventListener("rent_requests_updated", loadItems);
    return () => {
      window.removeEventListener("items_updated", loadItems);
      window.removeEventListener("rent_requests_updated", loadItems);
    };
  }, []);

  // Compute item counts per category
  const itemCounts = useMemo(() => {
    const counts = { All: items.length };
    items.forEach((item) => {
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1;
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
        selectedCategory === "All" || item.category === selectedCategory;

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
      {/* 1. HERO SECTION (Shown ONLY for new/guest users; automatically hidden when exploring or dismissed) */}
      {showHero && !searchTerm.trim() && selectedCategory === "All" && (
        <section className="hero-section">
          {/* Close / Dismiss button */}
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
              <Sparkles size={14} color="#15803d" />
              <span>Sri Lanka's Community Rental Platform</span>
            </div>

            <h1>
              Find What You Need.
              <br />
              <span>Rent What You Love.</span>
            </h1>

            <p>
              Why buy when you can rent? Borrow tools, electronics, camping gear, and everyday items from verified neighbors at affordable daily rates.
            </p>

            <div className="hero-action-buttons">
              <button
                type="button"
                className="hero-button hero-primary-btn"
                onClick={handleExploreItems}
              >
                <span>Explore Items</span>
                <ArrowDown size={16} />
              </button>
            </div>

            <div className="hero-features">
              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <ShieldCheck size={18} color="#15803d" />
                </div>
                <div>
                  <strong>Verified Community</strong>
                  <small>Safe & trusted member profiles</small>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <DollarSign size={18} color="#15803d" />
                </div>
                <div>
                  <strong>Budget Friendly</strong>
                  <small>Pay only for days you use</small>
                </div>
              </div>

              <div className="hero-feature-item">
                <div className="hero-feature-icon">
                  <Zap size={18} color="#15803d" />
                </div>
                <div>
                  <strong>Easy Handovers</strong>
                  <small>Quick pickup in your town</small>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. RENTAL ITEMS & DISCOVERY SECTION */}
      <section id="rental-items" className="rental-section">
        {/* Search Bar Container */}
        <div className="home-search-wrapper">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchInputRef={searchInputRef}
          />
        </div>

        {/* Categories Bar */}
        <CategorySlider
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          itemCounts={itemCounts}
        />

        {/* Section Header Controls (Filter bar, sort, active count) */}
        <div className="home-results-header">
          <div className="home-results-title-group">
            <h2>
              {selectedCategory === "All"
                ? "All Rental Items"
                : `${selectedCategory} Rentals`}
            </h2>
            <span className="home-results-count-badge">
              {filteredAndSortedItems.length}{" "}
              {filteredAndSortedItems.length === 1 ? "item" : "items"}
            </span>

            {/* Active search filter tag */}
            {searchTerm.trim() && (
              <span className="home-active-filter-tag">
                <span>"{searchTerm}"</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Remove search filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}
          </div>

          <div className="home-results-actions">
            {/* Toggle Available Only */}
            <button
              type="button"
              className={`home-filter-toggle-btn ${availableOnly ? "active" : ""}`}
              onClick={() => setAvailableOnly(!availableOnly)}
            >
              <CheckCircle2 size={15} />
              <span>Available Only</span>
            </button>

            {/* Sort Options Dropdown */}
            <div className="home-sort-wrapper">
              <label htmlFor="home-sort-select" className="home-sort-label">
                <SlidersHorizontal size={14} />
                <span>Sort:</span>
              </label>
              <select
                id="home-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="home-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

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
              Try Again
            </button>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="home-empty-state">
            <div className="home-empty-icon-wrapper">
              <PackageSearch size={42} color="#15803d" />
            </div>
            <h3>No rental items found</h3>
            <p>
              {searchTerm
                ? `We couldn't find anything matching "${searchTerm}". Try checking your spelling or search for another item.`
                : availableOnly
                  ? "No items are currently available in this category. Try unticking 'Available Only'."
                  : "No items listed under this category yet."}
            </p>
            <button
              type="button"
              className="home-reset-filters-btn"
              onClick={handleResetFilters}
            >
              <RotateCcw size={15} />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {filteredAndSortedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* 3. HOW IT WORKS SECTION (Simple 3-step guide for users) */}
      <section className="how-it-works-section">
        <div className="how-it-works-header">
          <span className="how-it-works-tag">Simple & Transparent</span>
          <h2>How Rent-Hub Works</h2>
          <p>Get started with renting or renting out in 3 simple steps</p>
        </div>

        <div className="how-it-works-steps">
          <div className="how-step-card">
            <div className="how-step-number">1</div>
            <div className="how-step-icon">
              <Search size={22} color="#15803d" />
            </div>
            <h3>Find & Choose</h3>
            <p>Browse everyday items, tools, and equipment available for rent near your location.</p>
          </div>

          <div className="how-step-card">
            <div className="how-step-number">2</div>
            <div className="how-step-icon">
              <Calendar size={22} color="#15803d" />
            </div>
            <h3>Send Request</h3>
            <p>Select your rental start and end dates, view the calculated total, and send the request.</p>
          </div>

          <div className="how-step-card">
            <div className="how-step-number">3</div>
            <div className="how-step-icon">
              <Handshake size={22} color="#15803d" />
            </div>
            <h3>Pickup & Enjoy</h3>
            <p>Verify details with the owner, inspect the item together, and enjoy your rental!</p>
          </div>
        </div>

        {/* Callout Card for Owners */}
        <div className="owner-cta-banner">
          <div className="owner-cta-text">
            <h3>Have items sitting idle at home?</h3>
            <p>List your unused tools, electronics, or gear and start earning rental income today.</p>
          </div>
          <Link to="/add-item" className="owner-cta-btn">
            <span>List Item Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
