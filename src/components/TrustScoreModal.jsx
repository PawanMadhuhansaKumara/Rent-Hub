import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  ShieldCheck,
  TrendingUp,
  PackageCheck,
  Clock,
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
} from "lucide-react";

export default function TrustScoreModal({
  isOpen,
  onClose,
  userId,
  trustScore: initialTrustScore,
  rentalLimit: initialLimit,
  completedRentals: initialCompleted,
  accountDays: initialDays,
  avgTrustRating: initialRating,
}) {
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    trustScore: Number(initialTrustScore || 50),
    maxRentalLimit: Number(initialLimit || 1000),
    completedRentals: Number(initialCompleted || 0),
    accountDays: Number(initialDays || 0),
    avgTrustRating: Number(initialRating || 10),
  });
  const [loading, setLoading] = useState(false);

  // Sync with initial props if they change
  useEffect(() => {
    if (initialTrustScore !== undefined) {
      setStats((prev) => ({
        ...prev,
        trustScore: Number(initialTrustScore || 50),
        maxRentalLimit: Number(initialLimit || prev.maxRentalLimit || 1000),
        completedRentals: Number(initialCompleted || prev.completedRentals || 0),
        accountDays: Number(initialDays || prev.accountDays || 0),
        avgTrustRating: Number(initialRating || prev.avgTrustRating || 10),
      }));
    }
  }, [initialTrustScore, initialLimit, initialCompleted, initialDays, initialRating]);

  // Fetch live calculated trust score from backend
  useEffect(() => {
    if (!isOpen || !userId) return;

    setLoading(true);
    fetch(`http://https://rent-hub-ashen.vercel.app/api/users/${userId}/trust-score`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setStats({
            trustScore: Number(data.trustScore || 50),
            maxRentalLimit: Number(data.maxRentalLimit || 1000),
            completedRentals: Number(data.completedRentals || 0),
            accountDays: Number(data.accountDays || 0),
            avgTrustRating: Number(data.avgTrustRating || 10),
          });
        }
      })
      .catch((err) => {
        console.error("Error loading trust score stats:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const score = stats.trustScore;
  const limit = stats.maxRentalLimit;

  // Trust Level Label
  const getTrustBadge = (s) => {
    if (s >= 85) return { label: "Excellent Trust", color: "#15803d", bg: "#dcfce7" };
    if (s >= 65) return { label: "Good Standing", color: "#00aa5b", bg: "#f0fdf4" };
    if (s >= 40) return { label: "Standard Member", color: "#d97706", bg: "#fef3c7" };
    return { label: "Building Trust", color: "#b45309", bg: "#ffedd5" };
  };

  const badge = getTrustBadge(score);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-modal, var(--bg-card, #ffffff))",
          borderRadius: "22px",
          width: "100%",
          maxWidth: "490px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(22, 163, 74, 0.15)",
          overflow: "hidden",
          animation: "fadeIn 0.25s ease-out",
          border: "1px solid var(--border-light, #e2e8f0)",
          color: "var(--text-main, #0f172a)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================== */}
        {/* GREEN GRADIENT HEADER                                          */}
        {/* ============================================================== */}
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--primary, #00aa5b) 0%, var(--primary-hover, #008748) 100%)",
            padding: "18px 20px",
            color: "var(--text-inverse, #ffffff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={22} color="var(--text-inverse, #ffffff)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>
                {t("trustScore.title", "RentHub Trust Score & Limits")}
              </h3>
              <span style={{ fontSize: "12px", opacity: 0.9, color: "rgba(255, 255, 255, 0.9)" }}>
                {t("trustScore.subtitle", "Your reputation & borrowing power")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-inverse, #ffffff)",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")}
            title={t("common.close", "Close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* ============================================================== */}
        {/* BODY CONTENT                                                   */}
        {/* ============================================================== */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* TWO MAIN STATS CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* CARD 1: TRUST SCORE */}
            <div
              style={{
                backgroundColor: "var(--bg-card-elevated, #f8fafc)",
                border: "1.5px solid var(--border-light, #e2e8f0)",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--text-muted, #64748b)",
                  }}
                >
                  Trust Score
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    backgroundColor: badge.bg,
                    color: badge.color,
                    padding: "2px 7px",
                    borderRadius: "12px",
                  }}
                >
                  {badge.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "var(--primary, #00aa5b)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "2px",
                }}
              >
                <span>{score}%</span>
              </div>
            </div>

            {/* CARD 2: MAX RENTAL LIMIT */}
            <div
              style={{
                backgroundColor: "var(--bg-card-elevated, #f8fafc)",
                border: "1.5px solid var(--border-light, #e2e8f0)",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--text-muted, #64748b)",
                }}
              >
                Max Rental Limit
              </span>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "var(--primary-hover, #15803d)",
                  marginTop: "4px",
                }}
              >
                LKR {limit.toLocaleString()}
              </div>
              <span style={{ fontSize: "10.5px", color: "var(--text-secondary, #475569)" }}>
                Unlock items up to this value
              </span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11.5px",
                color: "var(--text-secondary, #475569)",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              <span>Reputation Meter</span>
              <span>{score} / 100 Points</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "10px",
                backgroundColor: "var(--bg-card-hover, #e2e8f0)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(5, score))}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #22c55e 0%, var(--primary, #00aa5b) 100%)",
                  borderRadius: "10px",
                  transition: "width 0.5s ease-out",
                }}
              />
            </div>
          </div>

          {/* 3 PERFORMANCE PILLS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              backgroundColor: "var(--badge-green-bg, #f0fdf4)",
              border: "1px solid var(--badge-green-bg, #bbf7d0)",
              borderRadius: "14px",
              padding: "12px 10px",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  color: "var(--primary-hover, #15803d)",
                  marginBottom: "2px",
                }}
              >
                <PackageCheck size={15} />
                <strong style={{ fontSize: "15px" }}>{stats.completedRentals}</strong>
              </div>
              <span style={{ fontSize: "10.5px", color: "var(--text-secondary, #475569)", fontWeight: "600" }}>
                Safe Returns
              </span>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  color: "var(--primary-hover, #15803d)",
                  marginBottom: "2px",
                }}
              >
                <Clock size={15} />
                <strong style={{ fontSize: "15px" }}>{stats.accountDays}d</strong>
              </div>
              <span style={{ fontSize: "10.5px", color: "var(--text-secondary, #475569)", fontWeight: "600" }}>
                Account Age
              </span>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  color: "var(--primary-hover, #15803d)",
                  marginBottom: "2px",
                }}
              >
                <Star size={14} color="#eab308" fill="#eab308" />
                <strong style={{ fontSize: "15px" }}>{Number(stats.avgTrustRating).toFixed(1)}/10</strong>
              </div>
              <span style={{ fontSize: "10.5px", color: "var(--text-secondary, #475569)", fontWeight: "600" }}>
                Trust Rating
              </span>
            </div>
          </div>

          {/* HOW TRUST SCORE WORKS EXPLANATION */}
          <div
            style={{
              backgroundColor: "var(--bg-app-alt, #f8fafc)",
              border: "1px solid var(--border-light, #e2e8f0)",
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: "700",
                color: "var(--text-main, #0f172a)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <Sparkles size={16} color="var(--primary, #00aa5b)" />
              <span>How To Increase Your Limit & Score</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "var(--text-secondary, #475569)" }}>
                <CheckCircle2 size={15} color="var(--primary, #00aa5b)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>Safe Returns (+LKR 1,500 limit):</strong> Return borrowed items on time and without damages.
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "var(--text-secondary, #475569)" }}>
                <CheckCircle2 size={15} color="var(--primary, #00aa5b)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>Owner Inspection Rating (0-10):</strong> Earn top ratings from sellers when handing back items.
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "var(--primary, #00aa5b)" }}>
                <CheckCircle2 size={15} color="var(--primary, #00aa5b)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>Account Age & Loyalty:</strong> Active members automatically receive periodic limit boosts.
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "var(--text-secondary, #475569)" }}>
                <CheckCircle2 size={15} color="var(--primary, #00aa5b)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>Unlock Expensive Gear:</strong> Higher limits let you rent high-end cameras, power tools, and vehicles with zero deposit!
                </span>
              </div>
            </div>
          </div>

          {/* CLOSE / GOT IT BUTTON */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "12px",
              backgroundColor: "var(--primary, #00aa5b)",
              color: "var(--text-inverse, #ffffff)",
              border: "none",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(0, 170, 91, 0.28)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            <CheckCircle2 size={18} />
            <span>{t("common.gotIt", "Got it!")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
