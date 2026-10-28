import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Send, X, MessageCircle, User, RefreshCw, Check, CheckCheck } from "lucide-react";

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
}) {
  const { t } = useTranslation();
  const [conversationId, setConversationId] = useState(initialConversationId || null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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
        const res = await fetch("http://localhost:5001/api/chat/start", {
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
      const res = await fetch(`http://localhost:5001/api/chat/messages/${convId}`);
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
      await fetch(`http://localhost:5001/api/chat/mark-read/${convId}`, {
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
        const startRes = await fetch("http://localhost:5001/api/chat/start", {
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

      const res = await fetch("http://localhost:5001/api/chat/send", {
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

  // Format time (e.g. 10:45 AM)
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Header display details
  const displayTitle = conversation?.item_title || itemTitle || "Item Chat";
  const displayImage = conversation?.item_image || itemImage;
  const displayPrice = conversation?.item_price || itemPrice;
  const displayPriceType = conversation?.item_price_type || itemPriceType || "day";

  // The other person in this conversation
  const isBuyer = Number(currentUserId) === Number(conversation?.buyer_id);
  const otherPartyName = isBuyer
    ? conversation?.seller_name || sellerName || "Seller"
    : conversation?.buyer_name || "Buyer";
  const otherPartyPic = isBuyer
    ? conversation?.seller_pic || sellerPic
    : conversation?.buyer_pic;

  return (
    <div style={styles.overlay}>
      <div style={styles.chatContainer}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {otherPartyPic ? (
              <img
                src={
                  otherPartyPic.startsWith("http")
                    ? otherPartyPic
                    : `http://localhost:5001${otherPartyPic}`
                }
                alt="Avatar"
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <User size={18} color="#fff" />
              </div>
            )}
            <div>
              <h4 style={styles.headerTitle}>{otherPartyName}</h4>
              <p style={styles.headerSubtitle}>
                {isBuyer ? (t("chat.sellerOfItem") || "Seller of item") : (t("chat.interestedBuyer") || "Interested Buyer")}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={styles.closeBtn} title="Close Chat">
            <X size={20} color="#475569" />
          </button>
        </div>

        {/* ITEM CARD PREVIEW */}
        <div style={styles.itemPreview}>
          {displayImage && (
            <img src={displayImage} alt={displayTitle} style={styles.itemImg} />
          )}
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
            <div style={{ ...styles.emptyNotice, color: "#dc2626", padding: "20px" }}>
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
                  border: "1px solid #ef4444",
                  background: "#fef2f2",
                  color: "#dc2626",
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
              <MessageCircle size={36} color="#cbd5e1" style={{ marginBottom: "8px" }} />
              <p style={{ margin: 0, fontWeight: "600" }}>{t("chat.noMessagesYet") || "No messages yet"}</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
                {t("chat.inquireNotice") || "Send a message to start inquiring about this item!"}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = Number(msg.sender_id) === Number(currentUserId);
              return (
                <div
                  key={msg.id || index}
                  style={{
                    ...styles.messageRow,
                    justifyContent: isMe ? "flex-end" : "flex-start",
                  }}
                >
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
                            <CheckCheck size={14} color="#60a5fa" />
                          ) : (
                            <Check size={14} color="#93c5fd" />
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
            <Send size={18} color="#fff" />
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
    padding: "20px",
  },
  chatContainer: {
    width: "100%",
    maxWidth: "420px",
    height: "560px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    animation: "slideUp 0.25s ease-out",
  },
  header: {
    padding: "14px 18px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #f1f5f9",
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
    backgroundColor: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "#64748b",
  },
  closeBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  itemPreview: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  itemImg: {
    width: "46px",
    height: "46px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid #e2e8f0",
  },
  itemTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "bold",
    color: "#1e293b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemPrice: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "#16a34a",
    fontWeight: "bold",
  },
  messagesContainer: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#f8fafc",
  },
  emptyNotice: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#64748b",
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
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderBottomRightRadius: "4px",
  },
  otherBubble: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
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
    color: "#bfdbfe",
  },
  otherMetaTime: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  footer: {
    padding: "12px 16px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "24px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
  },
  sendBtn: {
    backgroundColor: "#2563eb",
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
