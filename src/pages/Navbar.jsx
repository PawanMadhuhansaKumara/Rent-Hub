
import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageCircle, X, Clock } from "lucide-react";
import ChatBox from "../components/ChatBox";
import "./Navbar.css";
import "../responsive.css";
import logo from "../assets/logoSmall.png";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  const isActive = (path) => location.pathname === path;

  // Chat States
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [activeChatConversation, setActiveChatConversation] = useState(null);
  const dropdownRef = useRef(null);

  const userId = user?.user_id || user?.id;

  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5001/api/chat/unread-count/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Fetch conversations list when dropdown opens
  const fetchConversations = async () => {
    if (!userId) return;
    setLoadingChats(true);
    try {
      const res = await fetch(`http://localhost:5001/api/chat/user-conversations/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const activeList = (data.conversations || []).filter(
          (conv) => conv.last_message && conv.last_message.trim() !== ""
        );
        setConversations(activeList);
      }
    } catch (err) {
      console.error("Error fetching user conversations:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  // Poll unread count every 5 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  // When dropdown opens, fetch conversations
  useEffect(() => {
    if (showChatDropdown) {
      fetchConversations();
    }
  }, [showChatDropdown]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowChatDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleChatIconClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowChatDropdown((prev) => !prev);
  };

  const formatChatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      let date;
      if (typeof dateStr === "number" || dateStr instanceof Date) {
        date = new Date(dateStr);
      } else {
        let s = String(dateStr).trim();
        // If MySQL datetime lacks timezone indicator, treat as UTC
        if (!s.endsWith("Z") && !s.includes("+") && !s.match(/-\d{2}:\d{2}$/)) {
          s = s.replace(" ", "T") + "Z";
        }
        date = new Date(s);
      }
      if (isNaN(date.getTime())) return "";

      const now = new Date();
      const msgDate = date.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
      const nowDate = now.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });

      if (msgDate === nowDate) {
        return date.toLocaleTimeString("en-US", {
          timeZone: "Asia/Colombo",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      return date.toLocaleDateString("en-US", {
        timeZone: "Asia/Colombo",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const handleOpenConversation = (conv) => {
    setActiveChatConversation(conv);
    setShowChatDropdown(false);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-brand">
        <img
          src={logo}
          alt="Rent-Hub Logo"
          className="navbar-logo"
        />
      </Link>

      
{/* Navigation Links - Only show when logged in */}
{user && (
  <div className="navbar-menu">
    <Link
      to="/"
      className={`navbar-link ${
        isActive("/") ? "active" : ""
      }`}
    >
      {t("appbar.home") || "Home"}
    </Link>

    <Link
      to="/#rental-items"
      className="navbar-link"
    >
      Browse Items
    </Link>

    <Link
      to="/add-item"
      className={`navbar-add-item ${
        isActive("/add-item") ? "active" : ""
      }`}
    >
      <span>+</span> Add Item
    </Link>
  </div>
)}


      {/* Right Side */}
      <div className="navbar-actions">
        <select
          className="navbar-language"
          value={i18n.language?.split("-")[0] || "en"}
          onChange={(e) => changeLanguage(e.target.value)}
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="si">සිංහල</option>
          <option value="ta">தமிழ்</option>
        </select>

        {/* Chat Icon & Dropdown - Placed right next to Language Changer */}
        <div className="navbar-chat-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="navbar-chat-btn"
            onClick={handleChatIconClick}
            title="Messages & Inquiries"
            aria-label="Messages"
          >
            <MessageCircle size={22} color="#374151" />
            {unreadCount > 0 && (
              <span className="navbar-chat-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Conversations Dropdown */}
          {showChatDropdown && (
            <div className="navbar-chat-dropdown">
              <div className="navbar-chat-dropdown-header">
                <div>
                  <h4 className="navbar-chat-dropdown-title">
                    Messages
                  </h4>
                  <p className="navbar-chat-dropdown-subtitle">
                    {conversations.length} {t("chat.conversations") || "conversations"}
                  </p>
                </div>
                <button
                  type="button"
                  className="navbar-chat-close-btn"
                  onClick={() => setShowChatDropdown(false)}
                  aria-label="Close"
                >
                  <X size={17} color="#0284c7" />
                </button>
              </div>

              <div className="navbar-chat-dropdown-body">
                {loadingChats ? (
                  <div className="navbar-chat-empty">Loading chats...</div>
                ) : conversations.length === 0 ? (
                  <div className="navbar-chat-empty">
                    <MessageCircle size={32} color="#cbd5e1" style={{ marginBottom: "6px" }} />
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "13px", color: "#475569" }}>
                      {t("chat.noMessagesYet") || "No messages yet"}
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>
                      {t("chat.startChattingNotice") || "Start chatting with sellers directly from any item details page!"}
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isBuyer = Number(userId) === Number(conv.buyer_id);
                    const partnerName = isBuyer ? conv.seller_name || "Seller" : conv.buyer_name || "Buyer";
                    const hasUnread = conv.unread_count > 0;

                    return (
                      <div
                        key={conv.conversation_id}
                        className={`navbar-chat-item ${hasUnread ? "unread" : ""}`}
                        onClick={() => handleOpenConversation(conv)}
                      >
                        <img
                          src={conv.item_image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=100"}
                          alt={conv.item_title}
                          className="navbar-chat-item-img"
                        />
                        <div className="navbar-chat-item-info">
                          <div className="navbar-chat-item-row">
                            <span className="navbar-chat-item-title">
                              {conv.item_title || "Item Chat"}
                            </span>
                            <span className="navbar-chat-item-time">
                              {formatChatTime(conv.last_message_time)}
                            </span>
                          </div>
                          <div className="navbar-chat-item-partner-row">
                            <span className="navbar-chat-partner-label">{t("chat.with") || "With:"}</span>
                            <span className="navbar-chat-partner-badge">{partnerName}</span>
                          </div>
                          <div className="navbar-chat-item-snippet-row">
                            {conv.last_message ? (
                              <span className="navbar-chat-snippet-bubble">
                                {conv.last_message}
                              </span>
                            ) : (
                              <span className="navbar-chat-item-snippet">
                                {t("chat.noMessagesYet") || "No messages yet"}
                              </span>
                            )}
                          </div>
                        </div>
                        {hasUnread && (
                          <span className="navbar-chat-unread-dot" title={`${conv.unread_count} unread`}>
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {user ? (
          <>
            <Link to="/profile" className="navbar-profile">
              <img
                src={
                  user.profile_pic_url
                    ? user.profile_pic_url.startsWith("http")
                      ? user.profile_pic_url
                      : `http://localhost:5001${user.profile_pic_url}`
                    : "https://via.placeholder.com/40"
                }
                alt="Profile"
                className="navbar-profile-pic"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://via.placeholder.com/40";
                }}
              />

              <span className="navbar-username">
                {user.full_name || "My Profile"}
              </span>
            </Link>

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              {t("appbar.logout") || "Logout"}
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className={`navbar-login ${
              isActive("/login") ? "active" : ""
            }`}
          >
            {t("appbar.login") || "Login"}
          </Link>
        )}
      </div>

      {/* Active Chat Box Modal */}
      {activeChatConversation && (
        <ChatBox
          conversationId={activeChatConversation.conversation_id}
          itemId={activeChatConversation.item_id}
          itemTitle={activeChatConversation.item_title}
          itemImage={activeChatConversation.item_image}
          itemPrice={activeChatConversation.item_price}
          itemPriceType={activeChatConversation.item_price_type}
          sellerId={activeChatConversation.seller_id}
          sellerName={
            Number(userId) === Number(activeChatConversation.seller_id)
              ? activeChatConversation.buyer_name
              : activeChatConversation.seller_name
          }
          currentUser={user}
          onClose={() => {
            setActiveChatConversation(null);
            fetchUnreadCount();
          }}
        />
      )}
    </nav>
  );
}
