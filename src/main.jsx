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

// Automatically route https://rent-hub-ashen.vercel.app API calls & images to local backend when accessed locally or via phone/network
if (
  typeof window !== "undefined" &&
  !window.location.hostname.endsWith(".vercel.app")
) {
  const currentHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "localhost"
      : window.location.hostname;
  const targetOrigin = `http://${currentHost}:5001`;

  // 1. Intercept all fetch requests pointing to https://rent-hub-ashen.vercel.app
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === "string" && input.includes("https://rent-hub-ashen.vercel.app")) {
      input = input.replace("https://rent-hub-ashen.vercel.app", targetOrigin);
    } else if (input instanceof Request && input.url.includes("https://rent-hub-ashen.vercel.app")) {
      input = new Request(
        input.url.replace("https://rent-hub-ashen.vercel.app", targetOrigin),
        init || input
      );
    }
    return originalFetch.call(this, input, init);
  };

  // 2. Intercept image loading errors so https://rent-hub-ashen.vercel.app image URLs reload via local / network IP
  window.addEventListener(
    "error",
    (e) => {
      const target = e.target;
      if (
        target &&
        target.tagName === "IMG" &&
        target.src &&
        target.src.includes("https://rent-hub-ashen.vercel.app") &&
        !target.dataset.ipRetried
      ) {
        target.dataset.ipRetried = "true";
        target.src = target.src.replace("https://rent-hub-ashen.vercel.app", targetOrigin);
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
