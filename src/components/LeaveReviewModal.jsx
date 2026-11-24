import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, X, CheckCircle2, MessageSquare, AlertCircle, Trash2, Edit3 } from "lucide-react";

export default function LeaveReviewModal({
  isOpen,
  onClose,
  item,
  currentUser,
  onReviewSubmitted,
  onReviewDeleted,
  API_URL = "https://rent-hub-ashen.vercel.app",
}) {
  // Review ID resolution:
  // 1. Explicit review ID on rental item (item.reviewId or item.review_id)
  // 2. Direct review object from ItemDetails / Profile (where item.id is the review ID and it has NO requestId/itemId)
  const explicitReviewId = item?.reviewId || item?.review_id || null;
  const isDirectReviewObject = Boolean(
    !item?.requestId &&
    !item?.request_id &&
    item?.id &&
    (item?.rating !== undefined || item?.comment !== undefined) &&
    (item?.buyerName || item?.buyerPic || item?.sellerReply !== undefined)
  );

  const reviewId = explicitReviewId || (isDirectReviewObject ? item?.id : null);
  const isEdit = Boolean(reviewId);
  const { t } = useTranslation();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (item) {
      if (isEdit) {
        setRating(Number(item.reviewRating || item.rating || 5));
        setComment(item.reviewComment || item.comment || "");
      } else {
        setRating(5);
        setComment("");
      }
      setErrorMsg("");
      setSuccess(false);
      setSuccessMsg("");
    }
  }, [item, isEdit]);

  if (!isOpen || !item) return null;

  const activeStars = hoverRating || rating;

  const getRatingLabel = (val) => {
    switch (val) {
      case 5:
        return t("rentModals.ratingExcellent", "Excellent! (5.0)");
      case 4:
        return t("rentModals.ratingVeryGood", "Very Good (4.0)");
      case 3:
        return t("rentModals.ratingGood", "Good (3.0)");
      case 2:
        return t("rentModals.ratingFair", "Fair (2.0)");
      case 1:
        return t("rentModals.ratingPoor", "Poor (1.0)");
      default:
        return "Select Rating";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg("");

    const myId = currentUser?.user_id || currentUser?.id;
    if (!myId) {
      setErrorMsg("Please log in to submit a review.");
      return;
    }

    const reqId = item.requestId || item.request_id || item.id;
    const itmId = item.itemId || item.item_id || item.id;
    const sellerId = item.sellerId || item.seller_id || item.user_id;

    setSubmitting(true);
    try {
      if (isEdit && reviewId) {
        // UPDATE EXISTING REVIEW
        const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerId: myId,
            rating,
            comment: comment.trim(),
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(true);
          setSuccessMsg("Review updated successfully!");
          if (onReviewSubmitted) {
            onReviewSubmitted({
              requestId: reqId,
              reviewId,
              rating,
              comment: comment.trim(),
              isEdit: true,
            });
          }
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(data.message || "Failed to update review.");
        }
      } else {
        // CREATE NEW REVIEW
        if (!reqId || !itmId || !sellerId) {
          setErrorMsg("Missing rental information. Cannot submit review.");
          setSubmitting(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: reqId,
            itemId: itmId,
            buyerId: myId,
            sellerId: sellerId,
            rating,
            comment: comment.trim(),
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(true);
          setSuccessMsg("Review submitted successfully!");
          if (onReviewSubmitted) {
            onReviewSubmitted({
              requestId: reqId,
              reviewId: data.reviewId,
              rating,
              comment: comment.trim(),
              isEdit: false,
            });
          }
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(data.message || "Failed to submit review.");
        }
      }
    } catch (err) {
      console.error("Review Submit Error:", err);
      setErrorMsg("Network error. Please make sure the server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewId || deleting) return;
    if (!window.confirm("Are you sure you want to delete your review and rating?")) return;

    const myId = currentUser?.user_id || currentUser?.id;
    setDeleting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerId: myId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setSuccessMsg("Review deleted successfully.");
        if (onReviewDeleted) {
          onReviewDeleted({
            requestId: item.requestId || item.request_id || item.id,
            reviewId,
          });
        }
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Delete Review Error:", err);
      setErrorMsg("Network error while deleting review.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={() => !submitting && !deleting && onClose()}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={styles.iconWrap}>
              {isEdit ? (
                <Edit3 size={18} color="var(--badge-blue-text)" />
              ) : (
                <Star size={18} color="var(--badge-yellow-text)" fill="var(--badge-yellow-text)" />
              )}
            </div>
            <div>
              <h3 style={styles.title}>
                {t("rentModals.leaveReview", isEdit ? "Edit Your Review" : "Rate & Review")}
              </h3>
              <p style={styles.subtitle}>
                {t(
                  "rentModals.rateExperience",
                  isEdit
                    ? "Update your rating or comments for this rental"
                    : "Share your rental experience with the community"
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || deleting}
            style={styles.closeBtn}
            title="Close"
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Item Context Preview */}
        <div style={styles.itemPreview}>
          {item.image || item.itemImage ? (
            <img
              src={
                (item.image || item.itemImage).startsWith("http")
                  ? item.image || item.itemImage
                  : `${API_URL}${
                      (item.image || item.itemImage).startsWith("/") ? "" : "/"
                    }${item.image || item.itemImage}`
              }
              alt={item.title || item.itemTitle}
              style={styles.itemImg}
            />
          ) : (
            <div style={{ ...styles.itemImg, background: "var(--border-light)" }} />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4 style={styles.itemName}>
              {item.title || item.itemTitle || "Rented Item"}
            </h4>
            <p style={styles.shopName}>
              Rented from:{" "}
              <strong>
                {item.sellerName || item.shopName || "Item Owner"}
              </strong>
            </p>
          </div>
        </div>

        {/* Success Screen */}
        {success ? (
          <div style={styles.successBox}>
            <CheckCircle2 size={48} color="var(--primary)" />
            <h4 style={{ margin: "12px 0 4px 0", color: "var(--primary)", fontSize: "17px" }}>
              {successMsg || (isEdit ? "Review Updated!" : "Review Submitted!")}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              Thank you for helping others make confident rental choices.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {errorMsg && (
              <div style={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Interactive Stars Section */}
            <div style={styles.starSection}>
              <label style={styles.label}>Your Rating</label>
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= activeStars;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      style={styles.starBtn}
                      title={`${starVal} Star${starVal > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={32}
                        color={isFilled ? "var(--badge-yellow-text)" : "var(--border-light)"}
                        fill={isFilled ? "var(--badge-yellow-text)" : "none"}
                        strokeWidth={1.5}
                      />
                    </button>
                  );
                })}
              </div>
              <span style={styles.ratingLabel}>{getRatingLabel(activeStars)}</span>
            </div>

            {/* Comment Area */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <MessageSquare size={14} style={{ marginRight: "4px" }} />
                Your Feedback & Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the item's condition? Was the owner helpful and punctual? Would you recommend this shop?"
                rows={4}
                style={styles.textarea}
              />
            </div>

            {/* Actions */}
            <div style={styles.actionsRow}>
              {isEdit && reviewId ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting || deleting}
                  style={styles.deleteReviewBtn}
                  title="Delete this review completely"
                >
                  <Trash2 size={15} />
                  <span>{deleting ? "Deleting..." : "Delete Review"}</span>
                </button>
              ) : null}

              <div style={{ display: "flex", gap: "10px", marginLeft: isEdit && reviewId ? "auto" : "0" }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting || deleting}
                  style={styles.cancelBtn}
                >
                  {t("buyerLocation.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting || deleting}
                  style={styles.submitBtn}
                >
                  {submitting
                    ? t("rentRequest.submitting", "Saving...")
                    : t("rentModals.submitReview", isEdit ? "Update Review" : "Submit Review")}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
    padding: "16px",
    animation: "fadeIn 0.2s ease-out",
  },
  modalBox: {
    backgroundColor: "var(--bg-modal)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    border: "1px solid var(--border-light)",
    color: "var(--text-main)",
    overflow: "hidden",
    animation: "scaleIn 0.2s ease-out",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid var(--bg-card-hover)",
  },
  iconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "var(--badge-yellow-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: "var(--text-main)",
  },
  subtitle: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    padding: "6px",
    cursor: "pointer",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemPreview: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 24px",
    backgroundColor: "var(--bg-app-alt)",
    borderBottom: "1px solid var(--bg-card-hover)",
  },
  itemImg: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid var(--border-light)",
    flexShrink: 0,
  },
  itemName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-main)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  shopName: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  form: {
    padding: "20px 24px 24px",
  },
  starSection: {
    textAlign: "center",
    padding: "12px 0 16px",
    borderBottom: "1px solid var(--bg-card-hover)",
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    marginBottom: "8px",
  },
  starsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  starBtn: {
    background: "transparent",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    transition: "transform 0.1s ease",
  },
  ratingLabel: {
    display: "inline-block",
    marginTop: "8px",
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--badge-yellow-text)",
    backgroundColor: "var(--badge-yellow-bg)",
    padding: "3px 12px",
    borderRadius: "20px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid var(--border-light)",
    fontSize: "13px",
    fontFamily: "inherit",
    lineHeight: "1.5",
    outline: "none",
    resize: "vertical",
    minHeight: "90px",
    transition: "border-color 0.2s",
  },
  actionsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
  },
  cancelBtn: {
    padding: "10px 18px",
    backgroundColor: "var(--bg-card-hover)",
    border: "1px solid var(--border-light)",
    borderRadius: "10px",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  submitBtn: {
    padding: "10px 22px",
    backgroundColor: "var(--primary)",
    border: "none",
    borderRadius: "10px",
    color: "var(--text-inverse)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0, 170, 91, 0.3)",
    transition: "background 0.2s",
  },
  deleteReviewBtn: {
    padding: "9px 14px",
    backgroundColor: "var(--badge-red-bg)",
    border: "1px solid var(--badge-red-bg)",
    borderRadius: "10px",
    color: "var(--badge-notif-bg)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "var(--badge-red-bg)",
    border: "1px solid var(--badge-red-bg)",
    borderRadius: "8px",
    color: "var(--badge-red-text)",
    fontSize: "12px",
    marginBottom: "14px",
  },
  successBox: {
    padding: "48px 24px",
    textAlign: "center",
  },
};
