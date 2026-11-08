import "./components.css";
import { useTranslation } from "react-i18next";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  searchInputRef,
}) {
  const { t } = useTranslation();
  return (
    <div className="home-search">
      <span className="search-icon">⌕</span>

      <input
        ref={searchInputRef}
        type="search"
        placeholder={t("search.placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search rental items"
      />

      {searchTerm && (
        <button
          type="button"
          className="clear-search"
          onClick={() => setSearchTerm("")}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
      
    </div>
    
  );
}
