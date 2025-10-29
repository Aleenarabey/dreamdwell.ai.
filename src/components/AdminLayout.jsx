import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { io } from "socket.io-client";
import {
  Home,
  Package,
  ClipboardList,
  Users,
  DollarSign,
  FileText,
  Settings,
  ChevronRight,
  Bell,
  LogOut,
  Menu,
  X,
  Radio,
} from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Sidebar Navigation Item Component
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full p-3 rounded-md text-sm font-medium transition-colors ${
      active
        ? "bg-blue-500 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {!active && <ChevronRight size={16} className="text-gray-400" />}
  </button>
);

export default function AdminLayout() {
  const { user, logout, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [metrics, setMetrics] = useState({
    traffic: 67,
    serverLoad: 86,
  });
  const socketRef = useRef(null);

  useEffect(() => {
    // Check admin status
    if (!authLoading) {
      const savedUser = localStorage.getItem("user");
      let isAdminUser = isAdmin();

      if (!isAdminUser && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          isAdminUser = userData?.role === "admin";
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      if (!isAdminUser) {
        navigate("/");
        return;
      }
    }
  }, [authLoading, isAdmin, navigate]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to server - Admin Layout");
      setIsConnected(true);
      socketRef.current.emit("join-admin-room");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    socketRef.current.on("dashboard-update", (update) => {
      const notification = {
        id: Date.now(),
        message: `Update: ${update.type}`,
        type: update.type,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        !event.target.closest(".notification-dropdown")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserName = () => {
    // For admin users, always show "Admin" as the display name
    if (user?.role === 'admin') {
      // If admin has a custom username set, use it, otherwise default to "Admin"
      return user?.username || "Admin";
    }
    
    // For non-admin users, use their actual name
    if (user?.username) return user.username;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.name) return user.name;
    if (user?.designerName) return user.designerName;
    // Fallback
    return user?.email?.split("@")[0] || "User";
  };

  const getUserEmail = () => {
    return user?.email || "admin@gmail.com";
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-white border-r border-gray-100 fixed h-screen overflow-y-auto transition-all duration-300 z-30`}
      >
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">DREAMDWELL</h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {getUserName()}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
              MAIN
            </div>
            <nav className="space-y-1">
              <SidebarItem
                icon={<Home size={18} />}
                label="Dashboard"
                active={location.pathname === "/admin-dashboard"}
                onClick={() => navigate("/admin-dashboard")}
              />
              <SidebarItem
                icon={<Package size={18} />}
                label="Materials"
                active={location.pathname === "/admin/materials"}
                onClick={() => navigate("/admin/materials")}
              />
              <SidebarItem
                icon={<ClipboardList size={18} />}
                label="Projects"
                active={location.pathname === "/admin/projects"}
                onClick={() => navigate("/admin/projects")}
              />
              <SidebarItem
                icon={<Users size={18} />}
                label="Workers"
                active={location.pathname === "/admin/workers"}
                onClick={() => navigate("/admin/workers")}
              />
              <SidebarItem
                icon={<DollarSign size={18} />}
                label="Finances"
                active={location.pathname === "/admin/finance"}
                onClick={() => navigate("/admin/finance")}
              />
              <SidebarItem
                icon={<FileText size={18} />}
                label="Reports"
                active={location.pathname === "/admin/reports"}
                onClick={() => navigate("/admin/reports")}
              />
              <SidebarItem
                icon={<Settings size={18} />}
                label="Settings"
                active={location.pathname === "/admin/settings"}
                onClick={() => navigate("/admin/settings")}
              />
            </nav>
          </div>

          {/* Performance Metrics */}
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                TRAFFIC THIS MONTH
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.traffic}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">{metrics.traffic}%</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                SERVER LOAD
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.serverLoad}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {metrics.serverLoad}%
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 ${sidebarOpen ? "lg:ml-64" : "ml-0"} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              <Menu size={20} />
            </button>

            {/* Page Title */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {location.pathname === "/admin-dashboard" && "Dashboard"}
                {location.pathname === "/admin/materials" && "Materials Management"}
                {location.pathname === "/admin/projects" && "Project Management"}
                {location.pathname === "/admin/workers" && "Workers Management"}
                {location.pathname === "/admin/finance" && "Finance Management"}
                {location.pathname === "/admin/reports" && "Reports"}
                {location.pathname === "/admin/settings" && "Settings"}
              </h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <Radio
                  size={16}
                  className={isConnected ? "text-green-500" : "text-gray-400"}
                />
                <span className="text-xs text-gray-600">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                >
                  <Bell size={20} className="text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800">
                        Notifications
                      </h3>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="text-sm text-gray-800">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

