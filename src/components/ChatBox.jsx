import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Send, X, MessageCircle, User, RefreshCw, Check, CheckCheck, Trash2 } from "lucide-react";

export default function ChatBox({
  conversationId: initialConversationId,
  itemId,
  itemTitle,
  itemImage,
  itemPrice,
  itemPriceType,
  sellerId,
  sellerName,
  sellerPic,
  currentUser,
  onClose,
  onConversationDeleted,
}) {
  const { t } = useTranslation();
  const [conversationId, setConversationId] = useState(initialConversationId || null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [deletingAction, setDeletingAction] = useState(false);

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const currentUserId = currentUser?.user_id || currentUser?.id;

  // 1. Initialize Chat: Find or create conversation
  const initChat = async () => {
    setLoading(true);
    setError("");

    try {
      let activeConvId = conversationId;

      // If no conversationId provided, call /api/chat/start
      if (!activeConvId && itemId && sellerId && currentUserId) {
        const res = await fetch("https://rent-hub-ashen.vercel.app/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: itemId,
            buyer_id: currentUserId,
            seller_id: sellerId,
          }),
        });

        // Safely check if response is JSON or HTML error
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          if (res.status === 404 || text.includes("Cannot POST")) {
            throw new Error(
              "Backend server එක restart කර නැත! කරුණාකර Backend terminal එකේ Ctrl+C ඔබා නැවත 'node index.js' run කරන්න."
            );
          }
          throw new Error("Backend server is not responding with JSON. Please restart backend.");
        }

        const data = await res.json();
        if (res.ok && data.conversationId) {
          activeConvId = data.conversationId;
          setConversationId(activeConvId);
        } else {
          throw new Error(data.message || "Failed to start chat");
        }
      }

      // Load messages for the active conversation
      if (activeConvId) {
        await fetchMessages(activeConvId);
        markMessagesAsRead(activeConvId);
      }
    } catch (err) {
      console.error("Chat Init Error:", err);
      setError(err.message || "Error loading chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      initChat();
    } else {
      setError("Please login to chat with seller.");
      setLoading(false);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [conversationId, itemId, sellerId, currentUserId]);

  // 2. Poll for new messages every 3 seconds
  useEffect(() => {
    if (!conversationId) return;

    pollingRef.current = setInterval(() => {
      fetchMessages(conversationId, false);
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [conversationId]);

  // 3. Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages from backend
  const fetchMessages = async (convId, showLoading = true) => {
    try {
      const res = await fetch(`https://rent-hub-ashen.vercel.app/api/chat/messages/${convId}`);
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.conversation) {
          setConversation(data.conversation);
        }
      }
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (convId) => {
    if (!currentUserId || !convId) return;
    try {
      await fetch(`https://rent-hub-ashen.vercel.app/api/chat/mark-read/${convId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
    } catch (err) {
      console.error("Mark Read Error:", err);
    }
  };

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      let targetConvId = conversationId;

      // If conversationId not established yet, create it on the fly
      if (!targetConvId && itemId && sellerId && currentUserId) {
        const startRes = await fetch("https://rent-hub-ashen.vercel.app/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: itemId,
            buyer_id: currentUserId,
            seller_id: sellerId,
          }),
        });

        const startContentType = startRes.headers.get("content-type") || "";
        if (!startContentType.includes("application/json")) {
          throw new Error("Backend server restart කර නැත. කරුණාකර Backend server එක restart කරන්න.");
        }

        const startData = await startRes.json();
        if (startRes.ok && startData.conversationId) {
          targetConvId = startData.conversationId;
          setConversationId(targetConvId);
        } else {
          throw new Error(startData.message || "Failed to start chat");
        }
      }

      if (!targetConvId) {
        throw new Error("Could not initialize chat conversation");
      }

      // Optimistic UI update
      const tempMessage = {
        id: Date.now(),
        conversation_id: targetConvId,
        sender_id: currentUserId,
        message_text: messageText,
        created_at: new Date().toISOString(),
        is_read: 0,
        sender_name: currentUser?.full_name || "You",
      };
      setMessages((prev) => [...prev, tempMessage]);
      setError("");

      const res = await fetch("https://rent-hub-ashen.vercel.app/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: targetConvId,
          sender_id: currentUserId,
          message_text: messageText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? data.message : msg))
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Send Error:", err);
      alert(err.message || "Failed to send message. Please ensure backend is running.");
    } finally {
      setSending(false);
    }
  };

  // Format time to Sri Lanka time (Asia/Colombo, UTC+5:30)
  const formatTime = (dateStr) => {
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
      return date.toLocaleTimeString("en-US", {
        timeZone: "Asia/Colombo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  // Prompt to delete an individual message
  const promptDeleteMessage = (messageId) => {
    if (!messageId) return;
    setConfirmModal({
      type: "message",
      id: messageId,
      title: "Delete Message?",
      text: "Are you sure you want to delete this message? It will be permanently removed from this conversation.",
    });
  };

  // Prompt to delete entire conversation
  const promptDeleteConversation = () => {
    if (!conversationId) return;
    setConfirmModal({
      type: "conversation",
      id: conversationId,
      title: "Delete Conversation?",
      text: "Are you sure you want to delete this entire chat conversation and all its messages?",
    });
  };

  // Handle confirmed delete action
  const handleConfirmDelete = async () => {
    if (!confirmModal || deletingAction) return;
    setDeletingAction(true);

    try {
      if (confirmModal.type === "message") {
        const messageId = confirmModal.id;
        const res = await fetch(`https://rent-hub-ashen.vercel.app/api/chat/messages/${messageId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        });

        if (res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
          setConfirmModal(null);
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.message || "Failed to delete message.");
        }
      } else if (confirmModal.type === "conversation") {
        const res = await fetch(`https://rent-hub-ashen.vercel.app/api/chat/conversations/${confirmModal.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        });

        if (res.ok) {
          setConfirmModal(null);
          if (onConversationDeleted) {
            onConversationDeleted();
          } else if (onClose) {
            onClose();
          }
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.message || "Failed to delete conversation.");
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error while deleting.");
    } finally {
      setDeletingAction(false);
    }
  };

  // Header display details
  const displayTitle = conversation?.item_title || itemTitle || "Item Chat";
  const displayImage = conversation?.item_image || itemImage;
  const displayPrice = conversation?.item_price || itemPrice;
  const displayPriceType = conversation?.item_price_type || itemPriceType || "day";

  const formattedItemImage = displayImage
    ? displayImage.startsWith("http")
      ? displayImage
      : `https://rent-hub-ashen.vercel.app${displayImage.startsWith("/") ? "" : "/"}${displayImage}`
    : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=150";

  // The other person in this conversation
  const isBuyer = Number(currentUserId) === Number(conversation?.buyer_id);
  const otherPartyName = isBuyer
    ? conversation?.seller_name || sellerName || "Seller"
    : conversation?.buyer_name || "Buyer";
  const otherPartyPic = isBuyer
    ? conversation?.seller_pic || sellerPic
    : conversation?.buyer_pic;

  return (
    <div style={styles.overlay} className="chatbox-overlay">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .chat-msg-del-btn:hover {
          opacity: 1 !important;
          background-color: var(--badge-red-bg) !important;
        }
        .chat-msg-del-btn:hover svg {
          stroke: var(--badge-red-text) !important;
        }
        .chat-header-del-btn:hover {
          background-color: var(--badge-red-bg) !important;
          transform: scale(1.05);
        }
        .chat-confirm-cancel-btn:hover {
          background-color: var(--border-light) !important;
        }
        .chat-confirm-delete-btn:hover {
          background-color: var(--badge-red-text) !important;
        }
        @media (max-width: 640px) {
          .chatbox-overlay {
            padding: 8px 8px 75px 8px !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }
          .chatbox-container {
            width: 100% !important;
            max-width: 100% !important;
            height: calc(100dvh - 85px) !important;
            max-height: calc(100vh - 85px) !important;
            border-radius: 18px 18px 0 0 !important;
            border-bottom: none !important;
          }
        }
      `}</style>
      <div style={styles.chatContainer} className="chatbox-container">
        {/* IN-CHATBOX CONFIRMATION MODAL */}
        {confirmModal && (
          <div
            style={styles.confirmOverlay}
            onClick={() => !deletingAction && setConfirmModal(null)}
          >
            <div
              style={styles.confirmBox}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.confirmIconWrap}>
                <Trash2 size={24} color="var(--badge-red-text)" />
              </div>
              <h4 style={styles.confirmTitle}>{confirmModal.title}</h4>
              <p style={styles.confirmText}>{confirmModal.text}</p>
              <div style={styles.confirmBtnRow}>
                <button
                  type="button"
                  className="chat-confirm-cancel-btn"
                  style={styles.confirmCancelBtn}
                  onClick={() => setConfirmModal(null)}
                  disabled={deletingAction}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="chat-confirm-delete-btn"
                  style={styles.confirmDeleteBtn}
                  onClick={handleConfirmDelete}
                  disabled={deletingAction}
                >
                  {deletingAction ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {otherPartyPic ? (
              <img
                src={
                  otherPartyPic.startsWith("http")
                    ? otherPartyPic
                    : `https://rent-hub-ashen.vercel.app${otherPartyPic}`
                }
                alt="Avatar"
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <User size={18} color="var(--text-inverse)" />
              </div>
            )}
            <div>
              <h4 style={styles.headerTitle}>{otherPartyName}</h4>
              <p style={styles.headerSubtitle}>
                {isBuyer ? (t("chat.sellerOfItem") || "Seller of item") : (t("chat.interestedBuyer") || "Interested Buyer")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {conversationId && (
              <button
                type="button"
                onClick={promptDeleteConversation}
                className="chat-header-del-btn"
                style={styles.headerDeleteBtn}
                title={t("chat.deleteChat") || "Delete entire chat"}
              >
                <Trash2 size={16} color="var(--badge-red-text)" />
              </button>
            )}
            <button onClick={onClose} style={styles.closeBtn} title="Close Chat">
              <X size={20} color="var(--text-secondary)" />
            </button>
          </div>
        </div>

        {/* ITEM CARD PREVIEW */}
        <div style={styles.itemPreview}>
          <img
            src={formattedItemImage}
            alt={displayTitle}
            style={styles.itemImg}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=150";
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h5 style={styles.itemTitle}>{displayTitle}</h5>
            {displayPrice && (
              <p style={styles.itemPrice}>
                LKR {Number(displayPrice).toLocaleString()} / {displayPriceType}
              </p>
            )}
          </div>
        </div>

        {/* MESSAGES BODY */}
        <div style={styles.messagesContainer}>
          {loading ? (
            <div style={styles.emptyNotice}>{t("chat.loadingConversation") || "Loading conversation..."}</div>
          ) : error ? (
            <div style={{ ...styles.emptyNotice, color: "var(--badge-red-text)", padding: "20px" }}>
              <p style={{ margin: 0, fontWeight: "600", fontSize: "13px", lineHeight: "1.5" }}>
                {error}
              </p>
              <button
                type="button"
                onClick={initChat}
                style={{
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--badge-red-text)",
                  background: "var(--badge-red-bg)",
                  color: "var(--badge-red-text)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={14} /> {t("chat.retry") || "Retry"}
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div style={styles.emptyNotice}>
              <MessageCircle size={36} color="var(--border-light)" style={{ marginBottom: "8px" }} />
              <p style={{ margin: 0, fontWeight: "600" }}>{t("chat.noMessagesYet") || "No messages yet"}</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                {t("chat.inquireNotice") || "Send a message to start inquiring about this item!"}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = Number(msg.sender_id) === Number(currentUserId);
              return (
                <div
                  key={msg.id || index}
                  className="chat-message-row"
                  style={{
                    ...styles.messageRow,
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isMe && (
                    <button
                      type="button"
                      className="chat-msg-del-btn"
                      onClick={() => promptDeleteMessage(msg.id)}
                      title={t("chat.deleteMessage") || "Delete message"}
                      style={styles.msgDeleteBtn}
                    >
                      <Trash2 size={13} color="var(--text-muted)" />
                    </button>
                  )}

                  <div
                    style={{
                      ...styles.messageBubble,
                      ...(isMe ? styles.myBubble : styles.otherBubble),
                    }}
                  >
                    <p style={styles.messageText}>{msg.message_text}</p>
                    <div style={styles.messageMeta}>
                      <span style={isMe ? styles.myMetaTime : styles.otherMetaTime}>
                        {formatTime(msg.created_at)}
                      </span>
                      {isMe && (
                        <span style={{ marginLeft: "4px" }}>
                          {msg.is_read ? (
                            <CheckCheck size={14} color="var(--badge-blue-text)" />
                          ) : (
                            <Check size={14} color="var(--badge-blue-border)" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FOOTER */}
        <form onSubmit={handleSendMessage} style={styles.footer}>
          <input
            type="text"
            style={styles.input}
            placeholder={t("chat.typeMessagePlaceholder") || "Type your message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          <button
            type="submit"
            style={{
              ...styles.sendBtn,
              opacity: !newMessage.trim() || sending ? 0.6 : 1,
            }}
            disabled={!newMessage.trim() || sending}
          >
            <Send size={18} color="var(--text-inverse)" />
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    zIndex: 2000,
    padding: "20px 20px 85px 20px", // Space above bottom navigation bar
  },
  chatContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    height: "530px",
    maxHeight: "calc(100vh - 105px)",
    backgroundColor: "var(--bg-card)",
    borderRadius: "20px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid var(--border-light)",
    animation: "slideUp 0.25s ease-out",
  },
  confirmOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "20px",
    animation: "fadeIn 0.18s ease-out",
  },
  confirmBox: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "18px",
    padding: "22px 20px",
    width: "100%",
    maxWidth: "300px",
    textAlign: "center",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
    border: "1px solid var(--bg-card-hover)",
    animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  confirmIconWrap: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    backgroundColor: "var(--badge-red-bg)",
    border: "1px solid var(--badge-red-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px auto",
  },
  confirmTitle: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text-main)",
  },
  confirmText: {
    margin: "0 0 20px 0",
    fontSize: "13px",
    color: "var(--text-muted)",
    lineHeight: "1.45",
  },
  confirmBtnRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  confirmCancelBtn: {
    flex: 1,
    padding: "9px 14px",
    borderRadius: "10px",
    border: "1px solid var(--border-light)",
    backgroundColor: "var(--bg-app-alt)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  confirmDeleteBtn: {
    flex: 1,
    padding: "9px 14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "var(--badge-red-text)",
    color: "var(--text-inverse)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
    transition: "background 0.2s",
  },
  header: {
    padding: "14px 18px",
    backgroundColor: "var(--bg-card)",
    borderBottom: "1px solid var(--bg-card-hover)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatarImg: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "var(--badge-blue-text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "bold",
    color: "var(--text-main)",
  },
  headerSubtitle: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  closeBtn: {
    background: "var(--bg-card-hover)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  headerDeleteBtn: {
    background: "var(--badge-red-bg)",
    border: "1px solid var(--badge-red-bg)",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.1s",
  },
  msgDeleteBtn: {
    background: "transparent",
    border: "none",
    borderRadius: "4px",
    padding: "4px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    opacity: 0.6,
    transition: "opacity 0.2s, background-color 0.2s, color 0.2s",
  },
  itemPreview: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    backgroundColor: "var(--bg-app-alt)",
    borderBottom: "1px solid var(--border-light)",
  },
  itemImg: {
    width: "46px",
    height: "46px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid var(--border-light)",
  },
  itemTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "bold",
    color: "var(--text-main)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemPrice: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "var(--primary)",
    fontWeight: "bold",
  },
  messagesContainer: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "var(--bg-app-alt)",
  },
  emptyNotice: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "14px",
  },
  messageRow: {
    display: "flex",
    width: "100%",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  myBubble: {
    backgroundColor: "var(--badge-blue-text)",
    color: "var(--text-inverse)",
    borderBottomRightRadius: "4px",
  },
  otherBubble: {
    backgroundColor: "var(--bg-card)",
    color: "var(--text-main)",
    border: "1px solid var(--border-light)",
    borderBottomLeftRadius: "4px",
  },
  messageText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.45",
    wordBreak: "break-word",
  },
  messageMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: "4px",
  },
  myMetaTime: {
    fontSize: "10px",
    color: "var(--badge-blue-bg)",
  },
  otherMetaTime: {
    fontSize: "10px",
    color: "var(--text-muted)",
  },
  footer: {
    padding: "12px 16px",
    backgroundColor: "var(--bg-card)",
    borderTop: "1px solid var(--border-light)",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "24px",
    border: "1px solid var(--border-light)",
    outline: "none",
    fontSize: "14px",
    color: "var(--text-main)",
    backgroundColor: "var(--bg-card)",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
  },
  sendBtn: {
    backgroundColor: "var(--badge-blue-text)",
    border: "none",
    borderRadius: "50%",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};
