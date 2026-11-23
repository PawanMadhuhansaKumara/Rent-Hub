import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  XCircle,
  PackageCheck,
  RotateCcw,
  MessageCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { formatCompactTime } from "../utils/dateUtils";

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  API_URL = "https://rent-hub-ashen.vercel.app",
}) {
  const navigate = useNavigate();

  if (!notification) return null;

  const {
    id,
    title,
    message,
    type = "system",
    imageUrl,
    linkUrl,
    isRead = false,
    createdAt,
  } = notification;

  // Type styling matching Rent-Hub
  const getTypeConfig = () => {
    switch (type) {
      case "request_approved":
        return {
          icon: <CheckCircle2 size={15} color="var(--primary)" />,
          bg: "var(--badge-green-bg)",
          border: "var(--badge-green-bg)",
          tag: "Approved",
          tagColor: "var(--primary)",
        };
      case "request_declined":
        return {
          icon: <XCircle size={15} color="var(--badge-notif-bg)" />,
          bg: "var(--badge-red-bg)",
          border: "var(--badge-red-bg)",
          tag: "Declined",
          tagColor: "var(--badge-notif-bg)",
        };
      case "item_picked_up":
        return {
          icon: <PackageCheck size={15} color="var(--badge-blue-text)" />,
          bg: "var(--badge-blue-bg)",
          border: "var(--badge-blue-border)",
          tag: "Picked Up",
          tagColor: "var(--badge-blue-text)",
        };
      case "item_returned":
        return {
          icon: <RotateCcw size={15} color="var(--badge-purple-text)" />,
          bg: "var(--badge-purple-bg)",
          border: "var(--badge-purple-bg)",
          tag: "Returned",
          tagColor: "var(--badge-purple-text)",
        };
      case "chat_message":
        return {
          icon: <MessageCircle size={15} color="var(--badge-blue-text)" />,
          bg: "var(--badge-blue-bg)",
          border: "var(--badge-blue-border)",
          tag: "Message",
          tagColor: "var(--badge-blue-text)",
        };
      case "rental_request":
        return {
          icon: <Clock size={15} color="var(--badge-yellow-text)" />,
          bg: "var(--badge-yellow-bg)",
          border: "var(--badge-yellow-border)",
          tag: "Request",
          tagColor: "var(--badge-yellow-text)",
        };
      default:
        return {
          icon: <Bell size={15} color="var(--text-muted)" />,
          bg: "var(--bg-app-alt)",
          border: "var(--border-light)",
          tag: "Alert",
          tagColor: "var(--text-muted)",
        };
    }
  };

  const config = getTypeConfig();

  const imgSource = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${API_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    : null;

  const handleCardClick = (e) => {
    // If clicking delete button, don't navigate
    if (e.target.closest(".notif-del-btn")) return;

    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id);
    }

    if (linkUrl) {
      let targetUrl = linkUrl;
      if (targetUrl.startsWith("/rents")) {
        if (targetUrl.includes("tab=rented")) {
          targetUrl = "/my-items?tab=rented-items&subtab=rented-in";
        } else {
          targetUrl = "/my-items?tab=rent-requests";
        }
      }
      navigate(targetUrl);
    }
  };

  return (
    <div
      className={`notif-card ${isRead ? "notif-read" : "notif-unread"}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleCardClick(e);
      }}
    >
      {/* Left Icon */}
      <div
        className="notif-icon-box"
        style={{ backgroundColor: config.bg, borderColor: config.border }}
      >
        {config.icon}
      </div>

      {/* Main Content */}
      <div className="notif-body">
        <div className="notif-header-line">
          <div className="notif-title-row">
            <span
              className="notif-badge"
              style={{
                backgroundColor: config.bg,
                color: config.tagColor,
                borderColor: config.border,
              }}
            >
              {config.tag}
            </span>
            <span className="notif-title">{title}</span>
          </div>
          <span className="notif-time">{formatCompactTime(createdAt)}</span>
        </div>

        <p className="notif-desc">{message}</p>

        {/* Thumbnail if present */}
        {imgSource && (
          <div className="notif-thumb-wrap">
            <img
              src={imgSource}
              alt="Item"
              className="notif-thumb"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Right Column: Unread Dot + Delete Button */}
      <div className="notif-right-col" onClick={(e) => e.stopPropagation()}>
        {!isRead && (
          <span className="notif-dot" title="Unread notification" />
        )}

        {onDelete && (
          <button
            type="button"
            className="notif-del-btn"
            onClick={() => onDelete(id)}
            title="Delete notification"
            aria-label="Delete notification"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
