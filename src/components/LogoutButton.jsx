import { useTranslation } from "react-i18next";

export default function LogoutButton({ handleLogout }) {
  const { t } = useTranslation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (handleLogout) {
      handleLogout();
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <>
      <style>{`
        .navbar-logout {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid var(--badge-red-bg);
          border-radius: 9px;
          background: var(--badge-red-bg);
          color: var(--badge-red-text);
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .navbar-logout:hover {
          background: var(--badge-red-bg);
          border-color: var(--badge-red-border);
        }

        .navbar-logout:active {
          transform: scale(0.98);
        }
      `}</style>

      <button type="button" className="navbar-logout" onClick={logout}>
        {t("appbar.logout") || "Logout"}
      </button>
    </>
  );
}
