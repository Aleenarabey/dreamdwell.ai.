// src/pages/ArchitectSignup.jsx
import { useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaIdBadge,
  FaFileUpload,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function ArchitectSignup() {
  const [activeTab, setActiveTab] = useState("signup");
  const [preferredMethod, setPreferredMethod] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [licenseId, setLicenseId] = useState("");
  const [architectName, setArchitectName] = useState("");
  const [certificate, setCertificate] = useState(null);

  const handleVerify = () => {
    if (licenseId === "LIC12345") {
      setArchitectName("Ar. Jane Smith ✅");
    } else {
      setArchitectName("❌ Invalid License ID");
    }
  };

  const handleFileChange = (e) => {
    setCertificate(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!licenseId && !certificate) {
      alert("Please provide License ID or upload your certificate.");
      return;
    }
    alert("Form submitted successfully!");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-6">
      {/* Background image with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 filter blur-sm"
        style={{ backgroundImage: "url('singupbghomeowner.jpg')" }}
      ></div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Card container */}
      <div
        className="relative z-10 w-full max-w-4xl h-[580px] shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo in top-left corner */}
        <div className="absolute top-4 left-4 z-20">
          <img
            src="/dreamdwell logo.png"
            alt="Logo"
            className="h-12 w-auto drop-shadow-md"
          />
        </div>

        <div className="flex h-full">
          {/* Left side - Swiper */}
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
                  src="/architectsignup1 (2).jpg"
                  alt="Signup 1"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/architectsignup2.jpg"
                  alt="Signup 2"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/architectsignup3.jpg"
                  alt="Signup 3"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            </Swiper>
          </div>

          {/* Right side - Form */}
          <div className="w-3/5 flex items-start justify-center pt-4 px-6">
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-center mb-2 text-white drop-shadow-lg">
                {activeTab === "signup"
                  ? "Create Architect Account"
                  : "Welcome Architect"}
              </h2>
              {activeTab === "signup" && (
                <p className="text-sm text-gray-200 text-center mb-4">
                  Join and Start Designing Your Dream Projects, See Them Come
                  Alive!!
                </p>
              )}

              {/* Tabs */}
              <div className="flex bg-white/20 backdrop-blur-md rounded-lg mb-4">
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`w-1/2 py-2 text-center font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === "signup"
                      ? "bg-gradient-to-r from-slate-600 to-blue-700 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Sign up
                </button>
                <button
                  onClick={() => setActiveTab("login")}
                  className={`w-1/2 py-2 text-center font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === "login"
                      ? "bg-gradient-to-r from-slate-600 to-blue-700 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Log in
                </button>
              </div>

              {/* Form */}
              <form className="space-y-3" onSubmit={handleSubmit}>
                {activeTab === "signup" && (
                  <div className="flex space-x-3">
                    <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 w-1/2 border border-white/30 focus-within:ring-2 focus-within:ring-pink-400">
                      <FaUser className="text-gray-200 mr-2" />
                      <input
                        type="text"
                        placeholder="First name"
                        className="w-full bg-transparent text-black placeholder-black focus:outline-none text-sm"
                      />
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 w-1/2 border border-white/30 focus-within:ring-2 focus-within:ring-pink-400">
                      <FaUser className="text-gray-200 mr-2" />
                      <input
                        type="text"
                        placeholder="Last name"
                        className="w-full bg-transparent text-black placeholder-black focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30 focus-within:ring-2 focus-within:ring-pink-400">
                  <FaEnvelope className="text-gray-200 mr-2" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-transparent text-black placeholder-black focus:outline-none text-sm"
                  />
                </div>

                {/* Password */}
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30 focus-within:ring-2 focus-within:ring-pink-400">
                  <FaLock className="text-gray-200 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full bg-transparent text-black placeholder-black focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-gray-200 hover:text-white transition"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                {/* License */}
                {activeTab === "signup" && (
                  <div>
                    <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
                      <FaIdBadge className="text-gray-200 mr-2" />
                      <input
                        type="text"
                        value={licenseId}
                        onChange={(e) => setLicenseId(e.target.value)}
                        placeholder="License ID (optional)"
                        className="w-full bg-transparent text-black placeholder-black focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleVerify}
                        className="ml-2 px-3 py-0.5 text-xs bg-green-700 text-white rounded-full hover:bg-blue-800"
                      >
                        Verify
                      </button>
                    </div>
                    {architectName && (
                      <p
                        className={`mt-1 text-xs ${
                          architectName.startsWith("❌")
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {architectName}
                      </p>
                    )}
                  </div>
                )}

                {/* Certificate */}
                {activeTab === "signup" && !licenseId && (
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-dashed border-white/30">
                    <FaFileUpload className="text-gray-200 mr-2" />
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full text-black text-sm focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 rounded-full bg-gradient-to-r from-slate-600 to-blue-700 hover:from-blue-700 hover:to-green-600 text-white font-semibold shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-105 text-sm"
                >
                  {activeTab === "signup" ? "Sign up" : "Login"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-2">
                <hr className="flex-grow border-gray-600" />
                <span className="mx-2 text-gray-300 text-xs">OR</span>
                <hr className="flex-grow border-gray-600" />
              </div>

              {/* Google */}
              <button
                onClick={() => setPreferredMethod("google")}
                className={`w-full flex items-center justify-center gap-2 py-1.5 font-semibold mb-2 rounded-full transition-all duration-300 text-sm ${
                  preferredMethod === "google"
                    ? "bg-green-500 text-white shadow-lg scale-105"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                <FcGoogle className="text-lg" />
                Continue with Google
              </button>

              {/* Phone */}
              <button
                onClick={() => setPreferredMethod("phone")}
                className={`w-full flex items-center justify-center gap-2 py-1.5 font-semibold rounded-full transition-all duration-300 text-sm ${
                  preferredMethod === "phone"
                    ? "bg-green-500 text-white shadow-lg scale-105"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                <FaPhone className="text-gray-600 text-sm" />
                Continue with Phone
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
