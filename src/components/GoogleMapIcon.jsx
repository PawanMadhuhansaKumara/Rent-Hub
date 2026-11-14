import React from "react";

export default function GoogleMapIcon({ size = 18, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    >
      {/* Official Google Maps Pin 4-Color Motif */}
      <path
        fill="#48B04F"
        d="M24 4C14.06 4 6 12.06 6 22c0 8.04 5.34 14.84 12.63 17.11L24 44l5.37-4.89C36.66 36.84 42 30.04 42 22 42 12.06 33.94 4 24 4z"
      />
      <path
        fill="#FFC107"
        d="M24 4c-9.94 0-18 8.06-18 18 0 3.23.86 6.26 2.37 8.87L24 16.5V4z"
      />
      <path
        fill="#FF3D00"
        d="M24 4v12.5l8.63 7.87C34.34 23.06 35 21.08 35 19c0-8.28-4.93-15-11-15z"
      />
      <path
        fill="#1976D2"
        d="M8.37 30.87C10.74 34.96 14.54 38.07 19 39.38V27.5L8.37 30.87z"
      />
      <circle fill="#FFFFFF" cx="24" cy="20" r="6" />
    </svg>
  );
}
