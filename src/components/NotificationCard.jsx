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
  API_URL = "http://localhost:5001",
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
          icon: <CheckCircle2 size={15} color="#15803d" />,
          bg: "#f0fdf4",
          border: "#bbf7d0",
          tag: "Approved",
          tagColor: "#15803d",
        };
      case "request_declined":
        return {
          icon: <XCircle size={15} color="#e11d48" />,
          bg: "#fff1f2",
          border: "#fecdd3",
          tag: "Declined",
          tagColor: "#e11d48",
        };
      case "item_picked_up":
        return {
          icon: <PackageCheck size={15} color="#0d9488" />,
          bg: "#f0fdfa",
          border: "#99f6e4",
          tag: "Picked Up",
          tagColor: "#0d9488",
        };
      case "item_returned":
        return {
          icon: <RotateCcw size={15} color="#7c3aed" />,
          bg: "#faf5ff",
          border: "#e9d5ff",
          tag: "Returned",
          tagColor: "#7c3aed",
        };
      case "chat_message":
        return {
          icon: <MessageCircle size={15} color="#0284c7" />,
          bg: "#f0f9ff",
          border: "#bae6fd",
          tag: "Message",
          tagColor: "#0284c7",
        };
      case "rental_request":
        return {
          icon: <Clock size={15} color="#d97706" />,
          bg: "#fffbeb",
          border: "#fde68a",
          tag: "Request",
          tagColor: "#d97706",
        };
      default:
        return {
          icon: <Bell size={15} color="#64748b" />,
          bg: "#f8fafc",
          border: "#e2e8f0",
          tag: "Alert",
          tagColor: "#64748b",
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
