import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Home.css";
import SearchBar from "../components/SearchBar";
import ItemCard from "../components/ItemCard";
import CategorySlider from "../components/CategorySlider";

const API_URL = "http://localhost:5001/api/items";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
   
  //Filter item
  const [selectedCategory, setSelectedCategory] = useState("All");
   

const filteredItems = items.filter((item) => {
  const matchesSearch =
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCategory =
    selectedCategory === "All" ||
    item.category === selectedCategory;

  return matchesSearch && matchesCategory;
});
 
 
  
  
  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load items");
        }
        return response.json();
      })
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

 /* const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase();

    return (
      (item.title || "").toLowerCase().includes(search) ||
      (item.category || "").toLowerCase().includes(search)
    );
  });*/
   


  return (
    <main className="items-page">

  {/* Search Bar */}
  <SearchBar
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    searchInputRef={searchInputRef}
  />

  {/* Category Slider */}
  <CategorySlider
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
  />

  {/* Rental Items Section */}
  <section id="rental-items" className="rental-section">
    {loading ? (
      <p className="items-message">Loading items...</p>
    ) : error ? (
      <p className="items-message error-message">{error}</p>
    ) : filteredItems.length === 0 ? (
      <p className="items-message">No items found. Try another search.</p>
    ) : (
      <div className="items-grid">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    )}
  </section>

      

     
      
      {/* Professional Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">Welcome to Rent-Hub</span>

          <h1>
            Find What You Need.
            <br />
            <span>Rent What You Love.</span>
          </h1>

          <p>
            Discover useful items from your community. Rent what you need, save
            money, and make everyday life easier.
          </p>

          <button
            type="button"
            className="hero-button"
            onClick={() =>
              document
                .getElementById("rental-items")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Items <span>↓</span>
          </button>

          <div className="hero-features">
            <div>
              <strong>Easy to Find</strong>
              <small>Search for useful items</small>
            </div>

            <div>
              <strong>Budget Friendly</strong>
              <small>Rent when you need</small>
            </div>

            <div>
              <strong>Simple & Convenient</strong>
              <small>Discover more options</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
