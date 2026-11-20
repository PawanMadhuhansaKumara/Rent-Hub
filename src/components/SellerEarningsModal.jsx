import React, { useState, useEffect } from "react";
import {
  X,
  Coins,
  TrendingUp,
  Building2,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  DollarSign,
  Package,
} from "lucide-react";

const POPULAR_BANKS = [
  "Bank of Ceylon (BOC)",
  "People's Bank",
  "Commercial Bank of Ceylon",
  "Sampath Bank",
  "Hatton National Bank (HNB)",
  "Seylan Bank",
  "Nations Trust Bank (NTB)",
  "DFCC Bank",
  "National Savings Bank (NSB)",
  "Pan Asia Bank",
  "Union Bank of Colombo",
  "Other Bank",
];

export default function SellerEarningsModal({
  isOpen,
  onClose,
  userId,
  API_URL = "http://localhost:5001",
  onEarningsUpdated,
}) {
  const [activeTab, setActiveTab] = useState("breakdown"); // 'breakdown' | 'bank' | 'withdraw'
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState({
    totalNetEarnings: 0,
    totalGross: 0,
    totalCommission: 0,
    totalWithdrawn: 0,
    availableBalance: 0,
    cashPoints: 0,
    bankDetails: {
      bankName: "",
      branch: "",
      accountNo: "",
      accountName: "",
    },
    history: [],
    withdrawals: [],
  });

  // Bank Form State
  const [selectedBank, setSelectedBank] = useState("");
  const [customBank, setCustomBank] = useState("");
  const [branch, setBranch] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");
  const [savingBank, setSavingBank] = useState(false);
  const [bankSuccessMsg, setBankSuccessMsg] = useState("");
  const [bankErrorMsg, setBankErrorMsg] = useState("");

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [lastWithdrawalInfo, setLastWithdrawalInfo] = useState(null);
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState("");

  const fetchEarnings = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users/${userId}/earnings`);
      const data = await res.json();
      if (res.ok && data.success) {
        setEarningsData(data);
        if (data.bankDetails) {
          const bName = data.bankDetails.bankName || "";
          if (POPULAR_BANKS.includes(bName)) {
            setSelectedBank(bName);
          } else if (bName) {
            setSelectedBank("Other Bank");
            setCustomBank(bName);
          }
          setBranch(data.bankDetails.branch || "");
          setAccountNo(data.bankDetails.accountNo || "");
          setAccountName(data.bankDetails.accountName || "");
        }
        if (onEarningsUpdated) {
          onEarningsUpdated(data);
        }
      }
    } catch (err) {
      console.error("Error loading earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchEarnings();
      setWithdrawSuccess(false);
      setBankSuccessMsg("");
      setBankErrorMsg("");
      setWithdrawErrorMsg("");
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setBankSuccessMsg("");
    setBankErrorMsg("");

    const finalBankName = selectedBank === "Other Bank" ? customBank.trim() : selectedBank.trim();

    if (!finalBankName) {
      setBankErrorMsg("Please select or enter your bank name.");
      return;
    }
    if (!accountNo.trim()) {
      setBankErrorMsg("Please enter your bank account number.");
      return;
    }
    if (!accountName.trim()) {
      setBankErrorMsg("Please enter the account holder name.");
      return;
    }

    try {
      setSavingBank(true);
      const res = await fetch(`${API_URL}/api/users/${userId}/bank-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: finalBankName,
          branch: branch.trim(),
          accountNo: accountNo.trim(),
          accountName: accountName.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBankSuccessMsg("Bank details saved successfully to database!");
        setEarningsData((prev) => ({
          ...prev,
          bankDetails: data.bankDetails,
        }));
      } else {
        setBankErrorMsg(data.message || "Failed to save bank details.");
      }
    } catch (err) {
      setBankErrorMsg("Connection error saving bank details.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setWithdrawErrorMsg("");
    const amountNum = parseFloat(withdrawAmount);

    if (!amountNum || amountNum <= 0) {
      setWithdrawErrorMsg("Please enter a valid withdrawal amount.");
      return;
    }

    if (amountNum > earningsData.availableBalance) {
      setWithdrawErrorMsg(
        `Amount exceeds your available balance of LKR ${earningsData.availableBalance.toLocaleString()}`
      );
      return;
    }

    const finalBankName = selectedBank === "Other Bank" ? customBank.trim() : selectedBank.trim();
    if (!finalBankName || !accountNo.trim() || !accountName.trim()) {
      setWithdrawErrorMsg("Please complete and save your bank account details before requesting a payout.");
      return;
    }

    try {
      setWithdrawing(true);
      const res = await fetch(`${API_URL}/api/users/${userId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          bankName: finalBankName,
          branch: branch.trim(),
          accountNo: accountNo.trim(),
          accountName: accountName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLastWithdrawalInfo({
          amount: amountNum,
          bankName: finalBankName,
          accountNo: accountNo.trim(),
          date: new Date().toLocaleDateString("en-LK"),
        });
        setWithdrawSuccess(true);
        setWithdrawAmount("");
        fetchEarnings(); // Refresh balance and withdrawal history
      } else {
        setWithdrawErrorMsg(data.message || "Withdrawal request failed.");
      }
    } catch (err) {
      setWithdrawErrorMsg("Connection error processing withdrawal request.");
    } finally {
      setWithdrawing(false);
    }
  };

  const hasBankDetails = Boolean(
    earningsData.bankDetails?.bankName && earningsData.bankDetails?.accountNo
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "720px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          animation: "fadeIn 0.25s ease-out",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Coins size={24} color="#fef08a" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800" }}>
                  Store Earnings & Payouts
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    backgroundColor: "#bbf7d0",
                    color: "#166534",
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  90% Net Seller
                </span>
              </div>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12.5px",
                  color: "#d1fae5",
                }}
              >
                10% platform fee deducted automatically from each rental
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* TOP SUMMARY METRICS BAR */}
        <div
          style={{
            padding: "16px 24px",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1.5px solid #dcfce7",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#166534", textTransform: "uppercase" }}>
              Total Net Earned (90%)
            </span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#15803d", marginTop: "2px" }}>
              LKR {Number(earningsData.totalNetEarnings || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "10.5px", color: "#64748b" }}>from {earningsData.history.length} rental(s)</span>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
              Gross Volume (100%)
            </span>
            <div style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>
              LKR {Number(earningsData.totalGross || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "10.5px", color: "#ca8a04" }}>
              -10% Fee: LKR {Number(earningsData.totalCommission || 0).toLocaleString("en-LK")}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1.5px solid #bae6fd",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#0369a1", textTransform: "uppercase" }}>
              Available Balance
            </span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#0284c7", marginTop: "2px" }}>
              LKR {Number(earningsData.availableBalance || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "10.5px", color: "#0369a1" }}>
              {earningsData.totalCashPickupDeductions > 0
                ? `Net of -LKR ${Number(earningsData.totalCashPickupDeductions).toLocaleString("en-LK")} cash fee deductions`
                : "Ready for payout"}
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            padding: "0 24px",
            gap: "24px",
          }}
        >
          <button
            onClick={() => setActiveTab("breakdown")}
            style={{
              padding: "14px 4px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "breakdown" ? "3px solid #16a34a" : "3px solid transparent",
              color: activeTab === "breakdown" ? "#16a34a" : "#64748b",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <TrendingUp size={16} />
            <span>Item Earnings Breakdown ({earningsData.history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            style={{
              padding: "14px 4px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "bank" ? "3px solid #16a34a" : "3px solid transparent",
              color: activeTab === "bank" ? "#16a34a" : "#64748b",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Building2 size={16} />
            <span>Bank Account {hasBankDetails && <CheckCircle2 size={13} color="#16a34a" />}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("withdraw");
              setWithdrawSuccess(false);
            }}
            style={{
              padding: "14px 4px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "withdraw" ? "3px solid #16a34a" : "3px solid transparent",
              color: activeTab === "withdraw" ? "#16a34a" : "#64748b",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowDownToLine size={16} />
            <span>Request Payout</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            boxSizing: "border-box",
          }}
        >
          {/* TAB 1: ITEM EARNINGS BREAKDOWN */}
          {activeTab === "breakdown" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                    Rental Transactions & 10% Platform Cut
                  </h4>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    For every rented item, 10% platform service fee is deducted and 90% is credited to you.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("withdraw")}
                  style={{
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ArrowDownToLine size={14} /> Withdraw Payout
                </button>
              </div>

              {earningsData.history.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    backgroundColor: "#f8fafc",
                    borderRadius: "16px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <Package size={42} color="#94a3b8" style={{ marginBottom: "12px" }} />
                  <h4 style={{ margin: 0, fontSize: "15px", color: "#334155" }}>No items rented out yet</h4>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748b" }}>
                    When customers book and rent items from your rental store, your earnings and 10% commission calculations will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {earningsData.history.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "220px" }}>
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "10px",
                            backgroundColor: "#f1f5f9",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.itemImage ? (
                            <img
                              src={
                                item.itemImage.startsWith("http")
                                  ? item.itemImage
                                  : `${API_URL}${item.itemImage.startsWith("/") ? "" : "/"}${item.itemImage}`
                              }
                              alt={item.itemTitle}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Package size={22} color="#64748b" />
                          )}
                        </div>
                        <div>
                          <span
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#0f172a",
                            }}
                          >
                            {item.itemTitle}
                          </span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "#64748b" }}>
                            Rented by {item.renterName} • {new Date(item.date).toLocaleDateString("en-LK")}
                          </span>
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "3px",
                              fontSize: "10.5px",
                              fontWeight: "700",
                              backgroundColor: item.isCashOnPickup ? "#fef3c7" : "#f1f5f9",
                              color: item.isCashOnPickup ? "#92400e" : "#475569",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              textTransform: "capitalize",
                            }}
                          >
                            {item.isCashOnPickup ? "💵 Cash on Pickup" : `Paid via ${item.paymentMethod}`}
                          </span>
                          {item.isCashOnPickup && (
                            <span
                              style={{
                                display: "block",
                                marginTop: "2px",
                                fontSize: "10.5px",
                                color: item.feeDeducted ? "#dc2626" : "#b45309",
                                fontWeight: "600",
                              }}
                            >
                              {item.feeDeducted
                                ? "✓ Pickup Confirmed • 10% Fee Deducted"
                                : "Pending Pickup / Handover"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "18px",
                          textAlign: "right",
                        }}
                      >
                        {item.isCashOnPickup ? (
                          <>
                            <div>
                              <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                                In-Hand Cash: LKR {Number(item.grossAmount).toLocaleString("en-LK")}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "#dc2626",
                                }}
                              >
                                {item.feeDeducted ? "-10% Fee Deducted" : "10% Fee Pending"}
                              </span>
                            </div>

                            <div
                              style={{
                                backgroundColor: item.feeDeducted ? "#fef2f2" : "#fffbeb",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                border: item.feeDeducted ? "1px solid #fecaca" : "1px solid #fde68a",
                              }}
                            >
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  color: item.feeDeducted ? "#991b1b" : "#92400e",
                                }}
                              >
                                {item.feeDeducted ? "SHOP FEE DEDUCTION" : "PENDING DEDUCTION"}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "15px",
                                  fontWeight: "800",
                                  color: item.feeDeducted ? "#dc2626" : "#b45309",
                                }}
                              >
                                - LKR {Number(item.platformCommission).toLocaleString("en-LK")}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                                Gross: LKR {Number(item.grossAmount).toLocaleString("en-LK")}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "#dc2626",
                                }}
                              >
                                -10% Fee: LKR {Number(item.platformCommission).toLocaleString("en-LK")}
                              </span>
                            </div>

                            <div
                              style={{
                                backgroundColor: "#f0fdf4",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              <span style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#166534" }}>
                                YOUR NET (90%)
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "15px",
                                  fontWeight: "800",
                                  color: "#15803d",
                                }}
                              >
                                + LKR {Number(item.netEarned).toLocaleString("en-LK")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BANK ACCOUNT DETAILS */}
          {activeTab === "bank" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                  Store Bank Account for Payouts
                </h4>
                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  Save your official Sri Lankan bank account details. Your earned rental payouts will be directly credited to this account.
                </p>
              </div>

              {hasBankDetails && (
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1.5px solid #86efac",
                    borderRadius: "14px",
                    padding: "16px 20px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        backgroundColor: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Building2 size={22} color="#15803d" />
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "#166534" }}>
                        {earningsData.bankDetails.bankName}
                      </span>
                      <span style={{ display: "block", fontSize: "12px", color: "#15803d" }}>
                        Account: <strong>{earningsData.bankDetails.accountNo}</strong>
                        {earningsData.bankDetails.branch && ` • Branch: ${earningsData.bankDetails.branch}`}
                      </span>
                      <span style={{ display: "block", fontSize: "11.5px", color: "#4b5563" }}>
                        Holder: {earningsData.bankDetails.accountName}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      backgroundColor: "#bbf7d0",
                      color: "#166534",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCircle2 size={12} /> Verified & Saved
                  </span>
                </div>
              )}

              {bankSuccessMsg && (
                <div
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle2 size={16} /> {bankSuccessMsg}
                </div>
              )}

              {bankErrorMsg && (
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#b91c1c",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle size={16} /> {bankErrorMsg}
                </div>
              )}

              <form onSubmit={handleSaveBank} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Select Bank *
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "13.5px",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">-- Choose Bank --</option>
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBank === "Other Bank" && (
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Amana Bank, Standard Chartered"
                      value={customBank}
                      onChange={(e) => setCustomBank(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Bank Branch
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ratnapura Branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Account Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10023456789"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Account Holder Name (as in bank passbook) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. K. M. Sandesh Udaraka"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "13.5px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingBank}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: savingBank ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 6px -1px rgba(22, 163, 74, 0.25)",
                    opacity: savingBank ? 0.75 : 1,
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>{savingBank ? "Saving to Database..." : "Save Bank Details to Database"}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: REQUEST PAYOUT / WITHDRAW FUNDS */}
          {activeTab === "withdraw" && (
            <div>
              {/* SUCCESS STATE */}
              {withdrawSuccess ? (
                <div
                  style={{
                    padding: "36px 20px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "#f0fdf4",
                    borderRadius: "20px",
                    border: "2px solid #86efac",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)",
                      marginBottom: "16px",
                    }}
                  >
                    <CheckCircle2 size={48} color="#ffffff" strokeWidth={2.5} />
                  </div>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#dcfce7",
                      color: "#15803d",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      marginBottom: "8px",
                    }}
                  >
                    <Sparkles size={14} /> PAYOUT REQUEST SAVED
                  </span>

                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#166534",
                    }}
                  >
                    LKR {Number(lastWithdrawalInfo?.amount || 0).toLocaleString("en-LK")}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 20px 0",
                      fontSize: "13.5px",
                      color: "#15803d",
                      maxWidth: "420px",
                      lineHeight: "1.5",
                    }}
                  >
                    Your withdrawal request has been saved to the database. The payout will be transferred to your bank account (<strong>{lastWithdrawalInfo?.bankName} - {lastWithdrawalInfo?.accountNo}</strong>) within 24-48 business hours.
                  </p>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setWithdrawSuccess(false)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "10px",
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "13.5px",
                        cursor: "pointer",
                      }}
                    >
                      Make Another Request
                    </button>
                    <button
                      onClick={() => setActiveTab("breakdown")}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        color: "#166534",
                        border: "1.5px solid #86efac",
                        fontWeight: "700",
                        fontSize: "13.5px",
                        cursor: "pointer",
                      }}
                    >
                      View Breakdown
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                      Request Available Payout
                    </h4>
                    <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                      Choose any custom amount up to your available balance. Funds will be transferred to your registered bank account.
                    </p>
                  </div>

                  {/* BALANCE CARD */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                      color: "#ffffff",
                      borderRadius: "16px",
                      padding: "18px 22px",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#bae6fd", textTransform: "uppercase" }}>
                        Available Balance for Withdrawal
                      </span>
                      <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "2px" }}>
                        LKR {Number(earningsData.availableBalance || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        padding: "8px 14px",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    >
                      Total Earned: LKR {Number(earningsData.totalNetEarnings || 0).toLocaleString("en-LK")}
                    </div>
                  </div>

                  {!hasBankDetails ? (
                    <div
                      style={{
                        padding: "18px",
                        backgroundColor: "#fffbeb",
                        border: "1.5px solid #fde68a",
                        borderRadius: "14px",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <AlertCircle size={18} color="#b45309" />
                        <strong style={{ fontSize: "13.5px", color: "#92400e" }}>Bank Account Required</strong>
                      </div>
                      <p style={{ margin: "0 0 12px 0", fontSize: "12.5px", color: "#b45309" }}>
                        You must add your bank account details before submitting a withdrawal request so we know where to send your funds.
                      </p>
                      <button
                        onClick={() => setActiveTab("bank")}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          backgroundColor: "#f59e0b",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "12.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        + Add Bank Account Now
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Building2 size={18} color="#0369a1" />
                        <div>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                            Payout Destination: {earningsData.bankDetails.bankName}
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                            Acc: {earningsData.bankDetails.accountNo} ({earningsData.bankDetails.accountName})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("bank")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#16a34a",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Change Bank →
                      </button>
                    </div>
                  )}

                  {withdrawErrorMsg && (
                    <div
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={16} /> {withdrawErrorMsg}
                    </div>
                  )}

                  <form onSubmit={handleWithdrawRequest}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                        Withdrawal Amount (LKR) *
                      </label>
                      <div style={{ position: "relative" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "13.5px",
                            fontWeight: "800",
                            color: "#64748b",
                          }}
                        >
                          LKR
                        </span>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          min="100"
                          max={earningsData.availableBalance}
                          required
                          style={{
                            width: "100%",
                            padding: "12px 14px 12px 52px",
                            borderRadius: "10px",
                            border: "1.5px solid #cbd5e1",
                            fontSize: "16px",
                            fontWeight: "700",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      {/* QUICK PERCENTAGE PILLS */}
                      {earningsData.availableBalance > 0 && (
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                          {[0.25, 0.5, 0.75, 1].map((pct) => {
                            const val = Math.floor(earningsData.availableBalance * pct);
                            return (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setWithdrawAmount(val.toString())}
                                style={{
                                  flex: 1,
                                  padding: "6px 0",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  backgroundColor: "#f8fafc",
                                  fontSize: "11.5px",
                                  fontWeight: "700",
                                  color: "#334155",
                                  cursor: "pointer",
                                }}
                              >
                                {pct === 1 ? "100% (Max)" : `${pct * 100}%`}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={withdrawing || !hasBankDetails || earningsData.availableBalance <= 0}
                      style={{
                        width: "100%",
                        padding: "13px",
                        borderRadius: "10px",
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: withdrawing || !hasBankDetails || earningsData.availableBalance <= 0 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 4px 6px -1px rgba(22, 163, 74, 0.25)",
                        opacity: withdrawing || !hasBankDetails || earningsData.availableBalance <= 0 ? 0.6 : 1,
                      }}
                    >
                      <ArrowDownToLine size={18} />
                      <span>
                        {withdrawing
                          ? "Submitting Payout Request..."
                          : `Request Payout of LKR ${
                              withdrawAmount ? Number(withdrawAmount).toLocaleString() : "0"
                            }`}
                      </span>
                    </button>
                  </form>

                  {/* WITHDRAWAL HISTORY TABLE */}
                  {earningsData.withdrawals.length > 0 && (
                    <div style={{ marginTop: "28px" }}>
                      <h5 style={{ margin: "0 0 10px 0", fontSize: "13.5px", fontWeight: "700", color: "#334155" }}>
                        Past Payout Requests
                      </h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {earningsData.withdrawals.map((w) => (
                          <div
                            key={w.id}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "10px",
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <span style={{ display: "block", fontSize: "13.5px", fontWeight: "700", color: "#0f172a" }}>
                                LKR {Number(w.amount).toLocaleString("en-LK")}
                              </span>
                              <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                                {w.bankName} • {new Date(w.date).toLocaleDateString("en-LK")}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                textTransform: "uppercase",
                                backgroundColor:
                                  w.status === "completed" || w.status === "approved"
                                    ? "#dcfce7"
                                    : w.status === "rejected"
                                    ? "#fee2e2"
                                    : "#fef3c7",
                                color:
                                  w.status === "completed" || w.status === "approved"
                                    ? "#166534"
                                    : w.status === "rejected"
                                    ? "#b91c1c"
                                    : "#b45309",
                              }}
                            >
                              {w.status || "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
