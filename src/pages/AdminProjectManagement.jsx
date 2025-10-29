import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Plus,
  Trash2,
  Search,
  X,
  ArrowLeft,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  FileText,
  Calendar,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Users,
  Package,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:5000/api";

export default function AdminProjectManagement() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [autoSaving, setAutoSaving] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [laborData, setLaborData] = useState([]);
  const [availableEngineers, setAvailableEngineers] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const socketRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    startDate: "",
    endDate: "",
    budget: "",
    address: "",
    status: "pending",
    notes: ""
  });

  const [milestoneData, setMilestoneData] = useState({
    title: "",
    description: "",
    weight: 25,
    dueDate: "",
    notes: ""
  });

  useEffect(() => {
    let refreshInterval = null;
    
    if (isAdmin() || user?.role === 'admin') {
      // Fetch projects immediately
      fetchProjects();
      fetchEngineers();
      fetchMaterials();
      
      // Set up periodic refresh to ensure sync (every 30 seconds as fallback)
      refreshInterval = setInterval(() => {
        fetchProjects();
      }, 30000); // Refresh every 30 seconds
      
      // Initialize Socket.io connection for real-time updates
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to server - Project Management");
        setIsConnected(true);
        socketRef.current.emit("join-projects-room");
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ Disconnected from server");
        setIsConnected(false);
      });

      // Listen for real-time project updates
      socketRef.current.on("project-update", (update) => {
        console.log("📊 Project update received:", update);
        
        // Add to real-time updates log
        setRealTimeUpdates(prev => [{ ...update, timestamp: new Date() }, ...prev].slice(0, 10));
        
        // Always refresh projects list when any update is received
        fetchProjects();
        
        // Handle different update types
        if (update.type === "project-created" || update.status === "created") {
          setNotifications(prev => [{
            message: `New project "${update.projectName || update.name}" created`,
            type: 'success',
            timestamp: new Date()
          }, ...prev].slice(0, 5));
        } else if (update.type === "project-updated" || update.status === "updated") {
          setNotifications(prev => [{
            message: `Project "${update.projectName || update.name}" updated`,
            type: 'success',
            timestamp: new Date()
          }, ...prev].slice(0, 5));
        } else if (update.type === "project-deleted" || update.status === "deleted") {
          setNotifications(prev => [{
            message: `Project "${update.projectName || update.name}" deleted`,
            type: 'error',
            timestamp: new Date()
          }, ...prev].slice(0, 5));
        } else if (update.type === "project-status-changed") {
          setNotifications(prev => [{
            message: `Project "${update.projectName || update.name}" status changed to ${update.newStatus}`,
            type: 'success',
            timestamp: new Date()
          }, ...prev].slice(0, 5));
        }
      });

      // Listen for milestone updates
      socketRef.current.on("milestone-update", (update) => {
        console.log("🎯 Milestone update received:", update);
        
        setRealTimeUpdates(prev => [{ ...update, timestamp: new Date() }, ...prev].slice(0, 10));
        fetchProjects();
        
        if (update.status === "added") {
          setNotifications(prev => [{
            message: `Milestone "${update.milestoneTitle}" added to "${update.projectName}"`,
            type: 'success',
            timestamp: new Date()
          }, ...prev].slice(0, 5));
        } else if (update.status === "completed") {
          setNotifications(prev => [{
            message: `Milestone "${update.milestoneTitle}" completed for "${update.projectName}"`,
            type: 'success',
            timestamp: new Date()
          }, ...prev].slice(0, 5));
        }
      });

      // Listen for progress updates
      socketRef.current.on("project-progress-update", (update) => {
        console.log("📈 Progress update received:", update);
        
        setRealTimeUpdates(prev => [{ ...update, timestamp: new Date() }, ...prev].slice(0, 10));
        
        // Update the specific project's progress in the list
        setProjects(prev => prev.map(p => 
          p._id === update.projectId 
            ? { ...p, progressPercentage: update.progressPercentage }
            : p
        ));
        
        // Also refresh to ensure consistency
        fetchProjects();
      });

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    } else {
      navigate("/admin-dashboard");
    }
  }, []);

  const fetchProjects = async () => {
    try {
      console.log("🔍 Fetching projects from:", `${API_BASE}/projects`);
      const response = await axios.get(`${API_BASE}/projects`);
      const projectsData = response.data || [];
      console.log("✅ Projects fetched successfully:", projectsData.length, "projects");
      console.log("📋 Projects data:", projectsData);
      setProjects(projectsData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      // Set empty array on error to prevent UI breaking
      setProjects([]);
      setLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/users?role=engineer`);
      setAvailableEngineers(response.data || []);
    } catch (error) {
      console.error("Error fetching engineers:", error);
      // Set empty array on error to prevent UI breaking
      setAvailableEngineers([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API_BASE}/materials`);
      setAvailableMaterials(response.data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      clientName: "",
      startDate: "",
      endDate: "",
      budget: "",
      address: "",
      status: "pending",
      notes: ""
    });
    setEditingProject(null);
    setCurrentStep(1);
    setErrors({});
    setTeamMembers([]);
    setMaterials([]);
    setLaborData([]);
    setDraftId(null);
  };

  // Auto-save draft functionality
  const saveDraft = async () => {
    if (!formData.name) return; // Only save if basic info entered
    setAutoSaving(true);
    try {
      const draftData = {
        ...formData,
        status: "pending", // Always set to pending for drafts
        teamMembers,
        materials,
        laborData,
        isDraft: true
      };
      
      if (draftId) {
        await axios.put(`${API_BASE}/projects/${draftId}`, draftData);
      } else {
        const response = await axios.post(`${API_BASE}/projects`, draftData);
        setDraftId(response.data._id);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Auto-save on form data change
  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(() => {
      if (currentStep > 1 || formData.name) {
        saveDraft();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timer);
  }, [formData, teamMembers, materials, laborData, showModal]);

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Project name is required";
        if (!formData.clientName.trim()) newErrors.clientName = "Client name is required";
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";
        if (!formData.budget) newErrors.budget = "Budget is required";
        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
          newErrors.endDate = "End date must be after start date";
        }
        break;
      case 2:
        if (teamMembers.length === 0) newErrors.teamMembers = "At least one team member is required";
        break;
      case 3:
        // Materials and labor are optional
        break;
      case 4:
        // Review step - no validation needed
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!validateStep(currentStep)) {
      return;
    }
    
    try {
      const projectData = {
        ...formData,
        status: "pending", // Always set to pending for new projects
        teamMembers,
        materials,
        laborData,
        isDraft: false
      };
      
      let response;
      if (editingProject) {
        response = await axios.put(`${API_BASE}/projects/${editingProject._id}`, projectData);
      } else if (draftId) {
        response = await axios.put(`${API_BASE}/projects/${draftId}`, projectData);
      } else {
        response = await axios.post(`${API_BASE}/projects`, projectData);
      }
      
      // Show success notification
      const successNotification = {
        message: `Project "${formData.name}" created successfully!`,
        type: 'success',
        timestamp: new Date()
      };
      setNotifications([successNotification]);
      
      // Emit real-time update
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("project-update", {
          type: editingProject ? "project-updated" : "project-created",
          projectId: response.data._id || draftId,
          projectName: formData.name,
          status: editingProject ? 'updated' : 'created',
          timestamp: new Date()
        });
      }
      
      setShowModal(false);
      resetForm();
      
      // Refresh projects list
      await fetchProjects();
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotifications([]);
      }, 5000);
      
      // Scroll to top to show the new project
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error saving project:", error);
      
      // Show error notification
      const errorNotification = {
        message: `Failed to save project: ${error.response?.data?.error || error.message}`,
        type: 'error',
        timestamp: new Date()
      };
      setNotifications([errorNotification]);
      
      // Auto-dismiss notification after 8 seconds
      setTimeout(() => {
        setNotifications([]);
      }, 8000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const project = projects.find(p => p._id === id);
      await axios.delete(`${API_BASE}/projects/${id}`);
      
      // Emit real-time update
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("project-update", {
          type: "project-deleted",
          projectId: id,
          projectName: project?.name || "Unknown",
          status: 'deleted',
          timestamp: new Date()
        });
      }
      
      fetchProjects();
    } catch (error) {
      alert("Failed to delete project");
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/projects/${selectedProject._id}/milestones`, milestoneData);
      
      // Emit milestone update
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("milestone-update", {
          type: "milestone-added",
          projectId: selectedProject._id,
          projectName: selectedProject.name,
          milestoneTitle: milestoneData.title,
          status: 'added',
          timestamp: new Date()
        });
      }
      
      // Check if auto-completion happened
      const response = await axios.post(`${API_BASE}/projects/${selectedProject._id}/auto-update-status`);
      
      if (response.data.completed && response.data.notification) {
        setNotifications([...notifications, response.data.notification]);
      }
      
      setShowMilestoneModal(false);
      setMilestoneData({ title: "", description: "", weight: 25, dueDate: "", notes: "" });
      fetchProjects();
    } catch (error) {
      alert("Failed to add milestone");
    }
  };

  const handleMilestoneStatus = async (projectId, milestoneId, newStatus) => {
    try {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/milestones/${milestoneId}`, {
        status: newStatus
      });
      
      // Emit milestone update
      if (socketRef.current && socketRef.current.connected) {
        const project = projects.find(p => p._id === projectId);
        const milestone = project?.milestones?.find(m => m._id === milestoneId);
        
        if (project && milestone) {
          socketRef.current.emit("milestone-update", {
            type: newStatus === "completed" ? "milestone-completed" : "milestone-updated",
            projectId: projectId,
            projectName: project.name,
            milestoneTitle: milestone.title,
            status: newStatus,
            timestamp: new Date()
          });
          
          // Also emit progress update if milestone was completed
          if (newStatus === "completed" && response.data.updatedProject) {
            socketRef.current.emit("project-progress-update", {
              projectId: projectId,
              projectName: project.name,
              progressPercentage: response.data.updatedProject.progressPercentage,
              timestamp: new Date()
            });
          }
        }
      }
      
      if (response.data.autoCompleted && response.data.notification) {
        setNotifications([...notifications, response.data.notification]);
      }
      
      fetchProjects();
    } catch (error) {
      alert("Failed to update milestone status");
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
                     project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     (project.address && project.address.toLowerCase().includes(searchTerm.toLowerCase()));
    // When "all" is selected, show all projects (no status filter)
    const matchesFilter = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: "bg-green-100", text: "text-green-800", icon: <TrendingUp size={14} /> },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: <Clock size={14} /> },
      completed: { bg: "bg-gray-100", text: "text-gray-800", icon: <CheckCircle2 size={14} /> }
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${c.bg} ${c.text}`}>
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const addTeamMember = () => {
    const newMember = { engineerId: "", role: "", hours: "" };
    setTeamMembers([...teamMembers, newMember]);
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const removeTeamMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    const newMaterial = { materialId: "", quantity: "", unit: "" };
    setMaterials([...materials, newMaterial]);
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-xl">Loading projects...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin-dashboard")} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl text-gray-800 flex items-center gap-3">
                  <ClipboardList className="text-blue-600" size={32} />
                  Project Management
                </h1>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">Track milestones and monitor progress</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus size={18} /> Create Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-5 px-1">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search projects..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:font-light"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Real-time Updates Banner */}
      {realTimeUpdates.length > 0 && (
        <div className="px-6 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-blue-600" />
              <h3 className="font-semibold text-blue-800">Recent Activity</h3>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {realTimeUpdates.slice(0, 5).map((update, idx) => (
                <div key={idx} className="text-sm text-gray-700 bg-white rounded p-2">
                  {update.type === "project-created" && `✓ New project: "${update.projectName}" created`}
                  {update.type === "project-updated" && `📝 Project: "${update.projectName}" updated`}
                  {update.type === "project-deleted" && `🗑️ Project: "${update.projectName}" deleted`}
                  {update.type === "milestone-added" && `🎯 Milestone added to "${update.projectName}"`}
                  {update.type === "milestone-completed" && `✅ Milestone completed for "${update.projectName}"`}
                  {update.type === "project-progress-update" && `📈 Progress updated for "${update.projectName}"`}
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="px-6 pt-4 space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className={`${
              n.type === 'success' ? 'bg-green-50 border-green-200' : 
              n.type === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            } border rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top duration-300`}>
              <div className="flex items-center gap-3">
                {n.type === 'success' ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : n.type === 'error' ? (
                  <AlertTriangle size={20} className="text-red-600" />
                ) : (
                  <CheckCircle2 size={20} className="text-blue-600" />
                )}
                <span className={`text-sm ${
                  n.type === 'success' ? 'text-green-800' : 
                  n.type === 'error' ? 'text-red-800' : 
                  'text-blue-800'
                }`}>{n.message}</span>
              </div>
              <button 
                onClick={() => setNotifications(notifications.filter((_, idx) => idx !== i))} 
                className={`${
                  n.type === 'success' ? 'text-green-600 hover:text-green-800' : 
                  n.type === 'error' ? 'text-red-600 hover:text-red-800' : 
                  'text-blue-600 hover:text-blue-800'
                }`}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 hover:bg-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">Total Projects</p>
                <p className="text-4xl font-bold text-blue-800">{projects.length}</p>
              </div>
              <div className="bg-white p-3 rounded-xl"><FileText className="text-blue-600" size={28} /></div>
            </div>
          </div>
          <div className="bg-emerald-50 hover:bg-emerald-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">Active</p>
                <p className="text-4xl font-bold text-emerald-800">{projects.filter(p => p.status === 'active').length}</p>
              </div>
              <div className="bg-white p-3 rounded-xl"><TrendingUp className="text-emerald-600" size={28} /></div>
            </div>
          </div>
          <div className="bg-orange-50 hover:bg-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">Pending</p>
                <p className="text-4xl font-bold text-orange-800">{projects.filter(p => p.status === 'pending').length}</p>
              </div>
              <div className="bg-white p-3 rounded-xl"><Clock className="text-orange-600" size={28} /></div>
            </div>
          </div>
          <div className="bg-pink-50 hover:bg-pink-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-2 text-gray-600">Completed</p>
                <p className="text-4xl font-bold text-pink-800">{projects.filter(p => p.status === 'completed').length}</p>
              </div>
              <div className="bg-white p-3 rounded-xl"><CheckCircle2 className="text-pink-600" size={28} /></div>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Milestones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No projects found. Create your first project!
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                            <Target size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            {project.address && (
                              <div className="text-xs text-gray-500">{project.address}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{project.clientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${project.progressPercentage || 0}%` }}></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{project.progressPercentage || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(project.budget || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-purple-600" />
                          <span className="text-sm text-gray-900">
                            {(project.milestones || []).length} milestone{(project.milestones || []).length !== 1 ? 's' : ''}
                          </span>
                          <button 
                            onClick={() => { setSelectedProject(project); setShowMilestoneModal(true); }}
                            className="ml-2 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            <Plus size={12} className="inline" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Multi-Step Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between sticky top-0">
              <div>
                <h2 className="text-2xl text-white">{editingProject ? "Edit Project" : "Create Project"}</h2>
                {autoSaving && <p className="text-blue-200 text-sm mt-1">Auto-saving...</p>}
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep === step ? 'bg-blue-600 border-blue-600 text-white' :
                      currentStep > step ? 'bg-emerald-500 border-emerald-500 text-white' :
                      'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > step ? <CheckCircle size={20} /> : step}
                    </div>
                    <div className="flex-1 mx-2">
                      <div className={`h-1 rounded ${
                        currentStep > step ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">{currentStep === 1 ? 'Basic Info' : currentStep === 2 ? 'Assign Team' : currentStep === 3 ? 'Materials & Labor' : 'Review & Submit'}</span>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name *
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={formData.clientName} 
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.clientName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input 
                        type="date" 
                        required 
                        value={formData.startDate} 
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.startDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input 
                        type="date" 
                        required 
                        value={formData.endDate} 
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget (₹) *
                      </label>
                      <input 
                        type="number" 
                        required 
                        value={formData.budget} 
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.budget ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea 
                      value={formData.notes} 
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Assign Team */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="text-blue-600" size={24} />
                      Assign Team Members
                    </h3>
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={18} /> Add Member
                    </button>
                  </div>
                  {errors.teamMembers && <p className="text-red-500 text-sm mb-4">{errors.teamMembers}</p>}
                  {teamMembers.map((member, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Engineer</label>
                        <select
                          value={member.engineerId}
                          onChange={(e) => updateTeamMember(index, 'engineerId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select engineer</option>
                          {availableEngineers.map(eng => (
                            <option key={eng._id} value={eng._id}>{eng.name || eng.email}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Role</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          placeholder="e.g., Lead, Supervisor"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Hours/Day</label>
                        <input
                          type="number"
                          value={member.hours}
                          onChange={(e) => updateTeamMember(index, 'hours', e.target.value)}
                          placeholder="8"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Users size={48} className="mx-auto text-gray-400" />
                      <p className="text-gray-400 mt-2">No team members added yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Materials & Labor */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Package className="text-emerald-600" size={24} />
                        Materials Required
                      </h3>
                      <button
                        type="button"
                        onClick={addMaterial}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <Plus size={18} /> Add Material
                      </button>
                    </div>
                    {materials.map((material, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Material</label>
                          <select
                            value={material.materialId}
                            onChange={(e) => updateMaterial(index, 'materialId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">Select material</option>
                            {availableMaterials.map(mat => (
                              <option key={mat._id} value={mat._id}>{mat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={material.quantity}
                            onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Unit</label>
                          <input
                            type="text"
                            value={material.unit}
                            onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                            placeholder="e.g., kg, m³"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeMaterial(index)}
                            className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {materials.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mb-6">
                        <Package size={48} className="mx-auto text-gray-400" />
                        <p className="text-gray-400 mt-2">No materials added yet</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                      <Users className="text-orange-600" size={24} />
                      Labor Requirements
                    </h3>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                      <p className="text-gray-600">Labor requirements will be calculated based on team members</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <CheckCircle className="text-emerald-600" size={28} />
                    Review & Submit
                  </h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Project Name:</strong> {formData.name}</div>
                      <div><strong>Client:</strong> {formData.clientName}</div>
                      <div><strong>Start Date:</strong> {formData.startDate}</div>
                      <div><strong>End Date:</strong> {formData.endDate}</div>
                      <div><strong>Budget:</strong> ₹{formData.budget}</div>
                      <div><strong>Status:</strong> <span className="text-yellow-700 font-semibold">Pending (Default)</span></div>
                    </div>
                  </div>

                  {teamMembers.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Team Members ({teamMembers.length})</h4>
                      <div className="space-y-2">
                        {teamMembers.map((member, idx) => {
                          const engineer = availableEngineers.find(e => e._id === member.engineerId);
                          return (
                            <div key={idx} className="text-sm">
                              {engineer?.name || engineer?.email} - {member.role} ({member.hours}h/day)
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {materials.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Materials ({materials.length})</h4>
                      <div className="space-y-2">
                        {materials.map((material, idx) => {
                          const mat = availableMaterials.find(m => m._id === material.materialId);
                          return (
                            <div key={idx} className="text-sm">
                              {mat?.name || 'N/A'} - {material.quantity} {material.unit}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={currentStep === 1 ? () => setShowModal(false) : prevStep}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  {currentStep === 1 ? 'Cancel' : 'Previous'}
                </button>
                
                {currentStep < 4 ? (
                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2"
                  >
                    Next Step
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Submit Project
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showMilestoneModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl text-white">Add Milestone to {selectedProject.name}</h2>
              <button onClick={() => { setShowMilestoneModal(false); setSelectedProject(null); }} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} className="text-white" />
              </button>
            </div>
            <form onSubmit={handleAddMilestone} className="p-8">
              <div className="space-y-5">
                <div><label className="block text-sm text-gray-700 mb-2">Milestone Title</label>
                  <input type="text" required value={milestoneData.title} onChange={(e) => setMilestoneData({ ...milestoneData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div><label className="block text-sm text-gray-700 mb-2">Description</label>
                  <textarea value={milestoneData.description} onChange={(e) => setMilestoneData({ ...milestoneData, description: e.target.value })}
                    rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div><label className="block text-sm text-gray-700 mb-2">Weight (%)</label>
                  <input type="number" required min="0" max="100" value={milestoneData.weight} onChange={(e) => setMilestoneData({ ...milestoneData, weight: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div><label className="block text-sm text-gray-700 mb-2">Due Date</label>
                  <input type="date" value={milestoneData.dueDate} onChange={(e) => setMilestoneData({ ...milestoneData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div><label className="block text-sm text-gray-700 mb-2">Notes</label>
                  <textarea value={milestoneData.notes} onChange={(e) => setMilestoneData({ ...milestoneData, notes: e.target.value })}
                    rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => { setShowMilestoneModal(false); setSelectedProject(null); }}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all font-medium">Add Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
