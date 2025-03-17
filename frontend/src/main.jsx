import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Header } from "./Header";

// Importing the Bootstrap CSS (customized)
import "./scss/custom.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Header />
    <App />
  </StrictMode>
);
