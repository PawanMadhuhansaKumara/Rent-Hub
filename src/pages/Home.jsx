import React from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/BottomNav";

export default function Home({ user, setUser }) {
  const { t } = useTranslation();

  return (
    <>
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1> {t("home.title")} 📦</h1>
      </div>
      {user && <BottomNav />}
    </>
  );
}
