/**
 * CycleSideChick — Main Application Entry Point
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App.jsx";

// Import core stylesheets
import "./css/tokens.css";
import "./css/base.css";
import "./css/components.css";
import "./css/views.css";

// PWA Service Worker Registration with update checking
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New version available.");
  },
  onOfflineReady() {
    console.log("CycleSideChick is ready to work offline.");
  }
});

const rootElement = document.getElementById("root") || document.getElementById("app");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
