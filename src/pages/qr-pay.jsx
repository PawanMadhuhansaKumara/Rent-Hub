import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function QRCustomerPayPage() {
  const [params] = useSearchParams();
  const bank = params.get("bank") || "Bank";
  const holder = params.get("holder") || "Seller";
  const acc = params.get("acc") || "N/A";
  const sellerId = params.get("seller") || "";

  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paidSuccess, setPaidSuccess] = useState(false);

  const handleCardPay = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    // අවශ්‍ය නම් ඔබේ Backend POST API එකට { sellerId, amount, paymentMethod: 'qr_card', paymentStatus: 'paid' } යවන්න
    setPaidSuccess(true);
  };

  if (paidSuccess) {
    return (
      <div style={{ maxWidth: "420px", margin: "40px auto", padding: "24px", background: "#fff", borderRadius: "14px", textAlign: "center" }}>
        <h3 style={{ color: "#15803d" }}>Payment Successful!</h3>
        <p>Paid <strong>LKR {Number(amount).toLocaleString()}</strong> to <strong>{holder}</strong> ({bank}).</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "420px", margin: "30px auto", padding: "20px", background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
      <h3>Pay via Card (QR)</h3>
      <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
        <div><strong>To:</strong> {holder}</div>
        <div><strong>Bank:</strong> {bank}</div>
        <div><strong>Account:</strong> {acc}</div>
      </div>

      <form onSubmit={handleCardPay}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600 }}>Enter Amount (LKR)</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 2500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600 }}>Card Number</label>
          <input
            type="text"
            placeholder="4242 •••• •••• 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
            style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          />
          <input
            type="password"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            required
            style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          />
        </div>

        <button type="submit" className="payment-btn-confirm" style={{ width: "100%" }}>
          Pay LKR {amount ? Number(amount).toLocaleString() : "0"}
        </button>
      </form>
    </div>
  );
}