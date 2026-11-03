import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Package,
  ArrowLeft,
  Clock,
  Inbox,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  ShoppingBag,
  ShoppingCart
} from "lucide-react";
import "./MyItems.css";

const API_URL = "http://localhost:5001";

export default function MyItems({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const validTabs = ["my-items", "rented-items", "rent-requests", "rent-cart"];
  const tabFromUrl = searchParams.get("tab");
  const initialTab = validTabs.includes(tabFromUrl)
    ? tabFromUrl
    : "rented-items";

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rent Requests state (persisted in localStorage or demo defaults)
  // Cart items state already declared above (cartItems, loadingCart, errorCart)

  // Fetch cart items for the current user
  const fetchCartItems = async () => {
    try {
      setLoadingCart(true);
      setErrorCart('');
      const res = await fetch(`${API_URL}/api/cart/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to load cart items.');
      }
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setErrorCart(err.message || 'Failed to load cart items.');
    } finally {
      setLoadingCart(false);
    }
  };
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [errorCart, setErrorCart] = useState("");
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("rent_hub_requests");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const userId = currentUser?.user_id || currentUser?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchMyItems();
  }, [userId]);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/items/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to load your items.");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart items when userId changes or active tab is rent-cart
  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId, activeTab]);

  const handleToggleSelect = (cartId) => {
    setSelectedCartIds((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCartIds.length === cartItems.length) {
      setSelectedCartIds([]);
    } else {
      setSelectedCartIds(cartItems.map((ci) => ci.id));
    }
  };

  const totalSelectedPrice = cartItems
    .filter((ci) => selectedCartIds.includes(ci.id))
    .reduce(
      (acc, curr) => acc + Number(curr.price || 0) * (Number(curr.quantity) || 1),
      0
    );

  const handleRemoveFromCart = async (cartId) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/${cartId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCartItems((prev) => prev.filter((it) => it.id !== cartId));
        setSelectedCartIds((prev) => prev.filter((id) => id !== cartId));
      } else {
        alert("Failed to remove item from cart.");
      }
    } catch (err) {
      console.error("Error removing cart item:", err);
      alert("Error removing item from cart.");
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/items/status/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, available: newStatus } : it
          )
        );
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating item status.");
    }
  };

  const handleRequestAction = (reqId, newStatus) => {
    setRequests((prev) => {
      const updated = prev.map((r) =>
        r.id === reqId ? { ...r, status: newStatus } : r
      );
      try {
        localStorage.setItem("rent_hub_requests", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Filter items that are rented out
  const rentedItems = items.filter(
    (item) => item.available === "Rented Out" || item.available === 0 || item.available === "0"
  );

  // Tabs configuration sorted descending by item count (highest count on the left)
  const tabsConfig = [
    {
      key: "rented-items",
      label: "Rented Items",
      icon: <Clock size={17} />,
      count: rentedItems.length,
    },
    {
      key: "rent-requests",
      label: "Rent Requests",
      icon: <Inbox size={17} />,
      count: requests.length,
    },
    {
      key: "rent-cart",
      label: "Rent Items Cart",
      icon: <ShoppingCart size={17} />,
      count: cartItems.length,
    },
  ];

  const sortedTabs = [...tabsConfig].sort((a, b) => b.count - a.count);

  return (
    <div className="my-items-page">
      <div className="my-items-container">
        

        {/* 3 Tabs: Sorted dynamically by highest item count */}
        <div className="my-items-tabs">
          {sortedTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`my-items-tab-btn ${
                activeTab === tab.key ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="my-items-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: MY ITEMS */}
        {false && (
          <>
            {loading ? (
              <div className="my-items-loader">
                <div className="my-items-spinner" />
                <p>Loading your items...</p>
              </div>
            ) : error ? (
              <div className="my-items-error">
                <p>{error}</p>
                <button onClick={fetchMyItems} className="my-items-retry-btn">
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="my-items-empty">
                <div className="my-items-empty-icon">
                  <Package size={48} color="#15803d" />
                </div>
                <h3>No items listed yet</h3>
                <p>Start earning by listing your items for rent in the marketplace.</p>
                <Link to="/add-item" className="my-items-empty-add-btn">
                  <Plus size={18} /> Add Your First Item
                </Link>
              </div>
            ) : (
              <div className="profile-items-grid">
                {items.map((item) => {
                  const imageUrl = item.image
                    ? item.image.startsWith("http")
                      ? item.image
                      : `${API_URL}${item.image.startsWith("/") ? "" : "/"}${item.image}`
                    : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400";

                  const isAvailable =
                    item.available === "Available" ||
                    item.available === 1 ||
                    item.available === "1";

                  return (
                    <div key={item.id} className="profile-item-card">
                      {/* Image */}
                      <div className="profile-item-img-container">
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="profile-item-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400";
                          }}
                        />
                        {item.category && (
                          <span className="profile-item-category-badge">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="profile-item-body">
                        <h4 className="profile-item-title">{item.title}</h4>

                        {/* Status */}
                        <div className="profile-item-status-row">
                          <span className="profile-item-status-label">Status:</span>
                          <select
                            value={isAvailable ? "Available" : "Rented Out"}
                            onChange={(e) =>
                              handleStatusChange(item.id, e.target.value)
                            }
                            className={`profile-item-status-select ${
                              isAvailable ? "status-available" : "status-rented"
                            }`}
                          >
                            <option value="Available">Available</option>
                            <option value="Rented Out">Rented Out</option>
                          </select>
                        </div>

                        {/* Price */}
                        <div className="profile-item-footer">
                          <div>
                            <span className="profile-item-price-label">Price</span>
                            <p className="profile-item-price">
                              Rs. {Number(item.price || 0).toLocaleString()}
                              <span className="profile-item-price-type">
                                {" "}/ {item.priceType || "day"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TAB 2: RENTED ITEMS */}
        {activeTab === "rented-items" && (
          <>
            {loading ? (
              <div className="my-items-loader">
                <div className="my-items-spinner" />
                <p>Loading rented items...</p>
              </div>
            ) : rentedItems.length === 0 ? (
              <div className="my-items-empty">
                <div className="my-items-empty-icon" style={{ background: "#fef3c7" }}>
                  <Clock size={48} color="#d97706" />
                </div>
                <h3>No items currently rented out</h3>
                <p>
                  Items marked as "Rented Out" will be displayed here so you can keep track of active rentals.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("my-items")}
                  className="my-items-empty-add-btn"
                >
                  View All Items
                </button>
              </div>
            ) : (
              <div className="my-items-grid">
                {rentedItems.map((item) => {
                  const imageUrl = item.image
                    ? item.image.startsWith("http")
                      ? item.image
                      : `${API_URL}${item.image.startsWith("/") ? "" : "/"}${item.image}`
                    : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400";

                  return (
                    <div key={item.id} className="my-item-card rented-border">
                      <div className="my-item-image-wrapper">
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="my-item-image"
                        />
                        <span className="my-item-category-badge" style={{ background: "#d97706" }}>
                          Rented Out
                        </span>
                      </div>

                      <div className="my-item-body">
                        <h3 className="my-item-title" title={item.title}>
                          {item.title}
                        </h3>

                        <div className="my-item-status-row">
                          <span className="my-item-status-label">Status:</span>
                          <select
                            value="Rented Out"
                            onChange={(e) =>
                              handleStatusChange(item.id, e.target.value)
                            }
                            className="my-item-status-select status-rented"
                          >
                            <option value="Available">Mark Available</option>
                            <option value="Rented Out">Rented Out</option>
                          </select>
                        </div>

                        <div className="my-item-price-row">
                          <div>
                            <span className="my-item-price-label">Rental Rate</span>
                            <p className="my-item-price">
                              Rs. {Number(item.price || 0).toLocaleString()}
                              <span className="my-item-price-type">
                                {" "}
                                / {item.priceType || "day"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="my-item-actions">
                          <Link
                            to={`/item/${item.id}`}
                            className="my-item-view-btn"
                          >
                            View Item →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TAB 3: RENT REQUESTS */}
        {activeTab === "rent-requests" && (
          <div className="rent-requests-section">
            {requests.length === 0 ? (
              <div className="my-items-empty">
                <div className="my-items-empty-icon" style={{ background: "#e0f2fe" }}>
                  <Inbox size={48} color="#0284c7" />
                </div>
                <h3>No rental requests yet</h3>
                <p>When buyers submit rental requests for your products, they will appear here.</p>
              </div>
            ) : (
              <div className="rent-requests-list">
                {requests.map((req) => (
                  <div key={req.id} className="rent-request-card">
                    <div className="rent-request-top">
                      <div>
                        <span className="rent-request-time">{req.createdAt}</span>
                        <h4 className="rent-request-item-title">{req.itemTitle}</h4>
                      </div>
                      <span
                        className={`rent-request-status-badge ${
                          req.status === "Approved"
                            ? "badge-approved"
                            : req.status === "Declined"
                            ? "badge-declined"
                            : "badge-pending"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="rent-request-meta-grid">
                      <div className="rent-request-meta-item">
                        <User size={15} color="#15803d" />
                        <div>
                          <strong>{req.requesterName}</strong>
                          <span>{req.requesterPhone}</span>
                        </div>
                      </div>

                      <div className="rent-request-meta-item">
                        <Calendar size={15} color="#15803d" />
                        <div>
                          <strong>Rental Period</strong>
                          <span>
                            {req.startDate} → {req.endDate}
                          </span>
                        </div>
                      </div>

                      <div className="rent-request-meta-item">
                        <ShoppingBag size={15} color="#15803d" />
                        <div>
                          <strong>Total ({req.quantity} item)</strong>
                          <span>Rs. {req.totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    {req.status === "Pending" && (
                      <div className="rent-request-actions">
                        <button
                          type="button"
                          onClick={() => handleRequestAction(req.id, "Approved")}
                          className="req-btn req-btn-approve"
                        >
                          <CheckCircle2 size={16} /> Approve Request
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestAction(req.id, "Declined")}
                          className="req-btn req-btn-decline"
                        >
                          <XCircle size={16} /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RENT CART */}
        {activeTab === "rent-cart" && (
        loadingCart ? (
          <div className="my-items-loader">
            <div className="my-items-spinner" />
            <p>Loading cart items...</p>
          </div>
        ) : errorCart ? (
          <div className="my-items-error">
            <p>{errorCart}</p>
            <button onClick={fetchCartItems} className="my-items-retry-btn">Retry</button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="my-items-empty">
            <div className="my-items-empty-icon" style={{ background: "#eff6ff" }}>
              <ShoppingCart size={48} color="#2563eb" />
            </div>
            <h3>Your Rent Cart is empty</h3>
            <p>Browse items and add them to your rent cart to request rentals.</p>
            <Link to="/" className="my-items-empty-add-btn">Browse Items</Link>
          </div>
        ) : (
          <div className="rent-cart-items">
            {/* Toolbar for Selection */}
            <div className="rent-cart-toolbar">
              <label className="rent-cart-select-all">
                <input
                  type="checkbox"
                  checked={
                    cartItems.length > 0 &&
                    selectedCartIds.length === cartItems.length
                  }
                  onChange={handleSelectAll}
                />
                <span>Select All ({cartItems.length} items)</span>
              </label>

              {selectedCartIds.length > 0 && (
                <div className="rent-cart-selected-summary">
                  <span className="selected-count">
                    Selected: <strong>{selectedCartIds.length}</strong>
                  </span>
                  <span className="selected-total">
                    Total: <strong>Rs. {totalSelectedPrice.toLocaleString()}</strong>
                  </span>
                </div>
              )}
            </div>

            {cartItems.map((ci) => (
              <CartItemCard
                key={ci.id}
                cartItem={ci}
                isSelected={selectedCartIds.includes(ci.id)}
                onToggleSelect={handleToggleSelect}
                onRemove={handleRemoveFromCart}
              />
            ))}
          </div>
        )
      )}
      </div>
    </div>
  );
}
