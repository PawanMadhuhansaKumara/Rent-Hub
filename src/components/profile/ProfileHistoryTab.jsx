import React from "react";
import { Calendar, User } from "lucide-react";

export default function ProfileHistoryTab({
  rentalHistory = [],
  loadingHistory = false,
  historyError = null,
  styles = {},
  t = (key) => key,
}) {
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
              color: "#0f172a",
            }}
          >
            Rental History
          </h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
            View your completed rental transactions.
          </p>
        </div>
      </div>

      {loadingHistory ? (
        <div
          style={
            styles.emptyState || {
              padding: "40px",
              textAlign: "center",
              color: "#777",
              fontSize: "14px",
              backgroundColor: "#fafafa",
              borderRadius: "16px",
              border: "1px dashed #ddd",
            }
          }
        >
          Loading rental history...
        </div>
      ) : historyError ? (
        <div
          style={
            styles.emptyState || {
              padding: "40px",
              textAlign: "center",
              color: "#ef4444",
              fontSize: "14px",
              backgroundColor: "#fafafa",
              borderRadius: "16px",
              border: "1px dashed #ddd",
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
              color: "#777",
              fontSize: "14px",
              backgroundColor: "#fafafa",
              borderRadius: "16px",
              border: "1px dashed #ddd",
            }
          }
        >
          No completed rental transactions found.
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
                : `http://localhost:5001${rental.itemImage}`
              : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300";

            const otherUserImage = rental.otherUserPic
              ? rental.otherUserPic.startsWith("http")
                ? rental.otherUserPic
                : `http://localhost:5001${rental.otherUserPic}`
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
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
                    background: "#f1f5f9",
                  }}
                />
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <h4
                    style={{
                      margin: "0 0 8px",
                      color: "#0f172a",
                      fontSize: "16px",
                    }}
                  >
                    {rental.itemTitle || "Rental item"}
                  </h4>
                  <p
                    style={{
                      margin: "4px 0",
                      color: "#64748b",
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
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Quantity: {rental.quantity || 1} · {rental.totalDays || 1} day(s)
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
                      <User size={22} color="#64748b" />
                    )}
                    <span style={{ color: "#475569", fontSize: "13px" }}>
                      {rental.historyType === "buyer"
                        ? "Rented from"
                        : "Rented to"}
                      : <strong>{rental.otherUserName || "User"}</strong>
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <strong
                    style={{
                      display: "block",
                      color: "#0f172a",
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
                          ? "#2563eb"
                          : "#7c3aed",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {rental.historyType === "buyer" ? "Rented" : "Rented Out"}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "5px 10px",
                      borderRadius: "20px",
                      background: "#dcfce7",
                      color: "#15803d",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    Completed
                  </span>
                  <p
                    style={{
                      margin: "7px 0 0",
                      color: "#94a3b8",
                      fontSize: "11px",
                    }}
                  >
                    Transaction #{rental.transactionId}
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
