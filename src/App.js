import React from "react";
import { Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Import all components
import HeroSection from "./components/HeroSection";
import Signup from "./pages/Signup";
import InteriordesignerSignup from "./pages/InteriordesignerSignup";
import ArchitectSignup from "./pages/ArchitectSignup";
import FAQPage from "./pages/FAQPage";
import Dashboard from "./pages/Dashboard";
//import ChatPage from "./pages/Chatpage"; // ⚠️ Ensure filename is ChatPage.jsx
import Account from "./pages/Account";
//import MapWithStreetView from "./components/MapWithStreetView";

// Replace with your actual Google Client ID from GCP
const GOOGLE_CLIENT_ID =
  "739733184031-f4sq593qqdt01tlivnhe6rr1s3lsm5jn.apps.googleusercontent.com";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-700 mb-4">
              There was an error loading one of the components.
            </p>
            <details className="whitespace-pre-wrap text-sm text-gray-600 mb-4">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/architect-signup" element={<ArchitectSignup />} />
          <Route
            path="/interiordesigner-signup"
            element={<InteriordesignerSignup />}
          />
          <Route path="/faq" element={<FAQPage />} />

          {/* ✅ Dashboard Route */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ✅ Account Route */}
          <Route path="/account" element={<Account />} />

        

          {/* Catch-all 404 route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-gray-600 mb-4">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/"
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    Return to Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}
