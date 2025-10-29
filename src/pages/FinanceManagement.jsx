import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Users,
  Package,
  Truck,
  Wallet,
  PieChart,
  BarChart3,
  Eye,
  Edit,
  ChevronRight,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

export default function FinanceManagement() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Overview Data
  const [overview, setOverview] = useState({
    totalBudget: 0,
    materialExpenses: 0,
    laborExpenses: 0,
    supplierExpenses: 0,
    totalExpenses: 0,
    clientPayments: 0,
    pendingPayments: 0,
    netProfit: 0,
  });

  // Project Breakdown
  const [projectBreakdown, setProjectBreakdown] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Material Costs
  const [materialCosts, setMaterialCosts] = useState([]);

  // Payroll
  const [payrollSummary, setPayrollSummary] = useState([]);
  const [payrollDetails, setPayrollDetails] = useState([]);

  // Client Payments
  const [clientPayments, setClientPayments] = useState([]);

  // Supplier Payments
  const [supplierPayments, setSupplierPayments] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    projectId: "",
    status: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchAllData();
    fetchProjects();

    // Initialize Socket.io connection
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to server - Finance Management");
      setIsConnected(true);
      socketRef.current.emit("join-finance-room");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    socketRef.current.on("finance-update", (update) => {
      console.log("📊 Finance update received:", update);
      fetchAllData();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/projects`);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.projectId) params.append("projectId", filters.projectId);
      if (filters.status) params.append("status", filters.status);

      const [
        overviewRes,
        breakdownRes,
        materialsRes,
        payrollRes,
        clientPaymentsRes,
        supplierPaymentsRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/finance/overview?${params}`),
        axios.get(`${API_BASE}/finance/projects-breakdown?${params}`),
        axios.get(`${API_BASE}/finance/materials?${params}`),
        axios.get(`${API_BASE}/finance/payroll?${params}`),
        axios.get(`${API_BASE}/finance/client-payments?${params}`),
        axios.get(`${API_BASE}/finance/supplier-payments?${params}`),
      ]);

      setOverview(overviewRes.data);
      setProjectBreakdown(breakdownRes.data);
      setMaterialCosts(materialsRes.data);
      setPayrollSummary(payrollRes.data.summary || []);
      setPayrollDetails(payrollRes.data.details || []);
      setClientPayments(clientPaymentsRes.data);
      setSupplierPayments(supplierPaymentsRes.data);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      partially_paid: "bg-orange-100 text-orange-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.pending}`}>
        {status?.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const handleUpdatePayment = async (paymentId, paidAmount, status) => {
    try {
      await axios.patch(`${API_BASE}/finance/client-payments/${paymentId}`, {
        paidAmount,
        status,
        paymentDate: new Date().toISOString(),
      });
      setShowPaymentModal(false);
      setSelectedPayment(null);
      fetchAllData();
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Error updating payment: " + (error.response?.data?.error || error.message));
    }
  };

  const handleExportReport = (format) => {
    alert(`Exporting finance report as ${format}...`);
    // TODO: Implement export functionality
  };

  return (
    <div className="bg-gray-50">
      {/* Page Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={() => handleExportReport("PDF")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
          >
            <Download size={18} />
            Export PDF
          </button>
          <button
            onClick={() => handleExportReport("Excel")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
          >
            <FileText size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 px-4 py-4 border border-gray-200 bg-gray-50 rounded-lg">
          <div className="pt-4">
            <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Project</label>
                  <select
                    value={filters.projectId}
                    onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                  </select>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6 max-w-[1600px] mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading finance data...</p>
          </div>
        ) : (
          <>
            {/* Finance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Budget</h3>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-3">{formatCurrency(overview.totalBudget)}</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${overview.totalBudget > 0 ? Math.min((overview.totalExpenses / overview.totalBudget) * 100, 100) : 0}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Spent: {formatCurrency(overview.totalExpenses)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Material Expenses</h3>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Package size={20} className="text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-3">{formatCurrency(overview.materialExpenses)}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium">Total Expenses: {formatCurrency(overview.totalExpenses)}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Labor Wages</h3>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users size={20} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-3">{formatCurrency(overview.laborExpenses)}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={14} className="text-gray-400" />
                  <span>Paid to workers</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Net Profit/Loss</h3>
                  <div className={`p-2 rounded-lg ${overview.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    {overview.netProfit >= 0 ? (
                      <TrendingUp size={20} className="text-green-600" />
                    ) : (
                      <TrendingDown size={20} className="text-red-600" />
                    )}
                  </div>
                </div>
                <p
                  className={`text-3xl font-bold mb-3 ${
                    overview.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {overview.netProfit >= 0 ? "+" : ""}
                  {formatCurrency(overview.netProfit)}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500">Paid: <span className="font-semibold text-green-600">{formatCurrency(overview.clientPayments)}</span></span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">Due: <span className="font-semibold text-orange-600">{formatCurrency(overview.pendingPayments)}</span></span>
                </div>
              </div>
            </div>

            {/* Project-wise Financial Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <BarChart3 size={18} className="text-blue-600" />
                  </div>
                  Project-wise Financial Breakdown
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Spent</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Remaining</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projectBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="text-gray-400 mb-2">
                            <BarChart3 size={48} className="mx-auto" />
                          </div>
                          <p className="text-gray-500 font-medium">No project data available</p>
                        </td>
                      </tr>
                    ) : (
                      projectBreakdown.map((project) => (
                        <tr key={project.projectId} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{project.projectName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{project.clientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(project.budget)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(project.spent)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div
                              className={`text-sm font-bold ${
                                project.isOverBudget ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {formatCurrency(project.remaining)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                project.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : project.status === "completed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {project.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedProject(project)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 text-sm font-medium hover:underline"
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Client Payment Tracking */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Wallet size={18} className="text-green-600" />
                  </div>
                  Client Payment Tracking
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Due</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientPayments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="text-gray-400 mb-2">
                            <Wallet size={48} className="mx-auto" />
                          </div>
                          <p className="text-gray-500 font-medium">No payment records available</p>
                        </td>
                      </tr>
                    ) : (
                      clientPayments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{payment.clientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {payment.projectId?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-green-600">
                              {formatCurrency(payment.paidAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-red-600">
                              {formatCurrency(payment.dueAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowPaymentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 text-sm font-medium hover:underline"
                            >
                              <Edit size={16} />
                              Update
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Material Costs & Payroll in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Material Costs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Package size={18} className="text-orange-600" />
                    </div>
                    Material Costs
                  </h2>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Material</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Supplier</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {materialCosts.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center">
                            <div className="text-gray-400 mb-2">
                              <Package size={32} className="mx-auto" />
                            </div>
                            <p className="text-xs text-gray-500">No material costs recorded</p>
                          </td>
                        </tr>
                      ) : (
                        materialCosts.slice(0, 10).map((material, idx) => (
                          <tr key={idx} className="hover:bg-orange-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {material.materialId?.name || material.description}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {material.supplierId?.name || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-900">
                                {material.quantity} {material.unit}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(material.amount)}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(material.date)}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payroll Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Users size={18} className="text-purple-600" />
                    </div>
                    Labor & Payroll
                  </h2>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Worker</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Days</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total Paid</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payrollSummary.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center">
                            <div className="text-gray-400 mb-2">
                              <Users size={32} className="mx-auto" />
                            </div>
                            <p className="text-xs text-gray-500">No payroll records available</p>
                          </td>
                        </tr>
                      ) : (
                        payrollSummary.map((worker, idx) => (
                          <tr key={idx} className="hover:bg-purple-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {worker.worker?.name || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {worker.worker?.skillType || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {worker.totalDays || 0}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="text-sm font-bold text-green-600">
                                {formatCurrency(worker.totalPaid)}
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

            {/* Supplier Payments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Truck size={18} className="text-indigo-600" />
                  </div>
                  Supplier Payments
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice #</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Due</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplierPayments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="text-gray-400 mb-2">
                            <Truck size={48} className="mx-auto" />
                          </div>
                          <p className="text-gray-500 font-medium">No supplier payment records available</p>
                        </td>
                      </tr>
                    ) : (
                      supplierPayments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {payment.supplierId?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{payment.invoiceNumber || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-green-600">
                              {formatCurrency(payment.paidAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-red-600">
                              {formatCurrency(payment.amount - payment.paidAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(payment.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                payment.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : payment.paymentStatus === "partial"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {payment.paymentStatus?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Update Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Update Payment</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Paid (₹)</label>
                <input
                  type="number"
                  defaultValue={selectedPayment.paidAmount}
                  min={0}
                  max={selectedPayment.amount}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  id="paidAmount"
                />
                <p className="text-xs text-gray-500 mt-1">Total Amount: {formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
                <select
                  defaultValue={selectedPayment.status}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  id="paymentStatus"
                >
                  <option value="pending">Pending</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const paidAmount = parseFloat(document.getElementById("paidAmount").value);
                    const status = document.getElementById("paymentStatus").value;
                    handleUpdatePayment(selectedPayment._id, paidAmount, status);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Update Payment
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

