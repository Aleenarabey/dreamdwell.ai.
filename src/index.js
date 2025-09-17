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

root.render(
  <GoogleOAuthProvider clientId="739733184031-f4sq593qqdt01tlivnhe6rr1s3lsm5jn.apps.googleusercontent.com"> {/* 👈 Replace with your actual client ID */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
