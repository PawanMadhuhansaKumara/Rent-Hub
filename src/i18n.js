import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import siTranslation from "./locales/si/translation.json";
import taTranslation from "./locales/ta/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  si: {
    translation: siTranslation,
  },
  ta: {
    translation: taTranslation,
  },
};

const getInitialLanguage = () => {
  const saved = localStorage.getItem("language");
  if (saved) return saved;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.preferred_language) return user.preferred_language;
      if (user?.language) return user.language;
    }
  } catch {}
  return "en";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
