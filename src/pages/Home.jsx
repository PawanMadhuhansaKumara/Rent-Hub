
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const API_URL = "http://localhost:5001/api/items";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase();

    return (
      (item.title || "").toLowerCase().includes(search) ||
      (item.category || "").toLowerCase().includes(search)
    );
  });

  return (
    <main className="items-page">
      {/* Professional Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">
            Welcome to Rent-Hub
          </span>

          <h1>
            Find What You Need.
            <br />
            <span>Rent What You Love.</span>
          </h1>

          <p>
            Discover useful items from your community.
            Rent what you need, save money, and make
            everyday life easier.
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

      {/* Rental Items Section */}
      <section id="rental-items" className="rental-section">
        <div className="section-heading">
          <div>
            <span className="section-tag">EXPLORE OUR COLLECTION</span>
            <h2>Discover Items to Rent</h2>
            <p>Find the right item for your next need.</p>
          </div>

          <Link to="/add-item" className="add-item-button">
            + Add Item
          </Link>
        </div>

        {/* Search Bar */}
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

        {loading ? (
          <p className="items-message">Loading items...</p>
        ) : error ? (
          <p className="items-message error-message">{error}</p>
        ) : filteredItems.length === 0 ? (
          <p className="items-message">
            No items found. Try another search.
          </p>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <article className="item-card" key={item.id}>
                {item.image ? (
                  <img
                    src={
                      item.image.startsWith("http")
                        ? item.image
                        : `http://localhost:5001${item.image.startsWith("/") ? "" : "/"}${item.image}`
                    }
                    alt={item.title}
                    className="item-image"
                  />
                ) : (
                  <div className="no-image">
                    No Image Available
                  </div>
                )}

                <div className="item-info">
                  <span className="item-category">
                    {item.category}
                  </span>

                  <h3>{item.title}</h3>

                  <p className="item-condition">
                    Condition: {item.condition || "Not specified"}
                  </p>

                  <div className="item-price">
                    <strong>
                      LKR {Number(item.price).toFixed(2)}
                    </strong>
                    <span> / {item.priceType || "day"}</span>
                  </div>

                  <p className="item-availability">
                    Available: {item.available ?? 0}
                  </p>

                  <Link
                    to={`/item/${item.id}`}
                    className="view-details-button"
                  >
                    View Details <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
