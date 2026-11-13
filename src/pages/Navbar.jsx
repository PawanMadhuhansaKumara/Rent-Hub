import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageCircle, X, Clock, Trash2 } from "lucide-react";
import ChatBox from "../components/ChatBox";
import "./Navbar.css";
import "../responsive.css";
import logo from "../assets/logoSmall.png";
import LanguageSelecter from "../components/LanguageSelecter";
import CartIcon from "../components/CartIcon";

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
  const [deleteConfirmConvId, setDeleteConfirmConvId] = useState(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const dropdownRef = useRef(null);

  const userId = user?.user_id || user?.id;

  // Rental Limit එක ලබා ගැනීම (Login නැත්නම් 1000 යි)
  const userLimit = user ? Number(user.rental_limit || 1000) : 1000;

  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5001/api/chat/unread-count/${userId}`,
      );
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
      const res = await fetch(
        `http://localhost:5001/api/chat/user-conversations/${userId}`,
      );
      if (res.ok) {
        const data = await res.json();
        const activeList = (data.conversations || []).filter(
          (conv) => conv.last_message && conv.last_message.trim() !== "",
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
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
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
        if (!s.endsWith("Z") && !s.includes("+") && !s.match(/-\d{2}:\d{2}$/)) {
          s = s.replace(" ", "T") + "Z";
        }
        date = new Date(s);
      }
      if (isNaN(date.getTime())) return "";

      const now = new Date();
      const msgDate = date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Colombo",
      });
      const nowDate = now.toLocaleDateString("en-CA", {
        timeZone: "Asia/Colombo",
      });

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

  const handleDeleteConversation = (e, convId) => {
    e.stopPropagation();
    setDeleteConfirmConvId(convId);
  };

  const executeDeleteConversation = async (convId) => {
    if (!convId || isDeletingChat) return;
    setIsDeletingChat(true);

    try {
      const res = await fetch(`http://localhost:5001/api/chat/conversations/${convId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.conversation_id !== convId));
        fetchUnreadCount();
        if (activeChatConversation?.conversation_id === convId) {
          setActiveChatConversation(null);
        }
        setDeleteConfirmConvId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to delete conversation.");
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
      alert("Server error while deleting conversation.");
    } finally {
      setIsDeletingChat(false);
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
        <img src={logo} alt="Rent-Hub Logo" className="navbar-logo" />
      </Link>

      {/* Right Side Actions */}
      <div className="navbar-actions">
        {/* Home Link */}
        {!user && (
          <Link
            to="/"
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
          >
            {t("appbar.home") || "Home"}
          </Link>
        )}

        {/* --- GREEN RENTAL LIMIT BADGE (Placed near Cart & Message icons) --- */}
        {user && (
          <div className="nav-rental-limit-badge" title="Your current max rental limit">
            <span className="limit-label">Limit:</span>
            <span className="limit-amount">LKR {userLimit.toLocaleString()}</span>
          </div>
        )}

        {user && <CartIcon />}

        {/* Language Selector */}
        {!user && <LanguageSelecter />}

        {/* Chat Icon & Dropdown */}
        {user && (
          <div className="navbar-chat-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="navbar-chat-btn"
              onClick={handleChatIconClick}
              title="Messages & Inquiries"
              aria-label="Messages"
            >
              <MessageCircle size={21} color="#ffffff" />
              {unreadCount > 0 && (
                <span className="navbar-chat-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Conversations Dropdown */}
            {showChatDropdown && (
              <>
                <div
                  className="navbar-chat-mobile-backdrop"
                  onClick={() => setShowChatDropdown(false)}
                />
                <div className="navbar-chat-dropdown">
                {deleteConfirmConvId && (
                  <div
                    className="navbar-chat-confirm-overlay"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDeletingChat) setDeleteConfirmConvId(null);
                    }}
                  >
                    <div
                      className="navbar-chat-confirm-box"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="navbar-chat-confirm-icon">
                        <Trash2 size={22} color="#ef4444" />
                      </div>
                      <h4 className="navbar-chat-confirm-title">Delete Conversation?</h4>
                      <p className="navbar-chat-confirm-text">
                        Are you sure you want to delete this chat and all its messages?
                      </p>
                      <div className="navbar-chat-confirm-actions">
                        <button
                          type="button"
                          className="navbar-chat-confirm-cancel"
                          onClick={() => setDeleteConfirmConvId(null)}
                          disabled={isDeletingChat}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="navbar-chat-confirm-delete"
                          onClick={() => executeDeleteConversation(deleteConfirmConvId)}
                          disabled={isDeletingChat}
                        >
                          {isDeletingChat ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="navbar-chat-dropdown-header">
                  <div>
                    <h4 className="navbar-chat-dropdown-title">Messages</h4>
                    <p className="navbar-chat-dropdown-subtitle">
                      {conversations.length}{" "}
                      {t("chat.conversations") || "conversations"}
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
                      <MessageCircle
                        size={32}
                        color="#cbd5e1"
                        style={{ marginBottom: "6px" }}
                      />
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "600",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {t("chat.noMessagesYet") || "No messages yet"}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "11px",
                          color: "#94a3b8",
                        }}
                      >
                        {t("chat.startChattingNotice") ||
                          "Start chatting with sellers directly from any item details page!"}
                      </p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const isBuyer = Number(userId) === Number(conv.buyer_id);
                      const partnerName = isBuyer
                        ? conv.seller_name || "Seller"
                        : conv.buyer_name || "Buyer";
                      const hasUnread = conv.unread_count > 0;

                      return (
                        <div
                          key={conv.conversation_id}
                          className={`navbar-chat-item ${hasUnread ? "unread" : ""}`}
                          onClick={() => handleOpenConversation(conv)}
                        >
                          <img
                            src={
                              conv.item_image
                                ? conv.item_image.startsWith("http")
                                  ? conv.item_image
                                  : `http://localhost:5001${conv.item_image.startsWith("/") ? "" : "/"}${conv.item_image}`
                                : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=100"
                            }
                            alt={conv.item_title}
                            className="navbar-chat-item-img"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=100";
                            }}
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
                              <span className="navbar-chat-partner-label">
                                {t("chat.with") || "With:"}
                              </span>
                              <span className="navbar-chat-partner-badge">
                                {partnerName}
                              </span>
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
                          <div className="navbar-chat-item-actions">
                            {hasUnread && (
                              <span
                                className="navbar-chat-unread-dot"
                                title={`${conv.unread_count} unread`}
                              >
                                {conv.unread_count}
                              </span>
                            )}
                            <button
                              type="button"
                              className="navbar-chat-delete-btn"
                              title={t("chat.deleteChat") || "Delete Chat"}
                              onClick={(e) => handleDeleteConversation(e, conv.conversation_id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              </>
            )}
          </div>
        )}

        {user ? (
          <Link
            to="/profile"
            className="navbar-profile"
            title={user.full_name || "Profile"}
          >
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
                e.currentTarget.src = "https://via.placeholder.com/40";
              }}
            />
          </Link>
        ) : (
          <Link
            to="/login"
            className={`navbar-login ${isActive("/login") ? "active" : ""}`}
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
          onConversationDeleted={() => {
            setActiveChatConversation(null);
            fetchUnreadCount();
            fetchConversations();
          }}
        />
      )}
    </nav>
  );
}