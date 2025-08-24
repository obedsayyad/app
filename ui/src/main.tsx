import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./bridge/cordova";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
