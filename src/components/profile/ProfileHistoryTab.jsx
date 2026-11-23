import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  User,
  Star,
  Edit3,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  PackageCheck,
  Clock,
} from "lucide-react";

export default function ProfileHistoryTab({
  rentalHistory = [],
  loadingHistory = false,
  historyError = null,
  styles = {},
  t: propT,
  onRateItem,
}) {
  const { t: i18nT } = useTranslation();
  const t = propT || i18nT;

  // Subtab: 'rented-in' (Items I rented / Buyer) | 'rented-out' (Items I rented out / Seller)
  const [historySubTab, setHistorySubTab] = useState("rented-in");

  const rentedInList = rentalHistory.filter(
    (r) => r.historyType === "buyer" || r.reqType === "sent"
  );
  const rentedOutList = rentalHistory.filter(
    (r) => r.historyType === "seller" || r.reqType === "received"
  );

  const currentList = historySubTab === "rented-in" ? rentedInList : rentedOutList;

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div id="profile-history-section" style={{ marginTop: "24px" }}>
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 5px",
              fontSize: "20px",
              fontWeight: "800",
              color: "var(--text-main)",
            }}
          >
            {t("profile.rentalHistory", "Rental History")}
          </h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
            {t(
              "profile.historySubtitle",
              "Track your completed rentals, review borrowed items, and view feedback."
            )}
          </p>
        </div>
      </div>

      {/* Subtab Switcher: Rented In vs Rented Out */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setHistorySubTab("rented-in")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            borderRadius: "9999px",
            border:
              historySubTab === "rented-in"
                ? "1.5px solid var(--primary)"
                : "1px solid var(--border-light)",
            backgroundColor:
              historySubTab === "rented-in"
                ? "var(--primary)"
                : "var(--bg-card)",
            color: historySubTab === "rented-in" ? "#FFFFFF" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "13.5px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow:
              historySubTab === "rented-in"
                ? "0 2px 8px rgba(22, 163, 74, 0.25)"
                : "none",
          }}
        >
          <ArrowDownLeft size={16} />
          <span>{t("profile.rentedInTab", "Rented In")}</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              padding: "2px 8px",
              borderRadius: "10px",
              backgroundColor:
                historySubTab === "rented-in"
                  ? "rgba(255, 255, 255, 0.25)"
                  : "var(--bg-app-alt)",
              color:
                historySubTab === "rented-in"
                  ? "#FFFFFF"
                  : "var(--text-muted)",
            }}
          >
            {rentedInList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setHistorySubTab("rented-out")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            borderRadius: "9999px",
            border:
              historySubTab === "rented-out"
                ? "1.5px solid var(--primary)"
                : "1px solid var(--border-light)",
            backgroundColor:
              historySubTab === "rented-out"
                ? "var(--primary)"
                : "var(--bg-card)",
            color:
              historySubTab === "rented-out" ? "#FFFFFF" : "var(--text-main)",
            fontWeight: "700",
            fontSize: "13.5px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow:
              historySubTab === "rented-out"
                ? "0 2px 8px rgba(22, 163, 74, 0.25)"
                : "none",
          }}
        >
          <ArrowUpRight size={16} />
          <span>{t("profile.rentedOutTab", "Rented Out")}</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              padding: "2px 8px",
              borderRadius: "10px",
              backgroundColor:
                historySubTab === "rented-out"
                  ? "rgba(255, 255, 255, 0.25)"
                  : "var(--bg-app-alt)",
              color:
                historySubTab === "rented-out"
                  ? "#FFFFFF"
                  : "var(--text-muted)",
            }}
          >
            {rentedOutList.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      {loadingHistory ? (
        <div
          style={
            styles.emptyState || {
              padding: "40px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "14px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px dashed var(--border-light)",
            }
          }
        >
          {t("profile.loadingHistory", "Loading rental history...")}
        </div>
      ) : historyError ? (
        <div
          style={
            styles.emptyState || {
              padding: "40px",
              textAlign: "center",
              color: "var(--badge-red-text)",
              fontSize: "14px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px dashed var(--border-light)",
            }
          }
        >
          {historyError}
        </div>
      ) : currentList.length === 0 ? (
        <div
          style={
            styles.emptyState || {
              padding: "44px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "14px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px dashed var(--border-light)",
            }
          }
        >
          {historySubTab === "rented-in" ? (
            <div>
              <ShoppingBag
                size={36}
                color="var(--border-light)"
                style={{ marginBottom: "10px" }}
              />
              <p style={{ margin: 0, fontWeight: "600" }}>
                {t(
                  "profile.noRentedInHistory",
                  "No borrowed items in your history yet."
                )}
              </p>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                {t(
                  "profile.noRentedInDesc",
                  "Items you rent from shops will appear here once returned, where you can leave reviews."
                )}
              </span>
            </div>
          ) : (
            <div>
              <PackageCheck
                size={36}
                color="var(--border-light)"
                style={{ marginBottom: "10px" }}
              />
              <p style={{ margin: 0, fontWeight: "600" }}>
                {t(
                  "profile.noRentedOutHistory",
                  "No lent items in your history yet."
                )}
              </p>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                {t(
                  "profile.noRentedOutDesc",
                  "Completed rentals where you lent your items to customers will be archived here."
                )}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {currentList.map((rental) => {
            const itemImage = rental.itemImage
              ? rental.itemImage.startsWith("http")
                ? rental.itemImage
                : `http://localhost:5001${rental.itemImage.startsWith("/") ? "" : "/"}${rental.itemImage}`
              : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300";

            const otherUserImage = rental.otherUserPic
              ? rental.otherUserPic.startsWith("http")
                ? rental.otherUserPic
                : `http://localhost:5001${rental.otherUserPic.startsWith("/") ? "" : "/"}${rental.otherUserPic}`
              : null;

            const isBuyerRental =
              rental.historyType === "buyer" || rental.reqType === "sent";

            const hasReview = Boolean(
              rental.reviewId || rental.reviewRating || rental.hasReviewed
            );
            const currentRating = hasReview
              ? Number(rental.reviewRating || 5)
              : 5;
            const currentComment = hasReview ? rental.reviewComment || "" : "";

            return (
              <div
                key={rental.transactionId || rental.id}
                className="profile-history-card-item"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "14px",
                  padding: "16px 18px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Top Section: Image & Main Info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={itemImage}
                    alt={rental.itemTitle || "Rental item"}
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      background: "var(--bg-input)",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "4px",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          color: "var(--text-main)",
                          fontSize: "16px",
                          fontWeight: "700",
                        }}
                      >
                        {rental.itemTitle || "Rental item"}
                      </h4>
                      <span
                        style={{
                          color: isBuyerRental
                            ? "var(--badge-blue-text)"
                            : "var(--badge-purple-text)",
                          backgroundColor: isBuyerRental
                            ? "var(--badge-blue-bg)"
                            : "var(--badge-purple-bg)",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        {isBuyerRental
                          ? t("profile.rentedBuyer", "Rented In")
                          : t("profile.rentedSeller", "Rented Out")}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "4px 0",
                        color: "var(--text-muted)",
                        fontSize: "13px",
                      }}
                    >
                      <Calendar
                        size={13}
                        style={{
                          verticalAlign: "middle",
                          marginRight: "5px",
                        }}
                      />
                      {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
                      {" · "}
                      <span>
                        {rental.quantity || 1} item(s) · {rental.totalDays || 1}{" "}
                        {t("profile.daysLabel", "day(s)")}
                      </span>
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "8px",
                      }}
                    >
                      {otherUserImage ? (
                        <img
                          src={otherUserImage}
                          alt={rental.otherUserName || "User"}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <User size={20} color="var(--text-muted)" />
                      )}
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "12.5px",
                        }}
                      >
                        {isBuyerRental
                          ? t("profile.rentedFrom", "Rented from")
                          : t("profile.rentedTo", "Rented to")}
                        :{" "}
                        <strong style={{ color: "var(--text-main)" }}>
                          {rental.otherUserName || "User"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginLeft: "auto",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "var(--text-main)",
                        fontSize: "17px",
                        fontWeight: "800",
                      }}
                    >
                      LKR{" "}
                      {Number(rental.totalPrice || 0).toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>

                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background:
                          rental.status?.toLowerCase() === "return_pending"
                            ? "var(--badge-yellow-bg)"
                            : "var(--badge-green-bg)",
                        color:
                          rental.status?.toLowerCase() === "return_pending"
                            ? "var(--badge-yellow-text)"
                            : "var(--primary)",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      {rental.status?.toLowerCase() === "return_pending"
                        ? "Handover Pending"
                        : t("profile.completed", "Completed")}
                    </span>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "var(--text-muted)",
                        fontSize: "11px",
                      }}
                    >
                      {t("profile.transaction", "Trans #")}
                      {rental.transactionId || rental.id}
                    </p>
                  </div>
                </div>

                {/* Bottom Review Section */}
                {isBuyerRental ? (
                  /* Buyer Review Action / Display */
                  <div
                    style={{
                      paddingTop: "12px",
                      borderTop: "1px dashed var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    {hasReview ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Your Review:
                          </span>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              backgroundColor: "var(--badge-yellow-bg)",
                              padding: "2px 8px",
                              borderRadius: "12px",
                            }}
                          >
                            <Star
                              size={14}
                              color="var(--badge-yellow-text)"
                              fill="var(--badge-yellow-text)"
                            />
                            <strong
                              style={{
                                fontSize: "12.5px",
                                color: "var(--badge-yellow-text)",
                              }}
                            >
                              {currentRating.toFixed(1)} ★
                            </strong>
                          </div>
                          {currentComment && (
                            <span
                              style={{
                                fontSize: "12.5px",
                                color: "var(--text-muted)",
                                fontStyle: "italic",
                                maxWidth: "340px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={currentComment}
                            >
                              "{currentComment}"
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onRateItem &&
                            onRateItem({
                              ...rental,
                              id: rental.reviewId || rental.transactionId,
                              requestId: rental.transactionId || rental.id,
                              itemId: rental.itemId,
                              sellerId: rental.sellerId,
                              title: rental.itemTitle,
                              image: rental.itemImage,
                              reviewId: rental.reviewId,
                              reviewRating: currentRating,
                              reviewComment: currentComment,
                              rating: currentRating,
                              comment: currentComment,
                              hasReviewed: true,
                            })
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "5px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-light)",
                            backgroundColor: "var(--bg-app-alt)",
                            color: "var(--text-main)",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          title="Edit or delete your review"
                        >
                          <Edit3 size={13} />
                          <span>Edit Review</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12.5px",
                            color: "var(--text-muted)",
                          }}
                        >
                          ⭐{" "}
                          {t(
                            "profile.shareExperience",
                            "Completed rental! Rate this item to build shop trust and help the community."
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onRateItem &&
                            onRateItem({
                              ...rental,
                              requestId: rental.transactionId || rental.id,
                              itemId: rental.itemId,
                              sellerId: rental.sellerId,
                              title: rental.itemTitle,
                              image: rental.itemImage,
                              hasReviewed: false,
                            })
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "8px",
                            backgroundColor: "var(--primary)",
                            color: "#FFFFFF",
                            border: "none",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
                            transition: "all 0.2s ease",
                          }}
                          title="Leave a review for this item and shop"
                        >
                          <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
                          <span>Rate & Review Item</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Seller Rental Feedback Display */
                  <div
                    style={{
                      paddingTop: "12px",
                      borderTop: "1px dashed var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    {rental.reviewId || rental.reviewRating ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Customer Feedback:
                        </span>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            backgroundColor: "var(--badge-yellow-bg)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                          }}
                        >
                          <Star
                            size={14}
                            color="var(--badge-yellow-text)"
                            fill="var(--badge-yellow-text)"
                          />
                          <strong
                            style={{
                              fontSize: "12.5px",
                              color: "var(--badge-yellow-text)",
                            }}
                          >
                            {Number(rental.reviewRating || 5).toFixed(1)} ★
                          </strong>
                        </div>
                        {rental.reviewComment && (
                          <span
                            style={{
                              fontSize: "12.5px",
                              color: "var(--text-muted)",
                              fontStyle: "italic",
                              maxWidth: "340px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={rental.reviewComment}
                          >
                            "{rental.reviewComment}"
                          </span>
                        )}
                        {rental.reviewSellerReply && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--primary)",
                              fontWeight: "700",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              backgroundColor: "var(--badge-green-bg)",
                            }}
                          >
                            ✓ Replied
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "var(--text-muted)",
                          fontSize: "12px",
                        }}
                      >
                        <Clock size={13} />
                        <span>
                          {t(
                            "profile.waitingCustomerReview",
                            "Waiting for customer review on this rental."
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
