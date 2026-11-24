import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import siTranslation from "./locales/si/translation.json";
import taTranslation from "./locales/ta/translation.json";

import enSupport from "./locales/en/support.json";
import siSupport from "./locales/si/support.json";
import taSupport from "./locales/ta/support.json";

const resources = {
  en: {
    translation: {
      ...enTranslation,
      support: enSupport,
    },
    support: enSupport,
  },
  si: {
    translation: {
      ...siTranslation,
      support: siSupport,
    },
    support: siSupport,
  },
  ta: {
    translation: {
      ...taTranslation,
      support: taSupport,
    },
    support: taSupport,
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
