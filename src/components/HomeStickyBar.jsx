import React from "react";
import { useTranslation } from "react-i18next";
import { X, CheckCircle2, SlidersHorizontal, MapPin } from "lucide-react";
import SearchBar from "./SearchBar";
import CategorySlider from "./CategorySlider";
import "./HomeStickyBar.css";

export default function HomeStickyBar({
  searchTerm,
  setSearchTerm,
  searchInputRef,
  selectedCategory,
  setSelectedCategory,
  itemCounts,
  filteredCount,
  availableOnly,
  setAvailableOnly,
  sortBy,
  setSortBy,
  buyerLocation,
  setBuyerLocation,
  radius,
  setRadius,
  setShowBuyerPicker,
}) {
  const { t } = useTranslation();

  return (
    <div className="home-sticky-bar">
      {/* 1. Search Bar Slot (Mobile only; hidden on Desktop & Tablet) */}
      <div className="sticky-search-slot">
        <div>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchInputRef={searchInputRef}
          />
        </div>
      </div>

      {/* 2. Categories Slider Slot */}
      <div className="sticky-categories-slot">
        <CategorySlider
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          itemCounts={itemCounts}
        />
      </div>

      {/* 3. Filters, Sort & Location Controls Slot */}
      <div className="sticky-filters-slot">
        <div className="home-results-header">
          <div className="home-results-title-group">
            <h2>
              {selectedCategory === "All"
                ? t("home.allRentalItems", "All Rental Items")
                : t("home.categoryRentals", {
                    category: t(
                      `categories.${selectedCategory.toLowerCase()}`,
                      selectedCategory,
                    ),
                    defaultValue: `${selectedCategory} Rentals`,
                  })}
            </h2>

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

          <button
            type="button"
            className={`home-filter-toggle-btn home-available-filter-btn ${availableOnly ? "active" : ""}`}
            onClick={() => setAvailableOnly(!availableOnly)}
          >
            <CheckCircle2 size={15} />
            <span>{t("home.availableOnly", "Available Only")}</span>
          </button>

          <div className="home-results-actions">
            <div className="home-sort-wrapper">
              <label htmlFor="home-sort-select" className="home-sort-label">
                <SlidersHorizontal size={14} />
                <span>{t("home.sort", "Sort:")}</span>
              </label>
              <select
                id="home-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="home-sort-select"
              >
                <option value="newest">
                  {t("home.sortNewest", "Newest First")}
                </option>
                <option value="price-low">
                  {t("home.sortPriceLow", "Price: Low to High")}
                </option>
                <option value="price-high">
                  {t("home.sortPriceHigh", "Price: High to Low")}
                </option>
              </select>
            </div>

            {/* Compact Location Filter */}
            <div className="home-location-filter-wrapper">
              <button
                type="button"
                className={`home-filter-toggle-btn ${buyerLocation ? "active" : ""}`}
                onClick={() => setShowBuyerPicker(true)}
                title={
                  buyerLocation
                    ? buyerLocation.locationName
                    : t("home.location", "Location")
                }
              >
                <MapPin size={14} />
                <span className="home-location-name">
                  {buyerLocation
                    ? buyerLocation.locationName
                    : t("home.location", "Location")}
                </span>
              </button>

              {buyerLocation && (
                <>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="home-sort-select home-radius-select"
                    title="Filter Radius"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                    <option value="all">All</option>
                  </select>

                  <button
                    type="button"
                    className="home-clear-loc-btn"
                    onClick={() => {
                      setBuyerLocation(null);
                      setRadius("all");
                    }}
                    title="Clear Location"
                    aria-label="Clear location filter"
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
