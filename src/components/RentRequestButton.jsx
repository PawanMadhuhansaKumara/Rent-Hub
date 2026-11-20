import React from "react";
import { useTranslation } from "react-i18next";
import "./components.css";

function RentRequestButton({
  available,
  showRequestForm = false,
  onClick,
  disabled,
  children,
  className = "",
  ...props
}) {
  const { t } = useTranslation();
  const isRentedOut =
    available === "Rented Out" ||
    String(available).toLowerCase() === "rented out" ||
    String(available).toLowerCase() === "rented" ||
    available === 0 ||
    available === "0" ||
    (available !== undefined &&
      available !== null &&
      available !== "" &&
      !isNaN(Number(available)) &&
      Number(available) < 1);

  const isDisabled =
    disabled !== undefined ? disabled : isRentedOut;

  const buttonText =
    children ||
    (isRentedOut
      ? t("rentsPage.status.rented", "Rented Out")
      : t("rentRequest.requestToRent", "Rent Now"));

  return (
    <button
      type="button"
      className={`rent-request-button ${className}`.trim()}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {buttonText}
    </button>
  );
}

export default RentRequestButton;
