import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./bridge/cordova";
import App from "./App.tsx";

// Install global error handlers early to capture bootstrap issues inside WKWebView.
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    try {
      // eslint-disable-next-line no-console
      console.error("[UI Boot] window.onerror:", e.error || e.message, e);
    } catch {
      // ignore
    }
  });
  window.addEventListener("unhandledrejection", (e) => {
    try {
      // eslint-disable-next-line no-console
      console.error("[UI Boot] unhandledrejection:", e.reason, e);
    } catch {
      // ignore
    }
  });
  // eslint-disable-next-line no-console
  console.log(
    "[UI Boot] Starting React render. Cordova available:",
    !!(window as any).cordova
  );
}

try {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    // eslint-disable-next-line no-console
    console.error("[UI Boot] #root element not found");
  } else {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    // Mark React mounted and cancel watchdog if present
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__REACT_MOUNTED__ = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wd = (window as any).__BOOT_WATCHDOG__;
      if (wd && typeof wd.cancel === "function") {
        wd.cancel();
      }
      // eslint-disable-next-line no-console
      console.log("[UI Boot] React render completed");
    } catch {
      // ignore
    }
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("[UI Boot] React render failed:", err);
}
