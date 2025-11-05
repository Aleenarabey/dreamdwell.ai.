import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

/**
 * Route Guard Component: Ensures ONLY interior designers can access protected routes
 * Use this component to wrap routes that should only be accessible to interior designers
 */
export default function InteriorDesignerRouteGuard({ children }) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [engineerVerified, setEngineerVerified] = useState(false);

  // CRITICAL: All hooks must be called before any conditional returns
  // CRITICAL: Verify if user is actually an engineer in User model, even if localStorage says interiorDesigner
  // This catches cases where someone logged in as interior designer but is actually an engineer
  useLayoutEffect(() => {
    const verifyEngineerStatus = async () => {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (!savedUser) return;
      
      try {
        const userData = JSON.parse(savedUser);
        const email = userData?.email;
        
        if (!email) return;
        
        // Even if role in localStorage says "interiorDesigner", check if they're actually an engineer
        try {
          const response = await axios.get(`http://localhost:5000/api/auth/verify-engineer/${encodeURIComponent(email)}`);
          if (response.data?.isEngineer === true) {
            console.log("🚫🚫🚫 VERIFIED: User is ACTUALLY an engineer in User model - FORCING redirect");
            console.log("Email:", email, "was found as engineer despite localStorage role:", userData?.role);
            setEngineerVerified(true);
            // Clear incorrect localStorage data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            // Force redirect to engineer dashboard
            window.location.replace("/engineer-dashboard");
            return;
          }
        } catch (verifyError) {
          // If verification fails (404 means not an engineer, which is fine for interior designers)
          if (verifyError.response?.status !== 404) {
            console.log("🔍 Engineer verification check error:", verifyError.response?.status);
          }
        }
      } catch (error) {
        console.error("Error in engineer verification:", error);
      }
    };
    
    verifyEngineerStatus();
  }, []);

  // useLayoutEffect runs synchronously before paint
  useLayoutEffect(() => {
    if (authLoading || engineerVerified) return; // Wait for auth to load or if engineer verified

    // Check localStorage first (fastest check)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const userRole = userData?.role;

        console.log("🔍 Route Guard useLayoutEffect - Role:", userRole);

        // Block engineers - redirect immediately
        if (userRole === "engineer") {
          console.log("🚫 Route Guard: Engineer blocked in useLayoutEffect - FORCING redirect");
          window.location.replace("/engineer-dashboard");
          return;
        }

        // Block admins
        if (userRole === "admin") {
          console.log("🚫 Route Guard: Admin blocked in useLayoutEffect");
          window.location.replace("/admin-dashboard");
          return;
        }

        // Block customers
        if (userRole === "customer") {
          console.log("🚫 Route Guard: Customer blocked in useLayoutEffect");
          window.location.replace("/customer-dashboard");
          return;
        }

        // Only allow interior designers
        if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
          console.log(`🚫 Route Guard: Role "${userRole}" not allowed in useLayoutEffect`);
          window.location.replace("/");
          return;
        }
      } catch (error) {
        console.error("Route Guard: Error parsing user data:", error);
      }
    }

    // Check auth context
    if (user) {
      const userRole = user?.role;

      if (userRole === "engineer") {
        console.log("🚫 Route Guard: Engineer blocked via auth context in useLayoutEffect");
        window.location.replace("/engineer-dashboard");
        return;
      }

      if (userRole === "admin") {
        window.location.replace("/admin-dashboard");
        return;
      }

      if (userRole === "customer") {
        window.location.replace("/customer-dashboard");
        return;
      }

      if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
        window.location.replace("/");
        return;
      }
    } else if (!authLoading) {
      // No user logged in
      console.log("🚫 Route Guard: No user logged in - redirecting to /auth");
      window.location.replace("/auth");
      return;
    }
  }, [user, authLoading, navigate]);

  // Backup useEffect - runs after paint but should still catch issues
  useEffect(() => {
    if (authLoading) return;

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const userRole = userData?.role;

        if (userRole === "engineer") {
          console.log("🚫 Route Guard: Engineer detected in useEffect backup - FORCING redirect");
          window.location.replace("/engineer-dashboard");
        } else if (userRole === "admin") {
          window.location.replace("/admin-dashboard");
        } else if (userRole === "customer") {
          window.location.replace("/customer-dashboard");
        } else if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
          window.location.replace("/");
        }
      } catch (error) {
        console.error("Route Guard: Error in useEffect backup:", error);
      }
    }

    if (user) {
      const userRole = user?.role;
      if (userRole === "engineer" || userRole === "admin" || userRole === "customer") {
        window.location.replace(`/${userRole === "engineer" ? "engineer" : userRole === "admin" ? "admin" : "customer"}-dashboard`);
      } else if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
        window.location.replace("/");
      }
    } else if (!authLoading) {
      window.location.replace("/auth");
    }
  }, [user, authLoading, navigate]);

  // Show nothing while checking, verifying, or redirecting
  if (authLoading || engineerVerified) {
    return null;
  }

  // Final synchronous check before rendering
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      const userRole = userData?.role;
      
      console.log("🔍 Route Guard FINAL check before render - Role:", userRole);
      
      if (userRole === "engineer" || userRole === "admin" || userRole === "customer") {
        console.log(`🚫 Route Guard: ${userRole} BLOCKED in final check - NOT RENDERING`);
        return null; // Don't render - redirecting
      }
      
      if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
        console.log(`🚫 Route Guard: Role "${userRole}" BLOCKED in final check - NOT RENDERING`);
        return null; // Don't render - redirecting
      }
    } catch (error) {
      console.error("Route Guard: Error in final check:", error);
    }
  }

  if (user) {
    const userRole = user?.role;
    if (userRole === "engineer" || userRole === "admin" || userRole === "customer") {
      console.log(`🚫 Route Guard: ${userRole} BLOCKED via auth context in final check`);
      return null; // Don't render - redirecting
    }
    if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
      return null; // Don't render - redirecting
    }
  }

  if (!user && !authLoading) {
    console.log("🚫 Route Guard: No user in final check - NOT RENDERING");
    return null; // Don't render - redirecting to login
  }

  console.log("✅ Route Guard: User is an interior designer - ALLOWING render");
  // Only render children if user is an interior designer
  return children;
}

