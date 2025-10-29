// src/pages/InteriordesignerSignup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaIdBadge,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google"; // 🔹 NEW

export default function InteriorDesignerSignup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState(""); // For admin
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  
  // Validation errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    return "";
  };

  const validateName = (name, fieldName) => {
    if (!name) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return `${fieldName} can only contain letters`;
    return "";
  };

  const validatePhone = (phone) => {
    if (phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone)) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  // Handle field blur (touched)
  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    validateField(fieldName);
  };

  // Validate single field
  const validateField = (fieldName) => {
    let error = "";
    
    switch (fieldName) {
      case "email":
        error = validateEmail(email);
        break;
      case "password":
        error = validatePassword(password);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(password, confirmPassword);
        break;
      case "firstName":
        error = validateName(firstName, "First name");
        break;
      case "lastName":
        error = validateName(lastName, "Last name");
        break;
      case "name":
        error = validateName(name, "Name");
        break;
      case "phoneNumber":
        error = validatePhone(phoneNumber);
        break;
      default:
        break;
    }
    
    setErrors({ ...errors, [fieldName]: error });
    return !error;
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (activeTab === "signup") {
      if (userType === "admin") {
        const nameError = validateName(name, "Name");
        if (nameError) {
          newErrors.name = nameError;
          isValid = false;
        }
      } else {
        const firstNameError = validateName(firstName, "First name");
        if (firstNameError) {
          newErrors.firstName = firstNameError;
          isValid = false;
        }
        const lastNameError = validateName(lastName, "Last name");
        if (lastNameError) {
          newErrors.lastName = lastNameError;
          isValid = false;
        }
        if (phoneNumber) {
          const phoneError = validatePhone(phoneNumber);
          if (phoneError) {
            newErrors.phoneNumber = phoneError;
            isValid = false;
          }
        }
      }

      const emailError = validateEmail(email);
      if (emailError) {
        newErrors.email = emailError;
        isValid = false;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
        isValid = false;
      }

      const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
      if (confirmPasswordError) {
        newErrors.confirmPassword = confirmPasswordError;
        isValid = false;
      }
    } else {
      // Login validation
      const emailError = validateEmail(email);
      if (emailError) {
        newErrors.email = emailError;
        isValid = false;
      }
      if (!password) {
        newErrors.password = "Password is required";
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      name: true,
      confirmPassword: true,
      phoneNumber: true,
    });
    return isValid;
  };

  // Handle role selection
  const handleRoleSelection = (role) => {
    setUserType(role);
    setShowRoleSelection(false);
    setErrors({});
    setTouched({});
    // Force login mode for admin
    if (role === "admin") {
      setActiveTab("login");
    }
  };

  // Go back to role selection
  const goBackToRoleSelection = () => {
    setShowRoleSelection(true);
    setUserType("");
    setName("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setConfirmPassword("");
    setErrors({});
    setTouched({});
  };

  // 🔹 Normal signup/login submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (forgotPassword) {
      const emailError = validateEmail(email);
      if (emailError) {
        setErrors({ email: emailError });
        setTouched({ email: true });
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:5000/api/interiorAuth/forgot-password",
          { email }
        );
        alert(res.data.message || "Password reset link sent to your email");
      } catch (err) {
        console.error(err);
        alert("Error sending reset email");
      }
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      if (activeTab === "signup") {
        // Block admin signup
        if (userType === "admin") {
          alert("Admin signup is disabled. Admin account can only be created by the system administrator.");
          return;
        }

        // For admin, use name; for others, use firstName and lastName
        const signupData = userType === "admin" 
          ? { email, password, confirmPassword, name, userType }
          : { email, password, confirmPassword, firstName, lastName, userType, phoneNumber };
        
        const res = await axios.post(
          "http://localhost:5000/api/interiorAuth/signup",
          signupData
        );
        
        // If admin signup, store user data and redirect to admin dashboard
        if (userType === "admin") {
          alert("Admin account created successfully!");
          // Store admin user data in localStorage for AuthContext
          localStorage.setItem("user", JSON.stringify({
            _id: res.data.user._id,
            email: res.data.user.email,
            role: "admin",
            designerName: res.data.user.designerName,
            name: res.data.user.designerName
          }));
          navigate("/admin-dashboard");
          return;
        }
        
        alert(res.data.message || "Signup successful!");
        // redirect after signup? keep user on login or auto-login per API. For now, go to login tab.
        setActiveTab("login");
      } else {
        // Login
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !password) {
          alert("Please fill in all fields");
          return;
        }
        if (!emailRegex.test(email)) {
          alert("Please enter a valid email address");
          return;
        }

        // Admin login bypass for testing when backend is down
        if (userType === "admin") {
          alert("Login successful!");
          localStorage.setItem("user", JSON.stringify({
            _id: "admin123",
            email: email,
            role: "admin",
            name: email
          }));
          setTimeout(() => {
            navigate("/admin-dashboard");
          }, 100);
          return;
        }

        console.log("🔍 Attempting login through /api/interiorAuth/login");
        console.log("Email:", email, "UserType:", userType);
        
        const res = await axios.post(
          "http://localhost:5000/api/interiorAuth/login",
          { email, password, userType }
        );
        
        console.log("✅ Login successful through interior auth");
        console.log("Response user role:", res.data?.user?.role);
        console.log("Response user data:", res.data?.user);
        
        alert(res.data.message || "Login successful!");
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          
          // Verify what was saved
          const saved = localStorage.getItem("user");
          if (saved) {
            const savedData = JSON.parse(saved);
            console.log("🔍 Saved to localStorage - Role:", savedData.role, "Full data:", savedData);
          }
        }
        
        // Route based on user role - use setTimeout to ensure state is updated
        if (res.data?.user?.role === "admin") {
          setTimeout(() => {
            navigate("/admin-dashboard");
          }, 100);
        } else if (res.data?.user?.role === "engineer") {
          // Engineers should not use this route, redirect to proper auth
          alert("Engineers should use the Engineer login page");
          setTimeout(() => {
            navigate("/auth");
          }, 100);
          return;
        } else {
          // Only interior designers go to interior-dashboard
          setTimeout(() => {
            navigate("/interior-dashboard");
          }, 100);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Show detailed error message
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
      alert(errorMessage);
      
      // If engineer blocked, redirect to proper auth page
      if (err.response?.status === 403 && errorMessage.includes("Engineer")) {
        setTimeout(() => {
          navigate("/auth");
        }, 1000);
      }
    }
  };

  // 🔹 Handle Google success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/interiorAuth/google-login",
        { token: credentialResponse.credential }
      );

      // Store token and user data in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Route based on user role - use setTimeout to ensure state is updated
      if (res.data?.user?.role === "admin") {
        // For admin, redirect to dashboard without alert
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 100);
      } else if (res.data?.user?.role === "engineer") {
        // Engineers should not use this route, redirect to proper auth
        alert("Engineers should use the Engineer login page");
        setTimeout(() => {
          navigate("/auth");
        }, 100);
        return;
      } else {
        // For other users (interior designers), show alert and redirect
        alert(res.data.message || "Google login successful!");
        setTimeout(() => {
          navigate("/interior-dashboard");
        }, 100);
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert(err.response?.data?.message || "Google login failed");
    }
  };

  // 🔹 Handle Google failure
  const handleGoogleFailure = () => {
    alert("Google login failed. Please try again.");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-6">
      <div className="absolute inset-0 bg-yellow-50 z-0"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-4xl h-[720px] shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 overflow-hidden rounded-2xl">
        <div className="absolute top-4 left-4 z-20">
          <img src="/dreamdwell logo.png" alt="Logo" className="h-12 w-auto" />
        </div>

        <div className="flex h-full">
          {/* Left - Swiper */}
          <div className="w-2/5 h-full">
            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              navigation={false}
              modules={[Autoplay, Pagination, Navigation]}
              className="h-full w-full"
            >
              <SwiperSlide>
                <img
                  src="/interiordesigner5.png"
                  alt="Signup 1"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/interiordesigner2.jpg"
                  alt="Signup 2"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/interiordesigner4.jpg"
                  alt="Signup 4"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            </Swiper>
          </div>

          {/* Right - Form */}
          <div className="w-3/5 flex items-start justify-center pt-4 px-6">
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-center mb-2 text-black">
                {showRoleSelection
                  ? "Choose Your Role"
                  : forgotPassword
                  ? "Reset Password"
                  : activeTab === "signup"
                  ? `Create ${userType} Account`
                  : userType === "admin"
                  ? "Admin Login"
                  : "Welcome Back"}
              </h2>
              <p className="text-sm text-center mb-6 text-black">
                {showRoleSelection
                  ? "Select your role to get started"
                  : activeTab === "signup"
                  ? `Join our platform as a ${userType}`
                  : userType === "admin"
                  ? "Enter your admin credentials to continue"
                  : "Log in to continue your journey"}
              </p>

              {!forgotPassword && !showRoleSelection && userType !== "admin" && (
                <div className="flex bg-white/20 rounded-lg mb-4">
                  <button
                    onClick={() => setActiveTab("signup")}
                    className={`w-1/2 py-2 ${
                      activeTab === "signup"
                        ? "bg-blue-700 text-white"
                        : "text-black"
                    }`}
                  >
                    Sign up
                  </button>
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`w-1/2 py-2 ${
                      activeTab === "login"
                        ? "bg-blue-700 text-white"
                        : "text-black"
                    }`}
                  >
                    Log in
                  </button>
                </div>
              )}

              {/* Role Selection */}
              {showRoleSelection && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRoleSelection("admin")}
                      className="p-4 bg-white/20 rounded-lg border border-gray-300 hover:bg-white/30 transition-all duration-200 text-black"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">👨‍💼</div>
                        <div className="font-semibold">Admin</div>
                        <div className="text-xs text-gray-800 mt-1">Login Only</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleRoleSelection("engineer")}
                      className="p-4 bg-white/20 rounded-lg border border-gray-300 hover:bg-white/30 transition-all duration-200 text-black"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">👷‍♂️</div>
                        <div className="font-semibold">Engineer</div>
                        <div className="text-xs text-gray-800 mt-1">Technical Professional</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleRoleSelection("interior-designer")}
                      className="p-4 bg-white/20 rounded-lg border border-gray-300 hover:bg-white/30 transition-all duration-200 text-black"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎨</div>
                        <div className="font-semibold">Interior Designer</div>
                        <div className="text-xs text-gray-800 mt-1">Design Professional</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleRoleSelection("customer")}
                      className="p-4 bg-white/20 rounded-lg border border-gray-300 hover:bg-white/30 transition-all duration-200 text-black"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">👤</div>
                        <div className="font-semibold">Customer</div>
                        <div className="text-xs text-gray-800 mt-1">Client/End User</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <form className="space-y-3" onSubmit={handleSubmit}>
                {/* Back button for signup */}
                {!forgotPassword && activeTab === "signup" && !showRoleSelection && (
                  <button
                    type="button"
                    onClick={goBackToRoleSelection}
                    className="w-full py-2 rounded-full bg-gray-300 text-black font-semibold mb-3 hover:bg-gray-400"
                  >
                    ← Back to Role Selection
                  </button>
                )}

                {/* Name for admin, First/Last name for others (signup only) */}
                {!forgotPassword && activeTab === "signup" && !showRoleSelection && (
                  userType === "admin" ? (
                    <div>
                      <div className={`flex items-center bg-white/20 rounded-full px-3 py-1.5 border ${touched.name && errors.name ? "border-red-500" : "border-gray-300"}`}>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (touched.name) validateField("name");
                          }}
                          onBlur={() => handleBlur("name")}
                          placeholder="Name"
                          className="w-full bg-transparent text-black placeholder-gray-600 focus:outline-none text-sm"
                        />
                      </div>
                      {touched.name && errors.name && (
                        <p className="text-red-500 text-xs mt-1 ml-3">{errors.name}</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className={`flex items-center bg-white/20 rounded-full px-3 py-1.5 border ${touched.firstName && errors.firstName ? "border-red-500" : "border-gray-300"}`}>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (touched.firstName) validateField("firstName");
                            }}
                            onBlur={() => handleBlur("firstName")}
                            placeholder="First name"
                            className="w-full bg-transparent text-black placeholder-gray-600 focus:outline-none text-sm"
                          />
                        </div>
                        {touched.firstName && errors.firstName && (
                          <p className="text-red-500 text-xs mt-1 ml-3">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <div className={`flex items-center bg-white/20 rounded-full px-3 py-1.5 border ${touched.lastName && errors.lastName ? "border-red-500" : "border-gray-300"}`}>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              if (touched.lastName) validateField("lastName");
                            }}
                            onBlur={() => handleBlur("lastName")}
                            placeholder="Last name"
                            className="w-full bg-transparent text-black placeholder-gray-600 focus:outline-none text-sm"
                          />
                        </div>
                        {touched.lastName && errors.lastName && (
                          <p className="text-red-500 text-xs mt-1 ml-3">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* User Type Display (signup only) */}
                {!forgotPassword && activeTab === "signup" && !showRoleSelection && (
                  <div className="flex items-center bg-white/20 rounded-full px-3 py-1.5 border border-gray-300">
                    <span className="text-black mr-2">Role:</span>
                    <span className="text-black capitalize">{userType.replace('-', ' ')}</span>
                  </div>
                )}

                {/* Email */}
                {!showRoleSelection && (
                  <div>
                    <div className={`flex items-center bg-white/20 rounded-full px-3 py-1.5 border ${touched.email && errors.email ? "border-red-500" : "border-gray-300"}`}>
                      <FaEnvelope className={`mr-2 ${touched.email && errors.email ? "text-red-500" : "text-black"}`} />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (touched.email) validateField("email");
                        }}
                        onBlur={() => handleBlur("email")}
                        className="w-full bg-transparent text-black placeholder-gray-600 focus:outline-none text-sm"
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="text-red-500 text-xs mt-1 ml-3">{errors.email}</p>
                    )}
                  </div>
                )}

                {/* Phone Number (signup only) - NOT for admin */}
                {!forgotPassword && activeTab === "signup" && !showRoleSelection && userType !== "admin" && (
                  <div>
                    <div className={`flex items-center bg-white/20 rounded-full px-3 py-1.5 border ${touched.phoneNumber && errors.phoneNumber ? "border-red-500" : "border-gray-300"}`}>
                      <input
                        type="tel"
                        placeholder="Phone Number (optional)"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (touched.phoneNumber) validateField("phoneNumber");
                        }}
                        onBlur={() => handleBlur("phoneNumber")}
                        className="w-full bg-transparent text-black placeholder-gray-600 focus:outline-none text-sm"
                      />
                    </div>
                    {touched.phoneNumber && errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1 ml-3">{errors.phoneNumber}</p>
                    )}
                  </div>
                )}

                {!forgotPassword && !showRoleSelection && (
                  <>
                    {/* Password */}
                    <div>
                      <div className={`flex items-center bg-white/20 rounded-full px-3 py-1.5 border ${touched.password && errors.password ? "border-red-500" : "border-gray-300"}`}>
                        <FaLock className={`mr-2 ${touched.password && errors.password ? "text-red-500" : "text-black"}`} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (touched.password) {
                              validateField("password");
                              if (touched.confirmPassword) validateField("confirmPassword");
                            }
                          }}
                          onBlur={() => handleBlur("password")}
                          className="w-full bg-transparent text-black placeholder-gray-600 focus:outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="ml-2 text-black"
                        >
                          {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      {touched.password && errors.password && (
                        <p className="text-red-500 text-xs mt-1 ml-3">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password (signup only) */}
                    {activeTab === "signup" && (
                      <div>
                        <div className={`flex items-center bg-white/20 rounded-full px-3 py-1.5 border ${touched.confirmPassword && errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}>
                          <FaLock className={`mr-2 ${touched.confirmPassword && errors.confirmPassword ? "text-red-500" : "text-black"}`} />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (touched.confirmPassword) validateField("confirmPassword");
                            }}
                            onBlur={() => handleBlur("confirmPassword")}
                            className="w-full bg-transparent text-black placeholder-gray-600 focus:outline-none text-sm"
                          />
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1 ml-3">{errors.confirmPassword}</p>
                        )}
                      </div>
                    )}

                  </>
                )}

                {/* Submit */}
                {!showRoleSelection && (
                  <button
                    type="submit"
                    className="w-full py-2 rounded-full bg-gradient-to-r from-slate-600 to-blue-700 text-white font-semibold"
                  >
                    {forgotPassword
                      ? "Send Reset Link"
                      : activeTab === "signup"
                      ? "Sign up"
                      : userType === "admin"
                      ? "Admin Login"
                      : "Login"}
                  </button>
                )}
              </form>

              {!forgotPassword && activeTab === "login" && !showRoleSelection && (
                <p
                  onClick={() => setForgotPassword(true)}
                  className="mt-2 text-sm text-blue-400 cursor-pointer text-center"
                >
                  Forgot Password?
                </p>
              )}

              {forgotPassword && !showRoleSelection && (
                <p
                  onClick={() => setForgotPassword(false)}
                  className="mt-2 text-sm text-blue-400 cursor-pointer text-center"
                >
                  Back to Login
                </p>
              )}

              {/* 🔹 Google Login - For interior designer, engineer, and customer (both signup and login), NOT for admin */}
              {!forgotPassword && !showRoleSelection && userType !== "admin" && (
                <>
                  <div className="my-3 flex items-center">
                    <div className="flex-1 h-px bg-white/30"></div>
                    <span className="mx-2 text-gray-200 text-xs">or continue with Google</span>
                    <div className="flex-1 h-px bg-white/30"></div>
                  </div>
                  <div className="mt-3 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleFailure}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
