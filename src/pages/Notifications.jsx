import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Inbox,
  MessageCircle,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import NotificationCard from "../components/NotificationCard";
import "./Notifications.css";

const API_URL = "http://https://rent-hub-ashen.vercel.app";

export default function Notifications({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const userId =
    currentUser?.id ||
    currentUser?.user_id ||
    currentUser?.userId ||
    null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchNotifications = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/notifications/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.warn("Could not fetch notifications from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for live updates
    const handleUpdate = () => fetchNotifications();
    window.addEventListener("rent_requests_updated", handleUpdate);
    window.addEventListener("notifications_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("rent_requests_updated", handleUpdate);
      window.removeEventListener("notifications_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (String(n.id) === String(id) ? { ...n, isRead: true } : n))
    );

    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
      });
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (err) {
      console.warn("Mark read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await fetch(`${API_URL}/api/notifications/user/${userId}/read-all`, {
        method: "PUT",
      });
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (err) {
      console.warn("Mark all read error:", err);
    }
  };

  const handleDelete = async (id) => {
    setNotifications((prev) => prev.filter((n) => String(n.id) !== String(id)));

    try {
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
      });
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (err) {
      console.warn("Delete notification error:", err);
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;

    setNotifications([]);

    try {
      // Clear for user
      await fetch(`${API_URL}/api/notifications/user/${userId}/clear-all`, {
        method: "DELETE",
      });
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (err) {
      console.warn("Clear error:", err);
    }
  };

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "requests") {
      return (
        n.type === "rental_request" ||
        n.type === "request_approved" ||
        n.type === "request_declined" ||
        n.type === "item_picked_up" ||
        n.type === "item_returned"
      );
    }
    if (activeTab === "messages") {
      return n.type === "chat_message";
    }
    if (activeTab === "system") {
      return n.type === "system";
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const requestsCount = notifications.filter(
    (n) =>
      n.type === "rental_request" ||
      n.type === "request_approved" ||
      n.type === "request_declined" ||
      n.type === "item_picked_up" ||
      n.type === "item_returned"
  ).length;
  const messagesCount = notifications.filter((n) => n.type === "chat_message").length;

  if (!currentUser) {
    return (
      <div className="notifications-page-container">
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <Bell size={36} />
          </div>
          <h3>Please Login</h3>
          <p>Login to view your rental requests, notifications, and updates.</p>
          <Link to="/login" className="notifications-empty-btn">
            Login to Rent-Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page-container">
      {/* Header */}
      <div className="notifications-header">
        <div className="notifications-title-area">
          <button
            type="button"
            className="notifications-back-btn"
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="notifications-main-heading">
            <h1>{t("navigation.notifications") || "Notifications"}</h1>
            {unreadCount > 0 && (
              <span className="notifications-header-badge">{unreadCount}</span>
            )}
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="notifications-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notifications-action-btn"
                onClick={handleMarkAllAsRead}
                title="Mark all notifications as read"
              >
                <CheckCheck size={14} />
                <span className="btn-label-desktop">{t("notificationsPage.markAllAsRead", "Mark All as Read")}</span>
                <span className="btn-label-mobile">{t("notificationsPage.markAllAsRead", "Read All")}</span>
              </button>
            )}
            <button
              type="button"
              className="notifications-action-btn"
              onClick={handleClearAll}
              title="Clear notifications"
            >
              <Trash2 size={14} />
              <span>{t("notificationsPage.clearAll", "Clear")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="notifications-tabs">
        <button
          type="button"
          className={`notifications-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <span>{t("notificationsPage.all", "All")}</span>
          <span className="notifications-tab-count">{notifications.length}</span>
        </button>

        <button
          type="button"
          className={`notifications-tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <Inbox size={14} />
          <span>{t("notificationsPage.requests", "Rental Requests")}</span>
          <span className="notifications-tab-count">{requestsCount}</span>
        </button>

        <button
          type="button"
          className={`notifications-tab-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          <MessageCircle size={14} />
          <span>{t("notificationsPage.messages", "Messages")}</span>
          <span className="notifications-tab-count">{messagesCount}</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="notifications-loader">
          <div className="notifications-spinner" />
          <p>Loading your notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <Bell size={36} />
          </div>
          <h3>{t("notificationsPage.noNotifications", "No notifications yet")}</h3>
          <p>
            {t("notificationsPage.emptyDesc", "You are all caught up! When you receive rental requests, status updates, or messages, they will show up here.")}
          </p>
          <Link to="/" className="notifications-empty-btn">
            <ShoppingBag size={16} />
            <span>{t("rentsPage.browseItems", "Browse Rental Items")}</span>
          </Link>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              API_URL={API_URL}
            />
          ))}
        </div>
      )}
    </div>
  );
}
