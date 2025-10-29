import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Bell,
  Users,
  Box,
  FileText,
  DollarSign,
  Layers,
  LogOut,
  Settings,
  Home,
  Package,
  ClipboardList,
  Download,
  AlertTriangle,
  Search,
  Menu,
  RefreshCw,
  Power,
  ChevronRight,
  Radio,
  Calendar,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingDeadlines, setPendingDeadlines] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [showWorkers, setShowWorkers] = useState(false);
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

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // ========== REAL-TIME SOCKET.IO CONNECTION ==========
  useEffect(() => {
    // Initialize Socket.io connection
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    // Connection handlers
    socketRef.current.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
      socketRef.current.emit("join-admin-room");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    // Listen for real-time dashboard updates
    socketRef.current.on("dashboard-update", (update) => {
      console.log("📊 Real-time update received:", update);
      
      // Add to recent updates
      setRecentUpdates(prev => [update, ...prev].slice(0, 5));
      
      // Handle different update types
      if (update.type === "project-update") {
        fetchDashboardData();
      } else if (update.type === "milestone-update") {
        // Add notification
        const notification = {
          id: Date.now(),
          message: `Milestone "${update.data.milestoneTitle}" updated`,
          type: "milestone",
          timestamp: new Date(),
        };
        setNotifications(prev => [notification, ...prev]);
        fetchDashboardData();
      } else if (update.type === "material-update") {
        const notification = {
          id: Date.now(),
          message: `Material stock updated: ${update.data.materialName}`,
          type: "material",
          timestamp: new Date(),
        };
        setNotifications(prev => [notification, ...prev]);
        fetchDashboardData();
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/dashboard-stats");
      if (response.data.success) {
        const apiData = response.data.data;
        // Transform API data to match component structure
        setDashboard({
          projectStats: {
            totalProjects: apiData.projects?.total || 0,
            activeProjects: apiData.projects?.active || 0,
            completedProjects: apiData.projects?.completed || 0,
            pendingProjects: apiData.projects?.pending || 0,
          },
          financialStats: {
            totalRevenue: apiData.financial?.revenue || 0,
            totalExpenses: apiData.financial?.expenses || 0,
            profit: apiData.financial?.profit || 0,
          },
          budgetConsumption: apiData.budgetConsumption || {
            totalBudget: 0,
            consumedBudget: 0,
            remainingBudget: 0,
            consumptionPercentage: 0
          },
          materialUsage: apiData.materialUsage || {
            totalMaterials: 0,
            lowStockCount: 0,
            consumedMaterials: 0
          },
          workforce: {
            totalWorkers: (apiData.users?.clients || 0) + (apiData.users?.engineers || 0),
            activeWorkers: apiData.users?.engineers || 0,
            attendance: 92,
          },
          materials: apiData.lowStockAlerts?.map(item => ({
            name: item.name,
            quantity: item.stock,
            unit: item.unit
          })) || [],
          projects: apiData.projectsList || [],
        });
        
        // Set notifications from low stock alerts
        const stockNotifications = apiData.lowStockAlerts?.map((item, idx) => ({
          id: idx + 1,
          message: `Low stock warning for ${item.name}`
        })) || [];
        
        // Check for approaching deadlines
        const projects = apiData.projectsList || [];
        const approachingDeadlines = projects
          .filter(p => p.endDate)
          .map(p => {
            const daysUntil = Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            return { ...p, daysUntil };
          })
          .filter(p => p.daysUntil > 0 && p.daysUntil <= 7 && p.status !== 'completed')
          .sort((a, b) => a.daysUntil - b.daysUntil);
        
        setPendingDeadlines(approachingDeadlines);
        
        setNotifications(prev => [...stockNotifications, ...prev]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to sample data
      setDashboard({
        projectStats: {
          totalProjects: 12,
          activeProjects: 7,
          completedProjects: 3,
          pendingProjects: 2,
        },
        financialStats: {
          totalRevenue: 1200000,
          totalExpenses: 900000,
          profit: 300000,
        },
        workforce: {
          totalWorkers: 38,
          activeWorkers: 28,
          attendance: 92,
        },
        budgetConsumption: {
          totalBudget: 0,
          consumedBudget: 0,
          remainingBudget: 0,
          consumptionPercentage: 0
        },
        materialUsage: {
          totalMaterials: 0,
          lowStockCount: 0,
          consumedMaterials: 0
        },
        materials: [
          { name: "Cement", quantity: 12, unit: "tons" },
          { name: "Bricks", quantity: 4000, unit: "pcs" },
          { name: "Steel", quantity: 6, unit: "tons" },
          { name: "Paint", quantity: 5, unit: "buckets" },
        ],
        projects: [],
      });
      setNotifications([
        { id: 1, message: "Low stock warning for Cement" },
        { id: 2, message: "Payment due for Skyline Bungalow" },
        { id: 3, message: "Worker attendance dropped below 90%" },
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const fetchLowStockAlerts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/materials/low-stock/alerts");
        if (response.data.count > 0) {
          const stockNotifications = response.data.alerts.map((alert, idx) => ({
            id: `stock-${idx}`,
            message: alert.message,
            type: 'low-stock',
            urgency: alert.urgency,
            materialId: alert.id
          }));
          
          // Update notifications with real low stock data
          setNotifications(prev => {
            // Remove old stock notifications and add new ones
            const nonStockNotifications = prev.filter(n => n.type !== 'low-stock');
            return [...nonStockNotifications, ...stockNotifications];
          });
        }
      } catch (error) {
        console.error("Error fetching low stock alerts:", error);
      }
    };

    fetchLowStockAlerts();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchLowStockAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };


  if (loading || authLoading || !dashboard) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800 mb-4">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const kpis = [
    { title: "Total Projects", value: dashboard.projectStats.totalProjects, icon: <Layers size={18} /> },
    { title: "Active Projects", value: dashboard.projectStats.activeProjects, icon: <Box size={18} /> },
    { title: "Total Revenue", value: `₹ ${formatNumber(dashboard.financialStats.totalRevenue)}`, icon: <DollarSign size={18} /> },
    { title: "Profit", value: `₹ ${formatNumber(dashboard.financialStats.profit)}`, icon: <FileText size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Workers Panel */}
      {showWorkers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-11/12 max-w-6xl h-5/6 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Worker Management</h2>
              <button
                onClick={() => setShowWorkers(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Register New Workers */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users size={24} className="text-blue-600" />
                    Register New Workers
                  </h3>
                  <form className="space-y-3">
                    <input
                      type="text"
                      placeholder="Worker Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Contact Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Specialization"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Type: Worker</option>
                      <option>Subcontractor</option>
                    </select>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Register
                    </button>
                  </form>
                </div>

                {/* Assign to Projects/Sites */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ClipboardList size={24} className="text-green-600" />
                    Assign to Projects
                  </h3>
                  <form className="space-y-3">
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>Select Worker</option>
                      <option>John Doe - Electrician</option>
                      <option>Jane Smith - Carpenter</option>
                    </select>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>Select Project</option>
                      <option>Skyline Bungalow</option>
                      <option>Riverside Complex</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Site Location"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                      Assign
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Track Attendance & Wages */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={24} className="text-orange-600" />
                    Attendance & Wages
                  </h3>
                  <div className="space-y-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">John Doe</p>
                          <p className="text-sm text-gray-600">Electrician</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Hours</p>
                          <p className="font-bold text-orange-600">40 hrs</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">Jane Smith</p>
                          <p className="text-sm text-gray-600">Carpenter</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Hours</p>
                          <p className="font-bold text-orange-600">38 hrs</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
                    Download Report
                  </button>
                </div>

                {/* Approve Payments */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign size={24} className="text-purple-600" />
                    Approve Payments
                  </h3>
                  <div className="space-y-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-gray-800">Payment Request</p>
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                      </div>
                      <p className="text-sm text-gray-600">Worker: John Doe</p>
                      <p className="text-sm text-gray-600">Amount: ₹5,000</p>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700">
                          Approve
                        </button>
                        <button className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                    View All Requests
                  </button>
                </div>
              </div>

              {/* Worker Profiles & Documents */}
              <div className="bg-cyan-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={24} className="text-cyan-600" />
                  Worker Profiles & Documents
                </h3>
                
                {/* Search Worker */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search worker by name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Worker Card */}
                  <div className="bg-white rounded-lg p-4 border border-cyan-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">John Doe</p>
                        <p className="text-sm text-gray-600">Electrician</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Proof</span>
                        <span className="text-green-600">✓ Valid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Skill Cert.</span>
                        <span className="text-red-600">⚠ Expires: 2024-12-31</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Medical</span>
                        <span className="text-green-600">✓ Valid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Background</span>
                        <span className="text-green-600">✓ Verified</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button className="w-full bg-cyan-600 text-white py-2 rounded-lg text-sm hover:bg-cyan-700">
                        View Documents
                      </button>
                    </div>
                  </div>

                  {/* Worker Card */}
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">Jane Smith</p>
                        <p className="text-sm text-gray-600">Carpenter</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Expiring Soon</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Proof</span>
                        <span className="text-yellow-600">⚠ Expires: 2024-01-15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Skill Cert.</span>
                        <span className="text-green-600">✓ Valid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Medical</span>
                        <span className="text-green-600">✓ Valid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Background</span>
                        <span className="text-green-600">✓ Verified</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button className="w-full bg-cyan-600 text-white py-2 rounded-lg text-sm hover:bg-cyan-700">
                        View Documents
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload Documents */}
                <div className="bg-white rounded-lg p-4 border border-cyan-300">
                  <h4 className="font-semibold text-gray-800 mb-3">Upload New Document</h4>
                  <div className="space-y-3">
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option>Select Worker</option>
                      <option>John Doe</option>
                      <option>Jane Smith</option>
                    </select>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option>Select Document Type</option>
                      <option>ID Proof (Aadhar/Passport)</option>
                      <option>Skill Certificate</option>
                      <option>Medical Fitness</option>
                      <option>Background Verification</option>
                      <option>Other Documents</option>
                    </select>
                    <input
                      type="date"
                      placeholder="Expiry Date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="file"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700">
                      Upload Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Admin / <span className="text-gray-800 font-semibold">Dashboard</span>
            </div>
            <button className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600">
              +
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k, idx) => (
              <KPI_CARD key={k.title} title={k.title} value={k.value} icon={k.icon} index={idx} />
            ))}
          </div>

          {/* Approaching Deadlines Alert */}
          {pendingDeadlines.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="text-orange-600 mt-0.5" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    ⚠️ Approaching Deadlines
                  </h3>
                  <div className="space-y-2">
                    {pendingDeadlines.slice(0, 3).map((project) => (
                      <div key={project._id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{project.name}</p>
                          <p className="text-xs text-gray-600">Client: {project.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            project.daysUntil <= 3 ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {project.daysUntil} day{project.daysUntil !== 1 ? 's' : ''} left
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(project.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Updates (Real-time) */}
          {recentUpdates.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-blue-800">Recent Updates</h3>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </div>
              <div className="space-y-2">
                {recentUpdates.map((update, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-white rounded p-2 shadow-sm">
                    <Clock className="text-gray-400" size={14} />
                    <span className="text-gray-700">
                      {update.type === 'milestone-update' && `Milestone updated`}
                      {update.type === 'project-update' && `Project progress updated`}
                      {update.type === 'material-update' && `Material stock updated`}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Consumption & Material Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Budget Consumption */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-blue-600" size={20} />
                Budget Consumption
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Total Budget</span>
                    <span className="font-semibold text-gray-800">
                      ₹{formatNumber(dashboard.budgetConsumption.totalBudget)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Consumed</span>
                    <span className="font-semibold text-orange-600">
                      ₹{formatNumber(dashboard.budgetConsumption.consumedBudget)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, dashboard.budgetConsumption.consumptionPercentage)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`font-semibold ${
                      dashboard.budgetConsumption.remainingBudget > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{formatNumber(dashboard.budgetConsumption.remainingBudget)}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 text-center">
                    {dashboard.budgetConsumption.consumptionPercentage.toFixed(1)}% Budget Used
                  </div>
                </div>
              </div>
            </div>

            {/* Material Usage */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="text-emerald-600" size={20} />
                Material Usage
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Total Materials</span>
                    <span className="font-semibold text-gray-800">
                      {dashboard.materialUsage.totalMaterials}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Materials Consumed</span>
                    <span className="font-semibold text-blue-600">
                      {dashboard.materialUsage.consumedMaterials}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(100, dashboard.materialUsage.totalMaterials > 0 
                          ? (dashboard.materialUsage.consumedMaterials / dashboard.materialUsage.totalMaterials * 100) 
                          : 0)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Low Stock Alerts</span>
                    <span className={`font-semibold ${
                      dashboard.materialUsage.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {dashboard.materialUsage.lowStockCount}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 text-center">
                    {dashboard.materialUsage.lowStockCount > 0 
                      ? '⚠️ Action Required' 
                      : '✅ All Materials Stocked'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Annual Report Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Annual Report</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">₹{formatNumber(Math.floor(dashboard.financialStats.totalRevenue / 365))}</div>
                <div className="text-xs text-gray-500 mt-1">Today's</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">₹{formatNumber(Math.floor(dashboard.financialStats.totalRevenue / 52))}</div>
                <div className="text-xs text-gray-500 mt-1">This Week's</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">₹{formatNumber(Math.floor(dashboard.financialStats.totalRevenue / 12))}</div>
                <div className="text-xs text-gray-500 mt-1">This Month's</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">₹{formatNumber(dashboard.financialStats.totalRevenue)}</div>
                <div className="text-xs text-gray-500 mt-1">This Year's</div>
              </div>
            </div>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={sampleRevenueData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${formatNumber(value)}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="rgba(59, 130, 246, 0.1)" />
                  <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fill="rgba(239, 68, 68, 0.1)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Section - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Project Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Ongoing Projects</h2>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-600">⋯</button>
                  <button className="text-gray-400 hover:text-gray-600">×</button>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-gray-600 font-semibold">Project</th>
                    <th className="text-left py-3 text-gray-600 font-semibold">Client</th>
                    <th className="text-left py-3 text-gray-600 font-semibold">Status</th>
                    <th className="text-left py-3 text-gray-600 font-semibold">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.projects && dashboard.projects.length > 0 ? (
                    dashboard.projects.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 text-gray-800">{p.name}</td>
                        <td className="py-3 text-gray-600">{p.client}</td>
                        <td className={`py-3 font-medium ${p.status === "Active" ? "text-green-600" : p.status === "Pending" ? "text-yellow-500" : "text-gray-400"}`}>
                          {p.status}
                        </td>
                        <td className="py-3 text-gray-800">{p.budget}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500">
                        No projects found. Create your first project!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Low Stock Alerts</h2>
              <div className="space-y-3">
                {dashboard.materials.length > 0 ? (
                  dashboard.materials.map((m, i) => (
                    <div key={i} className={`p-3 rounded-lg ${m.quantity < 10 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{m.name}</span>
                        <span className={`text-sm font-bold ${m.quantity < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                          {m.quantity} {m.unit}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No low stock alerts</p>
                )}
              </div>
            </div>
          </div>

          {/* Workforce & Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Workforce Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Workforce Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Total Workers</span>
                    <span className="font-semibold text-gray-800">{dashboard.workforce.totalWorkers}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Active Workers</span>
                    <span className="font-semibold text-gray-800">{dashboard.workforce.activeWorkers}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Attendance</span>
                    <span className="font-semibold text-gray-800">{dashboard.workforce.attendance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${dashboard.workforce.attendance}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-semibold text-green-600">₹{formatNumber(dashboard.financialStats.totalRevenue)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Expenses</span>
                    <span className="font-semibold text-red-600">₹{formatNumber(dashboard.financialStats.totalExpenses)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Profit</span>
                    <span className={`font-semibold ${dashboard.financialStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{formatNumber(dashboard.financialStats.profit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${dashboard.financialStats.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                      style={{ width: `${Math.min(100, Math.abs(dashboard.financialStats.profit) / dashboard.financialStats.totalRevenue * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h2>
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <AlertTriangle size={18} className="text-yellow-600" />
                    <span className="text-sm text-gray-700">{n.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}


// KPI card with progress bar
const KPI_CARD = ({ title, value, icon, index }) => {
  const colors = [
    { 
      bg: "bg-blue-50", 
      hover: "hover:bg-blue-100",
      iconBg: "bg-blue-50", 
      text: "text-blue-700", 
      valueColor: "text-blue-800",
      progress: "bg-blue-200",
      progressFill: "bg-blue-500",
      iconColor: "text-blue-600"
    },
    { 
      bg: "bg-emerald-50", 
      hover: "hover:bg-emerald-100",
      iconBg: "bg-emerald-50", 
      text: "text-emerald-700", 
      valueColor: "text-emerald-800",
      progress: "bg-emerald-200",
      progressFill: "bg-emerald-500",
      iconColor: "text-emerald-600"
    },
    { 
      bg: "bg-orange-50", 
      hover: "hover:bg-orange-100",
      iconBg: "bg-orange-50", 
      text: "text-orange-700", 
      valueColor: "text-orange-800",
      progress: "bg-orange-200",
      progressFill: "bg-orange-500",
      iconColor: "text-orange-600"
    },
    { 
      bg: "bg-pink-50", 
      hover: "hover:bg-pink-100",
      iconBg: "bg-pink-50", 
      text: "text-pink-700", 
      valueColor: "text-pink-800",
      progress: "bg-pink-200",
      progressFill: "bg-pink-500",
      iconColor: "text-pink-600"
    },
  ];
  const color = colors[index % colors.length];
  const changePercent = [27, 9, 17, 13][index % 4];

  return (
    <div className={`rounded-xl shadow-sm p-6 transition-all duration-300 ${color.bg} ${color.hover} hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className={`${color.iconBg} p-3 rounded-lg`}>
          <div className={color.iconColor}>{icon}</div>
        </div>
      </div>
      <div className="mb-4">
        <div className={`text-3xl font-bold ${color.valueColor}`}>{value}</div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-2 text-gray-600">
          <span>Change {changePercent}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-2 overflow-hidden">
          <div className={`${color.progressFill} h-2 rounded-full transition-all duration-500`} style={{ width: `${changePercent}%` }}></div>
        </div>
      </div>
    </div>
  );
};

// Sample data
const sampleRevenueData = [
  { month: "Jan", revenue: 100000, expense: 80000 },
  { month: "Feb", revenue: 120000, expense: 95000 },
  { month: "Mar", revenue: 150000, expense: 110000 },
  { month: "Apr", revenue: 130000, expense: 100000 },
  { month: "May", revenue: 160000, expense: 120000 },
];

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
