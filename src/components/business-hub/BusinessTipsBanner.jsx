import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

export default function BusinessTipsBanner() {
  const { t } = useTranslation();

  return (
    <div className="business-tips-banner">
      <div className="tips-icon-wrap">
        <Sparkles size={22} />
      </div>
      <div className="tips-content">
        <h4>{t("businessHub.tipsTitle", "Boost Your Rental Income")}</h4>
        <p>
          {t(
            "businessHub.tipsDesc",
            "High quality pictures, quick replies to chat inquiries, and offering fair daily rates help items rent 3x faster on Rent-Hub."
          )}
        </p>
      </div>
    </div>
  );
}
