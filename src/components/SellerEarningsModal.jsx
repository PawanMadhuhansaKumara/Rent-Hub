import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  API_URL = "http://https://rent-hub-ashen.vercel.app",
  onEarningsUpdated,
}) {
  const { t } = useTranslation();
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
          background: "var(--bg-modal, var(--bg-card))",
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
            background: "linear-gradient(135deg, #15803D 0%, #16A34A 100%)",
            color: "#FFFFFF",
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
              <Coins size={24} color="#FDE047" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: "#FFFFFF" }}>
                  {t("earnings.title", "Store Earnings & Payouts")}
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    color: "#FFFFFF",
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
                  color: "rgba(255, 255, 255, 0.88)",
                }}
              >
                {t("earnings.feeDeducted", "10% platform fee deducted automatically from each rental")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
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
            backgroundColor: "var(--bg-app-alt)",
            borderBottom: "1px solid var(--border-light)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-modal, var(--bg-card))",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1.5px solid var(--badge-green-bg)",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary-hover)", textTransform: "uppercase" }}>
              {t("earnings.totalEarned", "Total Net Earned (90%)")}
            </span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)", marginTop: "2px" }}>
              LKR {Number(earningsData.totalNetEarnings || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>from {earningsData.history.length} rental(s)</span>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-modal, var(--bg-card))",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid var(--border-light)",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
              {t("earnings.grossRental", "Gross Volume (100%)")}
            </span>
            <div style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-main)", marginTop: "2px" }}>
              LKR {Number(earningsData.totalGross || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "10.5px", color: "var(--badge-yellow-text)" }}>
              -{t("earnings.platformFee", "10% Platform Fee")}: LKR {Number(earningsData.totalCommission || 0).toLocaleString("en-LK")}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-modal, var(--bg-card))",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1.5px solid var(--badge-blue-border)",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--badge-blue-text)", textTransform: "uppercase" }}>
              {t("earnings.availableWithdraw", "Available Balance")}
            </span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--badge-blue-text)", marginTop: "2px" }}>
              LKR {Number(earningsData.availableBalance || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "10.5px", color: "var(--badge-blue-text)" }}>
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
            borderBottom: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-modal, var(--bg-card))",
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
              borderBottom: activeTab === "breakdown" ? "3px solid var(--primary)" : "3px solid transparent",
              color: activeTab === "breakdown" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <TrendingUp size={16} />
            <span>{t("earnings.tabBreakdown", "Item Earnings Breakdown")} ({earningsData.history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            style={{
              padding: "14px 4px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "bank" ? "3px solid var(--primary)" : "3px solid transparent",
              color: activeTab === "bank" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Building2 size={16} />
            <span>{t("earnings.tabBank", "Bank Account")} {hasBankDetails && <CheckCircle2 size={13} color="var(--primary)" />}</span>
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
              borderBottom: activeTab === "withdraw" ? "3px solid var(--primary)" : "3px solid transparent",
              color: activeTab === "withdraw" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowDownToLine size={16} />
            <span>{t("earnings.tabWithdraw", "Request Payout")}</span>
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
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>
                    Rental Transactions & 10% Platform Cut
                  </h4>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    For every rented item, 10% platform service fee is deducted and 90% is credited to you.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("withdraw")}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#FFFFFF",
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
                    backgroundColor: "var(--bg-app-alt)",
                    borderRadius: "16px",
                    border: "1px dashed var(--border-light)",
                  }}
                >
                  <Package size={42} color="var(--text-muted)" style={{ marginBottom: "12px" }} />
                  <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text-secondary)" }}>No items rented out yet</h4>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
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
                        border: "1px solid var(--border-light)",
                        backgroundColor: "var(--bg-modal, var(--bg-card))",
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
                            backgroundColor: "var(--bg-card-hover)",
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
                            <Package size={22} color="var(--text-muted)" />
                          )}
                        </div>
                        <div>
                          <span
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "var(--text-main)",
                            }}
                          >
                            {item.itemTitle}
                          </span>
                          <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-muted)" }}>
                            Rented by {item.renterName} • {new Date(item.date).toLocaleDateString("en-LK")}
                          </span>
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "3px",
                              fontSize: "10.5px",
                              fontWeight: "700",
                              backgroundColor: item.isCashOnPickup ? "var(--badge-yellow-bg)" : "var(--bg-card-hover)",
                              color: item.isCashOnPickup ? "var(--badge-yellow-text)" : "var(--text-secondary)",
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
                                color: item.feeDeducted ? "var(--badge-red-text)" : "var(--badge-yellow-text)",
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
                              <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>
                                In-Hand Cash: LKR {Number(item.grossAmount).toLocaleString("en-LK")}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "var(--badge-red-text)",
                                }}
                              >
                                {item.feeDeducted ? "-10% Fee Deducted" : "10% Fee Pending"}
                              </span>
                            </div>

                            <div
                              style={{
                                backgroundColor: item.feeDeducted ? "var(--badge-red-bg)" : "var(--badge-yellow-bg)",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                border: item.feeDeducted ? "1px solid var(--badge-red-border)" : "1px solid var(--badge-yellow-border)",
                              }}
                            >
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                  color: item.feeDeducted ? "var(--badge-red-text)" : "var(--badge-yellow-text)",
                                }}
                              >
                                {item.feeDeducted ? "SHOP FEE DEDUCTION" : "PENDING DEDUCTION"}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "15px",
                                  fontWeight: "800",
                                  color: item.feeDeducted ? "var(--badge-red-text)" : "var(--badge-yellow-text)",
                                }}
                              >
                                - LKR {Number(item.platformCommission).toLocaleString("en-LK")}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>
                                Gross: LKR {Number(item.grossAmount).toLocaleString("en-LK")}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "var(--badge-red-text)",
                                }}
                              >
                                -10% Fee: LKR {Number(item.platformCommission).toLocaleString("en-LK")}
                              </span>
                            </div>

                            <div
                              style={{
                                backgroundColor: "var(--badge-green-bg)",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                border: "1px solid var(--badge-green-bg)",
                              }}
                            >
                              <span style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "var(--primary-hover)" }}>
                                YOUR NET (90%)
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "15px",
                                  fontWeight: "800",
                                  color: "var(--primary)",
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
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                  Store Bank Account for Payouts
                </h4>
                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                  Save your official Sri Lankan bank account details. Your earned rental payouts will be directly credited to this account.
                </p>
              </div>

              {hasBankDetails && (
                <div
                  style={{
                    backgroundColor: "var(--badge-green-bg)",
                    border: "1.5px solid var(--badge-green-bg)",
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
                        backgroundColor: "var(--badge-green-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Building2 size={22} color="var(--primary)" />
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "14px", fontWeight: "800", color: "var(--primary-hover)" }}>
                        {earningsData.bankDetails.bankName}
                      </span>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--primary)" }}>
                        Account: <strong>{earningsData.bankDetails.accountNo}</strong>
                        {earningsData.bankDetails.branch && ` • Branch: ${earningsData.bankDetails.branch}`}
                      </span>
                      <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)" }}>
                        Holder: {earningsData.bankDetails.accountName}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      backgroundColor: "var(--badge-green-bg)",
                      color: "var(--primary-hover)",
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
                    backgroundColor: "var(--badge-green-bg)",
                    color: "var(--primary-hover)",
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
                    backgroundColor: "var(--badge-red-bg)",
                    color: "var(--badge-red-text)",
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
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    {t("earnings.bankName", "Select Bank")} *
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid var(--border-light)",
                      fontSize: "13.5px",
                      backgroundColor: "var(--bg-modal, var(--bg-card))",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">-- {t("earnings.selectBank", "Choose Bank")} --</option>
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBank === "Other Bank" && (
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      {t("earnings.bankName", "Bank Name")} *
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
                        border: "1.5px solid var(--border-light)",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      {t("earnings.branch", "Bank Branch")}
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
                        border: "1.5px solid var(--border-light)",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      {t("earnings.accountNo", "Account Number")} *
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
                        border: "1.5px solid var(--border-light)",
                        fontSize: "13.5px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    {t("earnings.accountName", "Account Holder Name")} *
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
                      border: "1.5px solid var(--border-light)",
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
                    backgroundColor: "var(--primary)",
                    color: "#FFFFFF",
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
                  <span>{savingBank ? t("earnings.saving", "Saving...") : t("earnings.saveBank", "Save Bank Details to Database")}</span>
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
                    backgroundColor: "var(--badge-green-bg)",
                    borderRadius: "20px",
                    border: "2px solid var(--badge-green-bg)",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--text-accent) 0%, var(--primary) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)",
                      marginBottom: "16px",
                    }}
                  >
                    <CheckCircle2 size={48} color="#FFFFFF" strokeWidth={2.5} />
                  </div>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "var(--badge-green-bg)",
                      color: "var(--primary)",
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
                      color: "var(--primary-hover)",
                    }}
                  >
                    LKR {Number(lastWithdrawalInfo?.amount || 0).toLocaleString("en-LK")}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 20px 0",
                      fontSize: "13.5px",
                      color: "var(--primary)",
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
                        backgroundColor: "var(--primary)",
                        color: "#FFFFFF",
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
                        backgroundColor: "var(--bg-modal, var(--bg-card))",
                        color: "var(--primary-hover)",
                        border: "1.5px solid var(--badge-green-bg)",
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
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                      Request Available Payout
                    </h4>
                    <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                      Choose any custom amount up to your available balance. Funds will be transferred to your registered bank account.
                    </p>
                  </div>

                  {/* BALANCE CARD */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, var(--badge-blue-text) 0%, var(--badge-blue-text) 100%)",
                      color: "#FFFFFF",
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
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--badge-blue-border)", textTransform: "uppercase" }}>
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
                        backgroundColor: "var(--badge-yellow-bg)",
                        border: "1.5px solid var(--badge-yellow-border)",
                        borderRadius: "14px",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <AlertCircle size={18} color="var(--badge-yellow-text)" />
                        <strong style={{ fontSize: "13.5px", color: "var(--badge-yellow-text)" }}>Bank Account Required</strong>
                      </div>
                      <p style={{ margin: "0 0 12px 0", fontSize: "12.5px", color: "var(--badge-yellow-text)" }}>
                        You must add your bank account details before submitting a withdrawal request so we know where to send your funds.
                      </p>
                      <button
                        onClick={() => setActiveTab("bank")}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          backgroundColor: "var(--badge-yellow-text)",
                          color: "#FFFFFF",
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
                        backgroundColor: "var(--bg-app-alt)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Building2 size={18} color="var(--badge-blue-text)" />
                        <div>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--text-main)" }}>
                            Payout Destination: {earningsData.bankDetails.bankName}
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>
                            Acc: {earningsData.bankDetails.accountNo} ({earningsData.bankDetails.accountName})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("bank")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary)",
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
                        backgroundColor: "var(--badge-red-bg)",
                        color: "var(--badge-red-text)",
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
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        {t("earnings.withdrawAmount", "Withdrawal Amount (LKR)")} *
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
                            color: "var(--text-muted)",
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
                            border: "1.5px solid var(--border-light)",
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
                                  border: "1px solid var(--border-light)",
                                  backgroundColor: "var(--bg-app-alt)",
                                  fontSize: "11.5px",
                                  fontWeight: "700",
                                  color: "var(--text-secondary)",
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
                        backgroundColor: "var(--primary)",
                        color: "#FFFFFF",
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
                          ? t("earnings.saving", "Submitting Payout Request...")
                          : t("earnings.submitWithdraw", "Submit Payout Request")}
                      </span>
                    </button>
                  </form>

                  {/* WITHDRAWAL HISTORY TABLE */}
                  {earningsData.withdrawals.length > 0 && (
                    <div style={{ marginTop: "28px" }}>
                      <h5 style={{ margin: "0 0 10px 0", fontSize: "13.5px", fontWeight: "700", color: "var(--text-secondary)" }}>
                        {t("earnings.payoutHistory", "Past Payout Requests")}
                      </h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {earningsData.withdrawals.map((w) => (
                          <div
                            key={w.id}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "10px",
                              backgroundColor: "var(--bg-app-alt)",
                              border: "1px solid var(--border-light)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <span style={{ display: "block", fontSize: "13.5px", fontWeight: "700", color: "var(--text-main)" }}>
                                LKR {Number(w.amount).toLocaleString("en-LK")}
                              </span>
                              <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>
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
                                    ? "var(--badge-green-bg)"
                                    : w.status === "rejected"
                                    ? "var(--badge-red-bg)"
                                    : "var(--badge-yellow-bg)",
                                color:
                                  w.status === "completed" || w.status === "approved"
                                    ? "var(--primary-hover)"
                                    : w.status === "rejected"
                                    ? "var(--badge-red-text)"
                                    : "var(--badge-yellow-text)",
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
