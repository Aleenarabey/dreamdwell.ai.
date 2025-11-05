import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Users,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  UserCheck,
  Award,
  Stethoscope,
  Shield,
  ChevronLeft,
  Upload,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Eye,
  X,
  Save,
  UserPlus,
  ArrowLeftRight,
  ArrowLeft,
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Building2,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

export default function WorkersManagement() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);
  const socketRef = useRef(null);

  const availableSkills = [
    "Mason",
    "Electrician",
    "Plumber",
    "Welder",
    "Carpenter",
    "Painter",
    "Laborer",
    "Supervisor",
    "Engineer",
    "Architect",
  ];

  const contractTypes = ["Permanent", "Contract", "Subcontract"];

  const [newWorker, setNewWorker] = useState({
    name: "",
    photo: null,
    contact: { phone: "", email: "" },
    emergencyContact: { name: "", phone: "", relation: "" },
    skillType: "",
    skills: [],
    experienceYears: "",
    joiningDate: new Date().toISOString().split("T")[0],
    idProof: { file: null, type: "", number: "", expiryDate: "" },
      skillCert: { file: null, expiryDate: "" },
      medical: { file: null, expiryDate: "" },
      background: { file: null, expiryDate: "" },
    assignedProject: { projectId: "", site: "" },
    wages: { dailyWage: "", hourlyRate: "", contractType: "Contract" },
    notes: "",
  });

  const [assignmentData, setAssignmentData] = useState({
    workerId: "",
    projectId: "",
    site: "",
    assignedDate: new Date().toISOString().split("T")[0],
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validatePhone = (phone) => {
    if (!phone) return "Contact number is required";
    
    // Remove spaces and special characters for validation
    const cleanedPhone = phone.replace(/\s|-|\(|\)|\./g, "");
    
    // Check if phone contains any alphabets
    if (/[a-zA-Z]/.test(cleanedPhone)) {
      return "Enter your actual number";
    }
    
    // Check if phone contains only digits
    if (!/^\d+$/.test(cleanedPhone)) {
      return "Enter your actual number";
    }
    
    // Check if phone is exactly 10 digits
    if (cleanedPhone.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    
    // Check for invalid patterns (like 12345, 11111, 00000, etc.)
    // Check for consecutive same digits (1111111111, 2222222222, etc.)
    if (/^(\d)\1{9}$/.test(cleanedPhone)) {
      return "Please enter a valid number";
    }
    
    // Check for sequential ascending patterns (1234567890, 0123456789, etc.)
    if (/(0123456789|1234567890)/.test(cleanedPhone)) {
      return "Please enter a valid number";
    }
    
    // Check for simple sequential patterns like 12345 (first 5 digits)
    const firstFive = cleanedPhone.substring(0, 5);
    if (/^(01234|12345|23456|34567|45678|56789)$/.test(firstFive)) {
      return "Please enter a valid number";
    }
    
    // Check for reverse sequential patterns (54321)
    if (/^(54321|65432|76543|87654|98765)$/.test(firstFive)) {
      return "Please enter a valid number";
    }
    
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return ""; // Email is optional
    const trimmedEmail = email.trim();
    
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address (e.g., name@example.com)";
    }
    
    // Check for common typos
    if (trimmedEmail.includes("..")) {
      return "Email cannot contain consecutive dots";
    }
    
    if (trimmedEmail.startsWith(".") || trimmedEmail.startsWith("@")) {
      return "Email cannot start with . or @";
    }
    
    if (trimmedEmail.endsWith(".") || trimmedEmail.endsWith("@")) {
      return "Email cannot end with . or @";
    }
    
    // Check length
    if (trimmedEmail.length > 254) {
      return "Email address is too long (max 254 characters)";
    }
    
    return "";
  };

  const validateName = (name) => {
    if (!name || !name.trim()) return "Full name is required";
    
    const trimmedName = name.trim();
    
    // Check if name contains only numbers
    if (/^\d+$/.test(trimmedName)) {
      return "Name cannot contain only numbers";
    }
    
    // Allow letters, spaces, hyphens, apostrophes, and periods (for names like O'Brien, Mary-Jane, etc.)
    if (!/^[a-zA-Z\s'.-]+$/.test(trimmedName)) {
      return "Name can only contain letters, spaces, hyphens, apostrophes, and periods";
    }
    
    if (trimmedName.length < 2) return "Name must be at least 2 characters";
    if (trimmedName.length > 50) return "Name must be less than 50 characters";
    
    // Check for consecutive special characters
    if (/['.-]{2,}/.test(trimmedName)) {
      return "Name cannot contain consecutive special characters";
    }
    
    // Check if name starts or ends with special character
    if (/^['.-]|['.-]$/.test(trimmedName)) {
      return "Name cannot start or end with special characters";
    }
    
    return "";
  };

  const validateSkillType = (skillType) => {
    if (!skillType) return "Skill type is required";
    return "";
  };

  const validateNumber = (value, fieldName, min = null, max = null) => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (min !== null && num < min) return `${fieldName} must be at least ${min}`;
    if (max !== null && num > max) return `${fieldName} must be at most ${max}`;
    return "";
  };

  const validateDate = (date, fieldName, isFutureDate = false) => {
    if (!date) return "";
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(selectedDate.getTime())) return `Invalid ${fieldName} format`;
    
    // Check for reasonable date range (not too old for documents)
    const minDate = new Date("1900-01-01");
    if (selectedDate < minDate) {
      return `${fieldName} cannot be before 1900`;
    }
    
    if (isFutureDate && selectedDate > today) {
      return `${fieldName} cannot be in the future`;
    }
    
    if (!isFutureDate && selectedDate > today) {
      return `${fieldName} cannot be in the future`;
    }
    
    return "";
  };

  const validateFile = (file, maxSizeMB = 5, allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]) => {
    if (!file) return "";
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    if (!allowedTypes.includes(file.type)) {
      return "File must be an image (JPEG/PNG) or PDF";
    }
    return "";
  };

  // Validate emergency contact phone is different from main phone
  const validateEmergencyContactPhone = (phone) => {
    if (!phone || phone.trim() === "") return "";
    
    const mainPhone = newWorker.contact?.phone || "";
    if (mainPhone && phone === mainPhone) {
      return "Emergency contact number must be different from main contact number";
    }
    
    return validatePhone(phone);
  };

  // Get validation error for a field
  const getValidationError = (field, value, fieldPath = null) => {
    let validationError = "";

    switch (field) {
      case "name":
        validationError = validateName(value);
        break;
      case "contact":
        if (fieldPath === "contact.phone") {
          validationError = validatePhone(value);
        } else if (fieldPath === "contact.email") {
          validationError = validateEmail(value);
        }
        break;
      case "emergencyContact":
        if (fieldPath === "emergencyContact.phone") {
          // Emergency contact phone is optional, but if provided, must be valid and different from main phone
          if (value && value.trim() !== "") {
            validationError = validateEmergencyContactPhone(value);
          } else {
            validationError = "";
          }
        }
        break;
      case "skillType":
        validationError = validateSkillType(value);
        break;
      case "experienceYears":
        validationError = validateNumber(value, "Experience", 0, 50);
        break;
      case "wages":
        if (fieldPath === "wages.dailyWage") {
          validationError = validateNumber(value, "Daily wage", 0, 100000);
        } else if (fieldPath === "wages.hourlyRate") {
          validationError = validateNumber(value, "Hourly rate", 0, 10000);
        }
        break;
      case "idProof":
        if (fieldPath === "idProof.number" && value) {
          const trimmedValue = value.trim();
          if (trimmedValue.length < 10 || trimmedValue.length > 20) {
            validationError = "ID number must be between 10-20 characters";
          } else if (!/^[A-Z0-9]+$/i.test(trimmedValue)) {
            validationError = "ID number can only contain letters and numbers";
          }
        } else if (fieldPath === "idProof.expiryDate" && value) {
          validationError = validateDate(value, "ID expiry date", false);
        }
        break;
      case "skillCert":
      case "medical":
      case "background":
        if (fieldPath && fieldPath.includes("expiryDate") && value) {
          validationError = validateDate(value, "Expiry date", false);
        }
        break;
      case "joiningDate":
        validationError = validateDate(value, "Joining date", false);
        break;
      case "photo":
        validationError = validateFile(value, 5, ["image/jpeg", "image/jpg", "image/png"]);
        break;
      default:
        break;
    }

    return validationError;
  };

  // Name input handler - allows typing but validates immediately for numbers
  const handleNameChange = (value) => {
    let updatedWorker = { ...newWorker };
    updatedWorker.name = value;
    setNewWorker(updatedWorker);
    
    // Validate immediately if numbers are detected or field was previously touched
    const hasNumbers = /\d/.test(value);
    if (hasNumbers || touched.name) {
      const validationError = validateName(value);
      setTouched((prev) => ({ ...prev, name: true }));
      setErrors((prev) => ({
        ...prev,
        name: validationError,
      }));
    }
  };

  // Phone input handler - restricts to digits only and max 10 digits
  const handlePhoneChange = (value, field, fieldPath) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");
    // Limit to 10 digits
    const limitedValue = digitsOnly.slice(0, 10);
    handleFieldChange(field, limitedValue, fieldPath);
  };

  // Field change handler - only updates value, no validation
  const handleFieldChange = (field, value, fieldPath = null) => {
    let updatedWorker = { ...newWorker };

    if (fieldPath) {
      // Handle nested fields (contact.phone, contact.email, etc.)
      const keys = fieldPath.split(".");
      let current = updatedWorker;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      updatedWorker[field] = value;
    }

    setNewWorker(updatedWorker);
    
    // Clear error for this field when user starts typing (if field was previously touched)
    const errorKey = fieldPath || field;
    if (touched[errorKey]) {
      const validationError = getValidationError(field, value, fieldPath);
      setErrors((prev) => ({
        ...prev,
        [errorKey]: validationError,
      }));
    }
  };

  // Field blur handler - validates when field loses focus
  const handleFieldBlur = (field, fieldPath = null) => {
    const errorKey = fieldPath || field;
    let value;

    // Get the current value from newWorker
    if (fieldPath) {
      const keys = fieldPath.split(".");
      let current = newWorker;
      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }
      value = current;
    } else {
      value = newWorker[field];
    }

    // Validate the field
    const validationError = getValidationError(field, value, fieldPath);

    // Mark field as touched and set error
    setTouched((prev) => ({
      ...prev,
      [errorKey]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [errorKey]: validationError,
    }));
  };

  // Validate file on selection
  const handleFileChange = (field, file) => {
    if (!file) return;
    
    const validationError = validateFile(file, 5, ["image/jpeg", "image/jpg", "image/png", "application/pdf"]);
    setErrors((prev) => ({
      ...prev,
      [field]: validationError,
    }));
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Update worker state
    if (field === "photo") {
      setNewWorker({ ...newWorker, photo: file });
    } else if (field === "idProofFile") {
      setNewWorker({
        ...newWorker,
        idProof: { ...newWorker.idProof, file: file },
      });
    } else if (field === "skillCertFile") {
      setNewWorker({
        ...newWorker,
        skillCert: { ...newWorker.skillCert, file: file },
      });
    } else if (field === "medicalFile") {
      setNewWorker({
        ...newWorker,
        medical: { ...newWorker.medical, file: file },
      });
    } else if (field === "backgroundFile") {
      setNewWorker({
        ...newWorker,
        background: { ...newWorker.background, file: file },
      });
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const requiredFields = {
      name: validateName(newWorker.name),
      "contact.phone": validatePhone(newWorker.contact?.phone || ""),
      skillType: validateSkillType(newWorker.skillType),
    };

    // Check all required fields
    for (const [field, error] of Object.entries(requiredFields)) {
      if (error) return false;
    }

    // Validate optional fields if they have values
    if (newWorker.contact?.email) {
      const emailError = validateEmail(newWorker.contact.email);
      if (emailError) return false;
    }

    if (newWorker.emergencyContact?.phone && newWorker.emergencyContact.phone.trim() !== "") {
      const emergencyPhoneError = validateEmergencyContactPhone(newWorker.emergencyContact.phone);
      if (emergencyPhoneError) return false;
    }

    // Validate ID proof fields if file is uploaded
    if (newWorker.idProof?.file) {
      if (!newWorker.idProof.type || !newWorker.idProof.type.trim()) {
        return false;
      }
      if (!newWorker.idProof.number || !newWorker.idProof.number.trim()) {
        return false;
      }
    }

    // Check if there are any errors in the errors state
    const hasErrors = Object.values(errors).some((error) => error !== "");
    return !hasErrors;
  };

  // Reset validation on modal close
  const resetValidation = () => {
    setErrors({});
    setTouched({});
  };

  useEffect(() => {
    fetchWorkers();
    fetchProjects();

    // Initialize Socket.io connection
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to server - Workers Management");
      setIsConnected(true);
      socketRef.current.emit("join-workers-room");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    socketRef.current.on("worker-update", (update) => {
      console.log("📊 Worker update received:", update);
      setRealTimeUpdates((prev) => [{ ...update, timestamp: new Date() }, ...prev].slice(0, 10));
      
      if (update.type === "worker-created" || update.type === "worker-updated") {
        fetchWorkers();
      } else if (update.type === "worker-deleted") {
        setWorkers((prev) => prev.filter((w) => w._id !== update.workerId));
      } else if (update.type === "worker-assigned" || update.type === "workers-bulk-assigned") {
        fetchWorkers();
      } else if (update.type === "attendance-updated") {
        fetchWorkers();
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterSkill) params.append("skillType", filterSkill);
      if (filterStatus) params.append("status", filterStatus);
      if (filterProject) params.append("projectId", filterProject);

      const response = await axios.get(`${API_BASE}/workers?${params}`);
      setWorkers(response.data || []);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/projects`);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [searchTerm, filterSkill, filterStatus, filterProject]);

  const handleSaveWorker = async () => {
    // Validate all required fields before submitting
    const validationErrors = {
      name: validateName(newWorker.name),
      "contact.phone": validatePhone(newWorker.contact.phone),
      skillType: validateSkillType(newWorker.skillType),
    };

    // Validate optional fields if they have values
    if (newWorker.contact.email) {
      validationErrors["contact.email"] = validateEmail(newWorker.contact.email);
    }
    if (newWorker.emergencyContact.phone && newWorker.emergencyContact.phone.trim() !== "") {
      validationErrors["emergencyContact.phone"] = validateEmergencyContactPhone(newWorker.emergencyContact.phone);
    }
    if (newWorker.experienceYears) {
      validationErrors.experienceYears = validateNumber(newWorker.experienceYears, "Experience", 0, 50);
    }
    if (newWorker.wages.dailyWage) {
      validationErrors["wages.dailyWage"] = validateNumber(newWorker.wages.dailyWage, "Daily wage", 0, 100000);
    }
    if (newWorker.wages.hourlyRate) {
      validationErrors["wages.hourlyRate"] = validateNumber(newWorker.wages.hourlyRate, "Hourly rate", 0, 10000);
    }

    // Validate ID proof fields if file is uploaded
    if (newWorker.idProof.file) {
      if (!newWorker.idProof.type || !newWorker.idProof.type.trim()) {
        validationErrors["idProof.type"] = "ID type is required when file is uploaded";
      }
      if (!newWorker.idProof.number || !newWorker.idProof.number.trim()) {
        validationErrors["idProof.number"] = "ID number is required when file is uploaded";
      } else {
        validationErrors["idProof.number"] = getValidationError("idProof", newWorker.idProof.number, "idProof.number");
      }
    }

    // Validate site location if project is assigned
    if (newWorker.assignedProject.projectId && (!newWorker.assignedProject.site || !newWorker.assignedProject.site.trim())) {
      validationErrors["assignedProject.site"] = "Site location is required when project is assigned";
    }

    setErrors(validationErrors);
    setTouched({
      name: true,
      "contact.phone": true,
      skillType: true,
      ...(newWorker.contact.email && { "contact.email": true }),
      ...(newWorker.emergencyContact.phone && newWorker.emergencyContact.phone.trim() !== "" && { "emergencyContact.phone": true }),
      ...(newWorker.experienceYears && { experienceYears: true }),
    });

    // Check if there are any errors
    const hasErrors = Object.values(validationErrors).some((error) => error !== "");
    if (hasErrors) {
      alert("Please fix the validation errors before saving.");
      return;
    }

    try {
      const formData = new FormData();
      
      formData.append("name", newWorker.name);
      formData.append("contact", JSON.stringify(newWorker.contact));
      formData.append("emergencyContact", JSON.stringify(newWorker.emergencyContact));
      formData.append("skillType", newWorker.skillType);
      formData.append("skills", newWorker.skills.join(","));
      formData.append("experienceYears", newWorker.experienceYears);
      formData.append("joiningDate", newWorker.joiningDate);
      formData.append("wages", JSON.stringify(newWorker.wages));
      formData.append("notes", newWorker.notes || "");
      formData.append("status", "Active");

      if (newWorker.photo) formData.append("photo", newWorker.photo);
      if (newWorker.idProof.file) formData.append("idProof", newWorker.idProof.file);
      if (newWorker.skillCert.file) formData.append("skillCert", newWorker.skillCert.file);
      if (newWorker.medical.file) formData.append("medical", newWorker.medical.file);
      if (newWorker.background.file) formData.append("background", newWorker.background.file);

      // Handle documents with expiry dates
      const documents = {
        idProof: {
          type: newWorker.idProof.type,
          number: newWorker.idProof.number,
          expiryDate: newWorker.idProof.expiryDate || null,
        },
        skillCert: {
          expiryDate: newWorker.skillCert.expiryDate || null,
        },
        medical: {
          expiryDate: newWorker.medical.expiryDate || null,
        },
        background: {
          expiryDate: newWorker.background.expiryDate || null,
        },
      };
      formData.append("documents", JSON.stringify(documents));

      // Handle project assignment
      if (newWorker.assignedProject.projectId) {
        const assignedProject = {
          projectId: newWorker.assignedProject.projectId,
          site: newWorker.assignedProject.site || "",
          assignedDate: new Date().toISOString(),
        };
        formData.append("assignedProject", JSON.stringify(assignedProject));
      }

      if (selectedWorker) {
        // Update existing worker
        await axios.put(`${API_BASE}/workers/${selectedWorker._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create new worker
        await axios.post(`${API_BASE}/workers`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

    setShowAddModal(false);
      resetWorkerForm();
      resetValidation();
      fetchWorkers();
      alert(selectedWorker ? "Worker updated successfully!" : "Worker added successfully!");
    } catch (error) {
      console.error("Error saving worker:", error);
      alert("Error saving worker: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;
    
    try {
      await axios.delete(`${API_BASE}/workers/${workerId}`);
      fetchWorkers();
      alert("Worker deleted successfully!");
    } catch (error) {
      console.error("Error deleting worker:", error);
      alert("Error deleting worker: " + (error.response?.data?.error || error.message));
    }
  };

  const handleAssignProject = async () => {
    try {
      await axios.patch(`${API_BASE}/workers/${assignmentData.workerId}/assign-project`, {
        projectId: assignmentData.projectId,
        site: assignmentData.site,
        assignedDate: assignmentData.assignedDate,
      });
      
      setShowAssignModal(false);
      setAssignmentData({
        workerId: "",
        projectId: "",
        site: "",
        assignedDate: new Date().toISOString().split("T")[0],
      });
      fetchWorkers();
      alert("Worker assigned to project successfully!");
    } catch (error) {
      console.error("Error assigning worker:", error);
      alert("Error assigning worker: " + (error.response?.data?.error || error.message));
    }
  };

  const handleBulkAssign = async (workerIds) => {
    if (workerIds.length === 0) {
      alert("Please select workers to assign");
      return;
    }

    const projectId = window.prompt("Enter Project ID:");
    if (!projectId) return;

    const site = window.prompt("Enter Site Location (optional):") || "";

    try {
      await axios.patch(`${API_BASE}/workers/bulk-assign`, {
        workerIds,
        projectId,
        site,
        assignedDate: new Date().toISOString(),
      });
      fetchWorkers();
      alert(`${workerIds.length} workers assigned successfully!`);
    } catch (error) {
      console.error("Error bulk assigning workers:", error);
      alert("Error assigning workers: " + (error.response?.data?.error || error.message));
    }
  };

  const handleEditWorker = (worker) => {
    setSelectedWorker(worker);
    setNewWorker({
      name: worker.name || "",
      photo: null,
      contact: worker.contact || { phone: "", email: "" },
      emergencyContact: worker.emergencyContact || { name: "", phone: "", relation: "" },
      skillType: worker.skillType || "",
      skills: worker.skills || [],
      experienceYears: worker.experience?.years || "",
      joiningDate: worker.joiningDate ? new Date(worker.joiningDate).toISOString().split("T")[0] : "",
      idProof: {
        file: null,
        type: worker.documents?.idProof?.type || "",
        number: worker.documents?.idProof?.number || "",
        expiryDate: worker.documents?.idProof?.expiryDate ? new Date(worker.documents.idProof.expiryDate).toISOString().split("T")[0] : "",
      },
      skillCert: {
        file: null,
        expiryDate: worker.documents?.skillCert?.expiryDate ? new Date(worker.documents.skillCert.expiryDate).toISOString().split("T")[0] : "",
      },
      medical: {
        file: null,
        expiryDate: worker.documents?.medical?.expiryDate ? new Date(worker.documents.medical.expiryDate).toISOString().split("T")[0] : "",
      },
      background: {
        file: null,
        expiryDate: worker.documents?.background?.expiryDate ? new Date(worker.documents.background.expiryDate).toISOString().split("T")[0] : "",
      },
      assignedProject: {
        projectId: worker.assignedProject?.projectId?._id || worker.assignedProject?.projectId || "",
        site: worker.assignedProject?.site || "",
      },
      wages: {
        dailyWage: worker.wages?.dailyWage || "",
        hourlyRate: worker.wages?.hourlyRate || "",
        contractType: worker.wages?.contractType || "Contract",
      },
      notes: worker.notes || "",
    });
    setShowAddModal(true);
  };

  const resetWorkerForm = () => {
    setSelectedWorker(null);
    setNewWorker({
      name: "",
      photo: null,
      contact: { phone: "", email: "" },
      emergencyContact: { name: "", phone: "", relation: "" },
      skillType: "",
      skills: [],
      experienceYears: "",
      joiningDate: new Date().toISOString().split("T")[0],
      idProof: { file: null, type: "", number: "", expiryDate: "" },
        skillCert: { file: null, expiryDate: "" },
        medical: { file: null, expiryDate: "" },
        background: { file: null, expiryDate: "" },
      assignedProject: { projectId: "", site: "" },
      wages: { dailyWage: "", hourlyRate: "", contractType: "Contract" },
      notes: "",
    });
    resetValidation();
  };

  const handleExportReport = (format) => {
    // Export functionality - can be implemented with libraries like xlsx or jsPDF
    alert(`Exporting ${filteredWorkers.length} workers to ${format}...`);
    // Implementation would go here
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.workerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.contact?.phone?.includes(searchTerm);

    const matchesSkill = !filterSkill || worker.skillType === filterSkill;
    const matchesStatus = !filterStatus || worker.status === filterStatus;
    const matchesProject =
      !filterProject ||
      worker.assignedProject?.projectId?._id === filterProject ||
      worker.assignedProject?.projectId === filterProject;

    return matchesSearch && matchesSkill && matchesStatus && matchesProject;
  });

  const getStatusBadge = (status) => {
    const badges = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-gray-100 text-gray-800",
      "On Leave": "bg-yellow-100 text-yellow-800",
    };
  return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.Inactive}`}>
        {status}
      </span>
    );
  };

  const getAttendanceBadge = (status) => {
    const badges = {
      Present: "bg-green-100 text-green-800",
      Absent: "bg-red-100 text-red-800",
      "On Leave": "bg-yellow-100 text-yellow-800",
      "Half Day": "bg-orange-100 text-orange-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.Absent}`}>
        {status || "Absent"}
      </span>
    );
  };

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "valid":
      case "verified":
        return <CheckCircle2 size={14} className="text-green-600" />;
      case "expiring":
        return <AlertCircle size={14} className="text-yellow-600" />;
      case "expired":
      case "failed":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col gap-4 mb-4">
          {/* Title Row */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                <Users className="text-blue-600 flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8" />
                <span className="truncate">Labor & Workforce Management</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{filteredWorkers.length} Workers</span>
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Export Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleExportReport("Excel")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                title="Export Excel"
              >
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
              <button
                onClick={() => handleExportReport("PDF")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                title="Export PDF"
              >
                <FileDown size={18} />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
            
            {/* Add Worker Button - Always visible on new line if needed */}
            <button
              onClick={() => {
                resetWorkerForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md whitespace-nowrap ml-auto sm:ml-0"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add New Worker</span>
              <span className="sm:hidden">Add Worker</span>
            </button>
          </div>
        </div>
            
        {/* Search & Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
              placeholder="Search by name, ID, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Skills</option>
            {availableSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
                ))}
              </select>
              
              <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
              </select>
          </div>
        </header>

          {/* Real-time Updates Banner */}
          {realTimeUpdates.length > 0 && (
        <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-600" />
            <h3 className="font-semibold text-blue-800 text-sm">Recent Activity</h3>
              </div>
          <div className="space-y-1">
                {realTimeUpdates.slice(0, 3).map((update, idx) => (
              <div key={idx} className="text-xs text-gray-700 bg-white rounded p-2">
                {update.type === "worker-created" && `✓ New worker registered`}
                {update.type === "worker-updated" && `✓ Worker updated`}
                {update.type === "worker-assigned" && `✓ Worker assigned to project`}
                {update.type === "attendance-updated" && `✓ Attendance updated`}
                  </div>
                ))}
              </div>
            </div>
          )}

      {/* Worker Overview Table */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-12">Loading workers...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name & Photo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skill Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Worked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                        <Users size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">No workers found</p>
                        <p className="text-sm mt-1">Add your first worker to get started</p>
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((worker) => (
                      <tr key={worker._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-600">{worker.workerId}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {worker.photo ? (
                                <img src={`http://localhost:5000${worker.photo}`} alt={worker.name} className="h-full w-full object-cover" />
                              ) : (
                                <User size={20} className="text-gray-400" />
                              )}
                            </div>
                    <div>
                              <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                              {worker.experience?.years && (
                                <div className="text-xs text-gray-500">{worker.experience.years} years exp.</div>
                              )}
                    </div>
                  </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{worker.contact?.phone || "N/A"}</div>
                          {worker.contact?.email && (
                            <div className="text-xs text-gray-500">{worker.contact.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{worker.skillType}</div>
                          {worker.skills && worker.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {worker.skills.slice(0, 2).map((skill, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                              {worker.skills.length > 2 && (
                                <span className="text-xs text-gray-500">+{worker.skills.length - 2}</span>
                              )}
                    </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {worker.assignedProject?.projectName || worker.assignedProject?.projectId?.name || "Not Assigned"}
                  </div>
                          {worker.assignedProject?.site && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin size={12} />
                              {worker.assignedProject.site}
                    </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(worker.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getAttendanceBadge(worker.attendance?.todayStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {worker.wages?.dailyWage ? `₹${worker.wages.dailyWage}/day` : worker.wages?.hourlyRate ? `₹${worker.wages.hourlyRate}/hr` : "N/A"}
                    </div>
                          {worker.wages?.contractType && (
                            <div className="text-xs text-gray-500">{worker.wages.contractType}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{worker.totalDaysWorked || 0}</div>
                          <div className="text-xs text-gray-500">days</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getDocumentStatusIcon(worker.documents?.idProof?.status)}
                            {getDocumentStatusIcon(worker.documents?.skillCert?.status)}
                            {getDocumentStatusIcon(worker.documents?.medical?.status)}
                            {getDocumentStatusIcon(worker.documents?.background?.status)}
                    </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditWorker(worker)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                    <button
                      onClick={() => {
                                setAssignmentData({
                                  workerId: worker._id,
                                  projectId: worker.assignedProject?.projectId?._id || worker.assignedProject?.projectId || "",
                                  site: worker.assignedProject?.site || "",
                                  assignedDate: new Date().toISOString().split("T")[0],
                                });
                                setShowAssignModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Assign Project"
                            >
                              <ArrowLeftRight size={16} />
                    </button>
                            <button
                              onClick={() => handleDeleteWorker(worker._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                      <Trash2 size={16} />
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
        )}
      </div>

      {/* Add/Edit Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto py-6">
          <div className="bg-white rounded-lg w-11/12 max-w-6xl p-6 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedWorker ? "Edit Worker" : "Add New Worker"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetWorkerForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && Object.values(errors).some(err => err) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                  <AlertTriangle size={16} />
                  Please fix the following errors:
                </div>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, error]) => 
                    error && touched[field] ? (
                      <li key={field}>{error}</li>
                    ) : null
                  )}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name (e.g., John Doe)"
                    value={newWorker.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => handleFieldBlur("name")}
                    maxLength={50}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched.name && errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : touched.name && !errors.name && newWorker.name
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {touched.name && errors.name ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.name}
                      </p>
                    ) : touched.name && !errors.name && newWorker.name ? (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} />
                        Valid name
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Enter worker's full name</p>
                    )}
                    <span className="text-xs text-gray-400">{newWorker.name?.length || 0}/50</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                  <div className="flex items-center gap-3">
                    {newWorker.photo && (
                      <img
                        src={URL.createObjectURL(newWorker.photo)}
                        alt="Preview"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                      <Upload size={16} />
                      <span className="text-sm">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("photo", e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {touched.photo && errors.photo && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors.photo}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
                    <input
                      type="text"
                      placeholder="9876543210"
                      value={newWorker.contact.phone}
                      onChange={(e) => handlePhoneChange(e.target.value, "contact", "contact.phone")}
                      onBlur={() => handleFieldBlur("contact", "contact.phone")}
                      maxLength={10}
                      className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        touched["contact.phone"] && errors["contact.phone"]
                          ? "border-red-500 focus:ring-red-500"
                          : touched["contact.phone"] && !errors["contact.phone"] && newWorker.contact.phone?.length === 10
                          ? "border-green-500 focus:ring-green-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  {touched["contact.phone"] && errors["contact.phone"] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors["contact.phone"]}
                    </p>
                  )}
                  {touched["contact.phone"] && !errors["contact.phone"] && newWorker.contact.phone?.length === 10 && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Valid phone number
                    </p>
                  )}
                  {!touched["contact.phone"] && (
                    <p className="mt-1 text-xs text-gray-500">Enter 10-digit mobile number</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="worker@example.com"
                    value={newWorker.contact.email}
                    onChange={(e) => handleFieldChange("contact", e.target.value, "contact.email")}
                    onBlur={() => handleFieldBlur("contact", "contact.email")}
                    maxLength={254}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched["contact.email"] && errors["contact.email"]
                        ? "border-red-500 focus:ring-red-500"
                        : touched["contact.email"] && !errors["contact.email"] && newWorker.contact.email
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {touched["contact.email"] && errors["contact.email"] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors["contact.email"]}
                    </p>
                  )}
                  {touched["contact.email"] && !errors["contact.email"] && newWorker.contact.email && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Valid email address
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={newWorker.emergencyContact.name}
                    onChange={(e) =>
                      setNewWorker({
                        ...newWorker,
                        emergencyContact: { ...newWorker.emergencyContact, name: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <div className="relative mb-2">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
                    <input
                      type="text"
                      placeholder="Phone Number (10 digits)"
                      value={newWorker.emergencyContact.phone}
                      onChange={(e) => handlePhoneChange(e.target.value, "emergencyContact", "emergencyContact.phone")}
                      onBlur={() => handleFieldBlur("emergencyContact", "emergencyContact.phone")}
                      maxLength={10}
                      className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        touched["emergencyContact.phone"] && errors["emergencyContact.phone"]
                          ? "border-red-500 focus:ring-red-500"
                          : touched["emergencyContact.phone"] && !errors["emergencyContact.phone"] && newWorker.emergencyContact.phone?.length === 10
                          ? "border-green-500 focus:ring-green-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  {touched["emergencyContact.phone"] && errors["emergencyContact.phone"] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 mb-2">
                      <AlertTriangle size={14} />
                      {errors["emergencyContact.phone"]}
                    </p>
                  )}
                  {touched["emergencyContact.phone"] && !errors["emergencyContact.phone"] && newWorker.emergencyContact.phone?.length === 10 && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1 mb-2">
                      <CheckCircle size={14} />
                      Valid phone number
                    </p>
                  )}
                  <input
                    type="text"
                    placeholder="Relation"
                    value={newWorker.emergencyContact.relation}
                    onChange={(e) =>
                      setNewWorker({
                        ...newWorker,
                        emergencyContact: { ...newWorker.emergencyContact, relation: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newWorker.skillType}
                    onChange={(e) => handleFieldChange("skillType", e.target.value)}
                    onBlur={() => handleFieldBlur("skillType")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched.skillType && errors.skillType
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">Select Skill Type</option>
                    {availableSkills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                  {touched.skillType && errors.skillType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors.skillType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Skills</label>
                  <select
                    multiple
                    value={newWorker.skills}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                      setNewWorker({ ...newWorker, skills: selected });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  >
                    {availableSkills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years) <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    min="0"
                    max="50"
                    step="0.5"
                    value={newWorker.experienceYears}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 50)) {
                        handleFieldChange("experienceYears", value);
                      }
                    }}
                    onBlur={() => handleFieldBlur("experienceYears")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched.experienceYears && errors.experienceYears
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {touched.experienceYears && errors.experienceYears && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors.experienceYears}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Enter years of experience (0-50)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={newWorker.joiningDate}
                    onChange={(e) => handleFieldChange("joiningDate", e.target.value)}
                    onBlur={() => handleFieldBlur("joiningDate")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched.joiningDate && errors.joiningDate
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {touched.joiningDate && errors.joiningDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors.joiningDate}
                    </p>
                  )}
                </div>
                </div>
                
              {/* Right Column - Project Assignment, Wages, Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Project Assignment</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Project</label>
                  <select
                    value={newWorker.assignedProject.projectId}
                    onChange={(e) => {
                      const projectId = e.target.value;
                      setNewWorker({
                        ...newWorker,
                        assignedProject: { 
                          ...newWorker.assignedProject, 
                          projectId: projectId,
                          // Clear site if project is deselected
                          site: projectId ? newWorker.assignedProject.site : ""
                        },
                      });
                      // Validate site location if project is selected
                      if (projectId && (!newWorker.assignedProject.site || !newWorker.assignedProject.site.trim())) {
                        const errorKey = "assignedProject.site";
                        setTouched((prev) => ({ ...prev, [errorKey]: true }));
                        setErrors((prev) => ({
                          ...prev,
                          [errorKey]: "Site location is required when project is assigned",
                        }));
                      } else if (!projectId) {
                        // Clear site location error if project is deselected
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors["assignedProject.site"];
                          return newErrors;
                        });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Optional - Select a project to assign the worker</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Location
                    {newWorker.assignedProject.projectId && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="Site address or location"
                    value={newWorker.assignedProject.site}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewWorker({
                        ...newWorker,
                        assignedProject: { ...newWorker.assignedProject, site: value },
                      });
                      // Validate if project is selected and site location becomes required
                      if (newWorker.assignedProject.projectId && value.trim() === "") {
                        const errorKey = "assignedProject.site";
                        setTouched((prev) => ({ ...prev, [errorKey]: true }));
                        setErrors((prev) => ({
                          ...prev,
                          [errorKey]: "Site location is required when project is assigned",
                        }));
                      } else {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors["assignedProject.site"];
                          return newErrors;
                        });
                      }
                    }}
                    onBlur={() => {
                      if (newWorker.assignedProject.projectId && !newWorker.assignedProject.site?.trim()) {
                        const errorKey = "assignedProject.site";
                        setTouched((prev) => ({ ...prev, [errorKey]: true }));
                        setErrors((prev) => ({
                          ...prev,
                          [errorKey]: "Site location is required when project is assigned",
                        }));
                      }
                    }}
                    maxLength={200}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched["assignedProject.site"] && errors["assignedProject.site"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {touched["assignedProject.site"] && errors["assignedProject.site"] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors["assignedProject.site"]}
                    </p>
                  )}
                  {newWorker.assignedProject.projectId && (
                    <p className="mt-1 text-xs text-gray-500">Required when project is assigned</p>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mt-6">Wages & Contract</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Wage (₹)</label>
                  <input
                    type="number"
                    placeholder="500"
                    min="0"
                    max="100000"
                    step="0.01"
                    value={newWorker.wages.dailyWage}
                    onChange={(e) => handleFieldChange("wages", e.target.value, "wages.dailyWage")}
                    onBlur={() => handleFieldBlur("wages", "wages.dailyWage")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched["wages.dailyWage"] && errors["wages.dailyWage"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {touched["wages.dailyWage"] && errors["wages.dailyWage"] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors["wages.dailyWage"]}
                    </p>
                  )}
              </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    placeholder="62.50"
                    min="0"
                    max="10000"
                    step="0.01"
                    value={newWorker.wages.hourlyRate}
                    onChange={(e) => handleFieldChange("wages", e.target.value, "wages.hourlyRate")}
                    onBlur={() => handleFieldBlur("wages", "wages.hourlyRate")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      touched["wages.hourlyRate"] && errors["wages.hourlyRate"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {touched["wages.hourlyRate"] && errors["wages.hourlyRate"] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors["wages.hourlyRate"]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                  <select
                    value={newWorker.wages.contractType}
                    onChange={(e) =>
                      setNewWorker({
                        ...newWorker,
                        wages: { ...newWorker.wages, contractType: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {contractTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mt-6">Documents & Verification</h3>

                <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Proof (Aadhaar/PAN/Passport)
                    </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange("idProofFile", e.target.files[0])}
                    className="w-full text-sm text-gray-500 mb-2"
                  />
                  {touched.idProofFile && errors.idProofFile && (
                    <p className="text-xs text-red-600 mb-2">{errors.idProofFile}</p>
                  )}
                  {newWorker.idProof.file && (
                    <>
                      <input
                        type="text"
                        placeholder="ID Type (e.g., Aadhaar, PAN, Passport)"
                        value={newWorker.idProof.type}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewWorker({
                            ...newWorker,
                            idProof: { ...newWorker.idProof, type: value },
                          });
                          if (value.trim() === "" && newWorker.idProof.file) {
                            setTouched((prev) => ({ ...prev, "idProof.type": true }));
                            setErrors((prev) => ({
                              ...prev,
                              "idProof.type": "ID type is required when file is uploaded",
                            }));
                          } else {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors["idProof.type"];
                              return newErrors;
                            });
                          }
                        }}
                        onBlur={() => {
                          if (!newWorker.idProof.type?.trim() && newWorker.idProof.file) {
                            setTouched((prev) => ({ ...prev, "idProof.type": true }));
                            setErrors((prev) => ({
                              ...prev,
                              "idProof.type": "ID type is required when file is uploaded",
                            }));
                          }
                        }}
                        maxLength={50}
                        className={`w-full px-3 py-1.5 border rounded text-sm mb-2 ${
                          touched["idProof.type"] && errors["idProof.type"]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {touched["idProof.type"] && errors["idProof.type"] && (
                        <p className="text-xs text-red-600 mb-2">{errors["idProof.type"]}</p>
                      )}
                    </>
                  )}
                  {newWorker.idProof.file && (
                    <>
                      <input
                        type="text"
                        placeholder="ID Number (10-20 characters)"
                        value={newWorker.idProof.number}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          handleFieldChange("idProof", value, "idProof.number");
                          if (value.trim() === "" && newWorker.idProof.file) {
                            setTouched((prev) => ({ ...prev, "idProof.number": true }));
                            setErrors((prev) => ({
                              ...prev,
                              "idProof.number": "ID number is required when file is uploaded",
                            }));
                          }
                        }}
                        onBlur={() => {
                          handleFieldBlur("idProof", "idProof.number");
                          if (!newWorker.idProof.number?.trim() && newWorker.idProof.file) {
                            setTouched((prev) => ({ ...prev, "idProof.number": true }));
                            setErrors((prev) => ({
                              ...prev,
                              "idProof.number": "ID number is required when file is uploaded",
                            }));
                          }
                        }}
                        maxLength={20}
                        className={`w-full px-3 py-1.5 border rounded text-sm mb-2 ${
                          touched["idProof.number"] && errors["idProof.number"]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {touched["idProof.number"] && errors["idProof.number"] && (
                        <p className="text-xs text-red-600 mb-2">{errors["idProof.number"]}</p>
                      )}
                    </>
                  )}
                    <input
                      type="date"
                      placeholder="Expiry Date"
                      value={newWorker.idProof.expiryDate}
                      onChange={(e) => handleFieldChange("idProof", e.target.value, "idProof.expiryDate")}
                      onBlur={() => handleFieldBlur("idProof", "idProof.expiryDate")}
                      className={`w-full px-3 py-1.5 border rounded text-sm ${
                        touched["idProof.expiryDate"] && errors["idProof.expiryDate"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched["idProof.expiryDate"] && errors["idProof.expiryDate"] && (
                      <p className="text-xs text-red-600 mt-1">{errors["idProof.expiryDate"]}</p>
                    )}
                </div>
                
                <div className="bg-green-50 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Certificate</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange("skillCertFile", e.target.files[0])}
                    className="w-full text-sm text-gray-500 mb-2"
                  />
                  {touched.skillCertFile && errors.skillCertFile && (
                    <p className="text-xs text-red-600 mb-2">{errors.skillCertFile}</p>
                  )}
                  <input
                    type="date"
                    placeholder="Expiry Date"
                      value={newWorker.skillCert.expiryDate}
                      onChange={(e) => handleFieldChange("skillCert", e.target.value, "skillCert.expiryDate")}
                      onBlur={() => handleFieldBlur("skillCert", "skillCert.expiryDate")}
                      className={`w-full px-3 py-1.5 border rounded text-sm ${
                        touched["skillCert.expiryDate"] && errors["skillCert.expiryDate"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched["skillCert.expiryDate"] && errors["skillCert.expiryDate"] && (
                      <p className="text-xs text-red-600 mt-1">{errors["skillCert.expiryDate"]}</p>
                    )}
                </div>
                
                <div className="bg-purple-50 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Fitness</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange("medicalFile", e.target.files[0])}
                    className="w-full text-sm text-gray-500 mb-2"
                  />
                  {touched.medicalFile && errors.medicalFile && (
                    <p className="text-xs text-red-600 mb-2">{errors.medicalFile}</p>
                  )}
                  <input
                    type="date"
                    placeholder="Expiry Date"
                      value={newWorker.medical.expiryDate}
                      onChange={(e) => handleFieldChange("medical", e.target.value, "medical.expiryDate")}
                      onBlur={() => handleFieldBlur("medical", "medical.expiryDate")}
                      className={`w-full px-3 py-1.5 border rounded text-sm ${
                        touched["medical.expiryDate"] && errors["medical.expiryDate"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched["medical.expiryDate"] && errors["medical.expiryDate"] && (
                      <p className="text-xs text-red-600 mt-1">{errors["medical.expiryDate"]}</p>
                    )}
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Verification</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange("backgroundFile", e.target.files[0])}
                    className="w-full text-sm text-gray-500 mb-2"
                  />
                  {touched.backgroundFile && errors.backgroundFile && (
                    <p className="text-xs text-red-600 mb-2">{errors.backgroundFile}</p>
                  )}
                    <input
                      type="date"
                      placeholder="Expiry Date"
                      value={newWorker.background.expiryDate}
                      onChange={(e) => handleFieldChange("background", e.target.value, "background.expiryDate")}
                      onBlur={() => handleFieldBlur("background", "background.expiryDate")}
                      className={`w-full px-3 py-1.5 border rounded text-sm ${
                        touched["background.expiryDate"] && errors["background.expiryDate"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched["background.expiryDate"] && errors["background.expiryDate"] && (
                      <p className="text-xs text-red-600 mt-1">{errors["background.expiryDate"]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes / Remarks <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    value={newWorker.notes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1000) {
                        setNewWorker({ ...newWorker, notes: value });
                      }
                    }}
                    rows={3}
                    placeholder="Any additional notes or remarks about the worker..."
                    maxLength={1000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Maximum 1000 characters</p>
                    <span className={`text-xs ${newWorker.notes?.length > 950 ? "text-orange-600" : "text-gray-400"}`}>
                      {newWorker.notes?.length || 0}/1000
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveWorker}
                disabled={!isFormValid()}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isFormValid()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Save size={18} />
                {selectedWorker ? "Update Worker" : "Save Worker"}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetWorkerForm();
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Assign/Reassign Project</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
    </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  value={assignmentData.projectId}
                  onChange={(e) =>
                    setAssignmentData({ ...assignmentData, projectId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Location</label>
                <input
                  type="text"
                  placeholder="Site address"
                  value={assignmentData.site}
                  onChange={(e) =>
                    setAssignmentData({ ...assignmentData, site: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Date</label>
                <input
                  type="date"
                  value={assignmentData.assignedDate}
                  onChange={(e) =>
                    setAssignmentData({ ...assignmentData, assignedDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAssignProject}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Assign
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
