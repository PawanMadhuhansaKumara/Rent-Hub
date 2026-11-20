import React from "react";
import { Star, Edit3, Trash2, CornerDownRight, ChevronDown } from "lucide-react";

export default function ProfileReviewsTab({
  profile = {},
  sellerReviews = [],
  loadingReviews = false,
  visibleProfileReviews = 3,
  setVisibleProfileReviews = () => {},
  loggedInUserId,
  loggedInUser,
  isOwnProfile = false,
  replyingReviewId,
  replyingToReviewId,
  setReplyingReviewId = () => {},
  setReplyingToReviewId,
  editingReplyId,
  setEditingReplyId = () => {},
  replyText = "",
  setReplyText = () => {},
  submittingReply = false,
  handlePostReply = () => {},
  handleReplySubmit,
  handleDeleteReply = () => {},
  setEditingCustomerReview = () => {},
  handleDeleteCustomerReview = () => {},
  styles = {},
  t = (key, fallback) => fallback || key,
}) {
  const currentLoggedInUserId =
    loggedInUserId || loggedInUser?.user_id || loggedInUser?.id;

  const currentReplyingReviewId =
    replyingReviewId !== undefined ? replyingReviewId : replyingToReviewId;

  const currentSetReplyingReviewId =
    setReplyingReviewId || setReplyingToReviewId || (() => {});

  const currentHandlePostReply =
    handlePostReply || handleReplySubmit || (() => {});

  const currentRating =
    profile?.user_rating && profile.user_rating > 0
      ? Number(profile.user_rating).toFixed(1)
      : profile?.reviews_count > 0
      ? "5.0"
      : "0.0";

  const totalReviewsCount =
    profile?.reviews_count !== undefined
      ? profile.reviews_count
      : sellerReviews?.length || 0;

  return (
    <div id="profile-reviews-section" style={{ marginTop: "24px" }}>
      {/* Reviews Summary Header Card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          padding: "24px 28px",
          border: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              backgroundColor: "var(--badge-yellow-bg)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--badge-yellow-border)",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "var(--badge-yellow-text)",
                lineHeight: 1,
              }}
            >
              {currentRating}
            </span>
            <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={10}
                  color="var(--badge-yellow-text)"
                  fill={
                    s <=
                    Math.round(
                      profile?.user_rating ||
                        (profile?.reviews_count > 0 ? 5 : 0)
                    )
                      ? "var(--badge-yellow-text)"
                      : "none"
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <h3
              style={{
                margin: "0 0 4px 0",
                fontSize: "18px",
                fontWeight: "700",
                color: "var(--text-main)",
              }}
            >
              Customer Reviews & Ratings
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              Based on{" "}
              <strong>
                {totalReviewsCount}{" "}
                {totalReviewsCount === 1 ? "review" : "reviews"}
              </strong>{" "}
              from verified renters
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loadingReviews ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <p>Loading reviews...</p>
        </div>
      ) : !sellerReviews || sellerReviews.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            backgroundColor: "var(--bg-app-alt)",
            borderRadius: "16px",
            border: "1px dashed var(--border-light)",
          }}
        >
          <Star
            size={40}
            color="var(--border-light)"
            style={{ marginBottom: "12px" }}
          />
          <h4
            style={{
              margin: "0 0 6px 0",
              color: "var(--text-secondary)",
              fontSize: "16px",
            }}
          >
            No reviews yet
          </h4>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
            Reviews from customers who completed rentals will be featured here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {sellerReviews.slice(0, visibleProfileReviews).map((rev) => {
            const buyerPic = rev.buyerPic
              ? rev.buyerPic.startsWith("http")
                ? rev.buyerPic
                : `http://localhost:5001${rev.buyerPic}`
              : null;

            const itemImg = rev.itemImage
              ? rev.itemImage.startsWith("http")
                ? rev.itemImage
                : `http://localhost:5001${rev.itemImage}`
              : null;

            const isMyReview =
              Boolean(currentLoggedInUserId) &&
              Number(currentLoggedInUserId) === Number(rev.buyerId);

            return (
              <div
                key={rev.id}
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  border: "1px solid var(--border-light)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                {/* Top Row: User info & Rating */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {buyerPic ? (
                      <img
                        src={buyerPic}
                        alt={rev.buyerName || "Buyer"}
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid var(--border-light)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                          color: "var(--text-inverse)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "16px",
                        }}
                      >
                        {rev.buyerName ? rev.buyerName[0].toUpperCase() : "U"}
                      </div>
                    )}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <h5
                          style={{
                            margin: "0 0 2px 0",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "var(--text-main)",
                          }}
                        >
                          {rev.buyerName || "Verified Renter"}
                        </h5>
                        {isMyReview && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "var(--badge-blue-text)",
                              backgroundColor: "var(--badge-blue-bg)",
                              padding: "1px 6px",
                              borderRadius: "10px",
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "Recent Review"}
                        {rev.buyerCity ? ` • ${rev.buyerCity}` : ""}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          color="var(--badge-yellow-text)"
                          fill={
                            star <= Number(rev.rating) ? "var(--badge-yellow-text)" : "none"
                          }
                        />
                      ))}
                      <span
                        style={{
                          marginLeft: "4px",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "var(--badge-yellow-text)",
                        }}
                      >
                        {Number(rev.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    {/* Customer Actions: Edit / Delete own review */}
                    {isMyReview && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setEditingCustomerReview({
                              ...rev,
                              title: rev.itemTitle,
                              itemTitle: rev.itemTitle,
                              image: rev.itemImage,
                              itemImage: rev.itemImage,
                            })
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            background: "var(--badge-blue-bg)",
                            border: "1px solid var(--badge-blue-border)",
                            color: "var(--badge-blue-text)",
                            borderRadius: "6px",
                            padding: "2px 7px",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                          title="Edit your review"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomerReview(rev.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            background: "var(--badge-red-bg)",
                            border: "1px solid var(--badge-red-border)",
                            color: "var(--badge-red-text)",
                            borderRadius: "6px",
                            padding: "2px 7px",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                          title="Delete your review"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Tag */}
                {rev.itemTitle && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "var(--bg-app-alt)",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                      marginBottom: "12px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {itemImg && (
                      <img
                        src={itemImg}
                        alt={rev.itemTitle}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "4px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <span>
                      Rented: <strong>{rev.itemTitle}</strong>
                    </span>
                  </div>
                )}

                {/* Comment text */}
                {rev.comment ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.5",
                    }}
                  >
                    "{rev.comment}"
                  </p>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    (Rating only, no written comment provided)
                  </p>
                )}

                {/* Seller / Shop Response Display */}
                {rev.sellerReply && editingReplyId !== rev.id && (
                  <div
                    style={{
                      marginTop: "14px",
                      backgroundColor: "var(--badge-green-bg)",
                      border: "1px solid var(--badge-green-bg)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      borderLeft: "4px solid var(--primary)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <CornerDownRight size={15} color="var(--primary)" />
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "var(--primary-hover)",
                          }}
                        >
                          Response from Shop Owner
                        </span>
                        {rev.sellerReplyAt && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                            }}
                          >
                            •{" "}
                            {new Date(rev.sellerReplyAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>

                      {isOwnProfile && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReplyId(rev.id);
                              setReplyText(rev.sellerReply);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--primary)",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              padding: "2px 6px",
                            }}
                            title="Edit your reply"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReply(rev.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--badge-red-text)",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              padding: "2px 6px",
                            }}
                            title="Delete your reply"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "var(--text-main)",
                        lineHeight: "1.5",
                      }}
                    >
                      {rev.sellerReply}
                    </p>
                  </div>
                )}

                {/* Reply Form (When Shop Owner clicks Reply or Edit) */}
                {isOwnProfile &&
                  (currentReplyingReviewId === rev.id ||
                    editingReplyId === rev.id) && (
                    <div
                      style={{
                        marginTop: "14px",
                        backgroundColor: "var(--bg-app-alt)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "12px",
                        padding: "14px",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "var(--text-secondary)",
                          marginBottom: "6px",
                        }}
                      >
                        {editingReplyId === rev.id
                          ? "Edit your response:"
                          : "Write a response to this customer:"}
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Thank the customer or address their feedback..."
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-light)",
                          fontSize: "13px",
                          fontFamily: "inherit",
                          resize: "vertical",
                          outline: "none",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            currentSetReplyingReviewId(null);
                            setEditingReplyId(null);
                            setReplyText("");
                          }}
                          disabled={submittingReply}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-light)",
                            backgroundColor: "var(--bg-card)",
                            color: "var(--text-secondary)",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => currentHandlePostReply(rev.id)}
                          disabled={submittingReply || !replyText.trim()}
                          style={{
                            padding: "6px 16px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "var(--primary)",
                            color: "var(--text-inverse)",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor:
                              submittingReply || !replyText.trim()
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              submittingReply || !replyText.trim() ? 0.6 : 1,
                          }}
                        >
                          {submittingReply ? "Posting..." : "Post Reply"}
                        </button>
                      </div>
                    </div>
                  )}

                {/* Reply Button (When no reply yet and owner is viewing) */}
                {isOwnProfile &&
                  !rev.sellerReply &&
                  currentReplyingReviewId !== rev.id && (
                    <div
                      style={{
                        marginTop: "12px",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          currentSetReplyingReviewId(rev.id);
                          setEditingReplyId(null);
                          setReplyText("");
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--badge-green-bg)",
                          backgroundColor: "var(--badge-green-bg)",
                          color: "var(--primary-hover)",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <CornerDownRight size={14} />
                        <span>Reply to Review</span>
                      </button>
                    </div>
                  )}
              </div>
            );
          })}

          {/* See more reviews button (loads 3 more each time) */}
          {sellerReviews.length > visibleProfileReviews && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "12px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setVisibleProfileReviews((prev) => prev + 3)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--badge-green-bg)",
                  border: "1.5px solid var(--badge-green-bg)",
                  color: "var(--primary)",
                  padding: "10px 24px",
                  borderRadius: "9999px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <span>See more reviews</span>
                <span style={{ fontSize: "12px", opacity: 0.85 }}>
                  ({sellerReviews.length - visibleProfileReviews} remaining)
                </span>
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
