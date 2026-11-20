import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function QRCustomerPayPage() {
  const navigate = useNavigate();
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

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleCardPay = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setPaidSuccess(true);
  };

  if (paidSuccess) {
    return (
      <div style={{ maxWidth: "420px", margin: "40px auto", padding: "24px", background: "var(--bg-card)", borderRadius: "14px", textAlign: "center", border: "1px solid var(--border-light)" }}>
        <CheckCircle2 size={48} color="var(--primary)" style={{ marginBottom: "12px" }} />
        <h3 style={{ color: "var(--primary)", margin: "0 0 8px 0" }}>Payment Successful!</h3>
        <p style={{ color: "var(--text-secondary)" }}>Paid <strong>LKR {Number(amount).toLocaleString()}</strong> to <strong>{holder}</strong> ({bank}).</p>
        <button
          type="button"
          onClick={handleBack}
          style={{
            marginTop: "16px",
            padding: "9px 20px",
            borderRadius: "8px",
            background: "var(--primary)",
            color: "var(--text-inverse)",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "420px", margin: "30px auto", padding: "20px", background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border-light)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid var(--border-light)",
            background: "var(--bg-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Go Back"
          aria-label="Go Back"
        >
          <ArrowLeft size={16} color="var(--text-secondary)" />
        </button>
        <h3 style={{ margin: 0 }}>Pay via Card (QR)</h3>
      </div>
      <div style={{ background: "var(--bg-app-alt)", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
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
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid var(--border-light)" }}
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
            style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid var(--border-light)" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
            style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid var(--border-light)" }}
          />
          <input
            type="password"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            required
            style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "1px solid var(--border-light)" }}
          />
        </div>

        <button type="submit" className="payment-btn-confirm" style={{ width: "100%" }}>
          Pay LKR {amount ? Number(amount).toLocaleString() : "0"}
        </button>
      </form>
    </div>
  );
}