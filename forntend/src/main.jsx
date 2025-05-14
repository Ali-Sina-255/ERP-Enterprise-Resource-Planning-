// src/main.jsx
import React, { Suspense } from "react"; // Import Suspense
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./i18n"; // Import the i18n configuration

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading translations...</div>}>
      {" "}
      {/* Add Suspense for translations loading */}
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
