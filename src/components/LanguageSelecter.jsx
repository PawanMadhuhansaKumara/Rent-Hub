import { useTranslation } from "react-i18next";
import "./components.css";

export default function LanguageSelecter() {
  const { i18n } = useTranslation();

  const changeLanguage = async (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const userId = storedUser?.user_id || storedUser?.id;
      if (userId) {
        const updatedUser = { ...storedUser, preferred_language: language };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user_updated"));
        window.dispatchEvent(new Event("storage"));

        await fetch(`http://https://rent-hub-ashen.vercel.app/api/users/${userId}/language`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language }),
        });
      }
    } catch (err) {
      console.error("Failed to sync language to database:", err);
    }
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
