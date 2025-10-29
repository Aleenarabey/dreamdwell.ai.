import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { redirectIfNotInteriorDesigner, checkUserRole } from '../utils/roleCheck';

/**
 * Route Guard Component: Ensures ONLY interior designers can access protected routes
 * Use this component to wrap routes that should only be accessible to interior designers
 */
export default function InteriorDesignerRouteGuard({ children }) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // IMMEDIATE synchronous check BEFORE any hooks run - using utility function
  // This runs synchronously on every render, before React even processes hooks
  const roleImmediate = checkUserRole();
  console.log("🔍 Route Guard IMMEDIATE check (first line) - Role:", roleImmediate);
  
  if (redirectIfNotInteriorDesigner()) {
    // Redirect was triggered - return null to prevent any rendering
    return null;
  }
  
  // Additional immediate check with full data
  const savedUserImmediate = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  if (savedUserImmediate) {
    try {
      const userDataImmediate = JSON.parse(savedUserImmediate);
      const userRoleImmediate = userDataImmediate?.role;
      
      console.log("🔍 Route Guard IMMEDIATE check (full data) - Role:", userRoleImmediate, "User data:", userDataImmediate);
      
      // Block engineers - IMMEDIATE redirect BEFORE anything renders
      if (userRoleImmediate === "engineer") {
        console.log("🚫🚫🚫 Route Guard: Engineer BLOCKED IMMEDIATELY - FORCING redirect");
        console.log("🚫 Full engineer data:", userDataImmediate);
        console.log("🚫 Current URL:", window.location.href);
        // Use window.location.replace for immediate, non-cancellable redirect
        window.location.replace("/engineer-dashboard");
        // Also try navigate as backup
        setTimeout(() => navigate("/engineer-dashboard", { replace: true }), 0);
        return null; // Don't render anything
      }

      // Block admins
      if (userRoleImmediate === "admin") {
        console.log("🚫 Route Guard: Admin BLOCKED IMMEDIATELY");
        window.location.replace("/admin-dashboard");
        return null;
      }

      // Block customers
      if (userRoleImmediate === "customer") {
        console.log("🚫 Route Guard: Customer BLOCKED IMMEDIATELY");
        window.location.replace("/customer-dashboard");
        return null;
      }

      // Only allow interior designers
      if (userRoleImmediate && userRoleImmediate !== "interiorDesigner" && userRoleImmediate !== "interior") {
        console.log(`🚫 Route Guard: Role "${userRoleImmediate}" BLOCKED IMMEDIATELY`);
        window.location.replace("/");
        return null;
      }
    } catch (error) {
      console.error("Route Guard: Error parsing user data in immediate check:", error);
    }
  }

  // useLayoutEffect runs synchronously before paint
  useLayoutEffect(() => {
    if (authLoading) return; // Wait for auth to load

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

  // Show nothing while checking or redirecting
  if (authLoading) {
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

