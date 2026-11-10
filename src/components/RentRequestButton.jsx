import React from "react";
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
  const isDisabled =
    disabled !== undefined
      ? disabled
      : available !== undefined
        ? available < 1
        : false;

  const buttonText =
    children ||
    (available !== undefined && available < 1
      ? "Not Available"
      : "Rent Now");

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
