import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Import all components
import HeroSection from "./components/HeroSection";
import InteriorDesignerSignup from "./pages/InteriordesignerSignup";
import FAQPage from "./pages/FAQPage";
import InteriorDesigndDashboard from "./pages/InteriorDesigndDashboard";
import AIHouse from "./pages/AIHouse";
// import ChatPage from "./pages/ChatPage"; // ⚠️ If you use it later
import Account from "./pages/Account";
// import MapWithStreetView from "./components/MapWithStreetView";
import PricingAndTrialFlow from "./pages/PricingandTrialFlow";   // ✅ NEW
import InteriorResetPassword from "./pages/InteriorResetPassword";

// Import new authentication pages
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import MaterialsManagement from "./pages/MaterialsManagement";
import AdminProjectManagement from "./pages/AdminProjectManagement";
import WorkersManagement from "./pages/WorkersManagement";
import FinanceManagement from "./pages/FinanceManagement";
import AdminLayout from "./components/AdminLayout";
import InteriorDesignerRouteGuard from "./components/InteriorDesignerRouteGuard";

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
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* ✅ Home */}
          <Route path="/" element={<HeroSection />} />

          {/* ✅ Auth / Signup */}
          <Route
            path="/interiordesigner-signup"
            element={<InteriorDesignerSignup />}
          />
          
          {/* ✅ Common Signup Page */}
          <Route path="/signup" element={<InteriorDesignerSignup />} />
          
          {/* ✅ NEW Unified Auth with Role Selection */}
          <Route path="/auth" element={<AuthPage />} />

          {/* ✅ General Pages */}
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/PricingandTrialFlow" element={<PricingAndTrialFlow />} /> {/* ✅ NEW Pricing Route */}
          <Route path="/products/aihouse" element={<AIHouse />} />

          {/* ✅ Dashboards */}
          {/* ⚠️ Interior Dashboard: ONLY accessible to Interior Designers */}
          <Route 
            path="/interior-dashboard" 
            element={
              <InteriorDesignerRouteGuard>
                <InteriorDesigndDashboard />
              </InteriorDesignerRouteGuard>
            } 
          />
          
          {/* ✅ Role-based Dashboards */}
          <Route path="/engineer-dashboard" element={<EngineerDashboard />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          
          {/* ✅ Admin Routes with Shared Layout */}
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/materials" element={<MaterialsManagement />} />
            <Route path="/admin/projects" element={<AdminProjectManagement />} />
            <Route path="/admin/workers" element={<WorkersManagement />} />
            <Route path="/admin/finance" element={<FinanceManagement />} />
          </Route>

          {/* ✅ Account */}
          <Route path="/account" element={<Account />} />

          {/* ✅ Password Reset Routes */}
          <Route path="/interior-reset-password/:token" element={<InteriorResetPassword />} />

          {/* ✅ Catch-all 404 */}
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
      </AuthProvider>
    </ErrorBoundary>
  );
}
