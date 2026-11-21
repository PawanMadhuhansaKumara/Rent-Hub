import React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, User } from "lucide-react";

export default function ProfileHistoryTab({
  rentalHistory = [],
  loadingHistory = false,
  historyError = null,
  styles = {},
  t: propT,
}) {
  const { t: i18nT } = useTranslation();
  const t = propT || i18nT;

  return (
    <div id="profile-history-section" style={{ marginTop: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 5px",
              fontSize: "20px",
              color: "var(--text-main)",
            }}
          >
            {t("profile.rentalHistory", "Rental History")}
          </h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
            {t("profile.historySubtitle", "View your completed rental transactions.")}
          </p>
        </div>
      </div>

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
      ) : !rentalHistory || rentalHistory.length === 0 ? (
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
          {t("profile.noHistory", "No completed rental transactions found.")}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {rentalHistory.map((rental) => {
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

            const formatDate = (value) =>
              value
                ? new Date(value).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—";

            return (
              <div
                key={rental.transactionId}
                className="profile-history-card-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "14px",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <img
                  src={itemImage}
                  alt={rental.itemTitle || "Rental item"}
                  style={{
                    width: "104px",
                    height: "104px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    background: "var(--bg-input)",
                  }}
                />
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <h4
                    style={{
                      margin: "0 0 8px",
                      color: "var(--text-main)",
                      fontSize: "16px",
                    }}
                  >
                    {rental.itemTitle || "Rental item"}
                  </h4>
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
                  </p>
                  <p
                    style={{
                      margin: "4px 0",
                      color: "var(--text-muted)",
                      fontSize: "13px",
                    }}
                  >
                    {t("profile.quantityLabel", "Quantity")}: {rental.quantity || 1} · {rental.totalDays || 1} {t("profile.daysLabel", "day(s)")}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "9px",
                    }}
                  >
                    {otherUserImage ? (
                      <img
                        src={otherUserImage}
                        alt={rental.otherUserName || "User"}
                        style={{
                          width: "25px",
                          height: "25px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <User size={22} color="var(--text-muted)" />
                    )}
                    <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {rental.historyType === "buyer"
                        ? t("profile.rentedFrom", "Rented from")
                        : t("profile.rentedTo", "Rented to")}
                      : <strong style={{ color: "var(--text-main)" }}>{rental.otherUserName || "User"}</strong>
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <strong
                    style={{
                      display: "block",
                      color: "var(--text-main)",
                      fontSize: "17px",
                    }}
                  >
                    LKR{" "}
                    {Number(rental.totalPrice || 0).toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                  <span
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color:
                        rental.historyType === "buyer"
                          ? "var(--badge-blue-text)"
                          : "var(--badge-purple-text)",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {rental.historyType === "buyer"
                      ? t("profile.rentedBuyer", "Rented")
                      : t("profile.rentedSeller", "Rented Out")}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "5px 10px",
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
                      margin: "7px 0 0",
                      color: "var(--text-muted)",
                      fontSize: "11px",
                    }}
                  >
                    {t("profile.transaction", "Transaction")} #{rental.transactionId}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
