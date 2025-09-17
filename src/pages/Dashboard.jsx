// Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaFolder,
  FaProjectDiagram,
  FaVideo,
  FaMagic,
  FaComments,
  FaImage,
  FaUserCircle,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

export default function Dashboard() {
  const [dropdown, setDropdown] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    }
    if (dropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdown]);

  // Get logged-in user name from localStorage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const displayName = storedUser
    ? [storedUser.firstName, storedUser.lastName].filter(Boolean).join(" ")
    : "Guest";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signup');
  };

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar - Static Expanded */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-all duration-300 relative">
        {/* Logo Section */}
        <div className="flex items-center justify-center p-4">
          <img
            src="/logo.png" // 🔹 Full logo
            alt="DreamDwell Logo"
            className="h-8"
          />
        </div>

        {/* Credits */}
        <div className="px-4">
          <div className="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2 mb-3">
            <span className="text-sm font-medium">🔥 30 CREDITS</span>
            <button className="bg-purple-600 text-white text-xs px-3 py-1 rounded-lg">
              Upgrade
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {/* Dashboard */}
            <li
              className={`px-4 py-2 flex items-center rounded-r-full cursor-pointer ${
                location.pathname === "/" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => navigate("/")}
            >
              <FaHome className="mr-3" />
              Dashboard
            </li>

            {/* Projects */}
            <li
              className={`px-4 py-2 flex items-center cursor-pointer ${
                location.pathname === "/projects" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => navigate("/projects")}
            >
              <FaFolder className="mr-3" />
              Projects
            </li>

            {/* Workflows */}
            <li
              className={`px-4 py-2 flex items-center cursor-pointer ${
                location.pathname === "/workflows" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => navigate("/workflows")}
            >
              <FaProjectDiagram className="mr-3" />
              Workflows
            </li>

            {/* Video AI */}
            <li
              className={`px-4 py-2 flex items-center cursor-pointer ${
                location.pathname === "/video-ai" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => navigate("/video-ai")}
            >
              <FaVideo className="mr-3" />
              Video AI
            </li>

            {/* Design Assistant */}
            <li
              className={`px-4 py-2 flex items-center cursor-pointer ${
                location.pathname === "/design-assistant" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => navigate("/design-assistant")}
            >
              <FaMagic className="mr-3" />
              Design Assistant
            </li>

            {/* Chat */}
            <li
              onClick={() => navigate("/chat")}
              className={`px-4 py-2 flex items-center cursor-pointer ${
                location.pathname === "/chat" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              <FaComments className="mr-3" />
              <>
                Chat{" "}
                <span className="ml-2 text-xs text-blue-600 font-bold">
                  New
                </span>
              </>
            </li>

            {/* Image Tools */}
            <li
              className={`px-4 py-2 flex items-center cursor-pointer ${
                location.pathname === "/image-tools" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => navigate("/image-tools")}
            >
              <FaImage className="mr-3" />
              Image Tools
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col bg-gradient-to-tr from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
        {/* Top Nav */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 shadow-sm">
          <div className="flex items-center space-x-6 text-gray-800 dark:text-gray-100">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              + Create
            </button>
            <span className="cursor-pointer">Dashboard</span>
            <span className="cursor-pointer">My Library</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-purple-600 text-white px-3 py-1 rounded-lg">
              Upgrade
            </button>
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setDropdown(!dropdown)}
              >
                <FaUserCircle size={28} className="text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-gray-700 dark:text-gray-100 truncate max-w-[140px]">{displayName}</span>
                <FiChevronDown />
              </div>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => navigate('/account')}
                  >
                    Account
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsDark((d) => !d)}
                  >
                    {isDark ? "Light mode" : "Dark mode"}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* New Project Card */}
          <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 text-center cursor-pointer hover:shadow-md">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-2xl mb-2">
              +
            </div>
            <h2 className="font-semibold">New Project</h2>
            <p className="text-sm text-gray-500">Start a fresh project</p>
          </div>

          {/* Top Picks */}
          <h2 className="text-xl font-bold mb-3">Top Picks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Discover the newest features and updates recently launched.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Exterior AI",
                desc: "Render or redesign your exterior designs in seconds. Just upload a photo or sketch...",
                img: "https://placehold.co/300x180",
              },
              {
                title: "Interior AI",
                desc: "Upload a sketch or model to redesign your interior space with more than 20 unique styles...",
                img: "https://placehold.co/300x180",
              },
              {
                title: "Render Enhancer",
                desc: "Enhance Lumion, Enscape, Vray, SketchUp or Revit renders & upscale low quality render...",
                img: "https://placehold.co/300x180",
              },
              {
                title: "Style Transfer Render",
                desc: "Apply the style from reference image to your input render...",
                img: "https://placehold.co/300x180",
              },
            ].map((tool, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={tool.img}
                    alt={tool.title}
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-lg font-semibold">
                    {tool.title}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{tool.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{tool.desc}</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Launch Tool →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
