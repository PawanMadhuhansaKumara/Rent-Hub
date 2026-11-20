import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Zap, ChevronDown } from "lucide-react";

export default function BusinessHubHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const scrollToQuickOps = () => {
    const el = document.getElementById("quick-operations");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="business-hub-header">
      <div className="business-hub-header-left">
        <button
          type="button"
          className="business-hub-back-btn"
          onClick={handleBack}
          title="Go Back"
          aria-label="Go Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="business-hub-title">
            {t("businessHub.title", "Business Hub")}
            <span className="business-hub-badge">
              {t("businessHub.sellerCenter", "Seller Center")}
            </span>
          </h1>
          <p className="business-hub-subtitle">
            {t(
              "businessHub.subtitle",
              "Manage your rental inventory, track availability, and grow your earnings."
            )}
          </p>
        </div>
      </div>

      <div className="business-hub-header-right">
        <button
          type="button"
          className="quick-ops-jump-btn"
          onClick={scrollToQuickOps}
          title="Jump directly to Quick Operations"
        >
          <Zap size={15} color="#059669" />
          <span>{t("businessHub.quickOperations", "Quick Operations")}</span>
          <ChevronDown size={14} color="#059669" />
        </button>
      </div>
    </div>
  );
}
