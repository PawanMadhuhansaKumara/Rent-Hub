import "./theme.css";
import "./index.css";
import "./Home.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./i18n";

// Initialize Theme on startup
try {
  const initialTheme = localStorage.getItem("renthub_theme") || "light";
  document.documentElement.setAttribute("data-theme", initialTheme);
  document.body.setAttribute("data-theme", initialTheme);
} catch {}

// Automatically route localhost:5001 API calls & images to current host IP when accessed from phone/network
if (
  typeof window !== "undefined" &&
  window.location.hostname &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  const currentHost = window.location.hostname;

  // 1. Intercept all fetch requests pointing to localhost:5001
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === "string" && input.includes("localhost:5001")) {
      input = input.replace("localhost:5001", `${currentHost}:5001`);
    } else if (input instanceof Request && input.url.includes("localhost:5001")) {
      input = new Request(
        input.url.replace("localhost:5001", `${currentHost}:5001`),
        init || input
      );
    }
    return originalFetch.call(this, input, init);
  };

  // 2. Intercept image loading errors so localhost:5001 image URLs reload via phone/network IP
  window.addEventListener(
    "error",
    (e) => {
      const target = e.target;
      if (
        target &&
        target.tagName === "IMG" &&
        target.src &&
        target.src.includes("localhost:5001") &&
        !target.dataset.ipRetried
      ) {
        target.dataset.ipRetried = "true";
        target.src = target.src.replace("localhost:5001", `${currentHost}:5001`);
      }
    },
    true
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
