import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // 👈 Import this
import App from "./App";
import "./index.css"; // Tailwind
import "cesium/Build/Cesium/Widgets/widgets.css"; // Cesium CSS

// Where Cesium fetches its static assets (from public/cesium)
window.CESIUM_BASE_URL = "/cesium";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Get Google Client ID from environment variable or use default
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "739733184031-f4sq593qqdt01tlivnhe6rr1s3lsm5jn.apps.googleusercontent.com";

root.render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
