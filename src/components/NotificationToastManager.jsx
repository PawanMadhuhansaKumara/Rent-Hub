import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  XCircle,
  PackageCheck,
  RotateCcw,
  MessageCircle,
  Clock,
  X,
  ExternalLink,
} from "lucide-react";
import "./NotificationToastManager.css";

const API_URL = "https://rent-hub-ashen.vercel.app";
const TOAST_DURATION = 6000; // 6 seconds

// Synthesize pleasant chime using Web Audio API (zero dependencies, 100% reliable)
const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Gentle melodic two-tone chime: D5 (587.33Hz) -> A5 (880Hz)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (err) {
    // Audio autoplay might be blocked before first interaction
  }
};

export default function NotificationToastManager({ user }) {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const seenIdsRef = useRef(new Set());
  const initialLoadDoneRef = useRef(false);
  const currentUserIdRef = useRef(null);

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

  // Request browser native notification permission on user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if ("Notification" in window && Notification.permission === "default") {
        try {
          Notification.requestPermission();
        } catch {}
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  // Reset tracker if user changes
  useEffect(() => {
    if (currentUserIdRef.current !== userId) {
      currentUserIdRef.current = userId;
      seenIdsRef.current = new Set();
      initialLoadDoneRef.current = false;
      setToasts([]);
    }
  }, [userId]);

  // Trigger Native Desktop Notification
  const showNativeNotification = (notif) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        const nativeNotif = new window.Notification(
          `RentHub • ${notif.title || "New Notification"}`,
          {
            body: notif.message || "You have a new update on RentHub.",
            icon: "/logoSmall.png",
            badge: "/favicon.svg",
            tag: `renthub-notif-${notif.id}`,
            renotify: true,
          }
        );

        nativeNotif.onclick = () => {
          try {
            window.focus();
            if (notif.linkUrl) {
              navigate(notif.linkUrl);
            } else {
              navigate("/notifications");
            }
            nativeNotif.close();
          } catch {}
        };
      } catch (e) {
        console.warn("Desktop notification error:", e);
      }
    }
  };

  // Poll notifications
  const checkNotifications = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/api/notifications/${userId}`);
      if (!res.ok) return;

      const data = await res.json();
      const list = data.notifications || [];

      // First run: register all existing notifications so we don't spam popups on reload
      if (!initialLoadDoneRef.current) {
        list.forEach((n) => seenIdsRef.current.add(n.id));
        initialLoadDoneRef.current = true;
        return;
      }

      // Find brand-new notifications
      const newItems = list.filter(
        (n) => !seenIdsRef.current.has(n.id) && !n.isRead
      );

      if (newItems.length > 0) {
        newItems.forEach((item) => {
          seenIdsRef.current.add(item.id);

          // 1. Play audio chime
          playNotificationChime();

          // 2. Show native browser notification
          showNativeNotification(item);

          // 3. Add to in-browser floating toast
          setToasts((prev) => {
            // Keep at most 3 toasts on screen simultaneously
            const updated = [item, ...prev].slice(0, 3);
            return updated;
          });
        });
      }
    } catch (err) {
      // Network silence
    }
  };

  // Setup interval & listeners
  useEffect(() => {
    if (!userId) return;

    checkNotifications();
    const interval = setInterval(checkNotifications, 3500);

    const handleLiveEvent = () => checkNotifications();
    window.addEventListener("notifications_updated", handleLiveEvent);
    window.addEventListener("rent_requests_updated", handleLiveEvent);
    window.addEventListener("focus", handleLiveEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications_updated", handleLiveEvent);
      window.removeEventListener("rent_requests_updated", handleLiveEvent);
      window.removeEventListener("focus", handleLiveEvent);
    };
  }, [userId]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToastClick = async (toast) => {
    removeToast(toast.id);

    // Optimistically mark as read on backend
    try {
      await fetch(`${API_URL}/api/notifications/${toast.id}/read`, {
        method: "PUT",
      });
      window.dispatchEvent(new Event("notifications_updated"));
    } catch {}

    // Navigate to target link
    if (toast.linkUrl) {
      navigate(toast.linkUrl);
    } else {
      navigate("/notifications");
    }
  };

  if (!userId || toasts.length === 0) return null;

  return (
    <div className="notif-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
          onClick={() => handleToastClick(toast)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose, onClick }) {
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(() => {
      onClose();
    }, TOAST_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, onClose]);

  const getTypeConfig = (type) => {
    switch (type) {
      case "request_approved":
        return {
          icon: <CheckCircle2 size={18} color="#16a34a" />,
          color: "#16a34a",
          badge: "Approved",
          badgeBg: "rgba(34, 197, 94, 0.15)",
        };
      case "request_declined":
        return {
          icon: <XCircle size={18} color="#ef4444" />,
          color: "#ef4444",
          badge: "Declined",
          badgeBg: "rgba(239, 68, 68, 0.15)",
        };
      case "item_picked_up":
        return {
          icon: <PackageCheck size={18} color="#2563eb" />,
          color: "#2563eb",
          badge: "Picked Up",
          badgeBg: "rgba(37, 99, 235, 0.15)",
        };
      case "item_returned":
        return {
          icon: <RotateCcw size={18} color="#9333ea" />,
          color: "#9333ea",
          badge: "Returned",
          badgeBg: "rgba(147, 51, 234, 0.15)",
        };
      case "chat_message":
        return {
          icon: <MessageCircle size={18} color="#0284c7" />,
          color: "#0284c7",
          badge: "Message",
          badgeBg: "rgba(2, 132, 199, 0.15)",
        };
      case "rental_request":
        return {
          icon: <Clock size={18} color="#d97706" />,
          color: "#d97706",
          badge: "New Request",
          badgeBg: "rgba(217, 119, 6, 0.15)",
        };
      default:
        return {
          icon: <Bell size={18} color="var(--primary)" />,
          color: "var(--primary)",
          badge: "Notice",
          badgeBg: "rgba(34, 197, 94, 0.15)",
        };
    }
  };

  const config = getTypeConfig(toast.type);

  return (
    <div
      className="notif-toast-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={onClick}
      role="alert"
    >
      {/* Accent Indicator Bar */}
      <div
        className="notif-toast-accent"
        style={{ backgroundColor: config.color }}
      />

      <div className="notif-toast-content">
        {/* Top Header Row */}
        <div className="notif-toast-header">
          <div className="notif-toast-icon-wrap" style={{ backgroundColor: config.badgeBg }}>
            {config.icon}
          </div>
          <div className="notif-toast-meta">
            <span
              className="notif-toast-badge"
              style={{ color: config.color, backgroundColor: config.badgeBg }}
            >
              {config.badge}
            </span>
            <span className="notif-toast-time">Just now</span>
          </div>

          <button
            type="button"
            className="notif-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>

        {/* Title and Message */}
        <div className="notif-toast-body">
          <h4 className="notif-toast-title">{toast.title || "New Notification"}</h4>
          <p className="notif-toast-msg">{toast.message}</p>
        </div>

        {/* Action Row */}
        <div className="notif-toast-footer">
          <span className="notif-toast-action-btn">
            View Details <ExternalLink size={12} />
          </span>
        </div>
      </div>

      {/* Draining Progress Bar */}
      <div
        className={`notif-toast-progress ${isPaused ? "paused" : ""}`}
        style={{
          backgroundColor: config.color,
          animationDuration: `${TOAST_DURATION}ms`,
        }}
      />
    </div>
  );
}
