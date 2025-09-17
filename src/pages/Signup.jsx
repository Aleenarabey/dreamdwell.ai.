import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config"; // centralized API base
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { GoogleLogin } from "@react-oauth/google";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function Signup() {
  const [activeTab, setActiveTab] = useState("signup");
  const [preferredMethod, setPreferredMethod] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;

      if (activeTab === "signup") {
        res = await axios.post(`${API_BASE}/api/auth/signup`, {
          ...formData,
          role: "homeowner",
        });

        alert(res.data.message);
        setActiveTab("login");
      } else {
        res = await axios.post(`${API_BASE}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert("Login successful ✅");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Error during " + activeTab);
      }
    }
  };

  const handleBackgroundClick = () => {
    setPreferredMethod("");
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center"
      onClick={handleBackgroundClick}
    >
      <div
        className="absolute inset-0 bg-cover bg-center z-0 filter blur-sm"
        style={{ backgroundImage: "url('/singupbghomeowner.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div
        className="relative z-10 w-full max-w-4xl h-[580px] shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full">
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
                  src="/homeownersignup1.jpg"
                  alt="Signup 1"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/homeownersignup2.jpg"
                  alt="Signup 2"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src="/homeownersignup4.jpg"
                  alt="Signup 4"
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            </Swiper>
          </div>

          <div className="w-3/5 flex items-start justify-center pt-10 px-6">
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-center mb-2 text-white drop-shadow-lg">
                {activeTab === "signup"
                  ? "Create Homeowner Account"
                  : "Welcome Homeowner"}
              </h2>
              {activeTab === "signup" && (
                <p className="text-sm text-gray-200 text-center mb-6">
                  Join and Begin To Design Your Dream Home, See It Come Alive!!
                </p>
              )}

              <div className="flex bg-white/20 backdrop-blur-md rounded-lg mb-6">
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`w-1/2 py-2 text-center font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === "signup"
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Sign up
                </button>
                <button
                  onClick={() => setActiveTab("login")}
                  className={`w-1/2 py-2 text-center font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === "login"
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Log in
                </button>
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                {activeTab === "signup" && (
                  <div className="flex space-x-3">
                    <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 w-1/2 border border-white/30 focus-within:ring-2 focus-within:ring-pink-400">
                      <FaUser className="text-gray-200 mr-2" />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full bg-transparent text-black placeholder-black focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 w-1/2 border border-white/30 focus-within:ring-2 focus-within:ring-pink-400">
                      <FaUser className="text-gray-200 mr-2" />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full bg-transparent text-black placeholder-black focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/30 focus-within:ring-2 focus-within:ring-pink-400">
                  <FaEnvelope className="text-gray-200 mr-2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent text-black placeholder-black focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/30 focus-within:ring-2 focus-within:ring-pink-400">
                  <FaLock className="text-gray-200 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent text-black placeholder-black focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-gray-200 hover:text-white transition"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-105"
                >
                  {activeTab === "signup" ? "Sign up" : "Login"}
                </button>
              </form>

              {/* OR divider */}
              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-600" />
                <span className="mx-2 text-gray-300">OR</span>
                <hr className="flex-grow border-gray-600" />
              </div>

              {/* Google login button */}
              <div className="mb-2">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      const { credential } = credentialResponse;

                      const res = await axios.post(`${API_BASE}/api/auth/google-login`, {
                        token: credential,
                      });

                      localStorage.setItem("token", res.data.token);
                      localStorage.setItem("user", JSON.stringify(res.data.user));

                      alert("Google login successful ✅");
                      window.location.href = "/dashboard";
                    } catch (err) {
                      console.error("Google login error:", err);
                      alert(err.response?.data?.message || "Google login failed");
                    }
                  }}
                  onError={() => {
                    alert("Google login failed");
                  }}
                  theme="outline"
                  size="large"
                  width={350}
                />
              </div>

              {/* Phone login placeholder */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreferredMethod("phone");
                  alert("Phone login not implemented yet");
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 font-semibold rounded-full transition-all duration-300 ${
                  preferredMethod === "phone"
                    ? "bg-green-500 text-white shadow-lg scale-105"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                <FaPhone className="text-gray-600" />
                Continue with Phone
              </button>

              {activeTab === "signup" && (
                <p className="text-xs text-gray-300 text-center mt-5">
                  By creating an account, you agree to our{" "}
                  <span className="underline cursor-pointer">
                    Terms & Service
                  </span>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
