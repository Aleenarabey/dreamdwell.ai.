import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useLayoutEffect } from "react";
import axios from "axios";
import { 
  Clock, LogIn, LogOut, Calendar, CheckCircle, XCircle, 
  FolderKanban, TrendingUp, Package, FileText, AlertCircle,
  Eye, ChevronRight, Target, AlertTriangle, Loader2
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

export default function EngineerDashboard() {
  const { user, logout, isEngineer, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'projects', 'materials'
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // useLayoutEffect runs synchronously before paint
  useLayoutEffect(() => {
    // IMMEDIATE check from localStorage - highest priority
    const savedUserImmediate = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (savedUserImmediate) {
      try {
        const userDataImmediate = JSON.parse(savedUserImmediate);
        const userRoleImmediate = userDataImmediate?.role;
        
        console.log("🔍 Engineer Dashboard IMMEDIATE check - Role:", userRoleImmediate);
        
        // Block all non-engineers IMMEDIATELY
        if (userRoleImmediate && userRoleImmediate !== "engineer") {
          console.log("🚫 Engineer Dashboard: Non-engineer BLOCKED IMMEDIATELY - Role:", userRoleImmediate);
          setShouldRedirect(true);
          
          // Redirect based on role
          if (userRoleImmediate === "admin") {
            window.location.replace("/admin-dashboard");
          } else if (userRoleImmediate === "customer") {
            window.location.replace("/customer-dashboard");
          } else if (userRoleImmediate === "interiorDesigner" || userRoleImmediate === "interior") {
            window.location.replace("/interior-dashboard");
          } else {
            window.location.replace("/auth");
          }
          return;
        }
      } catch (error) {
        console.error("Engineer Dashboard: Error parsing user data in immediate check:", error);
      }
    }

    if (authLoading) return; // Wait for auth to load

    // Check localStorage first (fastest check)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const userRole = userData?.role;

        console.log("🔍 Engineer Dashboard useLayoutEffect - Role:", userRole);

        // Block all non-engineers - redirect immediately
        if (userRole && userRole !== "engineer") {
          console.log("🚫 Engineer Dashboard: Non-engineer blocked in useLayoutEffect - Role:", userRole);
          setShouldRedirect(true);
          
          // Redirect based on role
          if (userRole === "admin") {
            window.location.replace("/admin-dashboard");
          } else if (userRole === "customer") {
            window.location.replace("/customer-dashboard");
          } else if (userRole === "interiorDesigner" || userRole === "interior") {
            window.location.replace("/interior-dashboard");
          } else {
            window.location.replace("/auth");
          }
          return;
        }
      } catch (error) {
        console.error("Engineer Dashboard: Error parsing user data:", error);
      }
    }

    // Check auth context
    if (user) {
      const userRole = user?.role;

      if (userRole && userRole !== "engineer") {
        console.log("🚫 Engineer Dashboard: Non-engineer blocked via auth context - Role:", userRole);
        setShouldRedirect(true);
        
        if (userRole === "admin") {
          window.location.replace("/admin-dashboard");
        } else if (userRole === "customer") {
          window.location.replace("/customer-dashboard");
        } else if (userRole === "interiorDesigner" || userRole === "interior") {
          window.location.replace("/interior-dashboard");
    } else {
          window.location.replace("/auth");
        }
        return;
      }
    }

    // If no user and auth is loaded, redirect to login
    if (!user && !authLoading) {
      console.log("🚫 Engineer Dashboard: No user logged in - redirecting to /auth");
      setShouldRedirect(true);
      window.location.replace("/auth");
    }
  }, [user, authLoading, navigate]);

  // Define functions after hooks but before they're used in useEffect
  const fetchDashboardData = async () => {
    setLoadingProjects(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/engineer/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProjects(response.data.data.projects || []);
        setDashboardStats(response.data.data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/attendance/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceStats(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/engineer/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  // Fetch data effect
  useEffect(() => {
    // Only fetch data if user is an engineer
    if (shouldRedirect) return;
    
    if (!isEngineer()) {
      console.log("🚫 Engineer Dashboard: User is not an engineer");
      setShouldRedirect(true);
      navigate("/auth");
      return;
    }
    
    fetchTodayAttendance();
    fetchAttendanceStats();
    fetchDashboardData();
    fetchMaterials();
  }, [isEngineer, navigate, shouldRedirect]);

  // Show nothing while checking or redirecting
  if (authLoading || shouldRedirect) {
    return null;
  }

  // Final synchronous check before rendering
  const savedUserFinal = localStorage.getItem('user');
  if (savedUserFinal) {
    try {
      const userDataFinal = JSON.parse(savedUserFinal);
      const userRoleFinal = userDataFinal?.role;
      
      console.log("🔍 Engineer Dashboard FINAL check before render - Role:", userRoleFinal);
      
      if (userRoleFinal && userRoleFinal !== "engineer") {
        console.log(`🚫 Engineer Dashboard: ${userRoleFinal} BLOCKED in final check - NOT RENDERING`);
        return null; // Don't render - redirecting
      }
    } catch (error) {
      console.error("Engineer Dashboard: Error in final check:", error);
    }
  }

  if (user) {
    const userRole = user?.role;
    if (userRole && userRole !== "engineer") {
      console.log(`🚫 Engineer Dashboard: ${userRole} BLOCKED via auth context in final check`);
      return null; // Don't render - redirecting
    }
  }

  if (!user && !authLoading) {
    console.log("🚫 Engineer Dashboard: No user in final check - NOT RENDERING");
    return null;
  }

  // Helper functions defined after all hooks and before JSX
  const fetchProjectDetails = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/engineer/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedProject(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      alert(error.response?.data?.message || 'Failed to fetch project details');
    }
  };

  const updateMilestoneStatus = async (projectId, milestoneId, status, notes) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE}/engineer/projects/${projectId}/milestones/${milestoneId}`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      // Update selected project if it's the same one
      if (selectedProject && selectedProject._id === projectId) {
        await fetchProjectDetails(projectId);
      }
      
      alert('Milestone updated successfully!');
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert(error.response?.data?.message || 'Failed to update milestone');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/attendance/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTodayAttendance();
      await fetchAttendanceStats();
      alert('Checked in successfully!');
    } catch (error) {
      console.error('Error checking in:', error);
      alert(error.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/attendance/checkout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTodayAttendance();
      await fetchAttendanceStats();
      alert('Checked out successfully!');
    } catch (error) {
      console.error('Error checking out:', error);
      alert(error.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getStatusBadge = (status) => {
    const config = {
      present: { bg: "bg-green-100", text: "text-green-800", icon: <CheckCircle size={16} /> },
      absent: { bg: "bg-red-100", text: "text-red-800", icon: <XCircle size={16} /> },
      half_day: { bg: "bg-yellow-100", text: "text-yellow-800", icon: <Clock size={16} /> },
      leave: { bg: "bg-blue-100", text: "text-blue-800", icon: <Calendar size={16} /> },
      active: { bg: "bg-green-100", text: "text-green-800", icon: <TrendingUp size={14} /> },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: <Clock size={14} /> },
      completed: { bg: "bg-gray-100", text: "text-gray-800", icon: <CheckCircle size={14} /> }
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text} transition-all duration-300`}>
        {c.icon} {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getMilestoneStatusBadge = (status) => {
    const config = {
      pending: { bg: "bg-gray-100", text: "text-gray-800", icon: <Clock size={14} /> },
      in_progress: { bg: "bg-blue-100", text: "text-blue-800", icon: <Loader2 size={14} /> },
      completed: { bg: "bg-green-100", text: "text-green-800", icon: <CheckCircle size={14} /> }
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.icon} {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  return (
    <div 
      className="min-h-screen bg-white relative"
      style={{
        backgroundImage: 'url(/architect.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Subtle overlay to ensure content readability */}
      <div className="absolute inset-0 bg-white/85 pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg relative z-20">
        <div className="container mx-auto flex justify-between items-center px-4 py-3">
          <h1 className="text-2xl font-medium tracking-wide">Engineer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-light">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-all duration-300 font-medium shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 relative z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'projects'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'materials'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Materials
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-8 relative z-10">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Dashboard Stats */}
            {dashboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Projects</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.totalProjects}</p>
                    </div>
                    <FolderKanban className="text-blue-600" size={40} />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Active Projects</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.activeProjects}</p>
                    </div>
                    <TrendingUp className="text-green-600" size={40} />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pending Milestones</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.pendingMilestones}</p>
                    </div>
                    <Target className="text-yellow-600" size={40} />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">In Progress</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.inProgressMilestones}</p>
                    </div>
                    <Loader2 className="text-purple-600" size={40} />
                  </div>
                </div>
              </div>
            )}

        {/* Attendance Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <Clock className="text-blue-600" size={32} />
            Today's Attendance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Current Status */}
            <div className="border-2 border-gray-200 rounded-lg p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Status</h3>
              {todayAttendance ? (
                <div>
                  <div className="mb-4">{getStatusBadge(todayAttendance.status)}</div>
                  {todayAttendance.checkIn && (
                    <div className="text-sm text-gray-600 mb-2">
                      <LogIn size={16} className="inline mr-2" />
                      Check In: {new Date(todayAttendance.checkIn).toLocaleTimeString()}
                    </div>
                  )}
                  {todayAttendance.checkOut && (
                    <div className="text-sm text-gray-600 mb-2">
                      <LogOut size={16} className="inline mr-2" />
                      Check Out: {new Date(todayAttendance.checkOut).toLocaleTimeString()}
                    </div>
                  )}
                  {todayAttendance.workHours > 0 && (
                    <div className="text-sm text-gray-600">
                      Work Hours: {todayAttendance.workHours} hrs
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Not marked yet</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-2 border-gray-200 rounded-lg p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Actions</h3>
              <div className="space-y-3">
                {todayAttendance?.checkIn && !todayAttendance?.checkOut ? (
                  <button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <LogOut size={20} />
                    Check Out
                  </button>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <LogIn size={20} />
                    Check In
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                ⏰ Auto-marked as absent if not checked in by 10:00 AM
              </p>
            </div>
          </div>

          {/* Attendance Stats */}
          {attendanceStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-green-50 rounded-lg p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                <div className="text-3xl font-semibold text-green-600">{attendanceStats.present}</div>
                <div className="text-sm text-gray-600 mt-1">Present</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                <div className="text-3xl font-semibold text-red-600">{attendanceStats.absent}</div>
                <div className="text-sm text-gray-600 mt-1">Absent</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                <div className="text-3xl font-semibold text-yellow-600">{attendanceStats.halfDay}</div>
                <div className="text-sm text-gray-600 mt-1">Half Day</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                <div className="text-3xl font-semibold text-blue-600">{attendanceStats.total}</div>
                <div className="text-sm text-gray-600 mt-1">Total</div>
              </div>
            </div>
          )}
        </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
                  <FolderKanban className="text-blue-600" size={32} />
                  Recent Projects
          </h2>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
            </div>

              {loadingProjects ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FolderKanban size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No projects assigned yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.slice(0, 6).map((project) => (
                    <div
                      key={project._id}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => fetchProjectDetails(project._id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{project.clientName || 'N/A'}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progressPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progressPercentage || 0}%` }}
                          ></div>
                        </div>
            </div>

                      <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-4">
                        View Details <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <FolderKanban className="text-blue-600" size={32} />
              My Projects
            </h2>
            
            {loadingProjects ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderKanban size={48} className="mx-auto mb-4 opacity-50" />
                <p>No projects assigned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => fetchProjectDetails(project._id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Client: {project.clientName || 'N/A'}</p>
                    {project.address && (
                      <p className="text-gray-500 text-xs mb-4">{project.address}</p>
                    )}
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progressPercentage || 0}%</span>
            </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progressPercentage || 0}%` }}
                        ></div>
          </div>
        </div>

                    {/* Milestones Count */}
                    {project.assignedMilestones && project.assignedMilestones.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          {project.assignedMilestones.length} milestone(s) assigned to you
                        </p>
                      </div>
                    )}
                    
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-4">
                      View Details <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Package className="text-blue-600" size={32} />
              Available Materials
            </h2>
            
            {materials.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No materials available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materials.map((material) => (
                      <tr key={material._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{material.name}</div>
                          {material.description && (
                            <div className="text-sm text-gray-500">{material.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.stock || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{material.unitPrice || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {material.stock < (material.reorderLevel || 10) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle size={12} /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} /> In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">{selectedProject.name}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">{selectedProject.clientName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
            </div>
            <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium">₹{selectedProject.budget?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <div className="mt-1">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{selectedProject.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${selectedProject.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                {selectedProject.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{selectedProject.address}</p>
                  </div>
                )}
              </div>

              {/* Milestones */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Milestones</h3>
                {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {selectedProject.milestones.map((milestone) => (
                      <div
                        key={milestone._id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
                            {milestone.description && (
                              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            )}
                          </div>
                          {getMilestoneStatusBadge(milestone.status)}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm text-gray-600">
                            <span>Weight: {milestone.weight || 0}%</span>
                            {milestone.dueDate && (
                              <span className="ml-4">
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          {milestone.status !== 'completed' && (
                            <div className="flex gap-2">
                              {milestone.status === 'pending' && (
                                <button
                                  onClick={() => updateMilestoneStatus(selectedProject._id, milestone._id, 'in_progress')}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                  Start
                                </button>
                              )}
                              {milestone.status === 'in_progress' && (
                                <button
                                  onClick={() => updateMilestoneStatus(selectedProject._id, milestone._id, 'completed')}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {milestone.notes && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-600">{milestone.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No milestones available</p>
                )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}