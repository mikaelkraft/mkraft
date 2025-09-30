import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Root element #root not found");
}
