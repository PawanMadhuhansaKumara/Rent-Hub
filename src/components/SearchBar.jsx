import "./components.css"
export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    
    <div className="home-search">
      <span className="search-icon">⌕</span>

      <input
        type="search"
        placeholder="Search items by name or category..."
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