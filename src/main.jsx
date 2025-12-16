import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SavingsProvider } from "./context/SavingsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SavingsProvider>
          <App />
        </SavingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
