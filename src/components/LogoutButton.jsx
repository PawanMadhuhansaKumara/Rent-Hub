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
  <style>{`
  .navbar-logout {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #fee2e2;
    border-radius: 9px;
    background: #fff5f5;
    color: #dc2626;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .navbar-logout:hover {
    background: #fee2e2;
    border-color: #fecaca;
  }

  .navbar-logout:active {
    transform: scale(0.98);
  }
`}</style>;
  return (
    <button type="button" className="navbar-logout" onClick={logout}>
      {t("appbar.logout") || "Logout"}
    </button>
  );
}
