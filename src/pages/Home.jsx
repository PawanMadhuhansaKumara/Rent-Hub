import React from "react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1> {t("home.title")} 📦</h1>
    </div>
  );
}
