import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("signup"); // 'signup' or 'login'
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  const [role, setRole] = useState("");

  // Form fields
  const [name, setName] = useState(""); // For admin
  const [firstName, setFirstName] = useState(""); // For engineer/customer
  const [lastName, setLastName] = useState(""); // For engineer/customer
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Handle role selection
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setShowRoleSelection(false);
    // Force login mode for admin
    if (selectedRole === "admin") {
      setMode("login");
    }
  };

  const goBackToRoleSelection = () => {
    setShowRoleSelection(true);
    setRole("");
    // Reset form fields
    setName("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    // Reset errors
    setErrors({
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  // Validation functions
  const validateEmail = (emailValue) => {
    if (!emailValue) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      return "Password is required";
    }
    if (passwordValue.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const validateName = (nameValue, fieldName = "Name") => {
    if (!nameValue) {
      return `${fieldName} is required`;
    }
    if (nameValue.trim().length < 2) {
      return `${fieldName} must be at least 2 characters long`;
    }
    return "";
  };

  const validateConfirmPassword = (confirmPasswordValue, passwordValue) => {
    if (!confirmPasswordValue) {
      return "Please confirm your password";
    }
    if (confirmPasswordValue !== passwordValue) {
      return "Passwords do not match";
    }
    return "";
  };

  // Handle field changes with validation
  const handleNameChange = (value) => {
    setName(value);
    if (mode === "signup") {
      setErrors(prev => ({ ...prev, name: validateName(value, "Name") }));
    }
  };

  const handleFirstNameChange = (value) => {
    setFirstName(value);
    if (mode === "signup") {
      setErrors(prev => ({ ...prev, firstName: validateName(value, "First name") }));
    }
  };

  const handleLastNameChange = (value) => {
    setLastName(value);
    if (mode === "signup") {
      setErrors(prev => ({ ...prev, lastName: validateName(value, "Last name") }));
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    setErrors(prev => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    // Also validate confirm password if it exists
    if (confirmPassword) {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: validateConfirmPassword(confirmPassword, value) 
      }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (mode === "signup") {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: validateConfirmPassword(value, password) 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "signup") {
        // Block admin signup
        if (role === "admin") {
          alert("Admin signup is disabled. Please use the login page.");
          return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }

        // Validate password strength
        if (password.length < 6) {
          alert("Password must be at least 6 characters long");
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert("Please enter a valid email address");
          return;
        }

        // Validate based on role
        if (role === "admin") {
          // Admin: name, email, password
          if (!name || !email || !password || !role) {
            alert("Please fill in all fields");
            return;
          }
          // Validate name has at least 2 characters
          if (name.trim().length < 2) {
            alert("Name must be at least 2 characters long");
            return;
          }
        } else {
          // Engineer/Customer: first name, last name, email, password
          if (!firstName || !lastName || !email || !password || !role) {
            alert("Please fill in all fields");
            return;
          }
          // Validate names have at least 2 characters
          if (firstName.trim().length < 2 || lastName.trim().length < 2) {
            alert("First and last names must be at least 2 characters long");
            return;
          }
        }

        // Prepare signup data
        const signupData = role === "admin" 
          ? { name, email, password, role }
          : { firstName, lastName, email, password, role };

        const res = await axios.post("http://localhost:5000/api/auth/signup", signupData);

        alert(res.data.message || "Signup successful!");
        // Switch to login mode after successful signup
        setMode("login");
        setShowRoleSelection(true);
        setRole("");
      } else {
        // Login
        if (!email || !password) {
          alert("Please fill in all fields");
          return;
        }

        // Validate email format for login
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert("Please enter a valid email address");
          return;
        }

        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });

        // Clear any old/stale localStorage data FIRST to prevent role conflicts
        console.log("🧹 Clearing old localStorage data before saving new login");
        
        // Save user data and token FIRST
        const userData = res.data.user;
        const userRole = userData.role;
        
        console.log("🔍 ===== LOGIN RESPONSE (FROM /api/auth/login) =====");
        console.log("Endpoint: /api/auth/login");
        console.log("User Role:", userRole);
        console.log("Full User Data:", userData);
        console.log("Token received:", res.data.token ? "YES" : "NO");
        console.log("Email:", userData.email);
        console.log("==============================");
        
        // Verify role before saving
        if (!userRole) {
          console.error("❌ ERROR: No role in user data!");
          alert("Login error: User role not found. Please contact support.");
          return;
        }

        // VERIFY role one more time before saving
        console.log("🔍 PRE-LOGIN CHECK - Role:", userRole, "User object:", userData);
        if (userRole === "engineer") {
          console.log("🚨 ENGINEER DETECTED BEFORE LOGIN SAVE - PREVENTING INTERIOR DASHBOARD ACCESS");
        }
        
        // Clear old localStorage first, then save new data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Save user data and token
        login(userData, res.data.token);
        
        // Verify it was saved correctly - do this synchronously
        const verifyUser = localStorage.getItem('user');
        if (verifyUser) {
          const verifyData = JSON.parse(verifyUser);
          console.log("🔍 POST-LOGIN VERIFICATION - Saved role:", verifyData.role, "Full saved data:", verifyData);
          if (verifyData.role !== userRole) {
            console.error("❌ ERROR: Role mismatch! Expected:", userRole, "Got:", verifyData.role);
            // Force fix if mismatch
            const correctedData = { ...verifyData, role: userRole };
            localStorage.setItem('user', JSON.stringify(correctedData));
            console.log("✅ Corrected role in localStorage");
          }
        } else {
          console.error("❌ ERROR: User data not saved to localStorage!");
        }

        // IMMEDIATE and FORCEFUL redirect based on role - NO DELAYS
        // Use window.location.replace immediately to prevent any other routes from loading
        if (userRole === "admin") {
          console.log("✅ Redirecting ADMIN to /admin-dashboard");
          window.location.replace("/admin-dashboard"); // Force redirect with replace (no back button)
          return; // Exit immediately
        } else if (userRole === "engineer") {
          // For engineers, FORCE redirect to engineer-dashboard - ABSOLUTELY NO EXCEPTIONS
          console.log("✅✅✅ ENGINEER LOGIN DETECTED - FORCING IMMEDIATE REDIRECT TO /engineer-dashboard");
          console.log("Engineer user data:", userData);
          console.log("Engineer role in localStorage:", JSON.parse(localStorage.getItem('user') || '{}')?.role);
          // Use window.location.replace for immediate, non-cancellable redirect
          window.location.replace("/engineer-dashboard"); 
          return; // Exit immediately to prevent ANY further execution
        } else if (userRole === "customer") {
          console.log("✅ Redirecting CUSTOMER to /customer-dashboard");
          window.location.replace("/customer-dashboard");
          return; // Exit immediately
        } else {
          // Unknown role - this should not happen for users from /api/auth/login
          console.error("⚠️ UNKNOWN ROLE:", userRole, "- Full data:", userData);
          alert(`Unknown user role: ${userRole}. Please contact support.`);
          window.location.replace("/");
          return; // Exit immediately
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  // Handle Google login for engineer and customer
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google-login", {
        token: credentialResponse.credential,
        role: role, // Send the selected role
      });

      // Save user data and token
      login(res.data.user, res.data.token);

      // Redirect based on role - FORCEFUL redirect to prevent any race conditions
      const userRole = res.data.user.role;
      console.log("🔍 Google login successful - User role:", userRole, "Full user data:", res.data.user);
      
      if (userRole === "admin") {
        // For admin, redirect to dashboard without alert
        window.location.href = "/admin-dashboard"; // Force redirect
        navigate("/admin-dashboard", { replace: true });
      } else if (userRole === "engineer") {
        // For engineers, FORCE redirect to engineer-dashboard - NO EXCEPTIONS
        console.log("✅ Engineer Google login confirmed - FORCING redirect to /engineer-dashboard");
        window.location.href = "/engineer-dashboard"; // Force redirect immediately
        navigate("/engineer-dashboard", { replace: true });
        // Don't show alert for engineers - redirect is immediate
        return; // Exit immediately
      } else if (userRole === "customer") {
        // For customers, redirect to customer-dashboard
        window.location.href = "/customer-dashboard"; // Force redirect
        navigate("/customer-dashboard", { replace: true });
        alert(res.data.message || "Google login successful!");
      } else {
        // Unknown role - redirect to home
        console.warn("⚠️ Unknown user role:", userRole, "- redirecting to home");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-2xl w-full p-8 ${role === "admin" ? "max-w-2xl" : "max-w-md"}`}>
        <h2 className={`font-bold text-center mb-2 text-gray-800 ${role === "admin" ? "text-4xl" : "text-3xl"}`}>
          {showRoleSelection
            ? "Choose Your Role"
            : mode === "signup"
            ? `Create ${role} Account`
            : role === "admin"
            ? "Admin Login"
            : "Welcome Back"}
        </h2>
        <p className={`text-gray-600 text-center mb-6 ${role === "admin" ? "text-lg" : "text-sm"}`}>
          {showRoleSelection
            ? "Select your role to get started"
            : mode === "signup"
            ? `Join our platform as a ${role}`
            : role === "admin"
            ? "Enter your admin credentials to continue"
            : "Log in to continue your journey"}
        </p>

        {/* Toggle between signup and login - Hide signup for admin */}
        {!showRoleSelection && role !== "admin" && (
          <div className="flex bg-gray-200 rounded-lg mb-6">
            <button
              onClick={() => {
                setMode("signup");
              }}
              className={`w-1/2 py-2 rounded-lg ${
                mode === "signup"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => {
                setMode("login");
              }}
              className={`w-1/2 py-2 rounded-lg ${
                mode === "login"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-300"
              }`}
            >
              Log in
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          {showRoleSelection && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("admin")}
                className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                🔑 Admin (Login Only)
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("engineer")}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                👨‍💻 Engineer
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("customer")}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                👤 Customer
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          )}

          {/* Signup/Login Form */}
          {!showRoleSelection && (
            <div className="space-y-4">
              {mode === "signup" && role !== "admin" && (
                <>
                  {/* Name field for admin, first/last name for engineer and customer */}
                  {role === "admin" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => handleFirstNameChange(e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => handleLastNameChange(e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className={role === "admin" ? "flex flex-col items-center" : ""}>
                <label className={`block text-gray-700 mb-3 ${role === "admin" ? "text-center text-2xl font-bold" : "text-sm font-medium"}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.email 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300"
                  } ${role === "admin" ? "px-10 py-7 text-2xl w-4/5" : "w-full px-4 py-2"}`}
                  placeholder={role === "admin" ? "Enter your email" : ""}
                  required
                />
                {errors.email && (
                  <p className={`mt-1 text-sm text-red-600 ${role === "admin" ? "text-center text-xl" : ""}`}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className={role === "admin" ? "flex flex-col items-center" : ""}>
                <label className={`block text-gray-700 mb-3 ${role === "admin" ? "text-center text-2xl font-bold" : "text-sm font-medium"}`}>
                  Password
                </label>
                <div className={`relative ${role === "admin" ? "w-4/5" : "w-full"}`}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.password 
                        ? "border-red-500 focus:ring-red-500" 
                        : "border-gray-300"
                    } ${role === "admin" ? "px-10 py-7 text-2xl" : "px-4 py-2"}`}
                    placeholder={role === "admin" ? "Enter your password" : ""}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute text-gray-600 hover:text-gray-800 ${role === "admin" ? "right-8 top-7 text-3xl" : "right-3 top-2"}`}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <p className={`mt-1 text-sm text-red-600 ${role === "admin" ? "text-center text-xl w-4/5" : ""}`}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password Link - Admin Only */}
              {role === "admin" && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={() => alert("Forgot password functionality coming soon!")}
                    className="text-blue-600 hover:text-blue-800 text-2xl font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {mode === "signup" && role !== "admin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className={role === "admin" ? "flex justify-center" : ""}>
                <button
                  type="submit"
                  className={`bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition ${role === "admin" ? "mt-8 py-6 px-20 text-2xl w-4/5" : "w-full py-3"}`}
                >
                  {mode === "signup" ? "Sign up" : role === "admin" ? "Admin Login" : "Login"}
                </button>
              </div>

              {/* Google Authentication - For engineer and customer (both signup and login), NOT for admin */}
              {role !== "admin" && (
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => alert("Google login failed")}
                      theme="filled_blue"
                      size="large"
                      width="100%"
                    />
                  </div>
                </div>
              )}

              {/* Back to Role Selection */}
              <button
                type="button"
                onClick={goBackToRoleSelection}
                className={`w-full text-gray-600 hover:text-gray-800 ${role === "admin" ? "py-3 text-base" : "py-2 text-sm"}`}
              >
                ← Back to Role Selection
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

