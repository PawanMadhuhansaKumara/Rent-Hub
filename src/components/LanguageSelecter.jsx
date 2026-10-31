import { useTranslation } from "react-i18next";
import "./components.css";

export default function LanguageSelecter() {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <select
      className="navbar-language"
      value={i18n.language?.split("-")[0] || "en"}
      onChange={(e) => changeLanguage(e.target.value)}
      aria-label="Select language"
    >
      <option value="en">English</option>
      <option value="si">සිංහල</option>
      <option value="ta">தமிழ்</option>
    </select>
  );
}
